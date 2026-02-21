import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../../core/types.js";

// ─── Consequential Decision Areas (SB 24-205) ───────────────────────────

interface ConsequentialDecisionArea {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const CONSEQUENTIAL_DECISION_AREAS: readonly ConsequentialDecisionArea[] = [
	{
		id: "co-education",
		name: "Education",
		description:
			"Decisions related to enrollment, admission, assessment, or discipline in education",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.userPopulations.includes("students") ||
				desc.includes("education") ||
				desc.includes("enrollment") ||
				desc.includes("admission") ||
				desc.includes("academic")
			);
		},
	},
	{
		id: "co-employment",
		name: "Employment",
		description:
			"Decisions related to hiring, termination, promotion, compensation, or other employment terms",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.userPopulations.includes("job-applicants") ||
				ctx.userPopulations.includes("employees") ||
				desc.includes("hiring") ||
				desc.includes("recruitment") ||
				desc.includes("employment") ||
				desc.includes("promotion") ||
				desc.includes("termination") ||
				desc.includes("resume screen")
			);
		},
	},
	{
		id: "co-financial-services",
		name: "Financial Services",
		description:
			"Decisions related to lending, credit, insurance, or other financial products and services",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.sectorContext?.sector === "financial-services" ||
				ctx.userPopulations.includes("credit-applicants") ||
				desc.includes("credit") ||
				desc.includes("lending") ||
				desc.includes("loan") ||
				desc.includes("financial service") ||
				desc.includes("banking")
			);
		},
	},
	{
		id: "co-government-services",
		name: "Government Services",
		description: "Decisions related to access to government services, benefits, or programs",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("government service") ||
				desc.includes("public benefit") ||
				desc.includes("public assistance") ||
				desc.includes("welfare") ||
				desc.includes("social benefit") ||
				desc.includes("government program")
			);
		},
	},
	{
		id: "co-healthcare",
		name: "Healthcare",
		description:
			"Decisions related to access to healthcare services, treatment, or insurance coverage",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.userPopulations.includes("patients") ||
				ctx.dataProcessed.includes("health") ||
				desc.includes("healthcare") ||
				desc.includes("medical") ||
				desc.includes("health service") ||
				desc.includes("clinical") ||
				desc.includes("diagnosis") ||
				desc.includes("treatment")
			);
		},
	},
	{
		id: "co-housing",
		name: "Housing",
		description: "Decisions related to renting, buying, or obtaining housing",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.userPopulations.includes("tenants") ||
				desc.includes("housing") ||
				desc.includes("rental") ||
				desc.includes("tenant screen") ||
				desc.includes("landlord") ||
				desc.includes("lease")
			);
		},
	},
	{
		id: "co-insurance",
		name: "Insurance",
		description: "Decisions related to insurance underwriting, pricing, claims, or coverage",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.sectorContext?.financialServices?.involvesInsurancePricing === true ||
				desc.includes("insurance") ||
				desc.includes("underwriting") ||
				desc.includes("actuarial") ||
				desc.includes("claims processing")
			);
		},
	},
	{
		id: "co-legal-services",
		name: "Legal Services",
		description: "Decisions related to access to legal services or legal outcomes",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("legal service") ||
				desc.includes("legal aid") ||
				desc.includes("judicial") ||
				desc.includes("court") ||
				desc.includes("sentencing") ||
				desc.includes("parole")
			);
		},
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingConsequentialAreas(ctx: ProductContext): readonly ConsequentialDecisionArea[] {
	return CONSEQUENTIAL_DECISION_AREAS.filter((area) => area.matchesContext(ctx));
}

function isConsequentialDecision(ctx: ProductContext): boolean {
	return getMatchingConsequentialAreas(ctx).length > 0;
}

function isHighRiskAiSystem(ctx: ProductContext): boolean {
	const hasConsequentialArea = isConsequentialDecision(ctx);
	const hasMaterialImpact =
		ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
	return hasConsequentialArea && hasMaterialImpact;
}

function isDeveloper(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	return (
		ctx.productType === "foundation-model" ||
		desc.includes("develop") ||
		desc.includes("provider") ||
		desc.includes("vendor") ||
		desc.includes("build") ||
		ctx.generativeAiContext?.foundationModelSource === "self-trained"
	);
}

function isDeployer(ctx: ProductContext): boolean {
	// Under Colorado SB 24-205, a "deployer" is any entity that uses a high-risk
	// AI system. Most LaunchClear users are deployers unless they are purely
	// foundation model providers with no end-user-facing deployment.
	if (
		ctx.productType === "foundation-model" &&
		!ctx.userPopulations.some((p) => p === "consumers" || p === "general-public")
	) {
		// Pure foundation model providers without consumer-facing use are developers, not deployers
		return false;
	}

	// Consumer-facing or decision-making products are deployers
	if (
		ctx.userPopulations.some((p) => p === "consumers" || p === "general-public") ||
		ctx.decisionImpact === "material" ||
		ctx.decisionImpact === "determinative"
	) {
		return true;
	}

	// Default: most product teams using LaunchClear are deployers
	return true;
}

function isGenAiInConsequentialArea(ctx: ProductContext): boolean {
	const isGenAi =
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model";
	return isGenAi && isConsequentialDecision(ctx);
}

function hasAgenticCapabilities(ctx: ProductContext): boolean {
	return (
		ctx.agenticAiContext?.isAgentic === true ||
		ctx.generativeAiContext?.usesAgenticCapabilities === true
	);
}

function isFinancialServicesContext(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

// ─── Risk Classification Logic ────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const consequentialAreas = getMatchingConsequentialAreas(ctx);

	// High-risk: consequential decisions with material/determinative impact
	if (isHighRiskAiSystem(ctx)) {
		return {
			level: "high",
			justification: `This AI system makes consequential decisions in the following area(s) under the Colorado AI Act (SB 24-205): ${consequentialAreas.map((a) => a.name).join(", ")}. The decision impact is ${ctx.decisionImpact}, classifying this as a high-risk AI system requiring impact assessments, risk management policies, consumer notice, and algorithmic discrimination prevention.`,
			applicableCategories: consequentialAreas.map((a) => a.id),
			provisions: ["SB 24-205 §6-1-1702", "SB 24-205 §6-1-1703", "SB 24-205 §6-1-1704"],
		};
	}

	// Limited: consumer data processed or consequential area without material impact
	if (
		isConsequentialDecision(ctx) ||
		ctx.dataProcessed.includes("personal") ||
		ctx.userPopulations.includes("consumers")
	) {
		return {
			level: "limited",
			justification:
				"This AI system processes consumer data or operates in a consequential decision area under the Colorado AI Act but does not make material or determinative decisions. General transparency obligations and consumer notification requirements may apply.",
			applicableCategories: consequentialAreas.map((a) => a.id),
			provisions: ["SB 24-205 §6-1-1704"],
		};
	}

	// Minimal: no consumer-facing consequential decisions
	return {
		level: "minimal",
		justification:
			"This AI system does not make consequential decisions about consumers in any of the areas regulated by the Colorado AI Act (SB 24-205). No mandatory obligations apply under this law.",
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

	// Core scope provision
	provisions.push({
		id: "co-sb205-scope",
		law: "Colorado AI Act",
		article: "SB 24-205 §6-1-1702",
		title: "High-Risk AI System Definition",
		summary:
			"A high-risk AI system is any AI system that, when deployed, makes or is a substantial factor in making a consequential decision concerning a consumer. Consequential decisions include those in education, employment, financial services, government services, healthcare, housing, insurance, and legal services.",
		relevance: risk.justification,
	});

	if (risk.level === "high") {
		// Developer obligations
		if (isDeveloper(ctx)) {
			provisions.push({
				id: "co-sb205-developer-duties",
				law: "Colorado AI Act",
				article: "SB 24-205 §6-1-1703",
				title: "Developer Duties",
				summary:
					"Developers must use reasonable care to protect consumers from algorithmic discrimination. Must make available to deployers: documentation describing high-risk uses, known limitations, data used in development, mitigation measures, and how to use the system to comply with deployer obligations.",
				relevance:
					"As a developer of this high-risk AI system, you must provide deployers with comprehensive documentation and exercise reasonable care to prevent algorithmic discrimination.",
			});
		}

		// Deployer obligations
		if (isDeployer(ctx)) {
			provisions.push(
				{
					id: "co-sb205-deployer-risk-mgmt",
					law: "Colorado AI Act",
					article: "SB 24-205 §6-1-1704(1)",
					title: "Deployer Risk Management Policy",
					summary:
						"Deployers must implement a risk management policy and program to govern the deployment of high-risk AI systems. The policy must specify principles, processes, and personnel for oversight.",
					relevance:
						"As a deployer of this high-risk AI system, a risk management policy and program is required.",
				},
				{
					id: "co-sb205-deployer-impact-assessment",
					law: "Colorado AI Act",
					article: "SB 24-205 §6-1-1704(2)",
					title: "Deployer Impact Assessment",
					summary:
						"Deployers must complete an impact assessment for each high-risk AI system before deployment and annually thereafter. The assessment must cover the purpose, intended uses, known risks of algorithmic discrimination, data inputs, outputs, and safeguards.",
					relevance:
						"An impact assessment is required before deploying this high-risk AI system in Colorado.",
				},
				{
					id: "co-sb205-deployer-notice",
					law: "Colorado AI Act",
					article: "SB 24-205 §6-1-1704(3)",
					title: "Consumer Notice Requirements",
					summary:
						"Deployers must notify consumers that the AI system is being used to make or substantially factor into a consequential decision. Must provide a description of the system, contact information, and the right to opt out of profiling.",
					relevance:
						"Consumers must be notified that this AI system is used in consequential decisions.",
				},
			);
		}

		// Algorithmic discrimination provision
		provisions.push({
			id: "co-sb205-algo-discrimination",
			law: "Colorado AI Act",
			article: "SB 24-205 §6-1-1701(1)",
			title: "Algorithmic Discrimination",
			summary:
				"Algorithmic discrimination means any condition where the use of an AI system results in an unlawful differential treatment or impact that disfavors an individual or group based on age, color, disability, ethnicity, genetic information, language, national origin, race, religion, reproductive health, sex, veteran status, or other protected class.",
			relevance:
				"Developers and deployers must use reasonable care to protect consumers from algorithmic discrimination in this high-risk AI system.",
		});
	}

	// GenAI in consequential decisions
	if (isGenAiInConsequentialArea(ctx)) {
		provisions.push({
			id: "co-sb205-genai-consequential",
			law: "Colorado AI Act",
			article: "SB 24-205 §6-1-1702, §6-1-1704",
			title: "GenAI in Consequential Decisions",
			summary:
				"When generative AI systems are used in or to support consequential decisions, all high-risk AI system obligations apply. The use of GenAI does not exempt deployers from impact assessment, notice, or anti-discrimination requirements.",
			relevance:
				"This system uses generative AI in a consequential decision area, triggering full Colorado AI Act obligations.",
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

	if (risk.level !== "high") return artifacts;

	// Impact assessment (required for deployers)
	if (isDeployer(ctx)) {
		artifacts.push({
			type: "algorithmic-impact",
			name: "Colorado AI Act Impact Assessment",
			required: true,
			legalBasis: "SB 24-205 §6-1-1704(2)",
			description:
				"Impact assessment covering the purpose, intended uses, known risks of algorithmic discrimination, data categories used, outputs, oversight measures, and safeguards implemented. Must be completed before deployment and updated annually.",
			templateId: "algorithmic-impact",
		});
	}

	// Risk management documentation
	artifacts.push({
		type: "risk-assessment",
		name: "Colorado AI Act Risk Management Policy",
		required: true,
		legalBasis: "SB 24-205 §6-1-1704(1)",
		description:
			"Risk management policy and program documentation specifying principles, processes, and personnel governing the deployment of the high-risk AI system. Must address algorithmic discrimination prevention.",
	});

	// Consumer transparency notice
	artifacts.push({
		type: "transparency-notice",
		name: "Colorado Consumer AI Notice",
		required: true,
		legalBasis: "SB 24-205 §6-1-1704(3)",
		description:
			"Consumer-facing notice that the AI system is being used to make or substantially factor into a consequential decision. Must include system description, contact information, and information about the right to opt out of profiling.",
		templateId: "transparency-notice",
	});

	// Developer documentation (if applicable)
	if (isDeveloper(ctx)) {
		artifacts.push({
			type: "model-card",
			name: "Colorado Developer Disclosure Documentation",
			required: true,
			legalBasis: "SB 24-205 §6-1-1703(2)",
			description:
				"Documentation for deployers describing the high-risk AI system: intended uses, known limitations and risks, data used in development, mitigation measures for algorithmic discrimination, and guidance for deployer compliance.",
			templateId: "model-card",
		});
	}

	// Bias audit for financial services or employment
	if (
		isFinancialServicesContext(ctx) ||
		ctx.userPopulations.includes("job-applicants") ||
		ctx.userPopulations.includes("employees")
	) {
		artifacts.push({
			type: "bias-audit",
			name: "Algorithmic Discrimination Analysis",
			required: true,
			legalBasis: "SB 24-205 §6-1-1701(1), §6-1-1704(1)",
			description:
				"Analysis documenting testing for algorithmic discrimination across protected classes (age, color, disability, ethnicity, genetic information, language, national origin, race, religion, reproductive health, sex, veteran status). Part of the required risk management program.",
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

	if (risk.level === "high") {
		// Deployer actions
		if (isDeployer(ctx)) {
			actions.push(
				{
					id: "co-risk-management-policy",
					title: "Implement risk management policy and program",
					description:
						"Establish a risk management policy governing deployment of this high-risk AI system. The policy must specify principles for AI governance, processes for identifying and mitigating algorithmic discrimination, personnel responsible for oversight, and employee training requirements.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1704(1)",
					jurisdictions: ["us-co"],
					estimatedEffort: "4-8 weeks",
					deadline: "2026-02-01",
				},
				{
					id: "co-impact-assessment",
					title: "Complete impact assessment before deployment",
					description:
						"Complete an impact assessment covering the purpose, intended uses, technology type, known risks of algorithmic discrimination, data categories used as inputs and generated as outputs, performance metrics, and safeguards. Must be updated annually after initial deployment.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1704(2)",
					jurisdictions: ["us-co"],
					estimatedEffort: "2-4 weeks",
					deadline: "2026-02-01",
				},
				{
					id: "co-consumer-notice",
					title: "Provide consumer notice of AI use in consequential decisions",
					description:
						"Notify consumers that a high-risk AI system is being used to make or substantially factor into a consequential decision. The notice must include a description of the AI system, contact information for the deployer, and information about the consumer's right to opt out of profiling in consequential decisions.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1704(3)",
					jurisdictions: ["us-co"],
					estimatedEffort: "1-2 weeks",
					deadline: "2026-02-01",
				},
				{
					id: "co-opt-out-mechanism",
					title: "Implement consumer opt-out for profiling",
					description:
						"Provide consumers with the ability to opt out of the deployer's processing of their personal data for purposes of profiling in furtherance of consequential decisions. The opt-out mechanism must be clearly accessible and easy to use.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1704(3)(c)",
					jurisdictions: ["us-co"],
					estimatedEffort: "2-4 weeks",
					deadline: "2026-02-01",
				},
				{
					id: "co-discrimination-testing",
					title: "Test for algorithmic discrimination",
					description:
						"Conduct testing to identify and mitigate algorithmic discrimination across protected classes defined by the Colorado AI Act (age, color, disability, ethnicity, genetic information, language, national origin, race, religion, reproductive health, sex, veteran status). Document methodology, results, and remediation steps.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1701(1), §6-1-1704(1)",
					jurisdictions: ["us-co"],
					estimatedEffort: "3-6 weeks",
					deadline: "2026-02-01",
				},
			);
		}

		// Developer actions
		if (isDeveloper(ctx)) {
			actions.push(
				{
					id: "co-developer-reasonable-care",
					title: "Exercise reasonable care to prevent algorithmic discrimination",
					description:
						"As a developer, use reasonable care to protect consumers from known or reasonably foreseeable risks of algorithmic discrimination arising from the intended uses of the AI system. Document design choices, data selection criteria, and bias mitigation measures.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1703(1)",
					jurisdictions: ["us-co"],
					estimatedEffort: "4-8 weeks",
					deadline: "2026-02-01",
				},
				{
					id: "co-developer-documentation",
					title: "Provide deployer documentation and transparency notice",
					description:
						"Make available to deployers and publish on your website: a general statement describing the types of high-risk AI systems the developer develops, documentation covering known limitations, intended uses, data used in development, risk mitigation measures, and guidance for deployer compliance.",
					priority: "critical",
					legalBasis: "SB 24-205 §6-1-1703(2)-(3)",
					jurisdictions: ["us-co"],
					estimatedEffort: "2-4 weeks",
					deadline: "2026-02-01",
				},
			);
		}

		// AG notification on discrimination discovery
		actions.push({
			id: "co-ag-notification",
			title: "Establish process for AG notification of discrimination",
			description:
				"Establish a process to notify the Colorado Attorney General within 90 days if the deployer discovers that the high-risk AI system has caused algorithmic discrimination. The notification must describe the discrimination, the affected population, and remediation steps taken.",
			priority: "important",
			legalBasis: "SB 24-205 §6-1-1704(4)",
			jurisdictions: ["us-co"],
			estimatedEffort: "1-2 weeks",
			deadline: "2026-02-01",
		});
	}

	// GenAI in consequential decisions
	if (risk.level === "high" && isGenAiInConsequentialArea(ctx)) {
		actions.push({
			id: "co-genai-consequential-controls",
			title: "Implement controls for GenAI use in consequential decisions",
			description:
				"When using generative AI in consequential decisions, implement additional controls: validate GenAI outputs before they influence decisions, document how GenAI outputs are used in the decision process, and ensure human oversight of GenAI-assisted consequential decisions. GenAI hallucination risks must be addressed in the impact assessment.",
			priority: "critical",
			legalBasis: "SB 24-205 §6-1-1702, §6-1-1704",
			jurisdictions: ["us-co"],
			estimatedEffort: "2-4 weeks",
			deadline: "2026-02-01",
		});
	}

	// Agentic AI additional considerations
	if (risk.level === "high" && hasAgenticCapabilities(ctx)) {
		actions.push({
			id: "co-agentic-oversight",
			title: "Implement oversight for agentic AI in consequential decisions",
			description:
				"For AI systems with agentic capabilities making consequential decisions, implement human checkpoints before autonomous actions that affect consumers. Document the scope of autonomous decision authority, action logging, and failsafe mechanisms in the impact assessment.",
			priority: "critical",
			legalBasis: "SB 24-205 §6-1-1704(1)-(2)",
			jurisdictions: ["us-co"],
			estimatedEffort: "3-6 weeks",
			deadline: "2026-02-01",
		});
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	notes.push(
		"The Colorado AI Act (SB 24-205) was signed into law on May 17, 2024, with an effective date of February 1, 2026.",
	);

	if (risk.level === "high") {
		notes.push(
			"CRITICAL: All high-risk AI system obligations take effect on February 1, 2026. Deployers must have risk management policies, impact assessments, and consumer notice mechanisms in place by this date.",
		);
		notes.push(
			"Impact assessments must be updated annually after initial deployment. Discovery of algorithmic discrimination must be reported to the AG within 90 days.",
		);
	}

	if (risk.level === "limited") {
		notes.push(
			"While the system is not currently classified as high-risk under the Colorado AI Act, changes in deployment context (e.g., using the system for consequential decisions) could trigger full obligations.",
		);
	}

	return {
		effectiveDate: "2026-02-01",
		deadlines: [
			{
				date: "2026-02-01",
				description:
					"Colorado AI Act (SB 24-205) takes effect. All developer and deployer obligations for high-risk AI systems become enforceable.",
				provision: "SB 24-205",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── Colorado AI Act Jurisdiction Module ──────────────────────────────────

export const coloradoModule: JurisdictionModule = {
	id: "us-co",
	name: "Colorado AI Act (SB 24-205)",
	jurisdiction: "us-co",

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
	getMatchingConsequentialAreas,
	isConsequentialDecision,
	isHighRiskAiSystem,
	isDeveloper,
	isDeployer,
	isGenAiInConsequentialArea,
	hasAgenticCapabilities,
	isFinancialServicesContext,
	CONSEQUENTIAL_DECISION_AREAS,
};
