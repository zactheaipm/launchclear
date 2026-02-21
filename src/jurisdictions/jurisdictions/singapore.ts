import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../core/types.js";

// ─── Framework Triggers ──────────────────────────────────────────────────

interface FrameworkTrigger {
	readonly id: string;
	readonly name: string;
	readonly framework: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

// PDPC AI Governance
const PDPC_TRIGGERS: readonly FrameworkTrigger[] = [
	{
		id: "sg-pdpc-personal-data",
		name: "Personal Data Processing (PDPA)",
		framework: "Personal Data Protection Act (PDPA)",
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
					d === "minor",
			),
	},
	{
		id: "sg-pdpc-automated-decisions",
		name: "Automated Decision-Making (PDPA)",
		framework: "PDPA / Model AI Governance Framework",
		matchesContext: (ctx) =>
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
			ctx.automationLevel === "fully-automated",
	},
];

// IMDA GenAI Guidelines
const IMDA_GENAI_TRIGGERS: readonly FrameworkTrigger[] = [
	{
		id: "sg-imda-genai-foundation",
		name: "Foundation Model Usage (IMDA GenAI)",
		framework: "IMDA GenAI Governance Framework",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.usesFoundationModel === true ||
			ctx.productType === "foundation-model",
	},
	{
		id: "sg-imda-genai-content",
		name: "AI Content Generation (IMDA GenAI)",
		framework: "IMDA GenAI Governance Framework",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true || ctx.productType === "generator",
	},
	{
		id: "sg-imda-genai-deepfake",
		name: "Synthetic Media Generation (IMDA GenAI)",
		framework: "IMDA GenAI Governance Framework",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.canGenerateDeepfakes === true ||
			ctx.generativeAiContext?.canGenerateSyntheticVoice === true,
	},
];

// IMDA Agentic AI Framework (Jan 2026)
const IMDA_AGENTIC_TRIGGERS: readonly FrameworkTrigger[] = [
	{
		id: "sg-imda-agentic-basic",
		name: "Agentic AI System (IMDA Agentic Framework)",
		framework: "IMDA Model AI Governance Framework for Agentic AI",
		matchesContext: (ctx) => ctx.agenticAiContext?.isAgentic === true,
	},
	{
		id: "sg-imda-agentic-broad",
		name: "Broad Autonomy Agentic AI",
		framework: "IMDA Model AI Governance Framework for Agentic AI",
		matchesContext: (ctx) => ctx.agenticAiContext?.autonomyLevel === "broad",
	},
	{
		id: "sg-imda-agentic-financial",
		name: "Agentic AI with Financial Transactions",
		framework: "IMDA Model AI Governance Framework for Agentic AI",
		matchesContext: (ctx) => ctx.agenticAiContext?.canMakeFinancialTransactions === true,
	},
	{
		id: "sg-imda-agentic-multi-agent",
		name: "Multi-Agent AI System",
		framework: "IMDA Model AI Governance Framework for Agentic AI",
		matchesContext: (ctx) => ctx.agenticAiContext?.isMultiAgent === true,
	},
];

// MAS AI Risk Management
const MAS_TRIGGERS: readonly FrameworkTrigger[] = [
	{
		id: "sg-mas-financial-ai",
		name: "AI in Financial Services (MAS)",
		framework: "MAS Guidelines on AI Risk Management for FIs",
		matchesContext: (ctx) => ctx.sectorContext?.sector === "financial-services",
	},
	{
		id: "sg-mas-credit-scoring",
		name: "AI Credit Scoring (MAS)",
		framework: "MAS Guidelines on AI Risk Management for FIs",
		matchesContext: (ctx) => ctx.sectorContext?.financialServices?.involvesCredit === true,
	},
	{
		id: "sg-mas-insurance",
		name: "AI Insurance Pricing (MAS)",
		framework: "MAS Guidelines on AI Risk Management for FIs",
		matchesContext: (ctx) =>
			ctx.sectorContext?.financialServices?.involvesInsurancePricing === true,
	},
	{
		id: "sg-mas-trading",
		name: "AI Trading (MAS)",
		framework: "MAS Guidelines on AI Risk Management for FIs",
		matchesContext: (ctx) => ctx.sectorContext?.financialServices?.involvesTrading === true,
	},
	{
		id: "sg-mas-aml-kyc",
		name: "AI AML/KYC (MAS)",
		framework: "MAS Guidelines on AI Risk Management for FIs",
		matchesContext: (ctx) => ctx.sectorContext?.financialServices?.involvesAmlKyc === true,
	},
	{
		id: "sg-mas-trm",
		name: "Technology Risk Management (MAS TRM)",
		framework: "MAS Technology Risk Management Guidelines",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			(ctx.generativeAiContext?.usesFoundationModel === true ||
				ctx.agenticAiContext?.isAgentic === true),
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingPdpcTriggers(ctx: ProductContext): readonly FrameworkTrigger[] {
	return PDPC_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingGenAiTriggers(ctx: ProductContext): readonly FrameworkTrigger[] {
	return IMDA_GENAI_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingAgenticTriggers(ctx: ProductContext): readonly FrameworkTrigger[] {
	return IMDA_AGENTIC_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingMasTriggers(ctx: ProductContext): readonly FrameworkTrigger[] {
	return MAS_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function isGenAiProduct(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model"
	);
}

function isAgenticAi(ctx: ProductContext): boolean {
	return ctx.agenticAiContext?.isAgentic === true;
}

function isFinancialServicesAi(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

// ─── Risk Classification ──────────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const masTriggers = getMatchingMasTriggers(ctx);
	const agenticTriggers = getMatchingAgenticTriggers(ctx);
	const genAiTriggers = getMatchingGenAiTriggers(ctx);
	const pdpcTriggers = getMatchingPdpcTriggers(ctx);

	const allCategories = [
		...masTriggers.map((t) => t.id),
		...agenticTriggers.map((t) => t.id),
		...genAiTriggers.map((t) => t.id),
		...pdpcTriggers.map((t) => t.id),
	];

	// MAS: financial services AI — highest regulatory tier
	if (masTriggers.length > 0) {
		return {
			level: "high",
			justification: `This AI system operates in financial services in Singapore, triggering MAS Guidelines on AI Risk Management for Financial Institutions: ${masTriggers.map((t) => t.name).join("; ")}. Board/senior management oversight, materiality assessment, and full lifecycle controls are required.`,
			applicableCategories: allCategories,
			provisions: ["MAS AI Risk Management Guidelines", "PDPA"],
		};
	}

	// Agentic AI with broad autonomy or financial transactions
	if (
		agenticTriggers.some(
			(t) => t.id === "sg-imda-agentic-broad" || t.id === "sg-imda-agentic-financial",
		)
	) {
		return {
			level: "high",
			justification:
				"This agentic AI system has broad autonomy or can make financial transactions, triggering heightened requirements under the IMDA Model AI Governance Framework for Agentic AI across all four dimensions: risk bounding, human accountability, technical controls, and end-user responsibility.",
			applicableCategories: allCategories,
			provisions: ["IMDA Agentic AI Framework", "PDPA"],
		};
	}

	// Foundation model provider
	if (ctx.productType === "foundation-model") {
		return {
			level: "high",
			justification:
				"This is a foundation model provider, triggering comprehensive IMDA GenAI governance requirements including testing and evaluation, incident reporting, content provenance, and disclosure obligations.",
			applicableCategories: allCategories,
			provisions: ["IMDA GenAI Governance Framework", "PDPA"],
		};
	}

	// GenAI or basic agentic AI
	if (genAiTriggers.length > 0 || agenticTriggers.length > 0) {
		return {
			level: "limited",
			justification: `This AI system triggers Singapore governance frameworks: ${[...genAiTriggers, ...agenticTriggers].map((t) => t.name).join("; ")}. Proportionate governance measures apply.`,
			applicableCategories: allCategories,
			provisions: [
				...(genAiTriggers.length > 0 ? ["IMDA GenAI Governance Framework"] : []),
				...(agenticTriggers.length > 0 ? ["IMDA Agentic AI Framework"] : []),
				...(pdpcTriggers.length > 0 ? ["PDPA"] : []),
			],
		};
	}

	// Personal data processing
	if (pdpcTriggers.length > 0) {
		return {
			level: "limited",
			justification:
				"This AI system processes personal data in Singapore, triggering PDPA obligations and Model AI Governance Framework alignment.",
			applicableCategories: pdpcTriggers.map((t) => t.id),
			provisions: ["PDPA", "Model AI Governance Framework"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific Singapore regulatory obligations. No personal data processing, financial services, GenAI, or agentic AI concerns identified.",
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

	// PDPC / PDPA
	if (getMatchingPdpcTriggers(ctx).length > 0) {
		provisions.push(
			{
				id: "sg-pdpa-consent",
				law: "PDPA",
				article: "Part IV (Consent)",
				title: "Consent for Personal Data Collection and Use",
				summary:
					"Organisations must obtain consent before collecting, using, or disclosing personal data. Consent must be informed — individuals must be told the purposes of data collection. For AI systems, this includes data used for training, inference, and profiling.",
				relevance:
					"This AI system processes personal data in Singapore, requiring informed consent under PDPA.",
			},
			{
				id: "sg-pdpc-advisory-ai",
				law: "PDPC Advisory Guidelines on AI and Personal Data",
				article: "Advisory Guidelines (2024 Revision)",
				title: "PDPC Advisory Guidelines on Use of Personal Data in AI",
				summary:
					"PDPC advisory guidelines (revised 2024) provide guidance on responsible use of personal data for AI systems, including data collection, use, disclosure, and cross-border transfer considerations specific to AI training and deployment. Includes guidance on informed consent for AI processing, purpose limitation in AI contexts, and model-level data protection.",
				relevance:
					"This AI system processes personal data in Singapore. PDPC advisory guidelines on AI and personal data apply.",
			},
			{
				id: "sg-cbpr-asean-transfer",
				law: "PDPA / APEC CBPR / ASEAN Data Management Framework",
				article: "PDPA Transfer Provisions, APEC CBPR, ASEAN DMF",
				title: "ASEAN/APEC Cross-Border Data Transfer Frameworks",
				summary:
					"Singapore participates in the APEC Cross-Border Privacy Rules (CBPR) system and the ASEAN Data Management Framework, both of which provide recognized mechanisms for cross-border personal data transfers. Organizations transferring data across ASEAN or APEC economies may leverage CBPR certification or ASEAN DMF alignment as a transfer basis under PDPA, complementing contractual and binding corporate rules approaches.",
				relevance:
					"This AI system processes personal data in Singapore. Cross-border transfer mechanisms including CBPR and ASEAN DMF should be evaluated if data flows across borders.",
			},
		);
	}

	// IMDA GenAI
	const genAiTriggers = getMatchingGenAiTriggers(ctx);
	if (genAiTriggers.length > 0) {
		provisions.push(
			{
				id: "sg-imda-genai-testing",
				law: "IMDA GenAI Governance Framework",
				article: "Testing and Evaluation",
				title: "GenAI Testing and Evaluation Requirements",
				summary:
					"GenAI systems must undergo testing and evaluation covering accuracy, robustness, safety, and security. Testing should be proportionate to the risk level of the application and include red-teaming for harmful outputs.",
				relevance:
					"This GenAI system requires testing and evaluation per IMDA governance guidelines.",
			},
			{
				id: "sg-imda-genai-incident",
				law: "IMDA GenAI Governance Framework",
				article: "Incident Reporting",
				title: "GenAI Incident Reporting",
				summary:
					"Organisations deploying GenAI should establish incident reporting mechanisms for tracking and addressing harms from AI-generated content, model failures, or security breaches.",
				relevance:
					"This GenAI system should have incident reporting mechanisms per IMDA guidelines.",
			},
			{
				id: "sg-imda-genai-provenance",
				law: "IMDA GenAI Governance Framework",
				article: "Content Provenance",
				title: "AI Content Provenance and Disclosure",
				summary:
					"GenAI providers should implement content provenance mechanisms (watermarking, metadata, labelling) to enable identification of AI-generated content. Users should be informed when they are interacting with AI-generated content.",
				relevance: "This GenAI system should implement content provenance per IMDA guidelines.",
			},
		);

		if (
			ctx.generativeAiContext?.outputModalities.includes("text") &&
			(ctx.userPopulations.includes("consumers") || ctx.userPopulations.includes("general-public"))
		) {
			provisions.push({
				id: "sg-dnc-registry",
				law: "Do Not Call Registry (PDPA Part IX)",
				article: "PDPA Part IX",
				title: "DNC Registry for AI-Generated Communications",
				summary:
					"If AI-generated text communications are sent to consumers in Singapore, the Do Not Call Registry under PDPA Part IX may apply. Organisations must check the DNC Registry before sending marketing messages, including those generated by AI systems.",
				relevance:
					"This AI system generates text content for consumers, potentially triggering DNC Registry obligations.",
			});
		}
	}

	// IMDA Agentic AI Framework
	const agenticTriggers = getMatchingAgenticTriggers(ctx);
	if (agenticTriggers.length > 0) {
		provisions.push(
			{
				id: "sg-imda-agentic-risk-bounding",
				law: "IMDA Agentic AI Framework",
				article: "Dimension 1: Assess and Bound Risks",
				title: "Agentic AI Risk Bounding",
				summary:
					"Assess domain sensitivity and bound AI agent risks upfront: limit autonomy scope, restrict tool and data access, implement threat modelling for agentic interactions, and define clear boundaries for agent actions.",
				relevance:
					"This agentic AI system must have its risks assessed and bounded per IMDA agentic framework Dimension 1.",
			},
			{
				id: "sg-imda-agentic-human-accountability",
				law: "IMDA Agentic AI Framework",
				article: "Dimension 2: Human Accountability",
				title: "Agentic AI Human Accountability",
				summary:
					"Make humans meaningfully accountable for agentic AI: define approval checkpoints for consequential actions, allocate responsibility across development and deployment teams, combat automation bias through training and audits, establish real-time escalation for unexpected behaviour.",
				relevance:
					"This agentic AI system requires human accountability mechanisms per IMDA framework Dimension 2.",
			},
			{
				id: "sg-imda-agentic-technical-controls",
				law: "IMDA Agentic AI Framework",
				article: "Dimension 3: Technical Controls",
				title: "Agentic AI Technical Controls",
				summary:
					"Implement technical controls: comprehensive agent action logging, secure development environments, pre-deployment testing for accuracy and edge cases, multi-agent system validation (if applicable), gradual rollout strategy, continuous monitoring with alert thresholds and failsafe mechanisms.",
				relevance:
					"This agentic AI system must implement technical controls per IMDA framework Dimension 3.",
			},
			{
				id: "sg-imda-agentic-end-user",
				law: "IMDA Agentic AI Framework",
				article: "Dimension 4: End-User Responsibility",
				title: "Agentic AI End-User Responsibility",
				summary:
					"Enable end-user responsibility: notify users of agentic AI use and its limitations, provide training for users integrating agentic AI, establish human escalation pathways for issues or concerns.",
				relevance:
					"This agentic AI system must support end-user responsibility per IMDA framework Dimension 4.",
			},
		);
	}

	// MAS AI Risk Management
	const masTriggers = getMatchingMasTriggers(ctx);
	if (masTriggers.length > 0) {
		provisions.push(
			{
				id: "sg-mas-governance",
				law: "MAS AI Risk Management Guidelines",
				article: "Governance and Oversight",
				title: "Board/Senior Management AI Oversight",
				summary:
					"The board and senior management of financial institutions must establish governance structures for AI risk management, including clear accountability for AI-related decisions, risk appetite statements covering AI, and allocation of resources for responsible AI use.",
				relevance:
					"This AI system operates at a Singapore financial institution, requiring board-level AI governance oversight.",
			},
			{
				id: "sg-mas-materiality",
				law: "MAS AI Risk Management Guidelines",
				article: "Materiality Assessment",
				title: "AI Risk Materiality Assessment",
				summary:
					"Financial institutions must assess the risk materiality of each AI use case, considering the potential impact on customers, the institution, and the financial system. Higher materiality triggers more stringent lifecycle controls.",
				relevance: "This AI use case must undergo a materiality assessment per MAS guidelines.",
			},
			{
				id: "sg-mas-lifecycle",
				law: "MAS AI Risk Management Guidelines",
				article: "Lifecycle Controls",
				title: "AI Lifecycle Controls",
				summary:
					"Lifecycle controls encompassing: data management (quality, lineage, privacy), transparency and explainability (appropriate to use case materiality), fairness and bias mitigation, human oversight, third-party AI management, testing and evaluation, documentation, pre-deployment review, post-deployment monitoring, and change management.",
				relevance:
					"This AI system requires comprehensive lifecycle controls per MAS guidelines proportionate to its materiality level.",
			},
		);

		if (masTriggers.some((t) => t.id === "sg-mas-credit-scoring")) {
			provisions.push({
				id: "sg-mas-credit-fairness",
				law: "MAS AI Risk Management Guidelines",
				article: "Fairness in Credit Decisions",
				title: "Fair AI Credit Scoring",
				summary:
					"AI credit scoring models must be tested for fairness and bias across demographic groups. Adverse credit decisions must be explainable. Model validation and ongoing monitoring are required with heightened scrutiny for credit scoring AI.",
				relevance:
					"This AI credit scoring system requires fairness testing and explainability per MAS guidelines.",
			});
		}
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

	// PDPA data protection assessment
	if (getMatchingPdpcTriggers(ctx).some((t) => t.id === "sg-pdpc-automated-decisions")) {
		artifacts.push({
			type: "dpia",
			name: "PDPA Data Protection Impact Assessment",
			required: true,
			legalBasis: "PDPA Part IV / PDPC AI Governance Framework",
			description:
				"Data protection assessment for AI systems making automated decisions with significant impact on individuals. Must address data collection consent, purpose limitation, accuracy, and individual rights.",
		});
	}

	// GenAI governance documentation
	if (isGenAiProduct(ctx)) {
		artifacts.push({
			type: "risk-assessment",
			name: "IMDA GenAI Governance Assessment",
			required: false,
			legalBasis: "IMDA GenAI Governance Framework",
			description:
				"Assessment of GenAI system governance covering testing and evaluation results, incident reporting mechanisms, content provenance approach, and disclosure practices. Proportionate to risk level.",
		});
	}

	// Agentic AI documentation
	if (isAgenticAi(ctx)) {
		artifacts.push({
			type: "risk-assessment",
			name: "IMDA Agentic AI Governance Assessment",
			required: true,
			legalBasis: "IMDA Model AI Governance Framework for Agentic AI",
			description:
				"Comprehensive assessment across all four dimensions of the IMDA Agentic AI Framework: (1) risk bounding analysis, (2) human accountability mapping, (3) technical controls inventory, (4) end-user responsibility mechanisms. Must document agent scope, tool access, action boundaries, checkpoint definitions, and failsafe mechanisms.",
		});
	}

	// MAS documentation
	const masTriggers = getMatchingMasTriggers(ctx);
	if (masTriggers.length > 0) {
		artifacts.push(
			{
				type: "risk-assessment",
				name: "MAS AI Risk Materiality Assessment",
				required: true,
				legalBasis: "MAS AI Risk Management Guidelines",
				description:
					"Assessment of the AI use case's risk materiality, including potential impact on customers, the institution, and the financial system. Determines the level of lifecycle controls required.",
			},
			{
				type: "model-card",
				name: "MAS AI Model Documentation",
				required: true,
				legalBasis: "MAS AI Risk Management Guidelines — Documentation",
				description:
					"Comprehensive model documentation covering model purpose, methodology, data inputs, performance metrics, validation results, limitations, and monitoring plan. Required for all material AI use cases at financial institutions.",
				templateId: "model-card",
			},
		);

		if (masTriggers.some((t) => t.id === "sg-mas-credit-scoring")) {
			artifacts.push({
				type: "bias-audit",
				name: "MAS AI Fairness Assessment — Credit Scoring",
				required: true,
				legalBasis: "MAS AI Risk Management Guidelines — Fairness",
				description:
					"Fairness assessment of AI credit scoring model testing for bias across demographic groups. Must include testing methodology, results, remediation measures, and ongoing monitoring plan.",
			});
		}
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

	// PDPA actions (Part-level obligations)
	if (getMatchingPdpcTriggers(ctx).length > 0) {
		actions.push(
			{
				id: "sg-pdpa-consent-part-iii",
				title: "Implement PDPA Part III consent obligations",
				description:
					"Under PDPA Sections 13-17, obtain valid consent for collection, use, and disclosure of personal data. The 2020 amendments introduced deemed consent by notification (Section 15A) and legitimate interest exceptions (Section 17A), which may apply to AI processing. Evaluate whether deemed consent or legitimate interest can be relied upon.",
				jurisdictions: ["singapore"],
				legalBasis: "PDPA Part III (Sections 13-17), 2020 Amendments (Sections 15A, 17A)",
				priority: "critical",
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "sg-pdpa-access-correction-part-iv",
				title: "Implement PDPA Part IV access and correction obligations",
				description:
					"Under PDPA Sections 21-22, provide individuals with access to their personal data and the ability to request corrections. For AI systems, this includes access to data used in automated decisions.",
				jurisdictions: ["singapore"],
				legalBasis: "PDPA Part IV (Sections 21-22)",
				priority: "important",
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "sg-pdpa-care-part-v",
				title: "Implement PDPA Part V care of personal data obligations",
				description:
					"Under PDPA Sections 24-26, ensure accuracy of personal data (Section 24 — particularly important for AI systems making decisions based on personal data), implement reasonable security measures (Section 24), and establish retention limitation policies (Section 25).",
				jurisdictions: ["singapore"],
				legalBasis: "PDPA Part V (Sections 24-26)",
				priority: "important",
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "sg-pdpa-breach-notification-part-via",
				title: "Implement PDPA Part VIA data breach notification procedures",
				description:
					"Under PDPA Sections 26A-26E, notify PDPC and affected individuals within 3 calendar days of determining a notifiable data breach has occurred. For AI systems, this includes breaches involving training data, model inversion attacks, or unauthorized access to personal data processed by the AI.",
				jurisdictions: ["singapore"],
				legalBasis: "PDPA Part VIA (Sections 26A-26E)",
				priority: "critical",
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
		);
	}

	// ASEAN/APEC cross-border data transfer mechanisms
	if (getMatchingPdpcTriggers(ctx).length > 0) {
		actions.push({
			id: "sg-cross-border-cbpr",
			title: "Evaluate ASEAN/APEC cross-border data transfer mechanisms",
			description:
				"Singapore participates in the APEC Cross-Border Privacy Rules (CBPR) system and the ASEAN Data Management Framework. For AI products transferring data across ASEAN or APEC markets, these mechanisms may provide a recognized transfer basis under the PDPA. Evaluate whether CBPR certification or ASEAN framework alignment simplifies cross-border compliance.",
			jurisdictions: ["singapore"],
			legalBasis: "PDPA Transfer provisions, APEC CBPR, ASEAN DMF",
			priority: "recommended",
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// IMDA GenAI actions
	if (isGenAiProduct(ctx)) {
		actions.push(
			{
				id: "sg-imda-genai-testing",
				title: "Conduct GenAI testing and evaluation",
				description:
					"Conduct testing and evaluation of the GenAI system covering accuracy, robustness, safety, and security. Include red-teaming for harmful outputs. Testing should be proportionate to the risk level and cover both pre-deployment and ongoing evaluation.",
				priority: "important",
				legalBasis: "IMDA GenAI Governance Framework",
				jurisdictions: ["singapore"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "sg-imda-genai-incident-reporting",
				title: "Establish GenAI incident reporting mechanism",
				description:
					"Set up incident reporting mechanisms for tracking and addressing harms from AI-generated content, model failures, or security breaches. Define escalation procedures and response timelines.",
				priority: "important",
				legalBasis: "IMDA GenAI Governance Framework",
				jurisdictions: ["singapore"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "sg-imda-genai-provenance",
				title: "Implement AI content provenance mechanisms",
				description:
					"Implement content provenance mechanisms (watermarking, metadata, labelling) to enable identification of AI-generated content. Ensure users are informed when interacting with AI-generated content. Consider C2PA or equivalent standards.",
				priority: "important",
				legalBasis: "IMDA GenAI Governance Framework",
				jurisdictions: ["singapore"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
		);

		actions.push({
			id: "sg-imda-ai-verify",
			title: "Consider AI Verify toolkit for testing and evaluation",
			description:
				"IMDA's AI Verify toolkit provides an open-source testing framework for AI governance. It includes testable criteria mapped to AI governance principles (transparency, fairness, safety, accountability). Consider using AI Verify or equivalent to structure testing and evaluation, particularly for GenAI systems requiring proportionate governance per IMDA guidelines.",
			priority: "recommended",
			legalBasis: "IMDA AI Verify / Model AI Governance Framework",
			jurisdictions: ["singapore"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// IMDA Agentic AI actions (four dimensions)
	if (isAgenticAi(ctx)) {
		// Dimension 1: Risk Bounding
		actions.push({
			id: "sg-imda-agentic-risk-bound",
			title: "Assess and bound agentic AI risks (IMDA Dimension 1)",
			description:
				"Assess domain sensitivity and bound agentic AI risks: define clear boundaries for agent autonomy scope, restrict tool access to minimum necessary, limit data access to required scope, conduct threat modelling for agentic interactions, and document risk bounding decisions.",
			priority: "critical",
			legalBasis: "IMDA Agentic AI Framework — Dimension 1",
			jurisdictions: ["singapore"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});

		// Dimension 2: Human Accountability
		actions.push({
			id: "sg-imda-agentic-human-accountability",
			title: "Establish human accountability mechanisms (IMDA Dimension 2)",
			description:
				"Define approval checkpoints for consequential agentic actions. Allocate responsibility across development and deployment teams. Combat automation bias through training and audits. Establish real-time escalation procedures for unexpected agent behaviour.",
			priority: "critical",
			legalBasis: "IMDA Agentic AI Framework — Dimension 2",
			jurisdictions: ["singapore"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});

		// Dimension 3: Technical Controls
		actions.push({
			id: "sg-imda-agentic-technical-controls",
			title: "Implement agentic AI technical controls (IMDA Dimension 3)",
			description:
				"Implement comprehensive agent action logging, secure development environments, pre-deployment testing for accuracy and edge cases. For multi-agent systems: validate agent interactions. Implement gradual rollout strategy, continuous monitoring with alert thresholds, and failsafe mechanisms (kill switches, rollback capabilities).",
			priority: "critical",
			legalBasis: "IMDA Agentic AI Framework — Dimension 3",
			jurisdictions: ["singapore"],
			estimatedEffort: "4-8 weeks",
			deadline: null,
		});

		// Dimension 4: End-User Responsibility
		actions.push({
			id: "sg-imda-agentic-end-user",
			title: "Enable end-user responsibility (IMDA Dimension 4)",
			description:
				"Notify users of agentic AI use and its limitations. Provide training materials for users integrating agentic AI into their workflows. Establish human escalation pathways for issues or concerns. Document user-facing guidance.",
			priority: "important",
			legalBasis: "IMDA Agentic AI Framework — Dimension 4",
			jurisdictions: ["singapore"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});

		if (ctx.agenticAiContext?.autonomyLevel === "broad") {
			actions.push({
				id: "sg-imda-agentic-graduated-deployment",
				title: "Implement graduated deployment strategy for agentic AI",
				description:
					"Deploy agentic AI system in phases with increasing autonomy: (1) shadow mode — agent suggests but human acts, (2) supervised mode — agent acts with human approval, (3) autonomous mode — agent acts independently within bounded scope. Each phase should have clear success criteria and rollback triggers. Aligns with IMDA Agentic AI Framework Dimension 3 (technical controls).",
				priority: "important",
				legalBasis: "IMDA Agentic AI Framework — Dimension 3",
				jurisdictions: ["singapore"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			});
		}
	}

	// MAS AI Risk Management actions
	const masTriggers = getMatchingMasTriggers(ctx);
	if (masTriggers.length > 0) {
		actions.push(
			{
				id: "sg-mas-governance-structure",
				title: "Establish board/senior management AI governance",
				description:
					"Establish governance structures for AI risk management: board/senior management oversight and accountability, AI risk appetite statement, resource allocation for responsible AI, and clear roles and responsibilities for AI-related decisions.",
				priority: "critical",
				legalBasis: "MAS AI Risk Management Guidelines — Governance",
				jurisdictions: ["singapore"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "sg-mas-materiality-assessment",
				title: "Conduct AI risk materiality assessment",
				description:
					"Assess the risk materiality of this AI use case considering: impact on customers if the AI produces incorrect/unfair outcomes, impact on the institution's reputation and operations, systemic implications for the financial system. Materiality level determines the stringency of required lifecycle controls.",
				priority: "critical",
				legalBasis: "MAS AI Risk Management Guidelines — Materiality",
				jurisdictions: ["singapore"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "sg-mas-lifecycle-controls",
				title: "Implement AI lifecycle controls per MAS guidelines",
				description:
					"Implement lifecycle controls proportionate to materiality: data management (quality, lineage, privacy), transparency/explainability, fairness/bias mitigation, human oversight, third-party AI management, testing/evaluation, documentation, pre-deployment review, post-deployment monitoring, and change management.",
				priority: "critical",
				legalBasis: "MAS AI Risk Management Guidelines — Lifecycle",
				jurisdictions: ["singapore"],
				estimatedEffort: "8-16 weeks",
				deadline: null,
			},
		);

		if (masTriggers.some((t) => t.id === "sg-mas-credit-scoring")) {
			actions.push({
				id: "sg-mas-credit-fairness-testing",
				title: "Conduct fairness testing for AI credit scoring",
				description:
					"Test AI credit scoring model for fairness and bias across demographic groups. Ensure adverse credit decisions are explainable with specific reasons. Implement ongoing monitoring for model drift and fairness degradation. Document testing methodology and results.",
				priority: "critical",
				legalBasis: "MAS AI Risk Management Guidelines — Fairness",
				jurisdictions: ["singapore"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			});
		}

		// Third-party AI management
		if (
			ctx.generativeAiContext?.foundationModelSource === "third-party-api" ||
			ctx.generativeAiContext?.foundationModelSource === "fine-tuned"
		) {
			actions.push({
				id: "sg-mas-third-party-ai",
				title: "Implement third-party AI management controls",
				description:
					"Assess and manage risks from third-party AI services: due diligence on AI providers, contractual arrangements for accountability, monitoring of third-party AI performance, and contingency plans for provider disruption or model changes.",
				priority: "important",
				legalBasis: "MAS AI Risk Management Guidelines — Third-Party AI",
				jurisdictions: ["singapore"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			});
		}

		if (masTriggers.some((t) => t.id === "sg-mas-trm")) {
			actions.push({
				id: "sg-mas-trm-compliance",
				title: "Comply with MAS Technology Risk Management Guidelines for AI",
				description:
					"Ensure AI system deployment meets MAS TRM Guidelines requirements for technology risk management in financial institutions: secure development lifecycle, access controls, data protection, system availability, and incident management. AI-specific concerns include model security, API access controls, and data pipeline integrity.",
				priority: "important",
				legalBasis: "MAS TRM Guidelines",
				jurisdictions: ["singapore"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			});
		}
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(ctx: ProductContext, risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	notes.push(
		"Singapore's AI governance approach is framework-based and proportionate. The PDPA provides the legal foundation, while IMDA and MAS frameworks provide detailed governance guidance.",
	);

	if (isAgenticAi(ctx)) {
		notes.push(
			"The IMDA Model AI Governance Framework for Agentic AI (January 2026) extends — not replaces — the existing Model AI Governance Framework. It adds four agentic-specific dimensions (risk bounding, human accountability, technical controls, end-user responsibility) on top of the base framework's governance principles.",
		);
	}

	if (isFinancialServicesAi(ctx)) {
		notes.push(
			"MAS Guidelines on AI Risk Management for Financial Institutions (consultation November 2025) are expected to become enforceable ~2026-2027. Early adoption is strongly recommended as MAS examinations are already considering AI governance practices.",
		);
	}

	if (isGenAiProduct(ctx)) {
		notes.push(
			"IMDA GenAI governance guidelines are part of a living framework that will be updated as GenAI technology evolves. Organisations should monitor IMDA announcements for updates.",
		);
	}

	return {
		effectiveDate: "2014-07-02",
		deadlines: [
			{
				date: "2014-07-02",
				description: "PDPA entered into full force. All personal data obligations apply.",
				provision: "PDPA",
				isMandatory: true,
			},
			{
				date: "2024-02-01",
				description:
					"PDPA amendments effective — Notifiable Data Breach regime updated with 3-calendar-day assessment period for data breaches likely to result in significant harm.",
				provision: "PDPA (Amended 2024)",
				isMandatory: true,
			},
			{
				date: "2020-02-01",
				description:
					"Model AI Governance Framework (Second Edition) published by PDPC/IMDA. Widely adopted industry framework.",
				provision: "Model AI Governance Framework",
				isMandatory: false,
			},
			{
				date: "2024-09-01",
				description:
					"IMDA GenAI Governance Framework published, providing governance guidelines for GenAI providers and deployers.",
				provision: "IMDA GenAI Governance Framework",
				isMandatory: false,
			},
			{
				date: "2026-01-15",
				description:
					"IMDA Model AI Governance Framework for Agentic AI published — world's first dedicated agentic AI governance framework.",
				provision: "IMDA Agentic AI Framework",
				isMandatory: false,
			},
			{
				date: "2026-06-30",
				description:
					"MAS Guidelines on AI Risk Management for Financial Institutions — expected finalisation and enforcement period begins.",
				provision: "MAS AI Risk Management Guidelines",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── Singapore Jurisdiction Module ────────────────────────────────────────

export const singaporeModule: JurisdictionModule = {
	id: "singapore",
	name: "Singapore AI Governance Frameworks (PDPC, IMDA, MAS)",
	jurisdiction: "singapore",

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

// ─── Exported Helpers (for testing) ───────────────────────────────────────

export {
	classifyRisk,
	getMatchingPdpcTriggers,
	getMatchingGenAiTriggers,
	getMatchingAgenticTriggers,
	getMatchingMasTriggers,
	isGenAiProduct,
	isAgenticAi,
	isFinancialServicesAi,
	PDPC_TRIGGERS,
	IMDA_GENAI_TRIGGERS,
	IMDA_AGENTIC_TRIGGERS,
	MAS_TRIGGERS,
};
