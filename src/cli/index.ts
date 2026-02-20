#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Command } from "commander";
import type {
	Jurisdiction,
	LaunchClearReport,
	LLMProvider,
	ProductContext,
} from "../core/types.js";
import { generateArtifacts } from "../artifacts/generator.js";
import { listAvailableTemplates } from "../artifacts/generator.js";
import { generateActionPlan, generateActionPlanWithoutLLM } from "../actions/generator.js";
import { mapAllJurisdictions, aggregateRequirements } from "../jurisdictions/requirement-mapper.js";
import {
	listJurisdictions,
	registerJurisdiction,
} from "../jurisdictions/registry.js";
import { euAiActModule } from "../jurisdictions/jurisdictions/eu-ai-act.js";
import { euGdprModule } from "../jurisdictions/jurisdictions/eu-gdpr.js";
import { usFederalModule } from "../jurisdictions/jurisdictions/us-federal.js";
import { getDefaultProvider, createProvider } from "../providers/index.js";
import type { ProviderId } from "../providers/index.js";
import {
	generateMarkdownReport,
	generateArtifactMarkdown,
	buildMarketReadiness,
	generateSummaryMarkdown,
} from "../output/markdown.js";
import { generateJsonReport } from "../output/json.js";
import { runInteractiveIntake, buildQuickContext } from "./interactive.js";

// ─── Register Built-in Jurisdictions ──────────────────────────────────────

function initRegistry(): void {
	registerJurisdiction({
		id: "eu-ai-act",
		name: "EU AI Act",
		region: "EU",
		description: "European Union Artificial Intelligence Act",
		module: euAiActModule,
	});
	registerJurisdiction({
		id: "eu-gdpr",
		name: "EU GDPR",
		region: "EU",
		description: "EU General Data Protection Regulation",
		module: euGdprModule,
	});
	registerJurisdiction({
		id: "us-federal",
		name: "US Federal",
		region: "US",
		description: "US Federal frameworks (FTC, NIST AI RMF)",
		module: usFederalModule,
	});
}

// ─── Report Builder ───────────────────────────────────────────────────────

async function buildReport(
	ctx: ProductContext,
	provider: LLMProvider | null,
): Promise<LaunchClearReport> {
	console.log("  Mapping jurisdiction requirements...");
	const mapResult = mapAllJurisdictions(ctx);

	if (mapResult.errors.length > 0) {
		for (const err of mapResult.errors) {
			console.warn(
				`  Warning: Could not map ${err.jurisdiction}: ${err.error}`,
			);
		}
	}

	const aggregated = aggregateRequirements(mapResult.results);
	const marketReadiness = buildMarketReadiness(mapResult.results);

	// Generate action plan
	let actionPlan;
	const actionErrors: Array<{ actionId: string; error: string }> = [];

	if (provider) {
		console.log("  Generating action plan with LLM-assisted best practices...");
		const actionResult = await generateActionPlan({
			ctx,
			jurisdictionResults: mapResult.results,
			provider,
		});
		actionPlan = actionResult.actionPlan;
		actionErrors.push(...actionResult.errors);
	} else {
		console.log("  Generating action plan (no LLM — using fallback guidance)...");
		actionPlan = generateActionPlanWithoutLLM(mapResult.results);
	}

	// Generate artifacts
	let artifacts: LaunchClearReport["artifacts"] = [];
	if (provider) {
		console.log("  Generating compliance artifacts...");
		const artifactResult = await generateArtifacts({
			ctx,
			jurisdictionResults: mapResult.results,
			provider,
		});
		artifacts = artifactResult.artifacts;
		if (artifactResult.errors.length > 0) {
			for (const err of artifactResult.errors) {
				console.warn(
					`  Warning: Failed to generate ${err.artifactType}: ${err.error}`,
				);
			}
		}
	} else {
		console.log(
			"  Skipping artifact generation (no LLM provider configured).",
		);
		console.log(
			"  Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or OLLAMA_BASE_URL to enable.",
		);
	}

	// Find highest/lowest risk markets
	const riskOrder: Record<string, number> = {
		unacceptable: 4,
		high: 3,
		limited: 2,
		minimal: 1,
		undetermined: 0,
	};

	let highestRiskMarket = "N/A";
	let lowestFrictionMarket = "N/A";
	let highestScore = -1;
	let lowestScore = 999;

	for (const result of mapResult.results) {
		const score = riskOrder[result.riskClassification.level] ?? 0;
		if (score > highestScore) {
			highestScore = score;
			highestRiskMarket = result.jurisdiction;
		}
		if (score < lowestScore) {
			lowestScore = score;
			lowestFrictionMarket = result.jurisdiction;
		}
	}

	const criticalBlockers = marketReadiness
		.filter((m) => m.status === "blocked")
		.flatMap((m) => m.blockers);

	const report: LaunchClearReport = {
		id: `lc-${Date.now().toString(36)}`,
		generatedAt: new Date().toISOString(),
		productContext: ctx,
		jurisdictionResults: mapResult.results,
		summary: {
			canLaunch: marketReadiness,
			highestRiskMarket,
			lowestFrictionMarket,
			criticalBlockers,
			totalArtifactsNeeded: aggregated.totalArtifacts,
			totalActionsNeeded: aggregated.totalActions,
			estimatedComplianceTimeline: "See per-jurisdiction timelines",
		},
		artifacts,
		actionPlan,
		metadata: {
			provider: provider?.id ?? "none",
			model: provider?.name ?? "none",
			knowledgeBaseVersion: "2026-02",
			intakeTranscript: Object.entries(ctx.answers).map(
				([id, answer]) => ({
					questionId: id,
					questionText: id,
					answer: answer.value,
					freeText: answer.freeText,
				}),
			),
		},
	};

	return report;
}

// ─── Output Writer ────────────────────────────────────────────────────────

async function writeOutput(
	report: LaunchClearReport,
	outputDir: string,
	format: "markdown" | "json" | "both",
): Promise<void> {
	const absDir = resolve(outputDir);
	await mkdir(absDir, { recursive: true });

	if (format === "markdown" || format === "both") {
		const markdownContent = generateMarkdownReport(report);
		await writeFile(join(absDir, "report.md"), markdownContent, "utf-8");
		console.log(`  Written: ${join(absDir, "report.md")}`);

		// Write individual artifact files
		for (const artifact of report.artifacts) {
			const artifactContent = generateArtifactMarkdown(artifact);
			await writeFile(
				join(absDir, artifact.filename),
				artifactContent,
				"utf-8",
			);
			console.log(`  Written: ${join(absDir, artifact.filename)}`);
		}
	}

	if (format === "json" || format === "both") {
		const jsonContent = generateJsonReport(report);
		await writeFile(join(absDir, "report.json"), jsonContent, "utf-8");
		console.log(`  Written: ${join(absDir, "report.json")}`);
	}
}

// ─── Resolve LLM Provider ────────────────────────────────────────────────

function resolveProvider(providerName?: string): LLMProvider | null {
	if (providerName) {
		const result = createProvider(providerName as ProviderId);
		if (result.ok) return result.value;
		console.warn(`  Warning: Could not create provider "${providerName}": ${result.error.message}`);
		return null;
	}

	const result = getDefaultProvider();
	if (result.ok) return result.value;

	// No provider configured — that's fine, we can still do deterministic analysis
	return null;
}

// ─── Parse Markets String ─────────────────────────────────────────────────

const MARKET_ALIASES: Readonly<Record<string, Jurisdiction>> = {
	eu: "eu-ai-act",
	"eu-ai-act": "eu-ai-act",
	gdpr: "eu-gdpr",
	"eu-gdpr": "eu-gdpr",
	us: "us-federal",
	"us-federal": "us-federal",
	california: "us-ca",
	"us-ca": "us-ca",
	ca: "us-ca",
	colorado: "us-co",
	"us-co": "us-co",
	co: "us-co",
	illinois: "us-il",
	"us-il": "us-il",
	il: "us-il",
	nyc: "us-ny",
	"us-ny": "us-ny",
	ny: "us-ny",
	texas: "us-tx",
	"us-tx": "us-tx",
	tx: "us-tx",
	uk: "uk",
	singapore: "singapore",
	sg: "singapore",
	china: "china",
	cn: "china",
	brazil: "brazil",
	br: "brazil",
};

function parseMarkets(marketsStr: string): Jurisdiction[] {
	return marketsStr
		.split(",")
		.map((m) => m.trim().toLowerCase())
		.map((m) => MARKET_ALIASES[m])
		.filter((m): m is Jurisdiction => m !== undefined);
}

// ─── Print Summary to Console ─────────────────────────────────────────────

function printSummary(report: LaunchClearReport): void {
	console.log("\n╔══════════════════════════════════════════════════╗");
	console.log("║           LaunchClear — Analysis Complete         ║");
	console.log("╚══════════════════════════════════════════════════╝\n");

	// Market readiness
	console.log("  Market Readiness:");
	for (const market of report.summary.canLaunch) {
		let icon: string;
		switch (market.status) {
			case "ready":
				icon = "✓";
				break;
			case "action-required":
				icon = "!";
				break;
			case "blocked":
				icon = "✗";
				break;
		}
		console.log(`    ${icon}  ${market.jurisdiction}: ${market.status}`);
		for (const blocker of market.blockers) {
			console.log(`       - ${blocker}`);
		}
	}
	console.log("");

	// Key metrics
	console.log(`  Highest Risk Market: ${report.summary.highestRiskMarket}`);
	console.log(
		`  Lowest Friction Market: ${report.summary.lowestFrictionMarket}`,
	);
	console.log(`  Artifacts Needed: ${report.summary.totalArtifactsNeeded}`);
	console.log(`  Actions Needed: ${report.summary.totalActionsNeeded}`);
	console.log("");

	// Critical actions
	if (report.actionPlan.critical.length > 0) {
		console.log("  Critical Actions:");
		for (const action of report.actionPlan.critical.slice(0, 5)) {
			console.log(`    - ${action.title}`);
			console.log(`      Jurisdictions: ${action.jurisdiction.join(", ")}`);
			if (action.deadline) {
				console.log(`      Deadline: ${action.deadline}`);
			}
		}
		if (report.actionPlan.critical.length > 5) {
			console.log(
				`    ... and ${report.actionPlan.critical.length - 5} more`,
			);
		}
		console.log("");
	}
}

// ─── CLI Definition ───────────────────────────────────────────────────────

const program = new Command();

program
	.name("launchclear")
	.description(
		"Compliance artifact and action generator for AI product teams",
	)
	.version("0.1.0");

// Default command: interactive mode
program
	.command("start", { isDefault: true })
	.description("Start interactive compliance intake interview")
	.option("-o, --output <dir>", "Output directory", "./launchclear-report")
	.option("-f, --format <format>", "Output format: markdown, json, both", "both")
	.option("-p, --provider <name>", "LLM provider: anthropic, openai, ollama")
	.action(
		async (options: {
			output: string;
			format: string;
			provider?: string;
		}) => {
			initRegistry();

			const intakeResult = await runInteractiveIntake();
			if (!intakeResult.ok) {
				console.error(`\n  Error: ${intakeResult.error}\n`);
				process.exit(1);
			}

			const provider = resolveProvider(options.provider);
			const report = await buildReport(intakeResult.value, provider);

			printSummary(report);

			const format = options.format as "markdown" | "json" | "both";
			await writeOutput(report, options.output, format);
			console.log(`\n  Report written to: ${resolve(options.output)}\n`);
		},
	);

// Quick check mode
program
	.command("check <scenario>")
	.description(
		'Quick compliance check from a scenario description (e.g., "AI resume screening tool")',
	)
	.requiredOption(
		"-m, --markets <markets>",
		"Comma-separated target markets (e.g., eu,us-ca,uk)",
	)
	.option("-o, --output <dir>", "Output directory", "./launchclear-report")
	.option("-f, --format <format>", "Output format: markdown, json, both", "both")
	.option("-p, --provider <name>", "LLM provider: anthropic, openai, ollama")
	.action(
		async (
			scenario: string,
			options: {
				markets: string;
				output: string;
				format: string;
				provider?: string;
			},
		) => {
			initRegistry();

			const markets = parseMarkets(options.markets);
			if (markets.length === 0) {
				console.error(
					"\n  Error: No valid markets specified. Use --markets eu,us-ca,uk\n",
				);
				process.exit(1);
			}

			console.log(`\n  Scenario: "${scenario}"`);
			console.log(`  Markets: ${markets.join(", ")}\n`);

			const contextResult = buildQuickContext(scenario, markets);
			if (!contextResult.ok) {
				console.error(`\n  Error: ${contextResult.error}\n`);
				process.exit(1);
			}

			const provider = resolveProvider(options.provider);
			const report = await buildReport(contextResult.value, provider);

			printSummary(report);

			const format = options.format as "markdown" | "json" | "both";
			await writeOutput(report, options.output, format);
			console.log(`\n  Report written to: ${resolve(options.output)}\n`);
		},
	);

// List jurisdictions
program
	.command("jurisdictions")
	.description("List supported jurisdictions")
	.action(() => {
		initRegistry();

		const jurisdictions = listJurisdictions();

		console.log("\n  Supported Jurisdictions:\n");
		console.log("  %-15s %-8s %s", "ID", "Region", "Name");
		console.log("  " + "-".repeat(50));

		for (const j of jurisdictions) {
			console.log("  %-15s %-8s %s", j.id, j.region, j.name);
		}

		const allMarkets: Jurisdiction[] = [
			"eu-ai-act", "eu-gdpr", "us-federal", "us-ca", "us-co",
			"us-il", "us-ny", "us-tx", "uk", "singapore", "china", "brazil",
		];
		const registered = new Set(jurisdictions.map((j) => j.id));
		const unregistered = allMarkets.filter((m) => !registered.has(m));

		if (unregistered.length > 0) {
			console.log(
				`\n  Coming soon: ${unregistered.join(", ")}\n`,
			);
		} else {
			console.log("");
		}
	});

// List artifact types
program
	.command("artifacts")
	.description("List available compliance artifact templates")
	.action(async () => {
		const result = await listAvailableTemplates();
		if (!result.ok) {
			console.error(`\n  Error: ${result.error.message}\n`);
			process.exit(1);
		}

		console.log("\n  Available Artifact Templates:\n");
		for (const id of result.value) {
			console.log(`    - ${id}`);
		}
		console.log("");
	});

// Parse and run
program.parse();
