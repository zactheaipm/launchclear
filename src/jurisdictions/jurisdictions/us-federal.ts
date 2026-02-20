import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../core/types.js";

// ─── Regulatory Concern Matchers ──────────────────────────────────────────

interface RegulatoryTrigger {
	readonly id: string;
	readonly name: string;
	readonly framework: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const FTC_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "ftc-deceptive-ai",
		name: "Deceptive AI Practices",
		framework: "FTC Act Section 5",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			// FTC focuses on consumer-facing AI that could deceive
			return (
				ctx.userPopulations.includes("consumers") &&
				(ctx.productType === "generator" ||
					ctx.productType === "recommender" ||
					ctx.productType === "classifier" ||
					desc.includes("consumer") ||
					desc.includes("customer"))
			);
		},
	},
	{
		id: "ftc-genai-synthetic-content",
		name: "AI-Generated/Synthetic Content Disclosure",
		framework: "FTC Act Section 5, FTC GenAI Guidance",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true ||
			ctx.productType === "generator" ||
			ctx.generativeAiContext?.canGenerateDeepfakes === true ||
			ctx.generativeAiContext?.canGenerateSyntheticVoice === true,
	},
	{
		id: "ftc-unfair-ai-decisions",
		name: "Unfair Automated Decision-Making",
		framework: "FTC Act Section 5",
		matchesContext: (ctx) => {
			const hasSignificantImpact =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			const affectsConsumers =
				ctx.userPopulations.includes("consumers") ||
				ctx.userPopulations.includes("credit-applicants") ||
				ctx.userPopulations.includes("tenants") ||
				ctx.userPopulations.includes("job-applicants");
			return hasSignificantImpact && affectsConsumers;
		},
	},
];

const NIST_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "nist-ai-rmf-general",
		name: "NIST AI Risk Management Framework",
		framework: "NIST AI RMF 1.0",
		matchesContext: () => true, // NIST AI RMF is voluntary but recommended for all AI
	},
	{
		id: "nist-genai-profile",
		name: "NIST GenAI Risk Profile",
		framework: "NIST AI 600-1",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.usesFoundationModel === true ||
			ctx.generativeAiContext?.generatesContent === true ||
			ctx.productType === "generator" ||
			ctx.productType === "foundation-model",
	},
];

const FINANCIAL_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "sr-11-7-model-risk",
		name: "OCC/Fed SR 11-7 Model Risk Management",
		framework: "SR 11-7 / OCC 2011-12",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			(ctx.sectorContext?.financialServices?.hasModelRiskGovernance !== undefined ||
				ctx.sectorContext?.financialServices?.involvesCredit === true ||
				ctx.sectorContext?.financialServices?.involvesTrading === true ||
				ctx.sectorContext?.financialServices?.involvesInsurancePricing === true),
	},
	{
		id: "cfpb-fair-lending",
		name: "CFPB Fair Lending AI Guidance",
		framework: "ECOA / Regulation B",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.sectorContext?.financialServices?.involvesCredit === true ||
				ctx.userPopulations.includes("credit-applicants") ||
				desc.includes("credit scor") ||
				desc.includes("creditworth") ||
				desc.includes("lending") ||
				desc.includes("loan")
			);
		},
	},
	{
		id: "sec-ai-advisory",
		name: "SEC AI in Investment Advisory",
		framework: "SEC Investment Advisers Act",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.sectorContext?.financialServices?.subSector === "investment" ||
				ctx.sectorContext?.financialServices?.involvesTrading === true ||
				desc.includes("investment advi") ||
				desc.includes("robo-advis") ||
				desc.includes("portfolio management")
			);
		},
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingFtcTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return FTC_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingNistTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return NIST_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingFinancialTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return FINANCIAL_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function isGenAiProduct(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model"
	);
}

function isFinancialServicesAi(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

function isCreditScoringAi(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	return (
		ctx.sectorContext?.financialServices?.involvesCredit === true ||
		ctx.userPopulations.includes("credit-applicants") ||
		desc.includes("credit scor") ||
		desc.includes("creditworth")
	);
}

function isHighImpactAutomatedDecision(ctx: ProductContext): boolean {
	return (
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
		ctx.automationLevel === "fully-automated" &&
		(ctx.userPopulations.includes("consumers") ||
			ctx.userPopulations.includes("credit-applicants") ||
			ctx.userPopulations.includes("job-applicants") ||
			ctx.userPopulations.includes("tenants"))
	);
}

// ─── Risk Classification Logic ────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const financialTriggers = getMatchingFinancialTriggers(ctx);

	// Financial services AI with credit/lending: highest regulatory scrutiny
	if (isCreditScoringAi(ctx)) {
		return {
			level: "high",
			justification:
				"This AI system is used in credit scoring or lending decisions, subject to heightened regulatory scrutiny under ECOA/Regulation B (CFPB fair lending), OCC/Fed SR 11-7 (model risk management), and FTC Section 5 (unfair practices). Supervisory examination and enforcement is active in this area.",
			applicableCategories: [
				"credit-scoring",
				...financialTriggers.map((t) => t.id),
			],
			provisions: [
				"ECOA/Regulation B",
				"SR 11-7",
				"FTC Act Section 5",
			],
		};
	}

	// Financial services AI (non-credit): elevated regulatory concern
	if (isFinancialServicesAi(ctx) && financialTriggers.length > 0) {
		return {
			level: "high",
			justification: `This AI system operates in financial services and is subject to regulatory oversight: ${financialTriggers.map((t) => t.name).join("; ")}. Supervised institutions must comply with model risk management expectations.`,
			applicableCategories: financialTriggers.map((t) => t.id),
			provisions: financialTriggers.map((t) => t.framework),
		};
	}

	// High-impact automated decisions on consumers
	if (isHighImpactAutomatedDecision(ctx)) {
		return {
			level: "limited",
			justification:
				"This AI system makes automated decisions with material impact on consumers, triggering FTC scrutiny for unfair or deceptive practices. While no mandatory pre-market assessment exists at the federal level, failure to ensure fairness and transparency creates significant enforcement risk.",
			applicableCategories: ["ftc-unfair-ai-decisions"],
			provisions: ["FTC Act Section 5"],
		};
	}

	// GenAI products: specific disclosure expectations
	if (isGenAiProduct(ctx)) {
		const ftcTriggers = getMatchingFtcTriggers(ctx);
		if (ftcTriggers.some((t) => t.id === "ftc-genai-synthetic-content")) {
			return {
				level: "limited",
				justification:
					"This generative AI system creates content that may be mistaken for human-created content. FTC guidance emphasizes disclosure obligations for AI-generated content and has taken enforcement actions against deceptive AI-generated content. NIST AI 600-1 provides a risk management profile for GenAI systems.",
				applicableCategories: ["ftc-genai-synthetic-content", "nist-genai-profile"],
				provisions: ["FTC Act Section 5", "NIST AI 600-1"],
			};
		}
	}

	// General consumer AI
	const ftcTriggers = getMatchingFtcTriggers(ctx);
	if (ftcTriggers.length > 0) {
		return {
			level: "limited",
			justification:
				"This AI system interacts with consumers and is subject to FTC oversight for unfair or deceptive practices. While US federal law does not mandate pre-market AI classification, FTC enforcement creates compliance obligations.",
			applicableCategories: ftcTriggers.map((t) => t.id),
			provisions: ["FTC Act Section 5"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific US federal regulatory obligations beyond general FTC consumer protection. Voluntary alignment with the NIST AI RMF is recommended as a best practice.",
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

	// NIST AI RMF (recommended for all AI)
	provisions.push({
		id: "us-nist-ai-rmf",
		law: "NIST AI RMF",
		article: "NIST AI 100-1",
		title: "NIST AI Risk Management Framework",
		summary:
			"Voluntary framework for managing AI risks across the lifecycle. Organised into four functions: Govern, Map, Measure, Manage. While not legally binding, widely referenced by regulators and increasingly expected as a standard of care.",
		relevance:
			"Recommended framework for systematic AI risk management regardless of regulatory requirements.",
	});

	// FTC enforcement (consumer-facing AI)
	const ftcTriggers = getMatchingFtcTriggers(ctx);
	if (ftcTriggers.length > 0) {
		provisions.push({
			id: "us-ftc-section5",
			law: "FTC Act",
			article: "Section 5",
			title: "FTC Prohibition on Unfair or Deceptive Practices",
			summary:
				"The FTC prohibits unfair or deceptive acts or practices in commerce. For AI systems, this covers making false claims about AI capabilities, failing to disclose AI involvement in decisions, using AI to discriminate, and marketing AI products with unsubstantiated claims.",
			relevance:
				"This AI system is consumer-facing. FTC has actively enforced against AI companies for deceptive practices, algorithmic bias, and unfair automated decisions.",
		});
	}

	// GenAI-specific provisions
	if (isGenAiProduct(ctx)) {
		provisions.push({
			id: "us-nist-genai-profile",
			law: "NIST AI 600-1",
			article: "NIST AI 600-1",
			title: "NIST Generative AI Risk Profile",
			summary:
				"Companion resource to the AI RMF specifically addressing generative AI risks: CBRN information, confabulation, data privacy, environmental impact, harmful bias, homogenization, human-AI configuration, information integrity, information security, intellectual property, obscene/degrading content, and value chain risks.",
			relevance:
				"This system uses or provides generative AI capabilities. The NIST GenAI profile identifies 12 unique risk areas for generative AI requiring specific risk management actions.",
		});

		if (
			ctx.generativeAiContext?.canGenerateDeepfakes ||
			ctx.generativeAiContext?.canGenerateSyntheticVoice
		) {
			provisions.push({
				id: "us-ftc-genai-deepfakes",
				law: "FTC Guidance",
				article: "FTC GenAI Guidance (2023-2024)",
				title: "FTC Guidance on AI-Generated Content and Deepfakes",
				summary:
					"FTC has warned that using AI to generate deceptive content (including deepfakes, synthetic voices, and fake reviews) may violate Section 5. Companies must not use AI to deceive consumers and should disclose when content is AI-generated. FTC has proposed rules specifically targeting AI-generated impersonation.",
				relevance:
					"This system can generate synthetic media or deepfakes, triggering FTC disclosure obligations and enforcement risk for deceptive AI-generated content.",
			});
		}
	}

	// Financial services provisions
	const financialTriggers = getMatchingFinancialTriggers(ctx);

	if (financialTriggers.some((t) => t.id === "sr-11-7-model-risk")) {
		provisions.push({
			id: "us-sr-11-7",
			law: "SR 11-7 / OCC 2011-12",
			article: "SR 11-7",
			title: "OCC/Fed Model Risk Management Guidance",
			summary:
				"Supervisory guidance applicable to AI/ML models at banking institutions. Requires model validation, ongoing monitoring, governance framework, and documentation. Models used for material decisions (credit, pricing, risk) must have independent validation, performance testing, and outcome analysis. Applies to AI models regardless of complexity.",
			relevance:
				"This AI system operates at a supervised financial institution and uses models for decision-making, requiring compliance with SR 11-7 model risk management expectations.",
		});
	}

	if (financialTriggers.some((t) => t.id === "cfpb-fair-lending")) {
		provisions.push({
			id: "us-cfpb-fair-lending",
			law: "ECOA / Regulation B",
			article: "ECOA Section 701, Regulation B",
			title: "CFPB Fair Lending AI Guidance",
			summary:
				"The Equal Credit Opportunity Act prohibits discrimination in credit decisions. CFPB has clarified that creditors using AI/ML models must still provide specific and accurate reasons for adverse actions — 'the algorithm decided' is not sufficient. AI models must be tested for disparate impact across protected classes and creditors must be able to explain individual decisions.",
			relevance:
				"This AI system is involved in credit decisions. CFPB requires that AI-based adverse action reasons be specific and accurate, not generic, and that models be tested for fair lending compliance.",
		});
	}

	if (financialTriggers.some((t) => t.id === "sec-ai-advisory")) {
		provisions.push({
			id: "us-sec-ai-advisory",
			law: "Investment Advisers Act",
			article: "SEC AI Examination Priorities",
			title: "SEC Examination of AI in Investment Advisory",
			summary:
				"SEC examines registered investment advisers' use of AI for conflicts of interest, disclosure obligations, and fiduciary duty compliance. Firms using AI for portfolio management, recommendations, or trading must disclose AI use to clients and ensure AI does not create undisclosed conflicts.",
			relevance:
				"This AI system is used in investment advisory or trading, subject to SEC examination and fiduciary duty requirements.",
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

	// US federal is less artifact-heavy than EU; more action-oriented
	// But risk assessments and documentation are expected as best practice

	if (risk.level === "high" || risk.level === "limited") {
		artifacts.push({
			type: "risk-assessment",
			name: "AI Risk Assessment (NIST AI RMF Aligned)",
			required: risk.level === "high",
			legalBasis: "NIST AI RMF 1.0",
			description:
				"Risk assessment aligned with NIST AI RMF covering Govern, Map, Measure, and Manage functions. While voluntary, increasingly expected as standard of care. For financial institutions, expected by federal supervisors.",
		});
	}

	// GenAI transparency documentation
	if (isGenAiProduct(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "AI-Generated Content Disclosure Policy",
			required: false,
			legalBasis: "FTC Act Section 5, NIST AI 600-1",
			description:
				"Documentation of policies and mechanisms for disclosing AI-generated content to consumers. Covers labeling, watermarking, and disclosure practices aligned with FTC expectations and NIST GenAI profile recommendations.",
			templateId: "transparency-notice",
		});
	}

	// Financial services model documentation
	if (isFinancialServicesAi(ctx)) {
		artifacts.push({
			type: "model-card",
			name: "Model Documentation (SR 11-7 Aligned)",
			required: true,
			legalBasis: "SR 11-7 / OCC 2011-12",
			description:
				"Comprehensive model documentation including model purpose, methodology, assumptions, limitations, performance metrics, validation results, and monitoring plan. Required for supervised financial institutions.",
			templateId: "model-card",
		});
	}

	// Fair lending adverse action documentation
	if (isCreditScoringAi(ctx)) {
		artifacts.push({
			type: "bias-audit",
			name: "Fair Lending Analysis / Bias Audit",
			required: true,
			legalBasis: "ECOA / Regulation B",
			description:
				"Analysis of AI credit model for disparate impact across protected classes (race, color, religion, national origin, sex, marital status, age). Must include testing methodology, results, and remediation plan. CFPB expects specific adverse action reason documentation.",
			templateId: "bias-audit-nyc",
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

	// NIST AI RMF alignment (recommended for all AI)
	actions.push({
		id: "us-nist-rmf-alignment",
		title: "Align with NIST AI Risk Management Framework",
		description:
			"Implement AI risk management practices aligned with NIST AI RMF 1.0. Address the four core functions: Govern (governance structure, policies), Map (context and risk identification), Measure (analysis and tracking), and Manage (prioritisation and response). While voluntary, increasingly referenced by federal agencies as expected practice.",
		priority: "recommended",
		legalBasis: "NIST AI RMF 1.0",
		jurisdictions: ["us-federal"],
		estimatedEffort: "4-8 weeks",
		deadline: null,
	});

	// FTC actions for consumer-facing AI
	const ftcTriggers = getMatchingFtcTriggers(ctx);
	if (ftcTriggers.length > 0) {
		actions.push({
			id: "us-ftc-transparency",
			title: "Ensure truthful AI marketing and transparency",
			description:
				"Review all marketing claims about AI capabilities for accuracy. Do not overstate AI capabilities, make unsubstantiated efficacy claims, or hide material AI involvement in decisions. FTC has enforcement precedent against AI companies for deceptive claims.",
			priority: "important",
			legalBasis: "FTC Act Section 5",
			jurisdictions: ["us-federal"],
			estimatedEffort: "1-2 weeks",
			deadline: null,
		});
	}

	// Unfair automated decisions
	if (isHighImpactAutomatedDecision(ctx)) {
		actions.push({
			id: "us-ftc-fair-ai-decisions",
			title: "Test and document AI decision fairness",
			description:
				"Test AI decision systems for unfair outcomes across protected classes and demographic groups. FTC considers AI decisions that cause substantial injury, are not reasonably avoidable by consumers, and are not outweighed by benefits as 'unfair practices'. Document testing methodology and results.",
			priority: "critical",
			legalBasis: "FTC Act Section 5",
			jurisdictions: ["us-federal"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	// GenAI-specific actions
	if (isGenAiProduct(ctx)) {
		actions.push({
			id: "us-nist-genai-risk-management",
			title: "Address NIST GenAI risk profile areas",
			description:
				"Map and address the 12 GenAI-specific risk areas identified in NIST AI 600-1: CBRN information, confabulation/hallucination, data privacy, environmental impact, harmful bias, homogenisation, human-AI configuration, information integrity, information security, intellectual property, obscene/degrading content, and value chain risks. Document risk assessments and mitigations for each applicable area.",
			priority: "important",
			legalBasis: "NIST AI 600-1",
			jurisdictions: ["us-federal"],
			estimatedEffort: "4-8 weeks",
			deadline: null,
		});

		actions.push({
			id: "us-ftc-genai-disclosure",
			title: "Implement AI-generated content disclosure",
			description:
				"Establish clear disclosure mechanisms for AI-generated content. FTC guidance indicates that failing to disclose AI involvement when consumers would expect human creation may be deceptive. Implement labeling, watermarking, or other provenance mechanisms. Pay particular attention to synthetic media that could be mistaken for real content.",
			priority: "important",
			legalBasis: "FTC Act Section 5, FTC GenAI Guidance",
			jurisdictions: ["us-federal"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// Financial services actions
	if (isFinancialServicesAi(ctx)) {
		const financialTriggers = getMatchingFinancialTriggers(ctx);

		if (financialTriggers.some((t) => t.id === "sr-11-7-model-risk")) {
			actions.push(
				{
					id: "us-sr-11-7-governance",
					title: "Establish AI model risk governance framework",
					description:
						"Implement model risk governance aligned with SR 11-7: define model inventory, establish model risk appetite, assign model ownership, and create model risk management policies. Board and senior management must provide effective challenge and oversight of model risk.",
					priority: "critical",
					legalBasis: "SR 11-7 / OCC 2011-12",
					jurisdictions: ["us-federal"],
					estimatedEffort: "4-8 weeks",
					deadline: null,
				},
				{
					id: "us-sr-11-7-validation",
					title: "Conduct independent model validation",
					description:
						"Perform independent validation of AI/ML models as required by SR 11-7. Validation must be conducted by persons not involved in model development. Must include evaluation of conceptual soundness, outcome analysis, ongoing monitoring, and benchmarking. Re-validate when models are materially changed.",
					priority: "critical",
					legalBasis: "SR 11-7 / OCC 2011-12",
					jurisdictions: ["us-federal"],
					estimatedEffort: "4-8 weeks",
					deadline: null,
				},
				{
					id: "us-sr-11-7-monitoring",
					title: "Implement ongoing model performance monitoring",
					description:
						"Establish ongoing monitoring of AI model performance including tracking of key performance metrics, drift detection, outcome analysis, and comparison to initial validation benchmarks. Trigger re-validation when performance degrades beyond thresholds.",
					priority: "important",
					legalBasis: "SR 11-7 / OCC 2011-12",
					jurisdictions: ["us-federal"],
					estimatedEffort: "3-6 weeks",
					deadline: null,
				},
			);
		}

		if (financialTriggers.some((t) => t.id === "cfpb-fair-lending")) {
			actions.push(
				{
					id: "us-cfpb-adverse-action",
					title: "Implement specific adverse action reason codes",
					description:
						"When AI model produces adverse credit decisions, provide specific and accurate reasons to applicants as required by ECOA. CFPB has clarified that generic reasons like 'based on our model' are insufficient — the reasons must meaningfully describe the principal factors. Use model explainability techniques to generate specific reason codes.",
					priority: "critical",
					legalBasis: "ECOA Section 701(d), Regulation B §1002.9",
					jurisdictions: ["us-federal"],
					estimatedEffort: "3-6 weeks",
					deadline: null,
				},
				{
					id: "us-cfpb-fair-lending-testing",
					title: "Conduct fair lending testing on AI credit model",
					description:
						"Test AI credit model for disparate impact across protected classes (race, color, religion, national origin, sex, marital status, age). Document testing methodology, results, and any remediation steps. CFPB expects proactive testing, not just reactive review after complaints.",
					priority: "critical",
					legalBasis: "ECOA / Regulation B",
					jurisdictions: ["us-federal"],
					estimatedEffort: "4-8 weeks",
					deadline: null,
				},
			);
		}

		if (financialTriggers.some((t) => t.id === "sec-ai-advisory")) {
			actions.push({
				id: "us-sec-ai-disclosure",
				title: "Disclose AI use in investment advisory",
				description:
					"Disclose to clients the use of AI in investment recommendations, portfolio management, or trading. Address potential conflicts of interest from AI-driven decisions. Ensure AI use aligns with fiduciary duty obligations and client's stated investment objectives.",
				priority: "critical",
				legalBasis: "Investment Advisers Act",
				jurisdictions: ["us-federal"],
				estimatedEffort: "2-4 weeks",
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
		"US federal AI regulation is primarily enforcement-driven rather than prescriptive. The FTC, CFPB, SEC, and banking regulators enforce existing authorities against AI misuse. There is no single 'effective date' — obligations arise from existing statutes.",
	);

	if (risk.level === "high") {
		notes.push(
			"Financial services AI is subject to immediate supervisory expectations. SR 11-7 model risk management, ECOA fair lending, and SEC fiduciary duties apply now to AI/ML models.",
		);
	}

	if (isGenAiProduct(ctx)) {
		notes.push(
			"NIST AI 600-1 (GenAI risk profile) was published in July 2024. While voluntary, it is increasingly referenced by federal agencies as a standard of practice for GenAI risk management.",
		);
	}

	const deadlines = [
		{
			date: "2024-10-30",
			description:
				"Executive Order 14110 on Safe, Secure, and Trustworthy AI established AI safety requirements for federal government use and directed agencies to develop AI guidance.",
			provision: "EO 14110",
			isMandatory: false,
		},
		{
			date: "2024-07-26",
			description:
				"NIST AI 600-1 (Generative AI Profile) published, providing a GenAI-specific companion to the AI RMF.",
			provision: "NIST AI 600-1",
			isMandatory: false,
		},
	];

	return {
		effectiveDate: null,
		deadlines,
		notes,
	};
}

// ─── US Federal Jurisdiction Module ───────────────────────────────────────

export const usFederalModule: JurisdictionModule = {
	id: "us-federal",
	name: "US Federal AI Regulatory Framework",
	jurisdiction: "us-federal",

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
	getMatchingFtcTriggers,
	getMatchingNistTriggers,
	getMatchingFinancialTriggers,
	isGenAiProduct,
	isFinancialServicesAi,
	isCreditScoringAi,
	isHighImpactAutomatedDecision,
	FTC_TRIGGERS,
	NIST_TRIGGERS,
	FINANCIAL_TRIGGERS,
};
