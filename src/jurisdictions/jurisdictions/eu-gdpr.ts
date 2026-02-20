import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../core/types.js";

// ─── DPIA Trigger Conditions (Article 35) ──────────────────────────────────

interface DpiaTrigger {
	readonly id: string;
	readonly name: string;
	readonly article: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const DPIA_TRIGGERS: readonly DpiaTrigger[] = [
	{
		id: "dpia-systematic-evaluation",
		name: "Systematic and Extensive Evaluation of Personal Aspects (Profiling)",
		article: "Article 35(3)(a)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			const isProfiling =
				desc.includes("profiling") ||
				desc.includes("profile") ||
				desc.includes("scoring") ||
				desc.includes("evaluating personal");
			const isAutomated =
				ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop";
			const hasLegalEffects =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return isProfiling && isAutomated && hasLegalEffects;
		},
	},
	{
		id: "dpia-large-scale-special-category",
		name: "Large-Scale Processing of Special Category Data",
		article: "Article 35(3)(b)",
		matchesContext: (ctx) => {
			const hasSpecialCategory =
				ctx.dataProcessed.includes("biometric") ||
				ctx.dataProcessed.includes("health") ||
				ctx.dataProcessed.includes("genetic") ||
				ctx.dataProcessed.includes("political") ||
				ctx.dataProcessed.includes("criminal");
			const desc = ctx.description.toLowerCase();
			const isLargeScale =
				desc.includes("large-scale") ||
				desc.includes("large scale") ||
				ctx.userPopulations.includes("general-public") ||
				ctx.userPopulations.includes("consumers");
			return hasSpecialCategory && isLargeScale;
		},
	},
	{
		id: "dpia-public-monitoring",
		name: "Systematic Monitoring of Publicly Accessible Area",
		article: "Article 35(3)(c)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(desc.includes("public space") ||
					desc.includes("public area") ||
					desc.includes("public monitoring") ||
					desc.includes("cctv") ||
					desc.includes("surveillance")) &&
				(desc.includes("monitor") || desc.includes("track") || desc.includes("surveillance"))
			);
		},
	},
	{
		id: "dpia-automated-decision-making",
		name: "Automated Decision-Making with Legal/Significant Effects",
		article: "Article 22 / Article 35",
		matchesContext: (ctx) => {
			const isFullyAutomated = ctx.automationLevel === "fully-automated";
			const hasSignificantEffect =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return isFullyAutomated && hasSignificantEffect;
		},
	},
	{
		id: "dpia-sensitive-data-processing",
		name: "Processing of Sensitive Personal Data",
		article: "Article 9, Article 35",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("sensitive") ||
			ctx.dataProcessed.includes("biometric") ||
			ctx.dataProcessed.includes("health") ||
			ctx.dataProcessed.includes("genetic"),
	},
	{
		id: "dpia-minor-data",
		name: "Processing of Children's Data",
		article: "Article 8, Article 35",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors"),
	},
	{
		id: "dpia-training-data-personal",
		name: "GenAI: Personal Data Used in Model Training",
		article: "Article 35, Recital 91",
		matchesContext: (ctx) => {
			const usesPersonalTraining =
				ctx.trainingData.containsPersonalData ||
				ctx.generativeAiContext?.trainingDataIncludes.includes("personal-data") === true ||
				ctx.generativeAiContext?.trainingDataIncludes.includes("user-generated-content") === true;
			return usesPersonalTraining && ctx.trainingData.usesTrainingData;
		},
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingDpiaTriggers(ctx: ProductContext): readonly DpiaTrigger[] {
	return DPIA_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function processesPersonalData(ctx: ProductContext): boolean {
	return ctx.dataProcessed.some(
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
			d === "criminal" ||
			d === "political" ||
			d === "genetic",
	);
}

function isAutomatedDecisionMaking(ctx: ProductContext): boolean {
	return (
		ctx.automationLevel === "fully-automated" &&
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
	);
}

function involvesDataTransfers(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	// Third-party APIs, cloud AI providers, or cross-border contexts suggest transfers
	return (
		desc.includes("cross-border") ||
		desc.includes("data transfer") ||
		desc.includes("third-party api") ||
		ctx.generativeAiContext?.foundationModelSource === "third-party-api" ||
		false
	);
}

function isGenAiWithPersonalDataConcerns(ctx: ProductContext): boolean {
	if (!ctx.generativeAiContext) return false;
	return (
		ctx.generativeAiContext.usesFoundationModel &&
		(ctx.trainingData.containsPersonalData ||
			ctx.generativeAiContext.trainingDataIncludes.includes("personal-data") ||
			ctx.generativeAiContext.trainingDataIncludes.includes("public-web-scrape") ||
			ctx.generativeAiContext.trainingDataIncludes.includes("user-generated-content"))
	);
}

function requiresLargeScaleProcessingDpo(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	const isLargeScale =
		desc.includes("large-scale") ||
		desc.includes("large scale") ||
		ctx.userPopulations.includes("general-public") ||
		ctx.userPopulations.includes("consumers");
	return (
		isLargeScale &&
		(ctx.dataProcessed.includes("sensitive") ||
			ctx.dataProcessed.includes("biometric") ||
			ctx.dataProcessed.includes("health") ||
			ctx.dataProcessed.includes("genetic") ||
			ctx.dataProcessed.includes("criminal"))
	);
}

// ─── Risk Classification Logic ────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	if (!processesPersonalData(ctx)) {
		return {
			level: "minimal",
			justification:
				"This AI system does not process personal data. GDPR obligations do not apply to non-personal data processing.",
			applicableCategories: [],
			provisions: [],
		};
	}

	const dpiaTriggers = getMatchingDpiaTriggers(ctx);

	if (dpiaTriggers.length > 0) {
		return {
			level: "high",
			justification: `This AI system triggers a DPIA requirement under GDPR due to: ${dpiaTriggers.map((t) => t.name).join("; ")}. A Data Protection Impact Assessment must be conducted before processing begins.`,
			applicableCategories: dpiaTriggers.map((t) => t.id),
			provisions: [...new Set(dpiaTriggers.map((t) => t.article))],
		};
	}

	return {
		level: "limited",
		justification:
			"This AI system processes personal data and must comply with GDPR principles (lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, accountability). No DPIA triggers were identified, but general GDPR obligations apply.",
		applicableCategories: ["general-processing"],
		provisions: ["Articles 5-6"],
	};
}

// ─── Applicable Provisions ────────────────────────────────────────────────

function buildApplicableProvisions(
	ctx: ProductContext,
	risk: RiskClassification,
): readonly ApplicableProvision[] {
	const provisions: ApplicableProvision[] = [];

	if (risk.level === "minimal") return provisions;

	// Core GDPR provisions always apply when processing personal data
	provisions.push({
		id: "gdpr-art5-principles",
		law: "GDPR",
		article: "Article 5",
		title: "Principles of Processing",
		summary:
			"Processing must be lawful, fair, and transparent; collected for specified purposes; adequate, relevant, and limited to what is necessary; accurate; stored only as long as necessary; and processed securely.",
		relevance: "Applies to all personal data processing in the AI system.",
	});

	provisions.push({
		id: "gdpr-art6-legal-basis",
		law: "GDPR",
		article: "Articles 6-7",
		title: "Legal Basis for Processing",
		summary:
			"Processing must have a valid legal basis: consent, contract performance, legal obligation, vital interests, public interest, or legitimate interests. For consent, it must be freely given, specific, informed, and unambiguous.",
		relevance:
			"A valid legal basis must be identified for each purpose of personal data processing in the AI system.",
	});

	provisions.push({
		id: "gdpr-art12-15-rights",
		law: "GDPR",
		article: "Articles 12-23",
		title: "Data Subject Rights",
		summary:
			"Data subjects have rights to access, rectification, erasure, restriction, portability, and objection. For AI systems, the right to explanation of automated decisions is particularly relevant.",
		relevance:
			"The AI system must facilitate the exercise of data subject rights, including providing information about processing and enabling deletion/rectification requests.",
	});

	// Automated decision-making (Article 22)
	if (isAutomatedDecisionMaking(ctx)) {
		provisions.push({
			id: "gdpr-art22",
			law: "GDPR",
			article: "Article 22",
			title: "Automated Individual Decision-Making, Including Profiling",
			summary:
				"Data subjects have the right not to be subject to decisions based solely on automated processing (including profiling) that produce legal or similarly significant effects, unless based on explicit consent, contractual necessity, or Union/Member State law. Suitable safeguards including the right to human intervention must be provided.",
			relevance:
				"This AI system makes fully automated decisions with material or determinative impact on individuals, triggering Article 22 protections.",
		});
	}

	// DPIA requirement
	if (risk.level === "high") {
		provisions.push({
			id: "gdpr-art35-dpia",
			law: "GDPR",
			article: "Articles 35-36",
			title: "Data Protection Impact Assessment (DPIA)",
			summary:
				"A DPIA must be carried out before processing that is likely to result in a high risk to individuals. If the DPIA indicates high risk that cannot be mitigated, prior consultation with the supervisory authority is required (Article 36).",
			relevance: risk.justification,
		});
	}

	// Data transfers
	if (involvesDataTransfers(ctx)) {
		provisions.push({
			id: "gdpr-art44-49-transfers",
			law: "GDPR",
			article: "Articles 44-49",
			title: "International Data Transfers",
			summary:
				"Transfers of personal data to third countries require an adequacy decision, appropriate safeguards (SCCs, BCRs), or a derogation. Post-Schrems II, supplementary measures may be required.",
			relevance:
				"The AI system involves data transfers to third-party services or cross-border processing, requiring a valid transfer mechanism.",
		});
	}

	// GenAI-specific: training data processing
	if (isGenAiWithPersonalDataConcerns(ctx)) {
		provisions.push({
			id: "gdpr-genai-training-data",
			law: "GDPR",
			article: "Articles 5-6, 9, 14",
			title: "Legal Basis for AI Training Data Processing",
			summary:
				"Processing personal data for AI model training requires a valid legal basis. Legitimate interest (Article 6(1)(f)) is commonly relied upon but requires a balancing test. Web-scraped personal data triggers additional transparency obligations under Article 14. Special category data in training sets requires explicit consent or another Article 9(2) exception.",
			relevance:
				"This AI system uses a foundation model trained on data that may include personal data. Legal basis for training data processing must be established, and data subject rights (including erasure) must be considered.",
		});

		provisions.push({
			id: "gdpr-genai-erasure",
			law: "GDPR",
			article: "Article 17",
			title: "Right of Erasure and Trained Models",
			summary:
				"Data subjects may request erasure of their personal data. For AI models trained on personal data, this raises complex questions about whether model weights encode personal data and whether retraining is required. Controllers must assess technical feasibility of erasure requests in the context of trained models.",
			relevance:
				"This AI system uses models potentially trained on personal data, requiring a documented approach to handling erasure requests for data embedded in model weights.",
		});
	}

	// Sensitive data processing
	if (
		ctx.dataProcessed.includes("sensitive") ||
		ctx.dataProcessed.includes("biometric") ||
		ctx.dataProcessed.includes("health") ||
		ctx.dataProcessed.includes("genetic")
	) {
		provisions.push({
			id: "gdpr-art9-special-category",
			law: "GDPR",
			article: "Article 9",
			title: "Processing of Special Categories of Data",
			summary:
				"Processing of special categories (racial/ethnic origin, political opinions, religious beliefs, trade union membership, genetic data, biometric data, health data, sex life/orientation) is prohibited unless an Article 9(2) exception applies.",
			relevance:
				"This AI system processes special category data, requiring explicit consent or another specific legal basis under Article 9(2).",
		});
	}

	// Children's data
	if (ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors")) {
		provisions.push({
			id: "gdpr-art8-children",
			law: "GDPR",
			article: "Article 8",
			title: "Conditions Applicable to Child's Consent",
			summary:
				"For information society services offered directly to a child, consent is lawful from age 16 (or lower if Member State sets 13-16). Below that threshold, parental/guardian consent is required. Clear, child-friendly information must be provided.",
			relevance:
				"This AI system processes data of minors, requiring age verification and parental consent mechanisms.",
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

	// DPIA required for high-risk processing
	if (risk.level === "high") {
		artifacts.push({
			type: "dpia",
			name: "GDPR Data Protection Impact Assessment",
			required: true,
			legalBasis: "Articles 35-36",
			description:
				"A DPIA is required before processing that is likely to result in a high risk to the rights and freedoms of natural persons. Must describe processing operations, assess necessity and proportionality, assess risks, and identify mitigation measures.",
			templateId: "dpia-gdpr",
		});
	}

	// Transparency notice always required when processing personal data
	if (processesPersonalData(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "GDPR Privacy Notice / Transparency Information",
			required: true,
			legalBasis: "Articles 13-14",
			description:
				"Privacy notice informing data subjects about processing purposes, legal basis, retention periods, data subject rights, and contact details. For AI systems, must include information about the existence of automated decision-making and meaningful information about the logic involved.",
			templateId: "transparency-notice",
		});
	}

	// Model card for GenAI systems processing personal data
	if (isGenAiWithPersonalDataConcerns(ctx)) {
		artifacts.push({
			type: "model-card",
			name: "Data Processing Record for AI Training",
			required: true,
			legalBasis: "Article 30",
			description:
				"Record of processing activities specifically documenting AI model training: legal basis for training data processing, categories of personal data used, retention policy, and technical/organisational measures for data subject rights compliance.",
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

	// Legal basis assessment (always required when processing personal data)
	actions.push({
		id: "gdpr-legal-basis-assessment",
		title: "Determine and document legal basis for processing",
		description:
			"Identify and document the legal basis (Article 6) for each processing purpose in the AI system. For consent, implement mechanisms for freely given, specific, informed, and unambiguous consent. For legitimate interests, conduct and document a Legitimate Interest Assessment (LIA).",
		priority: "critical",
		legalBasis: "Articles 6-7",
		jurisdictions: ["eu-gdpr"],
		estimatedEffort: "1-2 weeks",
		deadline: null,
	});

	// Data subject rights
	actions.push({
		id: "gdpr-data-subject-rights",
		title: "Implement data subject rights mechanisms",
		description:
			"Enable data subjects to exercise their rights: access (Art 15), rectification (Art 16), erasure (Art 17), restriction (Art 18), portability (Art 20), objection (Art 21). For AI systems, consider how these rights apply to automated processing and model training data.",
		priority: "critical",
		legalBasis: "Articles 12-23",
		jurisdictions: ["eu-gdpr"],
		estimatedEffort: "3-6 weeks",
		deadline: null,
	});

	// Privacy notice
	actions.push({
		id: "gdpr-privacy-notice",
		title: "Prepare and publish privacy notice",
		description:
			"Provide transparent information to data subjects about processing purposes, legal basis, data categories, retention periods, and their rights. For AI systems, include meaningful information about the logic involved in automated decision-making and its envisaged consequences.",
		priority: "critical",
		legalBasis: "Articles 13-14",
		jurisdictions: ["eu-gdpr"],
		estimatedEffort: "1-2 weeks",
		deadline: null,
	});

	// Records of processing
	actions.push({
		id: "gdpr-records-of-processing",
		title: "Maintain records of processing activities",
		description:
			"Maintain written records of processing activities including purposes, categories of data subjects and personal data, recipients, transfers, retention periods, and technical/organisational security measures.",
		priority: "important",
		legalBasis: "Article 30",
		jurisdictions: ["eu-gdpr"],
		estimatedEffort: "1-2 weeks",
		deadline: null,
	});

	// DPIA-specific actions
	if (risk.level === "high") {
		actions.push({
			id: "gdpr-conduct-dpia",
			title: "Conduct Data Protection Impact Assessment",
			description:
				"Conduct a DPIA before processing begins. Must systematically describe processing, assess necessity and proportionality, assess risks to rights and freedoms, and identify measures to address risks. If residual risk is high, prior consultation with the supervisory authority (Article 36) is required.",
			priority: "critical",
			legalBasis: "Articles 35-36",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// Automated decision-making
	if (isAutomatedDecisionMaking(ctx)) {
		actions.push({
			id: "gdpr-art22-safeguards",
			title: "Implement Article 22 automated decision-making safeguards",
			description:
				"Implement safeguards for automated decisions with legal or similarly significant effects: (1) right to obtain human intervention, (2) right to express their point of view, (3) right to contest the decision, (4) meaningful information about the logic involved. If relying on explicit consent or contract, document the legal basis.",
			priority: "critical",
			legalBasis: "Article 22",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// Special category data
	if (
		ctx.dataProcessed.includes("sensitive") ||
		ctx.dataProcessed.includes("biometric") ||
		ctx.dataProcessed.includes("health") ||
		ctx.dataProcessed.includes("genetic")
	) {
		actions.push({
			id: "gdpr-special-category-basis",
			title: "Establish legal basis for special category data processing",
			description:
				"Identify and document a valid Article 9(2) exception for processing special category data. Common bases include explicit consent (Art 9(2)(a)) or substantial public interest (Art 9(2)(g)). Implement additional safeguards appropriate to the sensitivity of the data.",
			priority: "critical",
			legalBasis: "Article 9",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "1-2 weeks",
			deadline: null,
		});
	}

	// Children's data
	if (ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors")) {
		actions.push({
			id: "gdpr-children-consent",
			title: "Implement age verification and parental consent",
			description:
				"Implement age verification mechanisms and parental/guardian consent collection for children's data. Provide child-friendly privacy notices. Ensure age threshold complies with applicable Member State law (13-16 years depending on Member State).",
			priority: "critical",
			legalBasis: "Article 8",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// DPO appointment
	if (requiresLargeScaleProcessingDpo(ctx)) {
		actions.push({
			id: "gdpr-appoint-dpo",
			title: "Appoint a Data Protection Officer",
			description:
				"Appoint a DPO as required when core activities consist of large-scale processing of special categories of data or systematic monitoring of individuals. The DPO must be independent, have expert knowledge of data protection law, and be provided with adequate resources.",
			priority: "important",
			legalBasis: "Articles 37-39",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// Data transfers
	if (involvesDataTransfers(ctx)) {
		actions.push({
			id: "gdpr-data-transfers",
			title: "Establish valid data transfer mechanisms",
			description:
				"Implement appropriate transfer mechanisms for international data transfers: adequacy decision, Standard Contractual Clauses (SCCs), Binding Corporate Rules (BCRs), or derogations. Conduct a Transfer Impact Assessment per Schrems II requirements. Document supplementary measures where needed.",
			priority: "critical",
			legalBasis: "Articles 44-49",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// GenAI training data
	if (isGenAiWithPersonalDataConcerns(ctx)) {
		actions.push(
			{
				id: "gdpr-genai-training-legal-basis",
				title: "Establish legal basis for AI training data processing",
				description:
					"Determine and document the legal basis for personal data used in model training. If relying on legitimate interest (Art 6(1)(f)), conduct a Legitimate Interest Assessment balancing the controller's interest against data subject rights. For web-scraped data, address Article 14 transparency obligations. For user-generated content, verify consent scope covers training use.",
				priority: "critical",
				legalBasis: "Articles 5-6, 14",
				jurisdictions: ["eu-gdpr"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "gdpr-genai-erasure-policy",
				title: "Develop policy for right of erasure in trained models",
				description:
					"Document the organisation's approach to handling erasure requests (Art 17) for personal data that may be encoded in model weights. Consider whether retraining, fine-tuning with unlearning techniques, or input/output filtering is appropriate. Consult with DPA guidance on model erasure expectations.",
				priority: "important",
				legalBasis: "Article 17",
				jurisdictions: ["eu-gdpr"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	// Security measures
	actions.push({
		id: "gdpr-security-measures",
		title: "Implement appropriate technical and organisational security measures",
		description:
			"Implement security measures appropriate to the risk, including as appropriate: pseudonymisation, encryption, confidentiality/integrity/availability/resilience, ability to restore access, and regular testing of effectiveness. For AI systems, consider model security, adversarial robustness, and access controls.",
		priority: "important",
		legalBasis: "Article 32",
		jurisdictions: ["eu-gdpr"],
		estimatedEffort: "2-6 weeks",
		deadline: null,
	});

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	notes.push(
		"GDPR has been in force since 25 May 2018. All obligations apply immediately to any personal data processing.",
	);

	if (risk.level === "high") {
		notes.push(
			"A DPIA must be conducted BEFORE processing begins. Processing cannot commence until the DPIA has been completed and risks have been mitigated to an acceptable level.",
		);
		notes.push(
			"If the DPIA indicates high residual risk that cannot be mitigated, prior consultation with the supervisory authority is required under Article 36 before processing may begin.",
		);
	}

	return {
		effectiveDate: "2018-05-25",
		deadlines: [
			{
				date: "2018-05-25",
				description:
					"GDPR entered into application. All data protection obligations are in force.",
				provision: "GDPR",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── EU GDPR Jurisdiction Module ──────────────────────────────────────────

export const euGdprModule: JurisdictionModule = {
	id: "eu-gdpr",
	name: "EU General Data Protection Regulation (GDPR)",
	jurisdiction: "eu-gdpr",

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
	getMatchingDpiaTriggers,
	processesPersonalData,
	isAutomatedDecisionMaking,
	involvesDataTransfers,
	isGenAiWithPersonalDataConcerns,
	requiresLargeScaleProcessingDpo,
	DPIA_TRIGGERS,
};
