import type { CodebaseContext, CodebaseSignal, IntakeQuestion } from "../core/types.js";

/**
 * Compares CodebaseContext against required ProductContext fields,
 * returns the list of intake questions that still need answers.
 *
 * Key principle: some things can NEVER be inferred from code alone
 * and must ALWAYS be asked. Additional must-ask questions are triggered
 * when specific signal categories are detected in the codebase.
 */

// ─── Always-Required Questions ──────────────────────────────────────────────

const alwaysRequiredQuestions: readonly IntakeQuestion[] = [
	{
		id: "gap-business-context",
		text: "What is the business purpose of this application? What problem does it solve for its users?",
		type: "free-text",
		category: "core",
		regulatoryRelevance:
			"Business context determines risk classification under the EU AI Act, " +
			"applicability of sector-specific regulations, and the scope of required " +
			"compliance artifacts. Code reveals technical capabilities, not business intent.",
	},
	{
		id: "gap-target-markets",
		text: "Which markets/jurisdictions are you targeting for launch?",
		type: "multi-select",
		category: "core",
		options: [
			{ value: "eu-ai-act", label: "EU (AI Act)" },
			{ value: "eu-gdpr", label: "EU (GDPR)" },
			{ value: "us-federal", label: "US Federal" },
			{ value: "us-ca", label: "US — California" },
			{ value: "us-co", label: "US — Colorado" },
			{ value: "us-il", label: "US — Illinois" },
			{ value: "us-ny", label: "US — New York" },
			{ value: "us-tx", label: "US — Texas" },
			{ value: "uk", label: "United Kingdom" },
			{ value: "singapore", label: "Singapore" },
			{ value: "china", label: "China" },
			{ value: "brazil", label: "Brazil" },
		],
		regulatoryRelevance:
			"Target markets determine which regulations apply. This is never " +
			"present in the codebase and must always be asked.",
	},
	{
		id: "gap-human-review",
		text: "Does your application have human review processes for AI-generated outputs or decisions? If so, how are reviews conducted in practice — are they substantive (reviewer can override and has time to evaluate) or procedural (rubber-stamp)?",
		type: "yes-no-elaborate",
		category: "core",
		regulatoryRelevance:
			"Meaningful human oversight is a key requirement under the EU AI Act " +
			"(Article 14), Singapore's IMDA frameworks, and US state laws like the " +
			"Colorado AI Act. Code may show a review queue exists, but cannot reveal " +
			"whether reviews are meaningful in practice.",
	},
];

// ─── GenAI-Triggered Questions ──────────────────────────────────────────────

const genAiTriggeredQuestions: readonly IntakeQuestion[] = [
	{
		id: "gap-genai-provider-role",
		text: "What is your role in the AI model supply chain? Are you the foundation model provider, a deployer using a third-party model via API, or both (e.g., you fine-tune and redistribute)?",
		type: "single-select",
		category: "generative-ai",
		options: [
			{ value: "provider", label: "Model provider (trained/host the model)" },
			{ value: "deployer", label: "Deployer (use third-party model via API)" },
			{ value: "both", label: "Both (fine-tune and serve)" },
		],
		regulatoryRelevance:
			"The provider vs. deployer distinction drives fundamentally different " +
			"obligations under the EU AI Act (GPAI Articles 51-56), China's CAC " +
			"GenAI measures, and the UK framework. Code shows API calls but not " +
			"the legal relationship.",
	},
	{
		id: "gap-genai-content-disclosure",
		text: "How do you disclose to users that content is AI-generated? Do your disclosure practices meet the specific requirements of your target jurisdictions (e.g., China's mandatory labeling, EU AI Act Article 50, California SB 942)?",
		type: "yes-no-elaborate",
		category: "generative-ai",
		regulatoryRelevance:
			"Almost every jurisdiction now requires AI-generated content disclosure. " +
			"Code may show watermarking libraries or metadata headers, but not whether " +
			"the implementation meets jurisdiction-specific format and placement requirements.",
	},
	{
		id: "gap-genai-training-data-provenance",
		text: "What is the provenance of your training data? Do you have copyright licenses for copyrighted material? Are there opt-out mechanisms for data subjects? Was consent obtained for personal data in training sets?",
		type: "free-text",
		category: "generative-ai",
		regulatoryRelevance:
			"EU AI Act Article 53(1)(c) requires copyright compliance summaries. " +
			"China CAC measures require training data legality verification. " +
			"Brazil's AI Bill requires training data disclosure. Code shows data " +
			"loading scripts but not whether rights have been secured.",
	},
];

// ─── Agentic AI-Triggered Questions ─────────────────────────────────────────

const agenticTriggeredQuestions: readonly IntakeQuestion[] = [
	{
		id: "gap-agentic-checkpoints",
		text: "How do human checkpoints work in practice for your AI agent? When the agent reaches a checkpoint, what happens? Can the human reviewer meaningfully evaluate and override the agent's proposed action?",
		type: "free-text",
		category: "agentic-ai",
		regulatoryRelevance:
			"Singapore's IMDA Agentic AI Framework requires 'meaningful human " +
			"accountability' — not just technical approval gates but substantive " +
			"oversight. Code shows approval functions exist but not whether they " +
			"represent genuine oversight or rubber-stamps.",
	},
	{
		id: "gap-agentic-autonomy-boundary",
		text: "What are the actual autonomy boundaries for your AI agent in production? Are there actions it can take in development/testing that are restricted in production? What is the maximum impact of an unsupervised action?",
		type: "free-text",
		category: "agentic-ai",
		regulatoryRelevance:
			"Risk bounding (limiting autonomy, tool access, and data access) is the " +
			"first dimension of Singapore's IMDA Agentic AI Framework. The EU AI Act " +
			"human oversight requirements (Article 14) also depend on actual production " +
			"autonomy, not development-time capabilities.",
	},
];

// ─── Financial Service-Triggered Questions ──────────────────────────────────

const financialTriggeredQuestions: readonly IntakeQuestion[] = [
	{
		id: "gap-fin-regulatory-status",
		text: "What is your organization's financial sector regulatory status? Which financial regulators supervise your operations (e.g., MAS, FCA, OCC, BaFin, SEC)?",
		type: "free-text",
		category: "financial-services",
		regulatoryRelevance:
			"Regulated financial institutions face additional AI obligations from " +
			"their financial supervisors. MAS Guidelines on AI Risk Management apply " +
			"specifically to FIs supervised by MAS. FCA guidance applies to FCA-authorized " +
			"firms. Code shows payment/credit APIs but not organizational regulatory status.",
	},
	{
		id: "gap-fin-model-risk-governance",
		text: "Do you have existing model risk governance in place? Have you conducted a model risk materiality assessment (required by MAS for Singapore)? Do you follow SR 11-7 model risk management practices (required for US banking)?",
		type: "yes-no-elaborate",
		category: "financial-services",
		regulatoryRelevance:
			"MAS AI Risk Management Guidelines require a materiality assessment for " +
			"all AI use cases. US OCC/Fed SR 11-7 requires comprehensive model risk " +
			"management for AI models used in banking. These are organizational " +
			"governance facts not present in code.",
	},
	{
		id: "gap-fin-consumer-impact",
		text: "Do your AI decisions directly affect consumers' access to credit, insurance, housing, or employment? Can an AI decision result in denial of service to a consumer?",
		type: "yes-no-elaborate",
		category: "financial-services",
		regulatoryRelevance:
			"AI credit scoring and insurance pricing are classified as HIGH-RISK under " +
			"EU AI Act Annex III §5, triggering full conformity assessment. US CFPB " +
			"enforces fair lending laws (ECOA/Regulation B) against AI discrimination. " +
			"The impact on consumers is a business-context question, not a code question.",
	},
];

// ─── China-Specific Questions (triggered when China is a target market) ─────

const chinaSpecificQuestions: readonly IntakeQuestion[] = [
	{
		id: "gap-china-algorithm-filing",
		text: "Has your algorithm been filed with China's Cyberspace Administration (CAC)? What is the current filing/approval status?",
		type: "single-select",
		category: "jurisdiction-specific",
		options: [
			{ value: "not-filed", label: "Not filed" },
			{ value: "filed", label: "Filed, pending approval" },
			{ value: "approved", label: "Filed and approved" },
			{ value: "not-applicable", label: "Not applicable" },
		],
		jurisdictionRelevance: ["china"],
		regulatoryRelevance:
			"China's CAC Interim Measures for GenAI Services require algorithm " +
			"filing. This is an organizational/administrative status that is never " +
			"present in the codebase.",
	},
];

// ─── Gap Detection Logic ────────────────────────────────────────────────────

function hasSignalsInCategory(signals: readonly CodebaseSignal[]): boolean {
	return signals.length > 0;
}

/**
 * Detect gaps between what the codebase tells us and what we need to know.
 * Returns a list of intake questions that must still be answered.
 */
export function detectGaps(context: CodebaseContext): readonly IntakeQuestion[] {
	const questions: IntakeQuestion[] = [...alwaysRequiredQuestions];

	// GenAI-triggered questions: ask when LLM/GenAI usage is detected
	const hasGenAi = hasSignalsInCategory(context.genAiSignals);
	if (hasGenAi) {
		questions.push(...genAiTriggeredQuestions);
	}

	// Agentic-triggered questions: ask when agentic capabilities are detected
	const hasAgentic = hasSignalsInCategory(context.agenticSignals);
	if (hasAgentic) {
		questions.push(...agenticTriggeredQuestions);
	}

	// Financial service-triggered questions: ask when financial indicators are detected
	const hasFinancial = hasSignalsInCategory(context.financialServiceSignals);
	if (hasFinancial) {
		questions.push(...financialTriggeredQuestions);
	}

	// China-specific questions are included in the set; the caller filters
	// based on selected target markets. We include them when GenAI is detected
	// since China has mandatory algorithm filing for GenAI services.
	if (hasGenAi) {
		questions.push(...chinaSpecificQuestions);
	}

	return questions;
}

/**
 * Filter remaining questions based on selected target markets.
 * Questions with jurisdictionRelevance are only shown if the user
 * selects the relevant jurisdiction.
 */
export function filterByJurisdictions(
	questions: readonly IntakeQuestion[],
	selectedJurisdictions: readonly string[],
): readonly IntakeQuestion[] {
	return questions.filter((q) => {
		if (!q.jurisdictionRelevance || q.jurisdictionRelevance.length === 0) {
			return true;
		}
		return q.jurisdictionRelevance.some((j) => selectedJurisdictions.includes(j));
	});
}
