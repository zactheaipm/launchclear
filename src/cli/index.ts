#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Command } from "commander";
import { generateActionPlan, generateActionPlanWithoutLLM } from "../actions/generator.js";
import { generateArtifacts } from "../artifacts/generator.js";
import { listAvailableTemplates } from "../artifacts/generator.js";
import { getKnowledgeBaseVersion } from "../core/knowledge-version.js";
import type {
	ActionPlan,
	Jurisdiction,
	LLMProvider,
	LaunchClearReport,
	ProductContext,
} from "../core/types.js";
import { brazilModule } from "../jurisdictions/jurisdictions/brazil.js";
import { chinaModule } from "../jurisdictions/jurisdictions/china.js";
import { euAiActModule } from "../jurisdictions/jurisdictions/eu-ai-act.js";
import { euGdprModule } from "../jurisdictions/jurisdictions/eu-gdpr.js";
import { singaporeModule } from "../jurisdictions/jurisdictions/singapore.js";
import { ukModule } from "../jurisdictions/jurisdictions/uk.js";
import { usFederalModule } from "../jurisdictions/jurisdictions/us-federal.js";
import { californiaModule } from "../jurisdictions/jurisdictions/us-states/california.js";
import { coloradoModule } from "../jurisdictions/jurisdictions/us-states/colorado.js";
import { illinoisModule } from "../jurisdictions/jurisdictions/us-states/illinois.js";
import { newYorkModule } from "../jurisdictions/jurisdictions/us-states/new-york.js";
import { texasModule } from "../jurisdictions/jurisdictions/us-states/texas.js";
import { listJurisdictions, registerJurisdiction } from "../jurisdictions/registry.js";
import { aggregateRequirements, mapAllJurisdictions } from "../jurisdictions/requirement-mapper.js";
import { generateJsonReport } from "../output/json.js";
import {
	buildMarketReadiness,
	generateArtifactMarkdown,
	generateMarkdownReport,
	generateSummaryMarkdown,
} from "../output/markdown.js";
import { createProvider, getDefaultProvider } from "../providers/index.js";
import type { ProviderId } from "../providers/index.js";
import { buildQuickContext, runInteractiveIntake } from "./interactive.js";

// ─── Error Formatting ─────────────────────────────────────────────────────

function formatError(err: unknown): string {
	if (typeof err === "object" && err !== null && "category" in err) {
		const lcErr = err as { category: string; message: string };
		switch (lcErr.category) {
			case "template-load":
				return `Template error: ${lcErr.message}\n  → Check that knowledge/templates/ directory exists and contains valid templates.`;
			case "llm-provider":
				return `LLM provider error: ${lcErr.message}\n  → Verify your API key is set (ANTHROPIC_API_KEY, OPENAI_API_KEY, or OLLAMA_BASE_URL).`;
			case "validation":
				return `Validation error: ${lcErr.message}\n  → Check your input data against the expected schema.`;
			case "provision-not-found":
				return `Provision not found: ${lcErr.message}\n  → Run "launchclear update-regulations" to refresh the knowledge base.`;
			case "file-io":
				return `File I/O error: ${lcErr.message}\n  → Check file permissions and available disk space.`;
			case "intake":
				return `Intake error: ${lcErr.message}\n  → Ensure all required questions are answered.`;
			case "jurisdiction-mapping":
				return `Jurisdiction mapping error: ${lcErr.message}\n  → Run "launchclear jurisdictions" to see supported jurisdictions.`;
			default:
				return lcErr.message;
		}
	}
	if (err instanceof Error) return err.message;
	return String(err);
}

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
	registerJurisdiction({
		id: "us-ca",
		name: "California",
		region: "US",
		description: "California CCPA/CPRA, SB 942 GenAI transparency, deepfake laws",
		module: californiaModule,
	});
	registerJurisdiction({
		id: "us-co",
		name: "Colorado",
		region: "US",
		description: "Colorado AI Act (SB 24-205)",
		module: coloradoModule,
	});
	registerJurisdiction({
		id: "us-il",
		name: "Illinois",
		region: "US",
		description: "Illinois BIPA, AI Video Interview Act, HRA AI amendment",
		module: illinoisModule,
	});
	registerJurisdiction({
		id: "us-ny",
		name: "New York",
		region: "US",
		description: "NYC Local Law 144 (AEDT bias audits)",
		module: newYorkModule,
	});
	registerJurisdiction({
		id: "us-tx",
		name: "Texas",
		region: "US",
		description: "Texas TRAIGA, deepfake laws",
		module: texasModule,
	});
	registerJurisdiction({
		id: "uk",
		name: "United Kingdom",
		region: "UK",
		description: "UK AI governance (ICO, AISI, DSIT, FCA)",
		module: ukModule,
	});
	registerJurisdiction({
		id: "singapore",
		name: "Singapore",
		region: "APAC",
		description: "Singapore AI governance (PDPC, IMDA GenAI, IMDA Agentic AI, MAS)",
		module: singaporeModule,
	});
	registerJurisdiction({
		id: "china",
		name: "China",
		region: "APAC",
		description: "China AI regulation (CAC GenAI, Deep Synthesis, Algorithm Registry)",
		module: chinaModule,
	});
	registerJurisdiction({
		id: "brazil",
		name: "Brazil",
		region: "LATAM",
		description: "Brazil LGPD and AI Bill (PL 2338/2023)",
		module: brazilModule,
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
			console.warn(`  Warning: Could not map ${err.jurisdiction}: ${err.error}`);
		}
	}

	const aggregated = aggregateRequirements(mapResult.results);
	const marketReadiness = buildMarketReadiness(mapResult.results);

	// Generate action plan
	let actionPlan: ActionPlan | undefined;
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
				console.warn(`  Warning: Failed to generate ${err.artifactType}: ${err.error}`);
			}
		}
	} else {
		console.log("  Skipping artifact generation (no LLM provider configured).");
		console.log("  Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or OLLAMA_BASE_URL to enable.");
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
			knowledgeBaseVersion: getKnowledgeBaseVersion().version,
			intakeTranscript: Object.entries(ctx.answers).map(([id, answer]) => ({
				questionId: id,
				questionText: id,
				answer: answer.value,
				freeText: answer.freeText,
			})),
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
			await writeFile(join(absDir, artifact.filename), artifactContent, "utf-8");
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
	const tokens = marketsStr.split(",").map((m) => m.trim().toLowerCase());
	const results: Jurisdiction[] = [];
	for (const token of tokens) {
		const mapped = MARKET_ALIASES[token];
		if (mapped) {
			results.push(mapped);
		} else {
			console.warn(
				`  Warning: Unrecognized market "${token}" — skipping. Use "launchclear jurisdictions" to see valid options.`,
			);
		}
	}
	return results;
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
	console.log(`  Lowest Friction Market: ${report.summary.lowestFrictionMarket}`);
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
			console.log(`    ... and ${report.actionPlan.critical.length - 5} more`);
		}
		console.log("");
	}
}

// ─── CLI Definition ───────────────────────────────────────────────────────

const program = new Command();

program
	.name("launchclear")
	.description("Compliance artifact and action generator for AI product teams")
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
			console.log("  ⚠  DISCLAIMER: LaunchClear generates draft documents to help prepare");
			console.log("     for conversations with qualified legal counsel. It does not provide");
			console.log("     legal advice. All outputs should be reviewed by a qualified lawyer.\n");

			const kbInfo = getKnowledgeBaseVersion();
			if (kbInfo.isStale) {
				console.log(
					"  ⚠  Knowledge base is over 60 days old. Run `launchclear update-regulations` to refresh.\n",
				);
			}

			const intakeResult = await runInteractiveIntake();
			if (!intakeResult.ok) {
				console.error(`\n  Error: ${intakeResult.error}\n`);
				process.exit(1);
			}

			if (intakeResult.value.targetMarkets.length === 0) {
				console.error(
					"\n  Error: No markets selected. Please select at least one market to analyze.\n",
				);
				process.exit(1);
			}

			const provider = resolveProvider(options.provider);
			const report = await buildReport(intakeResult.value, provider);

			printSummary(report);

			const format = options.format as "markdown" | "json" | "both";
			try {
				await writeOutput(report, options.output, format);
				console.log(`\n  Report written to: ${resolve(options.output)}\n`);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				console.error(
					`\n  Error: Failed to write output to "${resolve(options.output)}": ${msg}\n`,
				);
				process.exit(1);
			}
		},
	);

// Quick check mode
program
	.command("check <scenario>")
	.description(
		'Quick compliance check from a scenario description (e.g., "AI resume screening tool")',
	)
	.requiredOption("-m, --markets <markets>", "Comma-separated target markets (e.g., eu,us-ca,uk)")
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
			console.log("  ⚠  DISCLAIMER: LaunchClear generates draft documents to help prepare");
			console.log("     for conversations with qualified legal counsel. It does not provide");
			console.log("     legal advice. All outputs should be reviewed by a qualified lawyer.\n");

			const kbInfo = getKnowledgeBaseVersion();
			if (kbInfo.isStale) {
				console.log(
					"  ⚠  Knowledge base is over 60 days old. Run `launchclear update-regulations` to refresh.\n",
				);
			}

			const markets = parseMarkets(options.markets);
			if (markets.length === 0) {
				console.error("\n  Error: No valid markets specified. Use --markets eu,us-ca,uk\n");
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
			try {
				await writeOutput(report, options.output, format);
				console.log(`\n  Report written to: ${resolve(options.output)}\n`);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				console.error(
					`\n  Error: Failed to write output to "${resolve(options.output)}": ${msg}\n`,
				);
				process.exit(1);
			}
		},
	);

// List jurisdictions
program
	.command("jurisdictions")
	.description("List supported jurisdictions")
	.action(() => {
		const jurisdictions = listJurisdictions();

		console.log("\n  Supported Jurisdictions:\n");
		console.log(`  ${"ID".padEnd(15)} ${"Region".padEnd(8)} Name`);
		console.log(`  ${"-".repeat(50)}`);

		for (const j of jurisdictions) {
			console.log(`  ${j.id.padEnd(15)} ${j.region.padEnd(8)} ${j.name}`);
		}

		const allMarkets: Jurisdiction[] = [
			"eu-ai-act",
			"eu-gdpr",
			"us-federal",
			"us-ca",
			"us-co",
			"us-il",
			"us-ny",
			"us-tx",
			"uk",
			"singapore",
			"china",
			"brazil",
		];
		const registered = new Set(jurisdictions.map((j) => j.id));
		const unregistered = allMarkets.filter((m) => !registered.has(m));

		if (unregistered.length > 0) {
			console.log(`\n  Coming soon: ${unregistered.join(", ")}\n`);
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

// Update regulation knowledge base
program
	.command("update-regulations")
	.description("Fetch, process, and diff regulation sources to update the knowledge base")
	.option("-s, --sources <ids>", "Comma-separated source IDs to update (default: all)")
	.option("--skip-diff", "Skip diffing against existing knowledge base")
	.action(
		async (options: {
			sources?: string;
			skipDiff?: boolean;
		}) => {
			const { runPipelineForAll } = await import("../regulations/index.js");

			const sourceIds = options.sources
				? options.sources.split(",").map((s) => s.trim())
				: undefined;

			console.log("\n  LaunchClear — Regulation Update Pipeline\n");
			console.log(`  Sources: ${sourceIds ? sourceIds.join(", ") : "all"}`);
			console.log("");

			const result = await runPipelineForAll({
				sourceIds,
				skipDiff: options.skipDiff,
				onProgress: (sourceId: string, index: number, total: number) => {
					console.log(`  [${index + 1}/${total}] Fetching ${sourceId}...`);
				},
			});

			// Print results
			console.log("");
			console.log("  Results:");
			console.log(`    Succeeded: ${result.successes.length}`);
			console.log(`    Failed: ${result.failures.length}`);
			console.log(`    Snapshot: knowledge/snapshots/${result.snapshotDate}/`);

			if (result.failures.length > 0) {
				console.log("\n  Failures:");
				for (const f of result.failures) {
					console.log(`    - ${f.sourceId}: ${f.error}`);
				}
			}

			// Print changelogs
			const withChanges = result.successes.filter((s) => s.changelog !== null);
			if (withChanges.length > 0) {
				console.log("\n  Changes Detected:");
				for (const s of withChanges) {
					console.log(`    ${s.sourceId}: ${s.changelog?.summary}`);
					if (s.changelog && s.changelog.affectedMappings.length > 0) {
						console.log(`      Affected mappings: ${s.changelog.affectedMappings.join(", ")}`);
					}
				}
			} else {
				console.log("\n  No changes detected in any sources.");
			}

			// Print validation warnings
			const withWarnings = result.successes.filter((s) => s.validation.warnings.length > 0);
			if (withWarnings.length > 0) {
				console.log("\n  Validation Warnings:");
				for (const s of withWarnings) {
					for (const w of s.validation.warnings) {
						console.log(`    [${s.sourceId}] ${w.sectionId}: ${w.message}`);
					}
				}
			}

			console.log("");
		},
	);

// Show regulation changes since a date
program
	.command("diff")
	.description("Show regulation changes since a given date")
	.requiredOption("--since <date>", "Show changes since this date (YYYY-MM or YYYY-MM-DD)")
	.option("-s, --source <id>", "Filter to a specific source ID")
	.action(
		async (options: {
			since: string;
			source?: string;
		}) => {
			const { loadChangelogsSince } = await import("../regulations/differ.js");

			console.log(`\n  LaunchClear — Regulation Changes Since ${options.since}\n`);

			const result = await loadChangelogsSince(options.since);
			if (!result.ok) {
				console.error(`  Error: ${result.error.message}\n`);
				process.exit(1);
			}

			let changelogs = [...result.value];
			if (options.source) {
				changelogs = changelogs.filter((c) => c.sourceId === options.source);
			}

			if (changelogs.length === 0) {
				console.log("  No changes found since the specified date.\n");
				return;
			}

			for (const changelog of changelogs) {
				console.log(`  Source: ${changelog.sourceId}`);
				console.log(`  Version: ${changelog.previousVersion} -> ${changelog.currentVersion}`);
				console.log(`  Summary: ${changelog.summary}`);
				console.log("");

				for (const entry of changelog.entries) {
					const icon = entry.type === "added" ? "+" : entry.type === "removed" ? "-" : "~";
					console.log(`    [${icon}] ${entry.title}`);
					console.log(`        ${entry.description}`);
				}

				if (changelog.affectedMappings.length > 0) {
					console.log("\n  Affected requirement mappings:");
					for (const id of changelog.affectedMappings) {
						console.log(`    - ${id}`);
					}
				}
				console.log("");
			}
		},
	);

// Initialize jurisdiction registry once before parsing commands
initRegistry();

// Parse and run
program.parse();
