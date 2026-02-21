import inquirer from "inquirer";
import type {
	Answer,
	IntakeQuestion,
	Jurisdiction,
	ProductContext,
	Result,
} from "../core/types.js";
import { buildProductContext } from "../intake/context-builder.js";
import { getNextQuestions } from "../intake/question-router.js";
import { loadAllQuestions } from "../intake/questions.js";

// ─── Inquirer Question Adapters ───────────────────────────────────────────

function mapQuestionType(q: IntakeQuestion): "input" | "list" | "checkbox" | "confirm" {
	switch (q.type) {
		case "free-text":
			return "input";
		case "single-select":
			return "list";
		case "multi-select":
			return "checkbox";
		case "yes-no":
		case "yes-no-elaborate":
			return "confirm";
		case "scale":
			return "list";
		default:
			return "input";
	}
}

function buildChoices(q: IntakeQuestion): { name: string; value: string }[] | undefined {
	if (!q.options) return undefined;
	return q.options.map((opt) => ({
		name: opt.description ? `${opt.label} — ${opt.description}` : opt.label,
		value: opt.value,
	}));
}

// biome-ignore lint/suspicious/noExplicitAny: inquirer's Question type requires `any` for generic prompt construction
function toInquirerQuestion(q: IntakeQuestion): any {
	const type = mapQuestionType(q);
	const base: {
		type: string;
		name: string;
		message: string;
		choices?: { name: string; value: string }[];
		validate?: (input: unknown) => string | boolean;
	} = {
		type,
		name: q.id,
		message: q.text,
	};

	if (q.options && (type === "list" || type === "checkbox")) {
		base.choices = buildChoices(q);
	}

	if (type === "checkbox") {
		base.validate = (input: unknown) => {
			if (Array.isArray(input) && input.length === 0) {
				return "Please select at least one option.";
			}
			return true;
		};
	}

	return base;
}

// ─── Answer Recording ─────────────────────────────────────────────────────

function recordAnswer(
	answers: Record<string, Answer>,
	questionId: string,
	rawValue: unknown,
): void {
	let value: string | string[] | boolean;

	if (typeof rawValue === "boolean") {
		value = rawValue;
	} else if (Array.isArray(rawValue)) {
		value = rawValue as string[];
	} else {
		value = String(rawValue);
	}

	answers[questionId] = {
		questionId,
		value,
		timestamp: new Date().toISOString(),
	};
}

// ─── Progress Display ─────────────────────────────────────────────────────

function displayProgress(answeredCount: number, totalEstimate: number): void {
	const pct = Math.min(100, Math.round((answeredCount / totalEstimate) * 100));
	const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
	console.log(`\n  Progress: [${bar}] ${pct}%\n`);
}

// ─── Jurisdiction extraction helper ───────────────────────────────────────

function getSelectedJurisdictions(
	answers: Readonly<Record<string, Answer>>,
): Jurisdiction[] | undefined {
	const marketAnswer = answers["target-markets"];
	if (!marketAnswer) return undefined;
	if (Array.isArray(marketAnswer.value)) {
		return marketAnswer.value as Jurisdiction[];
	}
	return undefined;
}

// ─── Follow-up for yes-no-elaborate ───────────────────────────────────────

async function askFollowUp(questionId: string): Promise<string | undefined> {
	const { elaborate } = await inquirer.prompt([
		{
			type: "input",
			name: "elaborate",
			message: "  Please elaborate (press Enter to skip):",
		},
	]);
	return elaborate && String(elaborate).trim().length > 0 ? String(elaborate) : undefined;
}

// ─── Main Interactive Interview ───────────────────────────────────────────

export async function runInteractiveIntake(): Promise<Result<ProductContext, string>> {
	console.log("\n╔══════════════════════════════════════════════════╗");
	console.log("║          LaunchClear — Compliance Intake         ║");
	console.log("╚══════════════════════════════════════════════════╝\n");
	console.log("  Answer the following questions about your AI product.");
	console.log("  LaunchClear will determine your compliance requirements.\n");

	// Load all questions
	const questionsResult = loadAllQuestions();
	if (!questionsResult.ok) {
		return {
			ok: false,
			error: `Failed to load questions: ${questionsResult.error.message}`,
		};
	}

	const allQuestions = questionsResult.value;
	const answers: Record<string, Answer> = {};

	// Iterative questioning loop
	let round = 0;
	const MAX_ROUNDS = 20;

	while (round < MAX_ROUNDS) {
		round++;

		const selectedJurisdictions = getSelectedJurisdictions(answers);
		const nextQuestions = getNextQuestions(allQuestions, answers, selectedJurisdictions);

		if (nextQuestions.length === 0) {
			break;
		}

		displayProgress(
			Object.keys(answers).length,
			Object.keys(answers).length + nextQuestions.length,
		);

		// Ask questions one at a time for better UX
		for (const question of nextQuestions) {
			// Show regulatory relevance context
			console.log(`  ℹ  ${question.regulatoryRelevance}\n`);

			const inquirerQ = toInquirerQuestion(question);
			const result = await inquirer.prompt([inquirerQ]);
			const rawValue = result[question.id];

			recordAnswer(answers, question.id, rawValue);

			// Handle yes-no-elaborate: ask for elaboration after yes
			if (question.type === "yes-no-elaborate" && rawValue === true) {
				const elaboration = await askFollowUp(question.id);
				const existing = answers[question.id];
				if (elaboration && existing) {
					answers[question.id] = {
						questionId: existing.questionId,
						value: existing.value,
						timestamp: existing.timestamp,
						freeText: elaboration,
					};
				}
			}
		}
	}

	if (round >= MAX_ROUNDS) {
		console.warn("\n  Warning: Interview reached the maximum number of rounds (20).");
		console.warn("  Some conditional questions may not have been asked.");
		console.warn("  Consider re-running with more specific initial answers.\n");
	}

	// Build product context
	console.log("\n  Building product context from your answers...\n");

	const contextResult = buildProductContext(answers);
	if (!contextResult.ok) {
		const errorMessages = contextResult.error.map((e) => `${e.field}: ${e.message}`).join(", ");
		return {
			ok: false,
			error: `Missing required information: ${errorMessages}`,
		};
	}

	return { ok: true, value: contextResult.value };
}

// ─── Quick Check (non-interactive, from description + markets) ────────────

export function buildQuickContext(
	description: string,
	markets: readonly Jurisdiction[],
): Result<ProductContext, string> {
	// Infer product type from description
	const descLower = description.toLowerCase();
	let productType: ProductContext["productType"] = "other";

	if (
		descLower.includes("screen") ||
		descLower.includes("filter") ||
		descLower.includes("classif")
	) {
		productType = "classifier";
	} else if (descLower.includes("recommend")) {
		productType = "recommender";
	} else if (
		descLower.includes("generat") ||
		descLower.includes("chatbot") ||
		descLower.includes("llm")
	) {
		productType = "generator";
	} else if (descLower.includes("predict") || descLower.includes("forecast")) {
		productType = "predictor";
	} else if (descLower.includes("detect") || descLower.includes("anomal")) {
		productType = "detector";
	} else if (
		descLower.includes("rank") ||
		descLower.includes("sort") ||
		descLower.includes("priorit")
	) {
		productType = "ranker";
	} else if (descLower.includes("agent") || descLower.includes("autonom")) {
		productType = "agent";
	} else if (descLower.includes("foundation") || descLower.includes("gpai")) {
		productType = "foundation-model";
	}

	// Infer data categories
	const dataProcessed: ProductContext["dataProcessed"][number][] = ["personal"];
	if (
		descLower.includes("resume") ||
		descLower.includes("hiring") ||
		descLower.includes("employ") ||
		descLower.includes("job")
	) {
		dataProcessed.push("employment");
	}
	if (
		descLower.includes("health") ||
		descLower.includes("medical") ||
		descLower.includes("patient")
	) {
		dataProcessed.push("health");
	}
	if (
		descLower.includes("biometric") ||
		descLower.includes("face") ||
		descLower.includes("fingerprint")
	) {
		dataProcessed.push("biometric");
	}
	if (
		descLower.includes("financial") ||
		descLower.includes("credit") ||
		descLower.includes("income")
	) {
		dataProcessed.push("financial");
	}

	// Infer user populations
	const userPopulations: ProductContext["userPopulations"][number][] = [];
	if (
		descLower.includes("resume") ||
		descLower.includes("hiring") ||
		descLower.includes("applicant") ||
		descLower.includes("candidate")
	) {
		userPopulations.push("job-applicants");
	}
	if (descLower.includes("employee") || descLower.includes("worker")) {
		userPopulations.push("employees");
	}
	if (
		descLower.includes("consumer") ||
		descLower.includes("user") ||
		descLower.includes("customer")
	) {
		userPopulations.push("consumers");
	}
	if (descLower.includes("student")) {
		userPopulations.push("students");
	}
	if (descLower.includes("credit") && descLower.includes("applicant")) {
		userPopulations.push("credit-applicants");
	}
	if (userPopulations.length === 0) {
		userPopulations.push("general-public");
	}

	// Infer decision impact
	let decisionImpact: ProductContext["decisionImpact"] = "advisory";
	if (
		descLower.includes("auto-reject") ||
		descLower.includes("auto reject") ||
		descLower.includes("automat")
	) {
		decisionImpact = "determinative";
	} else if (
		descLower.includes("screen") ||
		descLower.includes("filter") ||
		descLower.includes("rank") ||
		descLower.includes("score")
	) {
		decisionImpact = "material";
	}

	// Infer automation level
	let automationLevel: ProductContext["automationLevel"] = "human-on-the-loop";
	if (
		descLower.includes("auto-reject") ||
		descLower.includes("fully automat") ||
		descLower.includes("automatic")
	) {
		automationLevel = "fully-automated";
	} else if (descLower.includes("human review") || descLower.includes("manual review")) {
		automationLevel = "human-in-the-loop";
	}

	// Infer financial services sector context
	const financialKeywords = [
		"credit",
		"lending",
		"insurance",
		"trading",
		"aml",
		"banking",
		"loan",
		"underwriting",
		"kyc",
		"anti-money",
	];
	const isFinancialSector = financialKeywords.some((kw) => descLower.includes(kw));

	const sectorContext: ProductContext["sectorContext"] = isFinancialSector
		? {
				sector: "financial-services",
				financialServices: {
					subSector: "banking",
					involvesCredit:
						descLower.includes("credit") ||
						descLower.includes("loan") ||
						descLower.includes("lending"),
					involvesInsurancePricing: descLower.includes("insurance"),
					involvesTrading: descLower.includes("trading") || descLower.includes("algorithmic"),
					involvesAmlKyc:
						descLower.includes("aml") ||
						descLower.includes("kyc") ||
						descLower.includes("anti-money"),
					involvesRegulatoryReporting: false,
					regulatoryBodies: [],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			}
		: undefined;

	const context: ProductContext = {
		description,
		productType,
		dataProcessed,
		userPopulations,
		decisionImpact,
		automationLevel,
		trainingData: {
			usesTrainingData: false,
			sources: [],
			containsPersonalData: false,
			consentObtained: null,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: markets,
		existingMeasures: [],
		answers: {},
		sourceMode: "cli-interview",
		...(sectorContext ? { sectorContext } : {}),
	};

	return { ok: true, value: context };
}
