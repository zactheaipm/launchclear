import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../../core/types.js";

// ─── Regulatory Trigger Matchers ─────────────────────────────────────────

interface RegulatoryTrigger {
	readonly id: string;
	readonly name: string;
	readonly law: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

// ─── CCPA/CPRA Triggers ──────────────────────────────────────────────────

const CCPA_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "us-ca-ccpa-personal-info",
		name: "CCPA/CPRA Personal Information Processing",
		law: "CCPA/CPRA (Cal. Civ. Code §§1798.100-1798.199.100)",
		matchesContext: (ctx) =>
			ctx.userPopulations.includes("consumers") &&
			ctx.dataProcessed.some(
				(d) =>
					d === "personal" ||
					d === "sensitive" ||
					d === "biometric" ||
					d === "health" ||
					d === "financial" ||
					d === "location" ||
					d === "behavioral" ||
					d === "minor" ||
					d === "employment" ||
					d === "genetic",
			),
	},
	{
		id: "us-ca-ccpa-sensitive-personal-info",
		name: "CCPA/CPRA Sensitive Personal Information Processing",
		law: "CPRA (Cal. Civ. Code §1798.140(ae))",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("sensitive") ||
			ctx.dataProcessed.includes("biometric") ||
			ctx.dataProcessed.includes("health") ||
			ctx.dataProcessed.includes("genetic") ||
			ctx.dataProcessed.includes("political") ||
			ctx.dataProcessed.includes("location"),
	},
	{
		id: "us-ca-ccpa-automated-decision-making",
		name: "CCPA/CPRA Automated Decision-Making Technology",
		law: "CPRA (Cal. Civ. Code §1798.185(a)(16))",
		matchesContext: (ctx) => {
			const hasAutomatedDecisions =
				ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop";
			const hasSignificantImpact =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			const affectsConsumers =
				ctx.userPopulations.includes("consumers") ||
				ctx.userPopulations.includes("credit-applicants") ||
				ctx.userPopulations.includes("job-applicants") ||
				ctx.userPopulations.includes("tenants");
			return hasAutomatedDecisions && hasSignificantImpact && affectsConsumers;
		},
	},
	{
		id: "us-ca-ccpa-sale-sharing",
		name: "CCPA/CPRA Sale or Sharing of Personal Information",
		law: "CCPA/CPRA (Cal. Civ. Code §1798.120)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.userPopulations.includes("consumers") &&
				(desc.includes("advertising") ||
					desc.includes("marketing") ||
					desc.includes("targeted ads") ||
					desc.includes("cross-context behavioral") ||
					desc.includes("data shar") ||
					desc.includes("third-party"))
			);
		},
	},
	{
		id: "us-ca-ccpa-minors",
		name: "CCPA/CPRA Minors' Data Protections",
		law: "CCPA/CPRA (Cal. Civ. Code §1798.120(c)-(d))",
		matchesContext: (ctx) =>
			ctx.userPopulations.includes("minors") || ctx.dataProcessed.includes("minor"),
	},
];

// ─── SB 942 GenAI Transparency Triggers ──────────────────────────────────

const SB_942_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "us-ca-sb942-genai-provider",
		name: "SB 942 GenAI Transparency Requirements",
		law: "California SB 942 (AI Transparency Act)",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true ||
			ctx.productType === "generator" ||
			ctx.productType === "foundation-model",
	},
	{
		id: "us-ca-sb942-provenance",
		name: "SB 942 AI-Generated Content Provenance",
		law: "California SB 942 (AI Transparency Act)",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true &&
			(ctx.generativeAiContext?.outputModalities.includes("image") === true ||
				ctx.generativeAiContext?.outputModalities.includes("video") === true ||
				ctx.generativeAiContext?.outputModalities.includes("audio") === true),
	},
];

// ─── SB 243 AI Regulation Triggers ───────────────────────────────────────

const SB_243_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "us-ca-sb243-ai-regulation",
		name: "SB 243 AI Regulations",
		law: "California SB 243",
		matchesContext: (ctx) => {
			const hasAutomatedDecisions =
				ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop";
			const hasSignificantImpact =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			const affectsConsumers =
				ctx.userPopulations.includes("consumers") ||
				ctx.userPopulations.includes("job-applicants") ||
				ctx.userPopulations.includes("credit-applicants") ||
				ctx.userPopulations.includes("tenants");
			return hasAutomatedDecisions && hasSignificantImpact && affectsConsumers;
		},
	},
];

// ─── Deepfake Law Triggers ───────────────────────────────────────────────

const DEEPFAKE_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "us-ca-ab730-political-deepfakes",
		name: "AB 730 Political Deepfake Prohibition",
		law: "California AB 730 (Cal. Elec. Code §20010)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			const canGenerateDeepfakes = ctx.generativeAiContext?.canGenerateDeepfakes === true;
			const isMediaGenerator =
				ctx.generativeAiContext?.outputModalities.includes("image") === true ||
				ctx.generativeAiContext?.outputModalities.includes("video") === true ||
				ctx.generativeAiContext?.outputModalities.includes("audio") === true;
			const hasPoliticalContext =
				desc.includes("election") ||
				desc.includes("political") ||
				desc.includes("candidate") ||
				desc.includes("campaign") ||
				desc.includes("voting");
			return (canGenerateDeepfakes || isMediaGenerator) && hasPoliticalContext;
		},
	},
	{
		id: "us-ca-ab602-sexual-deepfakes",
		name: "AB 602 Non-Consensual Sexual Deepfake Prohibition",
		law: "California AB 602 (Cal. Civ. Code §1708.86)",
		matchesContext: (ctx) => {
			const canGenerateDeepfakes = ctx.generativeAiContext?.canGenerateDeepfakes === true;
			const generatesVisualMedia =
				ctx.generativeAiContext?.outputModalities.includes("image") === true ||
				ctx.generativeAiContext?.outputModalities.includes("video") === true;
			return canGenerateDeepfakes && generatesVisualMedia;
		},
	},
];

// ─── Financial Services Triggers ─────────────────────────────────────────

const FINANCIAL_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "us-ca-ccpa-financial-data",
		name: "CCPA/CPRA Financial Data Processing",
		law: "CCPA/CPRA (Cal. Civ. Code §1798.140(ae))",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			ctx.userPopulations.includes("consumers"),
	},
	{
		id: "us-ca-financial-automated-decisions",
		name: "Automated Financial Decision-Making",
		law: "CCPA/CPRA, California Financial Code",
		matchesContext: (ctx) => {
			const isFinancial = ctx.sectorContext?.sector === "financial-services";
			const hasAutomatedDecisions =
				ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop";
			const hasSignificantImpact =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return isFinancial === true && hasAutomatedDecisions && hasSignificantImpact;
		},
	},
];

// ─── Helper Functions ────────────────────────────────────────────────────

function getMatchingCcpaTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return CCPA_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingSb942Triggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return SB_942_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingSb243Triggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return SB_243_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingDeepfakeTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return DEEPFAKE_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingFinancialTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return FINANCIAL_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function processesConsumerPersonalData(ctx: ProductContext): boolean {
	return (
		ctx.userPopulations.includes("consumers") &&
		ctx.dataProcessed.some(
			(d) =>
				d === "personal" ||
				d === "sensitive" ||
				d === "biometric" ||
				d === "health" ||
				d === "financial" ||
				d === "location" ||
				d === "behavioral" ||
				d === "minor" ||
				d === "employment" ||
				d === "genetic",
		)
	);
}

function isGenAiProduct(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model"
	);
}

function isAutomatedDecisionMakingOnConsumers(ctx: ProductContext): boolean {
	const hasAutomatedDecisions =
		ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop";
	const hasSignificantImpact =
		ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
	const affectsConsumers =
		ctx.userPopulations.includes("consumers") ||
		ctx.userPopulations.includes("credit-applicants") ||
		ctx.userPopulations.includes("job-applicants") ||
		ctx.userPopulations.includes("tenants");
	return hasAutomatedDecisions && hasSignificantImpact && affectsConsumers;
}

function involvesMinors(ctx: ProductContext): boolean {
	return ctx.userPopulations.includes("minors") || ctx.dataProcessed.includes("minor");
}

function hasDeepfakeCapabilities(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.canGenerateDeepfakes === true ||
		(ctx.productType === "generator" &&
			(ctx.generativeAiContext?.outputModalities.includes("image") === true ||
				ctx.generativeAiContext?.outputModalities.includes("video") === true))
	);
}

function hasPoliticalDeepfakeConcerns(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	return (
		hasDeepfakeCapabilities(ctx) &&
		(desc.includes("election") ||
			desc.includes("political") ||
			desc.includes("candidate") ||
			desc.includes("campaign") ||
			desc.includes("voting"))
	);
}

function isFinancialServicesAi(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

function isAgenticAi(ctx: ProductContext): boolean {
	return ctx.agenticAiContext?.isAgentic === true;
}

// ─── Risk Classification Logic ───────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const allCategories: string[] = [];
	const allProvisions: string[] = [];

	// HIGH RISK: Automated decision-making with material/determinative impact
	// on consumers, especially in employment, credit, housing, insurance
	if (isAutomatedDecisionMakingOnConsumers(ctx)) {
		const desc = ctx.description.toLowerCase();
		const isHighStakes =
			ctx.userPopulations.includes("job-applicants") ||
			ctx.userPopulations.includes("credit-applicants") ||
			ctx.userPopulations.includes("tenants") ||
			desc.includes("insurance") ||
			desc.includes("hiring") ||
			desc.includes("employment") ||
			desc.includes("credit") ||
			desc.includes("housing") ||
			desc.includes("lending");

		if (isHighStakes) {
			allCategories.push("us-ca-ccpa-automated-decision-making", "us-ca-sb243-ai-regulation");
			allProvisions.push("CPRA §1798.185(a)(16)", "SB 243");

			return {
				level: "high",
				justification:
					"This AI system makes automated decisions with material or determinative impact on California consumers in high-stakes domains (employment, credit, housing, insurance). This triggers CCPA/CPRA automated decision-making technology provisions, SB 243 AI regulations, and heightened opt-out and access rights for consumers.",
				applicableCategories: allCategories,
				provisions: allProvisions,
			};
		}
	}

	// HIGH RISK: Biometric data processing
	if (ctx.dataProcessed.includes("biometric") && processesConsumerPersonalData(ctx)) {
		return {
			level: "high",
			justification:
				"This AI system processes biometric information of California consumers. Biometric data is classified as sensitive personal information under CPRA, triggering enhanced consumer rights including the right to limit use and disclosure, opt-out rights, and heightened data minimisation requirements.",
			applicableCategories: ["us-ca-ccpa-sensitive-personal-info"],
			provisions: ["CPRA §1798.140(ae)", "CPRA §1798.121"],
		};
	}

	// HIGH RISK: GenAI with deepfake capabilities targeting elections or
	// generating sexual content of real persons
	if (hasPoliticalDeepfakeConcerns(ctx)) {
		return {
			level: "high",
			justification:
				"This AI system can generate deepfake content in a political context. California AB 730 prohibits distribution of deceptive audio/visual media of candidates within 60 days of an election. This creates significant legal risk and compliance obligations.",
			applicableCategories: ["us-ca-ab730-political-deepfakes"],
			provisions: ["AB 730 (Cal. Elec. Code §20010)"],
		};
	}

	if (hasDeepfakeCapabilities(ctx)) {
		const deepfakeTriggers = getMatchingDeepfakeTriggers(ctx);
		if (deepfakeTriggers.some((t) => t.id === "us-ca-ab602-sexual-deepfakes")) {
			allCategories.push("us-ca-ab602-sexual-deepfakes");
			allProvisions.push("AB 602 (Cal. Civ. Code §1708.86)");
		}
		// Deepfake capability alone is high risk due to AB 602 liability
		if (allCategories.length > 0) {
			return {
				level: "high",
				justification:
					"This AI system can generate deepfake visual media, creating liability exposure under California AB 602 which prohibits creation of non-consensual sexually explicit deepfakes. Providers of systems capable of generating realistic synthetic media of identifiable persons must implement safeguards.",
				applicableCategories: allCategories,
				provisions: allProvisions,
			};
		}
	}

	// LIMITED RISK: Consumer personal data processing (CCPA applies)
	if (processesConsumerPersonalData(ctx)) {
		allCategories.push("us-ca-ccpa-personal-info");
		allProvisions.push("CCPA/CPRA");
	}

	// LIMITED RISK: GenAI content generation (SB 942)
	const sb942Triggers = getMatchingSb942Triggers(ctx);
	if (sb942Triggers.length > 0) {
		allCategories.push(...sb942Triggers.map((t) => t.id));
		allProvisions.push("SB 942");
	}

	// LIMITED RISK: Automated decisions on consumers (non-high-stakes)
	if (isAutomatedDecisionMakingOnConsumers(ctx) && allCategories.length === 0) {
		allCategories.push("us-ca-ccpa-automated-decision-making");
		allProvisions.push("CPRA §1798.185(a)(16)");
	}

	if (allCategories.length > 0) {
		const justificationParts: string[] = [];
		if (processesConsumerPersonalData(ctx)) {
			justificationParts.push(
				"This AI system processes personal information of California consumers, triggering CCPA/CPRA obligations including consumer rights to know, delete, opt-out of sale/sharing, and limit use of sensitive personal information.",
			);
		}
		if (sb942Triggers.length > 0) {
			justificationParts.push(
				"This system generates AI content, triggering SB 942 (California AI Transparency Act) requirements for AI detection tools, provenance data, and disclosure of AI-generated content.",
			);
		}

		return {
			level: "limited",
			justification:
				justificationParts.join(" ") ||
				"This AI system triggers California regulatory obligations requiring transparency and consumer protections.",
			applicableCategories: [...new Set(allCategories)],
			provisions: [...new Set(allProvisions)],
		};
	}

	// MINIMAL: No consumer data, no automated decisions
	return {
		level: "minimal",
		justification:
			"This AI system does not process personal information of California consumers and does not make automated decisions with significant effects on individuals. California AI-specific regulations (CCPA/CPRA, SB 942, SB 243) do not impose material obligations.",
		applicableCategories: [],
		provisions: [],
	};
}

// ─── Applicable Provisions ───────────────────────────────────────────────

function buildApplicableProvisions(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ApplicableProvision[] {
	const provisions: ApplicableProvision[] = [];

	if (risk.level === "minimal") return provisions;

	// CCPA/CPRA core provisions
	const ccpaTriggers = getMatchingCcpaTriggers(ctx);

	if (ccpaTriggers.some((t) => t.id === "us-ca-ccpa-personal-info")) {
		provisions.push(
			{
				id: "us-ca-ccpa-consumer-rights",
				law: "CCPA/CPRA",
				article: "Cal. Civ. Code §§1798.100-1798.125",
				title: "Consumer Privacy Rights",
				summary:
					"California consumers have the right to know what personal information is collected, the right to delete personal information, the right to opt-out of sale or sharing of personal information, and the right to non-discrimination for exercising their rights.",
				relevance:
					"This AI system processes personal information of California consumers, triggering all core CCPA/CPRA consumer rights.",
			},
			{
				id: "us-ca-ccpa-notice",
				law: "CCPA/CPRA",
				article: "Cal. Civ. Code §1798.100(b)",
				title: "Notice at Collection",
				summary:
					"Businesses must inform consumers at or before collection of the categories of personal information collected, the purposes, whether it is sold or shared, and the retention period.",
				relevance:
					"Required at all points where the AI system collects personal information from California consumers.",
			},
		);
	}

	// Sensitive personal information
	if (ccpaTriggers.some((t) => t.id === "us-ca-ccpa-sensitive-personal-info")) {
		provisions.push({
			id: "us-ca-cpra-sensitive-info",
			law: "CPRA",
			article: "Cal. Civ. Code §§1798.121, 1798.140(ae)",
			title: "Right to Limit Use and Disclosure of Sensitive Personal Information",
			summary:
				"Consumers have the right to limit use and disclosure of sensitive personal information (SSN, financial accounts, precise geolocation, racial/ethnic origin, biometric data, health data, sexual orientation, contents of communications) to what is necessary to provide the requested service.",
			relevance:
				"This AI system processes sensitive personal information categories as defined by CPRA, triggering enhanced consumer rights and data minimisation obligations.",
		});
	}

	// Automated decision-making
	if (ccpaTriggers.some((t) => t.id === "us-ca-ccpa-automated-decision-making")) {
		provisions.push({
			id: "us-ca-cpra-admt",
			law: "CPRA",
			article: "Cal. Civ. Code §1798.185(a)(16)",
			title: "Automated Decision-Making Technology",
			summary:
				"CPRA directs the California Privacy Protection Agency (CPPA) to issue regulations governing access and opt-out rights for automated decision-making technology, including profiling, that produces legal or similarly significant effects on consumers. Consumers have the right to access information about automated decision-making, the right to opt out, and the right to request human review.",
			relevance:
				"This AI system uses automated decision-making that produces significant effects on consumers, triggering CPRA's ADMT provisions.",
		});
	}

	// Sale/sharing opt-out
	if (ccpaTriggers.some((t) => t.id === "us-ca-ccpa-sale-sharing")) {
		provisions.push({
			id: "us-ca-ccpa-opt-out",
			law: "CCPA/CPRA",
			article: "Cal. Civ. Code §1798.120",
			title: "Right to Opt-Out of Sale or Sharing of Personal Information",
			summary:
				"Consumers have the right to opt out of the sale or sharing of their personal information. Businesses must provide a 'Do Not Sell or Share My Personal Information' link on their website and honour Global Privacy Control signals.",
			relevance:
				"This AI system involves sharing or sale of personal information for advertising or marketing purposes.",
		});
	}

	// Minors
	if (ccpaTriggers.some((t) => t.id === "us-ca-ccpa-minors")) {
		provisions.push({
			id: "us-ca-ccpa-minors-protections",
			law: "CCPA/CPRA",
			article: "Cal. Civ. Code §1798.120(c)-(d)",
			title: "CCPA/CPRA Minors' Protections",
			summary:
				"Sale or sharing of personal information of consumers under 16 requires opt-in consent. For consumers under 13, a parent or guardian must opt in. Business must not sell or share a minor's personal information if it has actual knowledge the consumer is under 16 without affirmative consent.",
			relevance:
				"This AI system processes data of minors, triggering enhanced CCPA/CPRA protections requiring affirmative opt-in consent for any sale or sharing of their data.",
		});
	}

	// SB 942 — GenAI Transparency
	const sb942Triggers = getMatchingSb942Triggers(ctx);
	if (sb942Triggers.length > 0) {
		provisions.push({
			id: "us-ca-sb942-transparency",
			law: "California SB 942",
			article: "SB 942 (AI Transparency Act)",
			title: "GenAI Transparency and Provenance Requirements",
			summary:
				"SB 942 requires covered GenAI providers to: (1) make AI detection tools freely available to users, (2) include provenance data (manifest or watermark) in AI-generated content, (3) maintain a publicly accessible webpage describing AI detection tools and their capabilities and limitations, and (4) provide clear and conspicuous disclosure that content was generated by AI.",
			relevance:
				"This system generates AI content, triggering SB 942 requirements for AI detection tools, content provenance data, and AI-generated content disclosure.",
		});

		if (sb942Triggers.some((t) => t.id === "us-ca-sb942-provenance")) {
			provisions.push({
				id: "us-ca-sb942-provenance-data",
				law: "California SB 942",
				article: "SB 942 §§3-4",
				title: "AI-Generated Content Provenance Data",
				summary:
					"GenAI providers producing image, video, or audio content must include provenance data (either as a manifest embedded in the content or as a latent watermark) that identifies the content as AI-generated and the provider responsible. Provenance data must be detectable by the provider's AI detection tools.",
				relevance:
					"This system generates visual or audio content, requiring embedded provenance data (watermarking or manifests) in AI-generated outputs per SB 942.",
			});
		}
	}

	// SB 243
	const sb243Triggers = getMatchingSb243Triggers(ctx);
	if (sb243Triggers.length > 0) {
		provisions.push({
			id: "us-ca-sb243-ai-regs",
			law: "California SB 243",
			article: "SB 243",
			title: "SB 243 AI Regulation Requirements",
			summary:
				"SB 243 establishes additional AI-specific requirements for automated decision systems that make significant decisions affecting California consumers, including transparency, accountability, and consumer access requirements.",
			relevance:
				"This AI system makes significant automated decisions affecting consumers, triggering SB 243 compliance obligations.",
		});
	}

	// Deepfake laws
	const deepfakeTriggers = getMatchingDeepfakeTriggers(ctx);

	if (deepfakeTriggers.some((t) => t.id === "us-ca-ab730-political-deepfakes")) {
		provisions.push({
			id: "us-ca-ab730",
			law: "California AB 730",
			article: "Cal. Elec. Code §20010",
			title: "Prohibition on Political Deepfakes Near Elections",
			summary:
				"AB 730 prohibits any person from distributing with actual malice materially deceptive audio or visual media of a candidate for elective office within 60 days of an election. This applies to AI-generated deepfakes of political candidates. Violators are subject to injunctive relief and damages.",
			relevance:
				"This AI system can generate synthetic media and operates in a political context. AB 730 creates direct liability for deceptive AI-generated media of political candidates.",
		});
	}

	if (deepfakeTriggers.some((t) => t.id === "us-ca-ab602-sexual-deepfakes")) {
		provisions.push({
			id: "us-ca-ab602",
			law: "California AB 602",
			article: "Cal. Civ. Code §1708.86",
			title: "Prohibition on Non-Consensual Sexual Deepfakes",
			summary:
				"AB 602 creates a private right of action for individuals depicted in sexually explicit deepfakes created without their consent. Any person who creates, distributes, or makes available sexually explicit material that is a digital alteration of the plaintiff's likeness without consent is liable for damages.",
			relevance:
				"This AI system can generate deepfake visual media, creating potential liability under AB 602 for non-consensual sexually explicit content generation.",
		});
	}

	// Agentic AI assessed under CCPA/automated decision frameworks
	if (isAgenticAi(ctx) && processesConsumerPersonalData(ctx)) {
		provisions.push({
			id: "us-ca-agentic-ccpa",
			law: "CCPA/CPRA",
			article: "Cal. Civ. Code §§1798.100-1798.199.100",
			title: "Agentic AI Under CCPA/CPRA Framework",
			summary:
				"Agentic AI systems that autonomously collect, process, share, or make decisions about California consumers' personal information must comply with all CCPA/CPRA requirements. Autonomous data collection by AI agents triggers notice-at-collection obligations. Autonomous decisions with significant effects trigger ADMT provisions. Agent actions that constitute 'sale' or 'sharing' of data require opt-out mechanisms.",
			relevance:
				"This AI system has agentic capabilities that may autonomously process consumer personal information, requiring CCPA/CPRA compliance for all agent-initiated data operations.",
		});
	}

	// Financial services
	const financialTriggers = getMatchingFinancialTriggers(ctx);
	if (financialTriggers.length > 0) {
		provisions.push({
			id: "us-ca-ccpa-financial",
			law: "CCPA/CPRA",
			article: "Cal. Civ. Code §§1798.100, 1798.140(ae)",
			title: "CCPA/CPRA Financial Data and Automated Decision-Making",
			summary:
				"Financial account information is sensitive personal information under CPRA. AI systems making automated financial decisions affecting California consumers trigger enhanced rights including the right to limit use of sensitive data, opt-out of automated decision-making, and request human review of automated decisions.",
			relevance:
				"This AI system operates in financial services and processes California consumer data, triggering enhanced CCPA/CPRA protections for financial data and automated financial decisions.",
		});
	}

	return provisions;
}

// ─── Required Artifacts ──────────────────────────────────────────────────

function buildRequiredArtifacts(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ArtifactRequirement[] {
	const artifacts: ArtifactRequirement[] = [];

	if (risk.level === "minimal") return artifacts;

	// CCPA/CPRA privacy notice
	if (processesConsumerPersonalData(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "CCPA/CPRA Privacy Notice at Collection",
			required: true,
			legalBasis: "Cal. Civ. Code §§1798.100(b), 1798.130",
			description:
				"Privacy notice informing California consumers of: categories of personal information collected, purposes of collection, whether information is sold or shared, retention period, and consumer rights (know, delete, correct, opt-out). Must include a 'Do Not Sell or Share My Personal Information' link if applicable.",
			templateId: "transparency-notice",
		});
	}

	// Automated decision-making risk assessment
	if (isAutomatedDecisionMakingOnConsumers(ctx)) {
		artifacts.push({
			type: "risk-assessment",
			name: "CCPA/CPRA Automated Decision-Making Risk Assessment",
			required: true,
			legalBasis: "CPRA §1798.185(a)(16), SB 243",
			description:
				"Risk assessment of automated decision-making technology covering: the purpose and intended use of the ADMT, the personal information processed, whether it produces legal or similarly significant effects, evaluation of risks and benefits to consumers, and safeguards implemented to address identified risks.",
		});
	}

	// GenAI transparency documentation (SB 942)
	const sb942Triggers = getMatchingSb942Triggers(ctx);
	if (sb942Triggers.length > 0) {
		artifacts.push({
			type: "genai-content-policy",
			name: "SB 942 AI Transparency Compliance Documentation",
			required: true,
			legalBasis: "California SB 942 (AI Transparency Act)",
			description:
				"Documentation of SB 942 compliance including: description of AI detection tools made available to users, provenance data implementation (manifests, watermarks), publicly accessible webpage describing detection capabilities and limitations, and disclosure mechanisms for AI-generated content.",
			templateId: "genai-content-policy",
		});
	}

	// Bias audit for high-stakes automated decisions
	if (
		risk.level === "high" &&
		isAutomatedDecisionMakingOnConsumers(ctx) &&
		(ctx.userPopulations.includes("job-applicants") ||
			ctx.userPopulations.includes("credit-applicants") ||
			ctx.userPopulations.includes("tenants"))
	) {
		artifacts.push({
			type: "bias-audit",
			name: "California Automated Decision Bias Audit",
			required: false,
			legalBasis: "CPRA §1798.185(a)(16), SB 243",
			description:
				"Bias audit evaluating the automated decision-making system for disparate impact across protected classes under California law (race, colour, national origin, sex, disability, age). While not explicitly mandated for all uses, strongly recommended for high-stakes employment, credit, and housing decisions under SB 243 and CPRA ADMT regulations.",
			templateId: "bias-audit-nyc",
		});
	}

	// Financial services model documentation
	if (isFinancialServicesAi(ctx) && processesConsumerPersonalData(ctx)) {
		artifacts.push({
			type: "model-card",
			name: "California Financial AI Model Documentation",
			required: false,
			legalBasis: "CCPA/CPRA, California Financial Code",
			description:
				"Documentation of the AI model used in financial services including purpose, methodology, data categories processed, accuracy metrics, fairness evaluation, and consumer impact assessment. Recommended to support CCPA/CPRA transparency obligations for automated financial decisions.",
			templateId: "model-card",
		});
	}

	return artifacts;
}

// ─── Required Actions ────────────────────────────────────────────────────

function buildRequiredActions(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ActionRequirement[] {
	const actions: ActionRequirement[] = [];

	if (risk.level === "minimal") return actions;

	// CCPA/CPRA core compliance actions
	if (processesConsumerPersonalData(ctx)) {
		actions.push(
			{
				id: "us-ca-ccpa-notice-at-collection",
				title: "Provide CCPA/CPRA notice at collection",
				description:
					"Provide consumers with a notice at or before the point of collection listing the categories of personal information collected, the purposes, retention period, and whether information is sold or shared. The notice must be clear, conspicuous, and accessible.",
				priority: "critical",
				legalBasis: "Cal. Civ. Code §1798.100(b)",
				jurisdictions: ["us-ca"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "us-ca-ccpa-consumer-rights-mechanisms",
				title: "Implement CCPA/CPRA consumer rights request mechanisms",
				description:
					"Implement mechanisms for consumers to exercise their rights: right to know (categories and specific pieces of personal information collected), right to delete, right to correct, right to opt-out of sale/sharing. Must provide at least two methods for submitting requests, including a toll-free number and a website link. Must respond within 45 days.",
				priority: "critical",
				legalBasis: "Cal. Civ. Code §§1798.105-1798.125",
				jurisdictions: ["us-ca"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "us-ca-ccpa-data-inventory",
				title: "Conduct personal information inventory and mapping",
				description:
					"Map all categories of personal information collected, processed, stored, and shared by the AI system. Identify sources, purposes, retention periods, and third-party recipients. This inventory supports compliance with CCPA/CPRA disclosure requirements and consumer rights responses.",
				priority: "important",
				legalBasis: "Cal. Civ. Code §§1798.100, 1798.110",
				jurisdictions: ["us-ca"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	// Sensitive personal information actions
	if (
		CCPA_TRIGGERS.some(
			(t) => t.id === "us-ca-ccpa-sensitive-personal-info" && t.matchesContext(ctx),
		)
	) {
		actions.push({
			id: "us-ca-cpra-limit-sensitive-data",
			title: "Implement right to limit use of sensitive personal information",
			description:
				"Provide consumers with the ability to limit the use and disclosure of their sensitive personal information to what is necessary to perform the services or provide the goods reasonably expected. Display a 'Limit the Use of My Sensitive Personal Information' link. Honour consumer requests within 15 business days.",
			priority: "critical",
			legalBasis: "Cal. Civ. Code §1798.121",
			jurisdictions: ["us-ca"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// Automated decision-making actions
	if (isAutomatedDecisionMakingOnConsumers(ctx)) {
		actions.push(
			{
				id: "us-ca-cpra-admt-access",
				title: "Implement ADMT access and opt-out rights",
				description:
					"Enable consumers to: (1) access information about automated decision-making technology used to make significant decisions, (2) opt out of having ADMT used for significant decisions, and (3) request human review of automated decisions. Provide meaningful information about the logic involved in automated decision-making and the likely outcome.",
				priority: "critical",
				legalBasis: "CPRA §1798.185(a)(16)",
				jurisdictions: ["us-ca"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "us-ca-cpra-admt-risk-assessment",
				title: "Conduct automated decision-making risk assessment",
				description:
					"Conduct a risk assessment of the automated decision-making technology evaluating: purpose and necessity, personal information processed, risks to consumers (including disparate impact, privacy, and accuracy concerns), benefits of the processing, and safeguards implemented. Document and retain the assessment.",
				priority: "critical",
				legalBasis: "CPRA §1798.185(a)(16), SB 243",
				jurisdictions: ["us-ca"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	// Sale/sharing opt-out
	if (CCPA_TRIGGERS.some((t) => t.id === "us-ca-ccpa-sale-sharing" && t.matchesContext(ctx))) {
		actions.push({
			id: "us-ca-ccpa-opt-out-link",
			title: "Implement 'Do Not Sell or Share' opt-out mechanism",
			description:
				"Provide a clear and conspicuous 'Do Not Sell or Share My Personal Information' link on the business's website homepage. Honour Global Privacy Control (GPC) browser signals as valid opt-out requests. Do not use dark patterns to subvert consumer opt-out choices.",
			priority: "critical",
			legalBasis: "Cal. Civ. Code §1798.120",
			jurisdictions: ["us-ca"],
			estimatedEffort: "1-2 weeks",
			deadline: null,
		});
	}

	// Minors actions
	if (involvesMinors(ctx)) {
		actions.push({
			id: "us-ca-ccpa-minors-opt-in",
			title: "Implement opt-in consent for minors' data sale/sharing",
			description:
				"Implement affirmative opt-in consent before selling or sharing personal information of consumers known to be under 16. For consumers under 13, obtain verifiable parental or guardian consent. Implement age-gating or age verification mechanisms to identify minor consumers. Do not sell or share data of known minors without affirmative authorisation.",
			priority: "critical",
			legalBasis: "Cal. Civ. Code §1798.120(c)-(d)",
			jurisdictions: ["us-ca"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// SB 942 GenAI transparency actions
	const sb942Triggers = getMatchingSb942Triggers(ctx);
	if (sb942Triggers.length > 0) {
		actions.push(
			{
				id: "us-ca-sb942-detection-tools",
				title: "Make AI detection tools freely available",
				description:
					"Develop or license and make freely available to users an AI detection tool that allows users to assess whether content was generated by the provider's GenAI system. The detection tool must be accessible without charge and the provider must maintain a publicly accessible webpage describing the tool's capabilities and limitations.",
				priority: "critical",
				legalBasis: "California SB 942 (AI Transparency Act)",
				jurisdictions: ["us-ca"],
				estimatedEffort: "4-8 weeks",
				deadline: "2026-01-01",
			},
			{
				id: "us-ca-sb942-disclosure",
				title: "Implement AI-generated content disclosure",
				description:
					"Provide clear and conspicuous disclosure that content was generated by AI. For image, video, and audio content, include provenance data (manifest or latent watermark) identifying the content as AI-generated and the provider responsible. Disclosure must be durable and not easily removable by downstream users.",
				priority: "critical",
				legalBasis: "California SB 942 (AI Transparency Act)",
				jurisdictions: ["us-ca"],
				estimatedEffort: "3-6 weeks",
				deadline: "2026-01-01",
			},
		);

		if (sb942Triggers.some((t) => t.id === "us-ca-sb942-provenance")) {
			actions.push({
				id: "us-ca-sb942-provenance-implementation",
				title: "Implement provenance data in AI-generated media",
				description:
					"Embed provenance data in AI-generated image, video, and audio content using either content manifests (e.g., C2PA standard) or latent watermarking. Provenance data must identify: (1) that the content is AI-generated, (2) the provider responsible, and (3) be detectable by the provider's AI detection tools. Consider implementing both manifest-based and watermark-based approaches for robustness.",
				priority: "critical",
				legalBasis: "California SB 942 §§3-4",
				jurisdictions: ["us-ca"],
				estimatedEffort: "4-8 weeks",
				deadline: "2026-01-01",
			});
		}
	}

	// Deepfake safeguard actions
	const deepfakeTriggers = getMatchingDeepfakeTriggers(ctx);

	if (deepfakeTriggers.some((t) => t.id === "us-ca-ab730-political-deepfakes")) {
		actions.push({
			id: "us-ca-ab730-safeguards",
			title: "Implement safeguards against political deepfake generation",
			description:
				"Implement technical safeguards to prevent the generation or distribution of materially deceptive audio or visual media of candidates for elective office, particularly within 60 days of an election. Consider content filters for political candidate likenesses, usage policies prohibiting election manipulation, and monitoring for misuse. Violations carry liability for injunctive relief and damages.",
			priority: "critical",
			legalBasis: "AB 730 (Cal. Elec. Code §20010)",
			jurisdictions: ["us-ca"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	if (deepfakeTriggers.some((t) => t.id === "us-ca-ab602-sexual-deepfakes")) {
		actions.push({
			id: "us-ca-ab602-safeguards",
			title: "Implement safeguards against non-consensual sexual deepfakes",
			description:
				"Implement technical safeguards to prevent the creation of sexually explicit deepfakes of real persons without consent. This includes content safety filters for NSFW generation, identity verification before generating likenesses of real persons, usage policies prohibiting non-consensual intimate imagery, and abuse reporting mechanisms. AB 602 creates a private right of action with damages.",
			priority: "critical",
			legalBasis: "AB 602 (Cal. Civ. Code §1708.86)",
			jurisdictions: ["us-ca"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	// Agentic AI actions under CCPA/CPRA
	if (isAgenticAi(ctx) && processesConsumerPersonalData(ctx)) {
		actions.push({
			id: "us-ca-agentic-data-governance",
			title: "Implement data governance for agentic AI operations",
			description:
				"Ensure agentic AI systems comply with CCPA/CPRA when autonomously collecting, processing, or sharing consumer personal information. Implement: (1) notice mechanisms for agent-initiated data collection, (2) data minimisation for agent actions, (3) audit logging of all agent data operations, (4) consumer access to records of agent-processed data. Autonomous agent actions that constitute 'sale' or 'sharing' must honour existing opt-out preferences.",
			priority: "critical",
			legalBasis: "CCPA/CPRA",
			jurisdictions: ["us-ca"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	// Financial services actions
	if (isFinancialServicesAi(ctx) && processesConsumerPersonalData(ctx)) {
		actions.push({
			id: "us-ca-financial-ccpa-compliance",
			title: "Ensure CCPA/CPRA compliance for financial AI",
			description:
				"Implement enhanced CCPA/CPRA protections for financial data processing: (1) treat financial account information as sensitive personal information with right-to-limit, (2) provide enhanced transparency for automated financial decisions, (3) enable consumers to request human review of automated credit, insurance, or lending decisions, (4) conduct risk assessment of financial automated decision-making technology.",
			priority: "critical",
			legalBasis: "CCPA/CPRA, Cal. Civ. Code §§1798.121, 1798.185(a)(16)",
			jurisdictions: ["us-ca"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	// Data security (for all systems processing personal information)
	if (processesConsumerPersonalData(ctx)) {
		actions.push({
			id: "us-ca-data-security",
			title: "Implement reasonable security measures",
			description:
				"Implement and maintain reasonable security procedures and practices appropriate to the nature of the personal information to protect it from unauthorised access, destruction, use, modification, or disclosure. California's data breach notification law (Cal. Civ. Code §1798.82) imposes breach notification obligations. The lack of 'reasonable security' can give rise to a CCPA private right of action for data breaches.",
			priority: "important",
			legalBasis: "Cal. Civ. Code §§1798.81.5, 1798.82, 1798.150",
			jurisdictions: ["us-ca"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	return actions;
}

// ─── Compliance Timeline ─────────────────────────────────────────────────

function buildTimeline(ctx: ProductContext, risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];
	const deadlines = [
		{
			date: "2020-01-01",
			description:
				"CCPA entered into force. Core consumer privacy rights (right to know, delete, opt-out of sale) are enforceable.",
			provision: "CCPA (Cal. Civ. Code §1798.100 et seq.)",
			isMandatory: true,
		},
		{
			date: "2023-01-01",
			description:
				"CPRA amendments took effect. Enhanced consumer rights including right to correct, right to limit sensitive data use, and expanded definitions. California Privacy Protection Agency (CPPA) assumed enforcement authority.",
			provision: "CPRA",
			isMandatory: true,
		},
		{
			date: "2024-01-01",
			description:
				"AB 730 (political deepfakes) is in force. Prohibition on distribution of materially deceptive media of candidates within 60 days of an election applies.",
			provision: "AB 730 (Cal. Elec. Code §20010)",
			isMandatory: true,
		},
	];

	notes.push(
		"CCPA/CPRA obligations are in force now. All personal information processing of California consumers must comply with current requirements.",
	);

	if (risk.level === "high") {
		notes.push(
			"High-risk automated decision-making systems should complete risk assessments and implement consumer opt-out mechanisms as soon as practicable. CPPA is actively developing ADMT regulations.",
		);
	}

	const sb942Triggers = getMatchingSb942Triggers(ctx);
	if (sb942Triggers.length > 0) {
		deadlines.push({
			date: "2026-01-01",
			description:
				"SB 942 (California AI Transparency Act) takes effect. GenAI providers must make AI detection tools freely available, include provenance data in AI-generated content, and maintain public disclosures about detection capabilities.",
			provision: "SB 942 (AI Transparency Act)",
			isMandatory: true,
		});
		notes.push(
			"CRITICAL: SB 942 (AI Transparency Act) takes effect January 1, 2026. GenAI providers should begin implementing provenance data (watermarking/manifests) and developing AI detection tools well in advance of this deadline.",
		);
	}

	if (isGenAiProduct(ctx)) {
		notes.push(
			"California has multiple GenAI-relevant laws including SB 942 (transparency), AB 730 (political deepfakes), and AB 602 (sexual deepfakes). GenAI providers should implement comprehensive content governance spanning all applicable requirements.",
		);
	}

	if (isAgenticAi(ctx)) {
		notes.push(
			"Agentic AI systems are assessed under existing CCPA/CPRA and automated decision-making frameworks. As California develops ADMT regulations, agentic AI systems may face additional specific requirements. Monitor CPPA rulemaking for updates.",
		);
	}

	if (isFinancialServicesAi(ctx)) {
		notes.push(
			"Financial services AI processing California consumer data must comply with both CCPA/CPRA and applicable state financial regulations. Financial account data is sensitive personal information under CPRA.",
		);
	}

	return {
		effectiveDate: "2020-01-01",
		deadlines,
		notes,
	};
}

// ─── California Jurisdiction Module ──────────────────────────────────────

export const californiaModule: JurisdictionModule = {
	id: "us-ca",
	name: "California (CCPA/CPRA, SB 942, SB 243, AB 730, AB 602)",
	jurisdiction: "us-ca",

	getApplicableProvisions(ctx: ProductContext): readonly ApplicableProvision[] {
		const risk = classifyRisk(ctx);
		return buildApplicableProvisions(ctx, risk);
	},

	getRequiredArtifacts(ctx: ProductContext): readonly ArtifactRequirement[] {
		const risk = classifyRisk(ctx);
		return buildRequiredArtifacts(ctx, risk);
	},

	getRequiredActions(ctx: ProductContext): readonly ActionRequirement[] {
		const risk = classifyRisk(ctx);
		return buildRequiredActions(ctx, risk);
	},

	getRiskLevel(ctx: ProductContext): RiskClassification {
		return classifyRisk(ctx);
	},

	getTimeline(ctx: ProductContext): ComplianceTimeline {
		const risk = classifyRisk(ctx);
		return buildTimeline(ctx, risk);
	},
};

// ─── Exported Helpers (for testing) ──────────────────────────────────────

export {
	classifyRisk,
	buildApplicableProvisions,
	buildRequiredArtifacts,
	buildRequiredActions,
	buildTimeline,
	getMatchingCcpaTriggers,
	getMatchingSb942Triggers,
	getMatchingSb243Triggers,
	getMatchingDeepfakeTriggers,
	getMatchingFinancialTriggers,
	processesConsumerPersonalData,
	isGenAiProduct,
	isAutomatedDecisionMakingOnConsumers,
	involvesMinors,
	hasDeepfakeCapabilities,
	hasPoliticalDeepfakeConcerns,
	isFinancialServicesAi,
	isAgenticAi,
	CCPA_TRIGGERS,
	SB_942_TRIGGERS,
	SB_243_TRIGGERS,
	DEEPFAKE_TRIGGERS,
	FINANCIAL_TRIGGERS,
};
