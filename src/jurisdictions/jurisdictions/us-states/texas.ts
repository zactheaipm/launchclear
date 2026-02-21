import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../../core/types.js";

// ─── Regulatory Triggers ─────────────────────────────────────────────────

interface RegulatoryTrigger {
	readonly id: string;
	readonly name: string;
	readonly framework: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const TRAIGA_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "traiga-employment",
		name: "High-Risk AI — Employment Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) =>
			(ctx.userPopulations.includes("job-applicants") ||
				ctx.userPopulations.includes("employees")) &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "traiga-education",
		name: "High-Risk AI — Education Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) =>
			ctx.userPopulations.includes("students") &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "traiga-financial",
		name: "High-Risk AI — Financial Services Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(ctx.sectorContext?.sector === "financial-services" ||
					ctx.userPopulations.includes("credit-applicants") ||
					desc.includes("credit") ||
					desc.includes("lending") ||
					desc.includes("insurance") ||
					desc.includes("loan")) &&
				(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
			);
		},
	},
	{
		id: "traiga-housing",
		name: "High-Risk AI — Housing Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(ctx.userPopulations.includes("tenants") ||
					desc.includes("housing") ||
					desc.includes("rental") ||
					desc.includes("tenant screen")) &&
				(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
			);
		},
	},
	{
		id: "traiga-healthcare",
		name: "High-Risk AI — Healthcare Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) =>
			ctx.userPopulations.includes("patients") &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "traiga-government",
		name: "High-Risk AI — Government Services Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(desc.includes("government service") ||
					desc.includes("public benefit") ||
					desc.includes("welfare") ||
					desc.includes("public assistance")) &&
				(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
			);
		},
	},
	{
		id: "traiga-legal",
		name: "High-Risk AI — Legal Services Decisions",
		framework: "TRAIGA",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(desc.includes("legal service") ||
					desc.includes("legal decision") ||
					desc.includes("judicial")) &&
				(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
			);
		},
	},
];

const DEEPFAKE_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "tx-deepfake-election",
		name: "Election Deepfakes (Texas Election Code)",
		framework: "Texas Election Code § 255.004",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(ctx.generativeAiContext?.canGenerateDeepfakes === true ||
					ctx.generativeAiContext?.canGenerateSyntheticVoice === true) &&
				(desc.includes("election") ||
					desc.includes("political") ||
					desc.includes("candidate") ||
					desc.includes("campaign"))
			);
		},
	},
	{
		id: "tx-deepfake-sexual",
		name: "Non-Consensual Sexual Deepfakes",
		framework: "Texas Penal Code § 21.165",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.canGenerateDeepfakes === true &&
			(ctx.generativeAiContext?.outputModalities.includes("image") ||
				ctx.generativeAiContext?.outputModalities.includes("video")),
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingTraigaTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return TRAIGA_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingDeepfakeTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return DEEPFAKE_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function isHighRiskAi(ctx: ProductContext): boolean {
	return getMatchingTraigaTriggers(ctx).length > 0;
}

function isGenAiProduct(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model"
	);
}

// ─── Risk Classification ──────────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const traigaTriggers = getMatchingTraigaTriggers(ctx);
	const deepfakeTriggers = getMatchingDeepfakeTriggers(ctx);

	// TRAIGA high-risk: consequential decisions
	if (traigaTriggers.length > 0) {
		return {
			level: "high",
			justification: `This AI system makes consequential decisions in TRAIGA-regulated domains: ${traigaTriggers.map((t) => t.name).join("; ")}. Deployers must conduct impact assessments, implement risk management, and provide individual notice and opt-out rights.`,
			applicableCategories: traigaTriggers.map((t) => t.id),
			provisions: ["TRAIGA (Texas Responsible AI Governance Act)"],
		};
	}

	// Deepfake concerns
	if (deepfakeTriggers.length > 0) {
		return {
			level: "limited",
			justification: `This AI system can generate synthetic media triggering Texas deepfake provisions: ${deepfakeTriggers.map((t) => t.name).join("; ")}. Texas has specific criminal provisions for election deepfakes and non-consensual sexual deepfakes.`,
			applicableCategories: deepfakeTriggers.map((t) => t.id),
			provisions: deepfakeTriggers.map((t) => t.framework),
		};
	}

	// GenAI with content generation
	if (isGenAiProduct(ctx)) {
		return {
			level: "limited",
			justification:
				"This generative AI system is subject to Texas AI content disclosure requirements. TRAIGA includes provisions for transparency in AI-generated content.",
			applicableCategories: ["tx-genai-disclosure"],
			provisions: ["TRAIGA GenAI Provisions"],
		};
	}

	// Consumer-facing AI
	if (ctx.userPopulations.includes("consumers")) {
		return {
			level: "limited",
			justification:
				"This consumer-facing AI system is subject to general Texas consumer protection laws (DTPA) regarding deceptive trade practices.",
			applicableCategories: ["tx-consumer-protection"],
			provisions: ["Texas DTPA"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific Texas regulatory obligations. It does not make consequential decisions in TRAIGA domains and does not generate synthetic media.",
		applicableCategories: [],
		provisions: [],
	};
}

// ─── Applicable Provisions ────────────────────────────────────────────────

function buildApplicableProvisions(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ApplicableProvision[] {
	const provisions: ApplicableProvision[] = [];

	if (risk.level === "minimal") return provisions;

	// TRAIGA provisions
	if (isHighRiskAi(ctx)) {
		provisions.push(
			{
				id: "us-tx-traiga-impact-assessment",
				law: "TRAIGA",
				article: "TRAIGA Impact Assessment Requirements",
				title: "Algorithmic Impact Assessment",
				summary:
					"Deployers of high-risk AI systems must conduct and document impact assessments before deployment. Assessments must evaluate potential discriminatory impacts, describe the AI system's purpose and intended use, and identify risk mitigation measures.",
				relevance:
					"This AI system makes consequential decisions, requiring a TRAIGA impact assessment.",
			},
			{
				id: "us-tx-traiga-risk-management",
				law: "TRAIGA",
				article: "TRAIGA Risk Management",
				title: "Risk Management Policy",
				summary:
					"Deployers must implement a risk management policy including: identification of potential risks of algorithmic discrimination, steps to mitigate identified risks, and ongoing monitoring procedures.",
				relevance:
					"This high-risk AI system requires a documented risk management policy under TRAIGA.",
			},
			{
				id: "us-tx-traiga-notice",
				law: "TRAIGA",
				article: "TRAIGA Notice Requirements",
				title: "Individual Notice of AI Use",
				summary:
					"Deployers must provide clear notice to individuals that an AI system is being used to make a consequential decision about them, including what data is used and how to contest the decision.",
				relevance:
					"Individuals affected by this AI system's consequential decisions must be notified.",
			},
			{
				id: "us-tx-traiga-opt-out",
				law: "TRAIGA",
				article: "TRAIGA Opt-Out Rights",
				title: "Right to Opt Out and Appeal",
				summary:
					"Individuals subject to consequential AI decisions have the right to opt out of AI-based profiling and to appeal adverse decisions, with access to a human reviewer.",
				relevance: "Affected individuals must be given opt-out and appeal rights.",
			},
		);
	}

	// Deepfake provisions
	const deepfakeTriggers = getMatchingDeepfakeTriggers(ctx);
	if (deepfakeTriggers.some((t) => t.id === "tx-deepfake-election")) {
		provisions.push({
			id: "us-tx-election-deepfake",
			law: "Texas Election Code",
			article: "§ 255.004",
			title: "Prohibition on Deceptive Election Deepfakes",
			summary:
				"It is illegal to create and distribute a deepfake video intended to injure a candidate or influence an election within 30 days of an election. Violations are a Class A misdemeanor.",
			relevance:
				"This AI system can generate deepfakes and may be used in contexts involving political content.",
		});
	}

	if (deepfakeTriggers.some((t) => t.id === "tx-deepfake-sexual")) {
		provisions.push({
			id: "us-tx-sexual-deepfake",
			law: "Texas Penal Code",
			article: "§ 21.165",
			title: "Non-Consensual Sexual Deepfakes",
			summary:
				"Creating or distributing non-consensual sexually explicit deepfake imagery is a criminal offence (state jail felony). This applies to AI-generated images or videos depicting a real person in sexual situations without their consent.",
			relevance:
				"This AI system can generate realistic images/videos, creating risk for non-consensual sexually explicit content.",
		});
	}

	// GenAI disclosure
	if (isGenAiProduct(ctx)) {
		provisions.push({
			id: "us-tx-traiga-genai-disclosure",
			law: "TRAIGA",
			article: "TRAIGA GenAI Disclosure",
			title: "AI-Generated Content Disclosure",
			summary:
				"AI systems generating content must disclose that content is AI-generated when it could be mistaken for human-created content. Deployers must implement mechanisms for labelling AI-generated output.",
			relevance:
				"This generative AI system must implement content disclosure mechanisms under TRAIGA.",
		});
	}

	return provisions;
}

// ─── Required Artifacts ───────────────────────────────────────────────────

function buildRequiredArtifacts(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ArtifactRequirement[] {
	const artifacts: ArtifactRequirement[] = [];

	if (risk.level === "minimal") return artifacts;

	// TRAIGA impact assessment
	if (isHighRiskAi(ctx)) {
		artifacts.push(
			{
				type: "algorithmic-impact",
				name: "TRAIGA Algorithmic Impact Assessment",
				required: true,
				legalBasis: "TRAIGA Impact Assessment Requirements",
				description:
					"Algorithmic impact assessment documenting the AI system's purpose, data inputs, decision outputs, potential discriminatory impacts, risk mitigation measures, and ongoing monitoring plan. Must be completed before deployment.",
			},
			{
				type: "risk-assessment",
				name: "TRAIGA Risk Management Policy",
				required: true,
				legalBasis: "TRAIGA Risk Management",
				description:
					"Documented risk management policy covering identification of algorithmic discrimination risks, mitigation steps, and monitoring procedures.",
			},
			{
				type: "transparency-notice",
				name: "TRAIGA Individual Notice",
				required: true,
				legalBasis: "TRAIGA Notice Requirements",
				description:
					"Notice template informing individuals that AI is used in consequential decisions, what data is used, how to contest decisions, and how to opt out.",
				templateId: "transparency-notice",
			},
		);
	}

	// GenAI content policy
	if (isGenAiProduct(ctx)) {
		artifacts.push({
			type: "genai-content-policy",
			name: "AI-Generated Content Disclosure Policy",
			required: false,
			legalBasis: "TRAIGA GenAI Provisions",
			description:
				"Policy documenting mechanisms for disclosing AI-generated content, labelling standards, and compliance with Texas deepfake provisions.",
		});
	}

	return artifacts;
}

// ─── Required Actions ─────────────────────────────────────────────────────

function buildRequiredActions(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ActionRequirement[] {
	const actions: ActionRequirement[] = [];

	if (risk.level === "minimal") return actions;

	// TRAIGA high-risk actions
	if (isHighRiskAi(ctx)) {
		actions.push(
			{
				id: "us-tx-traiga-impact-assessment",
				title: "Conduct TRAIGA algorithmic impact assessment",
				description:
					"Complete an algorithmic impact assessment evaluating: system purpose and intended use, data inputs and their sources, potential for algorithmic discrimination across protected classes, risk mitigation measures, and ongoing monitoring plan. Must be completed before deployment.",
				priority: "critical",
				legalBasis: "TRAIGA",
				jurisdictions: ["us-tx"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "us-tx-traiga-risk-policy",
				title: "Implement TRAIGA risk management policy",
				description:
					"Develop and implement a risk management policy covering identification of algorithmic discrimination risks, documented mitigation steps, and ongoing monitoring procedures. Policy must be maintained and updated as the system evolves.",
				priority: "critical",
				legalBasis: "TRAIGA",
				jurisdictions: ["us-tx"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "us-tx-traiga-individual-notice",
				title: "Implement individual notice and opt-out mechanisms",
				description:
					"Provide clear notice to individuals that AI is being used for consequential decisions. Include information about what data is used, how to contest decisions, and how to opt out of AI-based profiling. Ensure a human reviewer is available for appeals.",
				priority: "critical",
				legalBasis: "TRAIGA",
				jurisdictions: ["us-tx"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "us-tx-traiga-discrimination-testing",
				title: "Test for algorithmic discrimination",
				description:
					"Test the AI system for discriminatory outcomes across Texas-protected classes. Document testing methodology, results, and remediation measures. Maintain records for regulatory review.",
				priority: "important",
				legalBasis: "TRAIGA",
				jurisdictions: ["us-tx"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
		);
	}

	// Deepfake actions
	const deepfakeTriggers = getMatchingDeepfakeTriggers(ctx);
	if (deepfakeTriggers.length > 0) {
		actions.push({
			id: "us-tx-deepfake-safeguards",
			title: "Implement Texas deepfake safeguards",
			description:
				"Implement safeguards to prevent creation and distribution of deceptive deepfakes. For election-related content: ensure AI cannot be easily used to create misleading political deepfakes within 30 days of elections. For intimate imagery: implement consent verification and content safety filters.",
			priority: "critical",
			legalBasis: "Texas Election Code § 255.004, Texas Penal Code § 21.165",
			jurisdictions: ["us-tx"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// GenAI disclosure actions
	if (isGenAiProduct(ctx)) {
		actions.push({
			id: "us-tx-genai-disclosure",
			title: "Implement AI-generated content disclosure",
			description:
				"Implement mechanisms to disclose that content is AI-generated when it could be mistaken for human-created content. Label AI-generated outputs and maintain provenance information.",
			priority: "important",
			legalBasis: "TRAIGA GenAI Provisions",
			jurisdictions: ["us-tx"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	notes.push(
		"TRAIGA (Texas Responsible AI Governance Act) was signed into law in 2025. Compliance obligations phase in based on system risk level.",
	);

	if (risk.level === "high") {
		notes.push(
			"High-risk AI system deployers must complete impact assessments and implement risk management policies before deployment. Ongoing monitoring and annual reassessment required.",
		);
	}

	return {
		effectiveDate: "2025-09-01",
		deadlines: [
			{
				date: "2019-09-01",
				description:
					"Texas Election Code deepfake provision (§ 255.004) took effect. Creating deceptive political deepfakes within 30 days of an election is a Class A misdemeanor.",
				provision: "Texas Election Code § 255.004",
				isMandatory: true,
			},
			{
				date: "2025-09-01",
				description:
					"TRAIGA takes effect. Deployers of high-risk AI systems must comply with impact assessment, risk management, notice, and opt-out requirements.",
				provision: "TRAIGA",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── Texas Jurisdiction Module ────────────────────────────────────────────

export const texasModule: JurisdictionModule = {
	id: "us-tx",
	name: "Texas Responsible AI Governance Act (TRAIGA)",
	jurisdiction: "us-tx",

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
		return buildTimeline(risk);
	},
};

// ─── Exported Helpers (for testing) ───────────────────────────────────────

export {
	classifyRisk,
	getMatchingTraigaTriggers,
	getMatchingDeepfakeTriggers,
	isHighRiskAi,
	isGenAiProduct,
	TRAIGA_TRIGGERS,
	DEEPFAKE_TRIGGERS,
};
