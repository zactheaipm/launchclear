import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../core/types.js";

// ─── Regulatory Triggers ─────────────────────────────────────────────────

interface RegulatoryTrigger {
	readonly id: string;
	readonly name: string;
	readonly framework: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

// LGPD Triggers
const LGPD_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "br-lgpd-personal-data",
		name: "Personal Data Processing",
		framework: "LGPD",
		matchesContext: (ctx) =>
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
					d === "genetic" ||
					d === "political",
			),
	},
	{
		id: "br-lgpd-automated-decisions",
		name: "Automated Decision-Making (Article 20)",
		framework: "LGPD Article 20",
		matchesContext: (ctx) =>
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
			(ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop"),
	},
	{
		id: "br-lgpd-sensitive-data",
		name: "Sensitive Personal Data Processing",
		framework: "LGPD Article 11",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("sensitive") ||
			ctx.dataProcessed.includes("biometric") ||
			ctx.dataProcessed.includes("health") ||
			ctx.dataProcessed.includes("genetic") ||
			ctx.dataProcessed.includes("political"),
	},
	{
		id: "br-lgpd-minors",
		name: "Children's Data Processing",
		framework: "LGPD Article 14",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors"),
	},
];

// AI Bill (PL 2338/2023) Triggers
const AI_BILL_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "br-ai-bill-high-risk",
		name: "High-Risk AI System (AI Bill)",
		framework: "AI Bill (PL 2338/2023)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
				(ctx.userPopulations.includes("consumers") ||
					ctx.userPopulations.includes("credit-applicants") ||
					ctx.userPopulations.includes("job-applicants") ||
					ctx.userPopulations.includes("patients") ||
					desc.includes("credit") ||
					desc.includes("employment") ||
					desc.includes("health") ||
					desc.includes("education") ||
					desc.includes("justice") ||
					desc.includes("public service"))
			);
		},
	},
	{
		id: "br-ai-bill-foundation-model",
		name: "Foundation Model Provider (AI Bill)",
		framework: "AI Bill (PL 2338/2023)",
		matchesContext: (ctx) =>
			ctx.productType === "foundation-model" ||
			ctx.generativeAiContext?.foundationModelSource === "self-trained",
	},
	{
		id: "br-ai-bill-genai-transparency",
		name: "GenAI Transparency (AI Bill)",
		framework: "AI Bill (PL 2338/2023)",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true || ctx.productType === "generator",
	},
	{
		id: "br-ai-bill-training-data",
		name: "Training Data Disclosure (AI Bill)",
		framework: "AI Bill (PL 2338/2023)",
		matchesContext: (ctx) =>
			(ctx.generativeAiContext?.usesFoundationModel === true ||
				ctx.generativeAiContext?.finetuningPerformed === true) &&
			ctx.trainingData.usesTrainingData,
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingLgpdTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return LGPD_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingAiBillTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return AI_BILL_TRIGGERS.filter((t) => t.matchesContext(ctx));
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
			d === "genetic" ||
			d === "political",
	);
}

function isAutomatedDecisionMaking(ctx: ProductContext): boolean {
	return (
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
		(ctx.automationLevel === "fully-automated" || ctx.automationLevel === "human-on-the-loop")
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

function isFoundationModelProvider(ctx: ProductContext): boolean {
	return (
		ctx.productType === "foundation-model" ||
		ctx.generativeAiContext?.foundationModelSource === "self-trained"
	);
}

function isFinancialServicesAi(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

// ─── Risk Classification ──────────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const lgpdTriggers = getMatchingLgpdTriggers(ctx);
	const aiBillTriggers = getMatchingAiBillTriggers(ctx);

	const allCategories = [...lgpdTriggers.map((t) => t.id), ...aiBillTriggers.map((t) => t.id)];

	// Automated decisions with legal/significant effects (LGPD Article 20)
	if (lgpdTriggers.some((t) => t.id === "br-lgpd-automated-decisions")) {
		return {
			level: "high",
			justification:
				"This AI system makes automated decisions affecting individuals in Brazil, triggering LGPD Article 20 rights (review, explanation) and AI Bill high-risk classification. Data subjects have the right to request review of automated decisions and explanation of the criteria and procedures used.",
			applicableCategories: allCategories,
			provisions: ["LGPD Article 20", "AI Bill (PL 2338/2023)"],
		};
	}

	// Foundation model provider (AI Bill)
	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-foundation-model")) {
		return {
			level: "high",
			justification:
				"This is a foundation model provider, triggering AI Bill transparency obligations including training data disclosure, model documentation, and accountability requirements for downstream uses.",
			applicableCategories: allCategories,
			provisions: ["AI Bill (PL 2338/2023)"],
		};
	}

	// Sensitive data or financial services
	if (lgpdTriggers.some((t) => t.id === "br-lgpd-sensitive-data") || isFinancialServicesAi(ctx)) {
		return {
			level: "high",
			justification:
				"This AI system processes sensitive personal data under LGPD or operates in financial services, requiring heightened data protection measures and impact assessments.",
			applicableCategories: allCategories,
			provisions: ["LGPD Article 11"],
		};
	}

	// GenAI content generation
	if (isGenAiProduct(ctx)) {
		return {
			level: "limited",
			justification:
				"This generative AI system triggers AI Bill transparency requirements for AI-generated content and training data disclosure obligations.",
			applicableCategories: aiBillTriggers.map((t) => t.id),
			provisions: ["AI Bill (PL 2338/2023)"],
		};
	}

	// Personal data processing
	if (lgpdTriggers.length > 0) {
		return {
			level: "limited",
			justification:
				"This AI system processes personal data in Brazil, triggering LGPD obligations including legal basis, data subject rights, and transparency requirements.",
			applicableCategories: lgpdTriggers.map((t) => t.id),
			provisions: ["LGPD"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific Brazilian regulatory obligations. No personal data processing, automated decisions, or GenAI concerns identified.",
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

	// LGPD core provisions
	if (processesPersonalData(ctx)) {
		provisions.push(
			{
				id: "br-lgpd-legal-basis",
				law: "LGPD",
				article: "Article 7",
				title: "Legal Basis for Processing",
				summary:
					"Processing of personal data requires one of 10 legal bases: consent, legal obligation, public policy execution, research, contract execution, exercise of rights, life/physical safety protection, health protection, legitimate interest, or credit protection. For AI systems, legitimate interest and consent are most commonly applicable.",
				relevance:
					"This AI system processes personal data, requiring a documented legal basis under LGPD Article 7.",
			},
			{
				id: "br-lgpd-data-subject-rights",
				law: "LGPD",
				article: "Article 18",
				title: "Data Subject Rights",
				summary:
					"Data subjects have rights to: confirmation of processing, access, correction, anonymisation/blocking/deletion, portability, information about sharing, revocation of consent, and opposition to processing. For AI, the right to explanation of automated decisions (Article 20) is particularly relevant.",
				relevance:
					"This AI system must enable exercise of data subject rights including explanation of automated decisions.",
			},
			{
				id: "br-anpd-ai-guidance",
				law: "ANPD AI Guidance",
				article: "ANPD Regulatory Sandbox / AI Analysis",
				title: "ANPD AI and Data Protection Guidance",
				summary:
					"The Brazilian National Data Protection Authority (ANPD) has published guidance on AI and data protection, including analysis of algorithmic decision-making, regulatory sandboxes for AI innovation, and guidance on the intersection of LGPD and AI systems. ANPD's strategic plan includes AI regulation as a priority area.",
				relevance:
					"This AI system processes personal data in Brazil and should align with ANPD guidance on AI and data protection.",
			},
		);
	}

	// LGPD Article 20 — automated decisions
	if (isAutomatedDecisionMaking(ctx)) {
		provisions.push({
			id: "br-lgpd-art20-automated",
			law: "LGPD",
			article: "Article 20",
			title: "Review of Automated Decisions",
			summary:
				"Data subjects have the right to request review of decisions made solely based on automated processing, including profiling, that affect their interests. The controller must provide clear and adequate information about the criteria and procedures used for the automated decision.",
			relevance:
				"This AI system makes automated decisions, triggering the right to human review and explanation under LGPD Article 20.",
		});
	}

	// AI Bill provisions
	const aiBillTriggers = getMatchingAiBillTriggers(ctx);

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-high-risk")) {
		provisions.push({
			id: "br-ai-bill-high-risk-obligations",
			law: "AI Bill (PL 2338/2023)",
			article: "High-Risk Classification",
			title: "High-Risk AI System Obligations (AI Bill)",
			summary:
				"NOTE: The AI Bill (PL 2338/2023) was approved by the Brazilian Senate in July 2024 and is under consideration in the Chamber of Deputies. It has NOT yet been enacted into law. Requirements below reflect the latest Senate-approved text and may change before final enactment. High-risk AI systems (those making consequential decisions in health, education, employment, credit, justice, public services) must undergo algorithmic impact assessments, implement governance measures, ensure transparency and explainability, and provide rights to affected individuals.",
			relevance:
				"This AI system makes consequential decisions in a high-risk domain under the AI Bill.",
		});
	}

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-foundation-model")) {
		provisions.push({
			id: "br-ai-bill-foundation-transparency",
			law: "AI Bill (PL 2338/2023)",
			article: "Foundation Model Provisions",
			title: "Foundation Model Provider Transparency",
			summary:
				"PENDING LEGISLATION: The AI Bill (PL 2338/2023) was approved by the Brazilian Senate in July 2024 and is under consideration in the Chamber of Deputies. It has NOT yet been enacted into law. Foundation model providers must publish information about model capabilities and limitations, training data sources and methodology, known risks and biases, and intended/prohibited uses. Providers are responsible for downstream harms from known vulnerabilities.",
			relevance: "This is a foundation model requiring provider transparency under the AI Bill.",
		});
	}

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-genai-transparency")) {
		provisions.push({
			id: "br-ai-bill-genai-transparency",
			law: "AI Bill (PL 2338/2023)",
			article: "GenAI Transparency",
			title: "AI-Generated Content Transparency",
			summary:
				"PENDING LEGISLATION: The AI Bill (PL 2338/2023) was approved by the Brazilian Senate in July 2024 and is under consideration in the Chamber of Deputies. It has NOT yet been enacted into law. AI systems that generate content must disclose that content is AI-generated. Users must be informed when they are interacting with AI. Generated content should be identifiable as AI-produced through labelling or metadata.",
			relevance:
				"This GenAI system must disclose AI-generated content under the AI Bill transparency requirements.",
		});
	}

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-training-data")) {
		provisions.push({
			id: "br-ai-bill-training-disclosure",
			law: "AI Bill (PL 2338/2023)",
			article: "Training Data Disclosure",
			title: "Training Data Disclosure Requirements",
			summary:
				"PENDING LEGISLATION: The AI Bill (PL 2338/2023) was approved by the Brazilian Senate in July 2024 and is under consideration in the Chamber of Deputies. It has NOT yet been enacted into law. AI system providers must disclose information about training data including: data sources, processing methodology, measures to ensure data quality, and compliance with LGPD for personal data used in training.",
			relevance: "This AI system uses training data requiring disclosure under the AI Bill.",
		});
	}

	// Financial services
	if (isFinancialServicesAi(ctx)) {
		provisions.push({
			id: "br-central-bank-ai",
			law: "Central Bank of Brazil (BCB)",
			article: "Resolucao BCB 403/2024, CMN Resolution 4893/2021",
			title: "BCB AI and Technology Risk Guidelines",
			summary:
				"The Brazilian Central Bank has issued resolutions on technology risk management and AI use in financial institutions. Resolucao BCB 403/2024 addresses AI-specific considerations including model governance, explainability requirements for automated credit decisions, and cybersecurity for AI systems. CMN Resolution 4893/2021 covers broader information security and technology risk management applicable to AI deployments. Financial institutions must document AI model governance and validation processes.",
			relevance:
				"This AI system operates in Brazilian financial services, triggering Central Bank guidelines on AI governance and technology risk.",
		});
	}

	// Consumer Defence Code — AI consumer protection
	if (
		(ctx.userPopulations.includes("consumers") || ctx.userPopulations.includes("general-public")) &&
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
	) {
		provisions.push({
			id: "br-cdc-consumer-protection",
			law: "Consumer Defence Code (CDC — Lei 8.078/1990)",
			article: "Articles 6, 31, 39, 43",
			title: "Consumer Defence Code — AI Consumer Protection",
			summary:
				"The Brazilian Consumer Defence Code (CDC) applies to AI systems making decisions affecting consumers. Key provisions: Article 6 (right to clear and adequate information), Article 31 (product/service information requirements), Article 39 (prohibition of abusive practices), and Article 43 (right to access and correction of consumer data). Courts have applied the CDC to AI-driven consumer decisions, establishing precedent for algorithmic transparency obligations.",
			relevance:
				"This AI system makes material decisions affecting consumers in Brazil, triggering Consumer Defence Code protections.",
		});
	}

	// LGPD international data transfer
	if (ctx.targetMarkets.length > 1 && processesPersonalData(ctx)) {
		provisions.push({
			id: "br-lgpd-international-transfer",
			law: "LGPD",
			article: "Articles 33-34",
			title: "International Data Transfer (LGPD)",
			summary:
				"LGPD restricts international transfers of personal data to countries or organisations that provide an adequate level of protection (ANPD adequacy determination), or through specific safeguards: standard contractual clauses (approved by ANPD), binding corporate rules, or specific consent. ANPD has been developing its adequacy assessment framework and standard contractual clauses. For AI systems processing data across borders, each transfer pathway must have a valid legal mechanism.",
			relevance:
				"This AI system operates across multiple markets, potentially requiring international personal data transfers subject to LGPD transfer restrictions.",
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

	// LGPD RIPD (Relatório de Impacto à Proteção de Dados Pessoais)
	if (risk.level === "high" && processesPersonalData(ctx)) {
		artifacts.push({
			type: "dpia",
			name: "LGPD Data Protection Impact Report (RIPD)",
			required: true,
			legalBasis: "LGPD Article 38",
			description:
				"Relatório de Impacto à Proteção de Dados Pessoais (RIPD) — data protection impact assessment required for high-risk processing. Must describe processing operations, protective measures, risk analysis, and methodologies. ANPD may request this at any time.",
		});
	}

	// AI Bill algorithmic impact assessment
	const aiBillTriggers = getMatchingAiBillTriggers(ctx);
	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-high-risk")) {
		artifacts.push({
			type: "algorithmic-impact",
			name: "AI Bill Algorithmic Impact Assessment",
			required: true,
			legalBasis: "AI Bill (PL 2338/2023)",
			description:
				"Algorithmic impact assessment for high-risk AI systems as required by the AI Bill. Must cover: system description and purpose, potential discriminatory impacts, risk mitigation measures, transparency mechanisms, and human oversight arrangements.",
		});
	}

	// Foundation model documentation
	if (isFoundationModelProvider(ctx)) {
		artifacts.push({
			type: "model-card",
			name: "Foundation Model Transparency Documentation",
			required: true,
			legalBasis: "AI Bill (PL 2338/2023) — Foundation Model Provisions",
			description:
				"Documentation of the foundation model covering capabilities, limitations, training data sources, methodology, known risks and biases, intended uses, and prohibited uses. Required for foundation model providers under the AI Bill.",
			templateId: "model-card",
		});
	}

	// GenAI transparency
	if (isGenAiProduct(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "AI-Generated Content Disclosure Notice",
			required: false,
			legalBasis: "AI Bill (PL 2338/2023) — GenAI Transparency",
			description:
				"Disclosure mechanism informing users that content is AI-generated. Required for public-facing GenAI systems under the AI Bill.",
			templateId: "transparency-notice",
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

	// LGPD core actions
	if (processesPersonalData(ctx)) {
		actions.push(
			{
				id: "br-lgpd-legal-basis",
				title: "Determine and document legal basis for processing",
				description:
					"Identify and document the legal basis (LGPD Article 7) for each processing purpose. For consent, implement clear and prominent consent mechanisms. For legitimate interest, document the balancing assessment.",
				priority: "critical",
				legalBasis: "LGPD Article 7",
				jurisdictions: ["brazil"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "br-lgpd-data-subject-rights",
				title: "Implement data subject rights mechanisms",
				description:
					"Enable data subjects to exercise their LGPD rights: confirmation of processing, access, correction, anonymisation/blocking/deletion, portability, information about sharing, consent revocation, and right to oppose processing.",
				priority: "critical",
				legalBasis: "LGPD Article 18",
				jurisdictions: ["brazil"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
		);
	}

	// LGPD Article 20 — automated decisions
	if (isAutomatedDecisionMaking(ctx)) {
		actions.push({
			id: "br-lgpd-art20-review",
			title: "Implement automated decision review mechanism",
			description:
				"Implement a mechanism for data subjects to request human review of automated decisions. Prepare clear and adequate explanations of the criteria and procedures used for automated decision-making. The explanation must be meaningful — not just 'the algorithm decided'.",
			priority: "critical",
			legalBasis: "LGPD Article 20",
			jurisdictions: ["brazil"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	// LGPD impact assessment
	if (risk.level === "high" && processesPersonalData(ctx)) {
		actions.push({
			id: "br-lgpd-ripd",
			title: "Conduct LGPD Data Protection Impact Report (RIPD)",
			description:
				"Conduct a Relatório de Impacto à Proteção de Dados Pessoais (RIPD) covering: description of processing operations and purposes, data categories processed, protective measures, risk analysis and mitigation, and compliance with LGPD principles. ANPD may request this at any time.",
			priority: "critical",
			legalBasis: "LGPD Article 38",
			jurisdictions: ["brazil"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// AI Bill actions
	const aiBillTriggers = getMatchingAiBillTriggers(ctx);

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-high-risk")) {
		actions.push({
			id: "br-ai-bill-impact-assessment",
			title: "Conduct AI Bill algorithmic impact assessment",
			description:
				"Conduct an algorithmic impact assessment for this high-risk AI system covering: system purpose and functionality, potential for discriminatory impacts across protected groups, risk mitigation measures, transparency and explainability mechanisms, human oversight arrangements, and ongoing monitoring plan.",
			priority: "important",
			legalBasis: "AI Bill (PL 2338/2023)",
			jurisdictions: ["brazil"],
			estimatedEffort: "4-8 weeks",
			deadline: null,
		});
	}

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-foundation-model")) {
		actions.push({
			id: "br-ai-bill-foundation-transparency",
			title: "Publish foundation model transparency documentation",
			description:
				"Publish comprehensive documentation of the foundation model: capabilities, limitations, training data sources and methodology, known risks and biases, intended uses, and prohibited uses. Maintain updated documentation as the model evolves.",
			priority: "important",
			legalBasis: "AI Bill (PL 2338/2023) — Foundation Model Provisions",
			jurisdictions: ["brazil"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-genai-transparency")) {
		actions.push({
			id: "br-ai-bill-genai-disclosure",
			title: "Implement AI-generated content disclosure",
			description:
				"Implement mechanisms to disclose that content is AI-generated. Inform users when they are interacting with AI. Ensure generated content is identifiable as AI-produced through labelling, metadata, or other mechanisms.",
			priority: "important",
			legalBasis: "AI Bill (PL 2338/2023) — GenAI Transparency",
			jurisdictions: ["brazil"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	if (aiBillTriggers.some((t) => t.id === "br-ai-bill-training-data")) {
		actions.push({
			id: "br-ai-bill-training-disclosure",
			title: "Disclose training data information",
			description:
				"Document and disclose training data sources, processing methodology, data quality measures, and LGPD compliance for any personal data used in training. Ensure copyright and intellectual property compliance for training datasets.",
			priority: "important",
			legalBasis: "AI Bill (PL 2338/2023) — Training Data Disclosure",
			jurisdictions: ["brazil"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// Financial services
	if (isFinancialServicesAi(ctx)) {
		actions.push({
			id: "br-financial-ai-governance",
			title: "Implement financial AI model governance",
			description:
				"Implement AI model governance aligned with Central Bank guidelines: document model methodology, conduct validation, implement explainability for credit decisions, and ensure consumer protection compliance. Automated credit decisions must provide meaningful explanations to applicants.",
			priority: "important",
			legalBasis: "Central Bank Guidelines, LGPD Article 20",
			jurisdictions: ["brazil"],
			estimatedEffort: "4-8 weeks",
			deadline: null,
		});
	}

	// Consumer Defence Code — AI consumer protection
	if (
		(ctx.userPopulations.includes("consumers") || ctx.userPopulations.includes("general-public")) &&
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
	) {
		actions.push({
			id: "br-cdc-transparency",
			title: "Ensure Consumer Defence Code compliance for AI decisions",
			description:
				"Ensure AI-driven consumer decisions comply with CDC: provide clear information about AI involvement in decision-making (Article 31), avoid abusive or discriminatory automated practices (Article 39), and enable consumers to access and correct data used in AI decisions (Article 43). Brazilian consumer protection law has been actively enforced in the context of automated decisions.",
			priority: "important",
			legalBasis: "Consumer Defence Code (Lei 8.078/1990)",
			jurisdictions: ["brazil"],
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
		"LGPD has been in force since September 2020 with ANPD enforcement since August 2021. All personal data processing obligations apply immediately.",
	);

	if (risk.level === "high") {
		notes.push(
			"High-risk processing requires a RIPD (data protection impact report) that ANPD may request at any time. Automated decisions triggering Article 20 must have review mechanisms in place before deployment.",
		);
	}

	notes.push(
		"The AI Bill (PL 2338/2023) was approved by the Brazilian Senate in July 2024 and is under consideration in the Chamber of Deputies. While not yet enacted, it signals the regulatory direction and early compliance is recommended. Expected enactment: 2025-2026.",
	);

	return {
		effectiveDate: "2020-09-18",
		deadlines: [
			{
				date: "2020-09-18",
				description:
					"LGPD entered into force. All personal data processing obligations apply including consent, data subject rights, and automated decision review.",
				provision: "LGPD",
				isMandatory: true,
			},
			{
				date: "2021-08-01",
				description:
					"ANPD enforcement begins. Administrative sanctions including fines up to 2% of revenue (capped at R$50 million per infraction) became enforceable.",
				provision: "LGPD Article 52",
				isMandatory: true,
			},
			{
				date: "2026-06-30",
				description:
					"AI Bill (PL 2338/2023) expected enactment. Foundation model transparency, high-risk AI impact assessments, and GenAI disclosure obligations expected to take effect.",
				provision: "AI Bill (PL 2338/2023)",
				isMandatory: false,
			},
		],
		notes,
	};
}

// ─── Brazil Jurisdiction Module ───────────────────────────────────────────

export const brazilModule: JurisdictionModule = {
	id: "brazil",
	name: "Brazil AI Regulations (LGPD, AI Bill PL 2338/2023)",
	jurisdiction: "brazil",

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
	getMatchingLgpdTriggers,
	getMatchingAiBillTriggers,
	processesPersonalData,
	isAutomatedDecisionMaking,
	isGenAiProduct,
	isFoundationModelProvider,
	isFinancialServicesAi,
	LGPD_TRIGGERS,
	AI_BILL_TRIGGERS,
};
