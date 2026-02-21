import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../core/types.js";

// ─── AISI Frontier Model Framework Triggers ─────────────────────────────

interface RegulatoryTrigger {
	readonly id: string;
	readonly name: string;
	readonly framework: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const AISI_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "aisi-frontier-safety-evaluation",
		name: "Frontier Model Safety Evaluation",
		framework: "AISI Frontier Model Framework",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.isFrontierModel === true ||
			(ctx.productType === "foundation-model" &&
				ctx.generativeAiContext?.foundationModelSource === "self-trained"),
	},
	{
		id: "aisi-pre-deployment-testing",
		name: "Pre-Deployment Testing Requirements",
		framework: "AISI Frontier Model Framework",
		matchesContext: (ctx) => ctx.generativeAiContext?.isFrontierModel === true,
	},
	{
		id: "aisi-voluntary-commitments",
		name: "Voluntary Safety Commitments (Becoming Mandatory)",
		framework: "AISI Frontier Model Framework",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.isFrontierModel === true || ctx.productType === "foundation-model",
	},
	{
		id: "aisi-agentic-capability-evaluation",
		name: "Agentic Capability Evaluation",
		framework: "AISI Frontier Model Framework",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.isFrontierModel === true &&
			(ctx.agenticAiContext?.isAgentic === true ||
				ctx.generativeAiContext?.usesAgenticCapabilities === true),
	},
];

// ─── DSIT Foundation Model Principles Triggers ───────────────────────────

const DSIT_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "dsit-foundation-model-transparency",
		name: "Foundation Model Transparency",
		framework: "DSIT Foundation Model Taskforce Principles",
		matchesContext: (ctx) =>
			ctx.productType === "foundation-model" ||
			ctx.generativeAiContext?.usesFoundationModel === true,
	},
	{
		id: "dsit-foundation-model-accountability",
		name: "Foundation Model Accountability",
		framework: "DSIT Foundation Model Taskforce Principles",
		matchesContext: (ctx) =>
			ctx.productType === "foundation-model" ||
			(ctx.generativeAiContext?.usesFoundationModel === true &&
				ctx.generativeAiContext?.foundationModelSource === "self-trained"),
	},
	{
		id: "dsit-foundation-model-safety",
		name: "Foundation Model Safety Standards",
		framework: "DSIT Foundation Model Taskforce Principles",
		matchesContext: (ctx) =>
			ctx.productType === "foundation-model" || ctx.generativeAiContext?.isFrontierModel === true,
	},
];

// ─── ICO AI and Data Protection Triggers ─────────────────────────────────

const ICO_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "ico-lawful-basis-ai-training",
		name: "Lawful Basis for AI Training on Personal Data",
		framework: "UK GDPR / Data Protection Act 2018",
		matchesContext: (ctx) => {
			const usesPersonalTraining =
				ctx.trainingData.containsPersonalData ||
				ctx.generativeAiContext?.trainingDataIncludes.includes("personal-data") === true ||
				ctx.generativeAiContext?.trainingDataIncludes.includes("public-web-scrape") === true ||
				ctx.generativeAiContext?.trainingDataIncludes.includes("user-generated-content") === true;
			return usesPersonalTraining && ctx.trainingData.usesTrainingData;
		},
	},
	{
		id: "ico-generated-content-personal-data",
		name: "Generated Content Containing Personal Data",
		framework: "UK GDPR / Data Protection Act 2018",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true && processesPersonalData(ctx),
	},
	{
		id: "ico-automated-decisions",
		name: "Automated Decision-Making (UK GDPR Article 22 Equivalent)",
		framework: "UK GDPR / Data Protection Act 2018",
		matchesContext: (ctx) =>
			ctx.automationLevel === "fully-automated" &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "ico-dpia-requirement",
		name: "UK DPIA Requirement",
		framework: "UK GDPR Article 35 / Data Protection Act 2018",
		matchesContext: (ctx) => {
			const hasSpecialCategory =
				ctx.dataProcessed.includes("biometric") ||
				ctx.dataProcessed.includes("health") ||
				ctx.dataProcessed.includes("genetic") ||
				ctx.dataProcessed.includes("criminal") ||
				ctx.dataProcessed.includes("sensitive");
			const isLargeScale =
				ctx.userPopulations.includes("general-public") || ctx.userPopulations.includes("consumers");
			const isProfiling =
				ctx.description.toLowerCase().includes("profiling") ||
				ctx.description.toLowerCase().includes("scoring");
			const isFullyAutomated = ctx.automationLevel === "fully-automated";
			const hasSignificantEffect =
				ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return (
				(hasSpecialCategory && isLargeScale) ||
				(isProfiling && isFullyAutomated && hasSignificantEffect) ||
				(isFullyAutomated && hasSignificantEffect) ||
				ctx.dataProcessed.includes("biometric")
			);
		},
	},
	{
		id: "ico-children-data",
		name: "Children's Data Processing (Age Appropriate Design Code)",
		framework: "UK GDPR / Age Appropriate Design Code (Children's Code)",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors"),
	},
	{
		id: "ico-special-category",
		name: "Special Category Data Processing",
		framework: "UK GDPR Article 9 / Data Protection Act 2018 Schedule 1",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("sensitive") ||
			ctx.dataProcessed.includes("biometric") ||
			ctx.dataProcessed.includes("health") ||
			ctx.dataProcessed.includes("genetic") ||
			ctx.dataProcessed.includes("political") ||
			ctx.dataProcessed.includes("criminal"),
	},
];

// ─── FCA AI Guidance Triggers (Financial Services) ───────────────────────

const FCA_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "fca-fair-treatment",
		name: "FCA Fair Treatment of Customers (AI Outcomes)",
		framework: "FCA Principles-Based AI Guidance",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			(ctx.userPopulations.includes("consumers") ||
				ctx.userPopulations.includes("credit-applicants")),
	},
	{
		id: "fca-ai-bias-avoidance",
		name: "FCA AI Bias Avoidance",
		framework: "FCA Principles-Based AI Guidance",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "fca-ai-explainability",
		name: "FCA AI Explainability Requirements",
		framework: "FCA Principles-Based AI Guidance",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			ctx.automationLevel === "fully-automated",
	},
	{
		id: "fca-smcr-accountability",
		name: "SM&CR Accountability for AI Decisions",
		framework: "Senior Managers & Certification Regime",
		matchesContext: (ctx) =>
			ctx.sectorContext?.sector === "financial-services" &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "fca-credit-ai",
		name: "FCA AI in Credit Decisions",
		framework: "FCA Principles-Based AI Guidance / Consumer Credit Act",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.sectorContext?.financialServices?.involvesCredit === true ||
				ctx.userPopulations.includes("credit-applicants") ||
				desc.includes("credit scor") ||
				desc.includes("creditworth") ||
				desc.includes("lending")
			);
		},
	},
	{
		id: "fca-insurance-ai",
		name: "FCA AI in Insurance Pricing",
		framework: "FCA Principles-Based AI Guidance / Insurance Conduct of Business",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.sectorContext?.financialServices?.involvesInsurancePricing === true ||
				(desc.includes("insurance") &&
					(desc.includes("pricing") || desc.includes("underwriting") || desc.includes("risk")))
			);
		},
	},
	{
		id: "fca-trading-ai",
		name: "FCA AI in Algorithmic Trading",
		framework: "FCA / MiFID II Algorithmic Trading Requirements",
		matchesContext: (ctx) => ctx.sectorContext?.financialServices?.involvesTrading === true,
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingAisiTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return AISI_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingDsitTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return DSIT_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingIcoTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return ICO_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingFcaTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return FCA_TRIGGERS.filter((t) => t.matchesContext(ctx));
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

function isFrontierModelProvider(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.isFrontierModel === true &&
		(ctx.productType === "foundation-model" ||
			ctx.generativeAiContext?.foundationModelSource === "self-trained")
	);
}

function isFoundationModelProduct(ctx: ProductContext): boolean {
	return (
		ctx.productType === "foundation-model" || ctx.generativeAiContext?.usesFoundationModel === true
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

function isFinancialServicesAi(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

function isAutomatedEmploymentDecision(ctx: ProductContext): boolean {
	return (
		(ctx.userPopulations.includes("job-applicants") || ctx.userPopulations.includes("employees")) &&
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
		ctx.automationLevel === "fully-automated"
	);
}

function hasDeepfakeCapabilities(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.canGenerateDeepfakes === true ||
		ctx.generativeAiContext?.canGenerateSyntheticVoice === true
	);
}

function isAgenticAi(ctx: ProductContext): boolean {
	return (
		ctx.agenticAiContext?.isAgentic === true ||
		ctx.generativeAiContext?.usesAgenticCapabilities === true
	);
}

// ─── Risk Classification Logic ────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const aisiTriggers = getMatchingAisiTriggers(ctx);
	const fcaTriggers = getMatchingFcaTriggers(ctx);
	const icoTriggers = getMatchingIcoTriggers(ctx);

	// HIGH RISK: Frontier model provider
	if (isFrontierModelProvider(ctx)) {
		return {
			level: "high",
			justification:
				"This AI system involves a frontier model. Under the AISI Frontier Model Framework, frontier model providers are subject to safety evaluation requirements, pre-deployment testing, and voluntary commitments that are becoming mandatory. This represents the highest tier of UK AI regulatory scrutiny.",
			applicableCategories: ["frontier-model-provider", ...aisiTriggers.map((t) => t.id)],
			provisions: ["AISI Frontier Model Framework", "DSIT Foundation Model Principles"],
		};
	}

	// HIGH RISK: Financial services AI with material decisions
	if (
		isFinancialServicesAi(ctx) &&
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
	) {
		return {
			level: "high",
			justification: `This AI system operates in financial services with material decision-making impact. FCA principles require fair treatment of customers, bias avoidance, and explainability. Senior Managers & Certification Regime (SM&CR) applies to AI-driven decisions. Applicable FCA concerns: ${fcaTriggers.map((t) => t.name).join("; ")}.`,
			applicableCategories: ["financial-services-material", ...fcaTriggers.map((t) => t.id)],
			provisions: [
				"FCA Principles-Based AI Guidance",
				"SM&CR",
				...fcaTriggers.map((t) => t.framework),
			],
		};
	}

	// HIGH RISK: Automated employment decisions
	if (isAutomatedEmploymentDecision(ctx)) {
		return {
			level: "high",
			justification:
				"This AI system makes automated employment decisions (recruitment, performance evaluation, or termination). Under UK GDPR and ICO guidance, fully automated decisions with significant effects on employees or job applicants require human oversight, data protection safeguards, and potentially a DPIA.",
			applicableCategories: ["automated-employment", ...icoTriggers.map((t) => t.id)],
			provisions: ["UK GDPR Article 22", "ICO AI Guidance", "Data Protection Act 2018"],
		};
	}

	// HIGH RISK: Biometric data processing
	if (ctx.dataProcessed.includes("biometric")) {
		return {
			level: "high",
			justification:
				"This AI system processes biometric data, classified as special category data under UK GDPR. Processing requires an Article 9(2) legal basis, a DPIA is mandatory, and ICO guidance imposes heightened transparency and security requirements. Biometric AI in public spaces attracts particular regulatory scrutiny.",
			applicableCategories: ["biometric-processing", ...icoTriggers.map((t) => t.id)],
			provisions: [
				"UK GDPR Article 9",
				"UK GDPR Article 35",
				"Data Protection Act 2018 Schedule 1",
				"ICO AI Guidance",
			],
		};
	}

	// LIMITED RISK: Foundation model deployer
	if (
		isFoundationModelProduct(ctx) &&
		ctx.productType !== "foundation-model" &&
		ctx.generativeAiContext?.foundationModelSource !== "self-trained"
	) {
		const categories: string[] = ["foundation-model-deployer"];
		const provisions: string[] = ["DSIT Foundation Model Principles"];
		if (aisiTriggers.length > 0) {
			categories.push(...aisiTriggers.map((t) => t.id));
			provisions.push("AISI Frontier Model Framework");
		}
		return {
			level: "limited",
			justification:
				"This AI system deploys a third-party foundation model. While the deployer is not subject to the full AISI frontier model safety requirements, DSIT principles on transparency and accountability apply. Deployers must ensure responsible integration, provide transparency disclosures, and comply with UK GDPR for any personal data processing.",
			applicableCategories: categories,
			provisions: [...new Set(provisions)],
		};
	}

	// LIMITED RISK: GenAI content generation
	if (isGenAiProduct(ctx)) {
		return {
			level: "limited",
			justification:
				"This AI system generates content using generative AI. UK regulatory expectations include transparency about AI-generated content, compliance with ICO guidance on AI and data protection, and alignment with DSIT foundation model principles. Deepfake or synthetic media capabilities attract additional disclosure obligations.",
			applicableCategories: [
				"genai-content-generation",
				...(hasDeepfakeCapabilities(ctx) ? ["deepfake-capabilities"] : []),
			],
			provisions: ["ICO AI Guidance", "DSIT Foundation Model Principles"],
		};
	}

	// LIMITED RISK: Consumer personal data processing
	if (processesPersonalData(ctx)) {
		return {
			level: "limited",
			justification:
				"This AI system processes personal data and must comply with UK GDPR and the Data Protection Act 2018. ICO AI guidance applies to the use of AI in personal data processing, requiring lawful basis, transparency, fairness, and data subject rights compliance.",
			applicableCategories: ["personal-data-processing", ...icoTriggers.map((t) => t.id)],
			provisions: ["UK GDPR", "Data Protection Act 2018", "ICO AI Guidance"],
		};
	}

	// MINIMAL RISK: No personal data, no high-impact decisions
	return {
		level: "minimal",
		justification:
			"This AI system does not process personal data, does not make high-impact decisions, and does not involve frontier or foundation models. No mandatory UK AI-specific obligations apply, though voluntary alignment with DSIT principles and ICO best practices is recommended.",
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

	// ─── ICO AI and Data Protection Guidance ─────────────────────────────
	if (processesPersonalData(ctx)) {
		provisions.push(
			{
				id: "uk-gdpr-principles",
				law: "UK GDPR",
				article: "Articles 5-6",
				title: "UK GDPR Principles and Lawful Basis",
				summary:
					"Processing must be lawful, fair, and transparent; collected for specified purposes; adequate, relevant, and limited to what is necessary; accurate; stored only as long as necessary; and processed securely. A valid legal basis under Article 6 is required.",
				relevance:
					"Applies to all personal data processing in the AI system operating in the UK market.",
			},
			{
				id: "uk-gdpr-data-subject-rights",
				law: "UK GDPR",
				article: "Articles 12-23",
				title: "Data Subject Rights",
				summary:
					"Data subjects have rights to access, rectification, erasure, restriction, portability, and objection. For AI systems, the right to meaningful information about automated decision logic is particularly relevant.",
				relevance:
					"The AI system must facilitate data subject rights, including explaining AI-driven processing upon request.",
			},
		);

		// Automated decision-making
		if (
			ctx.automationLevel === "fully-automated" &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
		) {
			provisions.push({
				id: "uk-gdpr-art22",
				law: "UK GDPR",
				article: "Article 22",
				title: "Automated Individual Decision-Making",
				summary:
					"Data subjects have the right not to be subject to decisions based solely on automated processing that produce legal or similarly significant effects. Suitable safeguards including human intervention must be available. ICO guidance requires organisations to identify automated decisions and provide meaningful information about the logic.",
				relevance:
					"This AI system makes fully automated decisions with material or determinative impact, triggering UK GDPR Article 22 protections and ICO automated decision-making guidance.",
			});
		}

		// DPIA requirement
		const icoTriggers = getMatchingIcoTriggers(ctx);
		if (icoTriggers.some((t) => t.id === "ico-dpia-requirement")) {
			provisions.push({
				id: "uk-gdpr-dpia",
				law: "UK GDPR",
				article: "Article 35",
				title: "UK Data Protection Impact Assessment",
				summary:
					"A DPIA is required before processing likely to result in a high risk to individuals. ICO has published specific guidance on when DPIAs are required for AI systems, including systematic profiling with significant effects, large-scale special category data processing, and biometric processing.",
				relevance:
					"This AI system triggers a UK DPIA requirement based on ICO screening criteria for AI processing.",
			});
		}

		// Special category data
		if (
			ctx.dataProcessed.includes("sensitive") ||
			ctx.dataProcessed.includes("biometric") ||
			ctx.dataProcessed.includes("health") ||
			ctx.dataProcessed.includes("genetic") ||
			ctx.dataProcessed.includes("criminal")
		) {
			provisions.push({
				id: "uk-gdpr-special-category",
				law: "UK GDPR / Data Protection Act 2018",
				article: "Article 9, Schedule 1",
				title: "Special Category Data Processing",
				summary:
					"Processing special categories of personal data is prohibited unless an Article 9(2) condition applies AND a Schedule 1 condition under the Data Protection Act 2018 is met. Criminal offence data requires an Article 10 / Schedule 1 condition.",
				relevance:
					"This AI system processes special category data, requiring both a UK GDPR Article 9 condition and a DPA 2018 Schedule 1 condition.",
			});
		}

		// Children's data
		if (ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors")) {
			provisions.push({
				id: "uk-children-code",
				law: "Data Protection Act 2018 / ICO Age Appropriate Design Code",
				article: "Age Appropriate Design Code (Children's Code)",
				title: "Age Appropriate Design Code",
				summary:
					"Online services likely to be accessed by children must comply with the ICO's Age Appropriate Design Code (Children's Code). This includes 15 standards covering best interests assessment, age-appropriate application, transparency, data minimisation, and default settings. AI systems processing children's data face heightened requirements.",
				relevance:
					"This AI system processes data of minors or is accessible to children, requiring compliance with the ICO Children's Code.",
			});
		}

		// AI training data
		const icoTrainingTrigger = icoTriggers.find((t) => t.id === "ico-lawful-basis-ai-training");
		if (icoTrainingTrigger) {
			provisions.push({
				id: "uk-ico-training-data",
				law: "UK GDPR / ICO AI Guidance",
				article: "Articles 5-6, 14",
				title: "Lawful Basis for AI Training on Personal Data",
				summary:
					"ICO guidance requires a valid legal basis for using personal data to train AI models. Legitimate interest is the most common basis but requires a three-part Legitimate Interest Assessment. Web-scraped personal data triggers Article 14 transparency obligations. Data subjects retain the right to object to training use.",
				relevance:
					"This AI system uses training data that includes personal data. ICO expects documented lawful basis and compliance with data subject rights for training data.",
			});
		}

		// Generated content with personal data
		if (ctx.generativeAiContext?.generatesContent && processesPersonalData(ctx)) {
			provisions.push({
				id: "uk-ico-generated-content",
				law: "UK GDPR / ICO AI Guidance",
				article: "Articles 5, 17, 22",
				title: "AI-Generated Content Containing Personal Data",
				summary:
					"When AI systems generate content that includes or references personal data (names, biographical details, likenesses), this constitutes processing under UK GDPR. Accuracy obligations (Article 5(1)(d)) apply to AI-generated statements about individuals. The right to erasure and rectification applies to AI-generated personal data.",
				relevance:
					"This AI system generates content that may contain personal data. ICO guidance requires accuracy safeguards and data subject rights mechanisms for generated content.",
			});
		}
	}

	// ─── AISI Frontier Model Framework ───────────────────────────────────
	const aisiTriggers = getMatchingAisiTriggers(ctx);
	if (aisiTriggers.length > 0) {
		provisions.push({
			id: "uk-aisi-frontier-framework",
			law: "AISI Frontier Model Framework",
			article: "AISI Safety Evaluation Framework",
			title: "AISI Frontier Model Safety Requirements",
			summary:
				"The AI Safety Institute (AISI) has established a framework for evaluating frontier AI models before deployment. Frontier model developers are expected to submit models for safety evaluation, conduct pre-deployment testing, and make voluntary (increasingly mandatory) safety commitments covering dangerous capabilities, societal impact, and autonomous operation.",
			relevance:
				"This AI system involves a frontier model, triggering AISI safety evaluation expectations and safety commitment obligations.",
		});

		if (aisiTriggers.some((t) => t.id === "aisi-agentic-capability-evaluation")) {
			provisions.push({
				id: "uk-aisi-agentic-evaluation",
				law: "AISI Frontier Model Framework",
				article: "AISI Agentic Capability Assessment",
				title: "Agentic Capability Evaluation",
				summary:
					"AISI is actively evaluating agentic capabilities of frontier models, including tool use, autonomous action, and multi-step planning. While no UK-specific agentic AI framework exists yet, AISI evaluations increasingly focus on assessing risks from AI systems that can take autonomous actions, including deception, self-replication, and uncontrolled behaviour.",
				relevance:
					"This AI system combines frontier model capabilities with agentic features. AISI agentic capability evaluations are relevant and UK human oversight frameworks apply.",
			});
		}
	}

	// ─── DSIT Foundation Model Principles ─────────────────────────────────
	const dsitTriggers = getMatchingDsitTriggers(ctx);
	if (dsitTriggers.length > 0) {
		provisions.push({
			id: "uk-dsit-foundation-principles",
			law: "DSIT Foundation Model Taskforce Principles",
			article: "DSIT Foundation Model Principles (2024)",
			title: "DSIT Foundation Model Transparency and Accountability",
			summary:
				"The Department for Science, Innovation & Technology (DSIT) has published principles for foundation model developers and deployers. These cover transparency (disclosing model capabilities, limitations, and training data), accountability (governance structures and incident reporting), and safety (testing, evaluation, and risk management). While principles-based and not yet statutory, they represent the UK government's expected standards.",
			relevance:
				"This AI system uses or provides a foundation model. DSIT principles on transparency, accountability, and safety apply.",
		});
	}

	// ─── FCA AI Guidance (Financial Services) ─────────────────────────────
	const fcaTriggers = getMatchingFcaTriggers(ctx);
	if (fcaTriggers.length > 0) {
		provisions.push({
			id: "uk-fca-principles",
			law: "FCA Handbook / FCA Principles-Based AI Guidance",
			article: "FCA Principles for Businesses",
			title: "FCA Principles-Based AI Guidance",
			summary:
				"FCA regulates AI in financial services through existing principles: Principle 6 (treating customers fairly), Principle 7 (clear communications), Principle 11 (cooperation with regulators). AI-specific guidance emphasises fair outcomes, avoiding bias in automated decisions, ensuring explainability of AI-driven financial decisions, and maintaining adequate governance. The FCA Consumer Duty (2023) reinforces outcomes-focused requirements.",
			relevance:
				"This AI system operates in UK financial services, subject to FCA regulatory oversight and principles-based AI expectations.",
		});

		if (fcaTriggers.some((t) => t.id === "fca-smcr-accountability")) {
			provisions.push({
				id: "uk-fca-smcr",
				law: "Senior Managers & Certification Regime (SM&CR)",
				article: "SM&CR / FCA SYSC 4",
				title: "SM&CR Accountability for AI Decisions",
				summary:
					"Under SM&CR, senior managers at financial institutions are personally accountable for ensuring AI systems used in their areas of responsibility comply with regulatory requirements. This includes accountability for AI-driven customer outcomes, bias testing, and model risk governance. Firms must identify which senior manager(s) are responsible for AI governance.",
				relevance:
					"This AI system makes material decisions in financial services. SM&CR requires a named senior manager to be accountable for AI governance and outcomes.",
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-credit-ai")) {
			provisions.push({
				id: "uk-fca-credit-ai",
				law: "FCA Handbook / Consumer Credit Act",
				article: "FCA CONC / Consumer Credit Act 1974",
				title: "AI in Credit Decisions",
				summary:
					"AI used in credit scoring and lending decisions must ensure fair treatment, provide clear reasons for adverse decisions, and avoid discriminatory outcomes. FCA expects firms to be able to explain AI-driven credit decisions to consumers and to regulators. The Consumer Duty requires firms to deliver good outcomes for retail customers.",
				relevance:
					"This AI system is involved in credit decisions in the UK market, subject to FCA consumer credit conduct rules and fair lending requirements.",
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-insurance-ai")) {
			provisions.push({
				id: "uk-fca-insurance-ai",
				law: "FCA Handbook / Insurance Conduct of Business",
				article: "FCA ICOBS / Insurance Act 2015",
				title: "AI in Insurance Pricing and Underwriting",
				summary:
					"FCA expects fair and transparent insurance pricing. AI-driven pricing must not unfairly discriminate. The FCA has examined 'price walking' and algorithmic pricing practices. Firms must ensure AI underwriting models produce fair outcomes and can be explained to regulators.",
				relevance:
					"This AI system is involved in insurance pricing or underwriting, subject to FCA insurance conduct requirements and fair value rules.",
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-trading-ai")) {
			provisions.push({
				id: "uk-fca-trading-ai",
				law: "FCA Handbook / MiFID II Implementation",
				article: "FCA MAR 7A / MiFID II Algorithmic Trading",
				title: "AI in Algorithmic Trading",
				summary:
					"AI-driven algorithmic trading is subject to MiFID II requirements as implemented in the UK. Firms must have effective systems and risk controls, including kill functionality, pre-trade controls, and real-time monitoring. Algorithm testing and validation is required before deployment and after material changes.",
				relevance:
					"This AI system is used in algorithmic trading, subject to FCA algorithmic trading requirements and MiFID II implementation.",
			});
		}
	}

	// ─── PRA Third-Party Dependency (Financial Services) ─────────────────
	if (
		isFinancialServicesAi(ctx) &&
		(ctx.generativeAiContext?.foundationModelSource === "third-party-api" ||
			ctx.generativeAiContext?.foundationModelSource === "fine-tuned")
	) {
		provisions.push({
			id: "uk-pra-ss221",
			law: "PRA Supervisory Statement SS2/21",
			article: "SS2/21",
			title: "PRA Third-Party Dependency Management",
			summary:
				"PRA SS2/21 sets expectations for outsourcing and third-party risk management. Financial institutions using third-party AI services (including foundation model APIs) must conduct due diligence, ensure contractual protections, maintain contingency plans for provider failure, and regularly assess concentration risk. This applies to AI services regardless of whether they are formally classified as 'outsourcing'.",
			relevance:
				"This AI system relies on third-party AI services in a UK-regulated financial institution, triggering PRA third-party dependency expectations.",
		});
	}

	// ─── International Data Transfers ─────────────────────────────────────
	if (ctx.targetMarkets.length > 1 && processesPersonalData(ctx)) {
		provisions.push({
			id: "uk-ico-transfer-risk",
			law: "UK GDPR / ICO Transfer Risk Assessment",
			article: "Articles 44-49, ICO TRA Tool",
			title: "International Data Transfer Risk Assessment",
			summary:
				"UK GDPR requires appropriate safeguards for international transfers of personal data. The ICO's Transfer Risk Assessment (TRA) tool helps organisations assess whether transfer mechanisms (e.g., Standard Contractual Clauses, adequacy regulations) provide adequate protection. For AI systems processing personal data across jurisdictions, a TRA must be conducted for each transfer pathway.",
			relevance:
				"This AI system operates across multiple markets, potentially requiring international personal data transfers subject to UK GDPR transfer restrictions.",
		});
	}

	// ─── Agentic AI (Existing UK Frameworks) ─────────────────────────────
	if (isAgenticAi(ctx) && aisiTriggers.length === 0) {
		// Agentic AI without frontier model status: assessed under existing frameworks
		provisions.push({
			id: "uk-agentic-existing-frameworks",
			law: "UK GDPR / ICO Guidance / DSIT Principles",
			article: "Multiple",
			title: "Agentic AI Under Existing UK Frameworks",
			summary:
				"The UK does not yet have a dedicated agentic AI governance framework. Agentic AI systems are assessed under existing regulatory frameworks: UK GDPR human oversight requirements (Article 22), ICO guidance on automated decision-making, DSIT principles on accountability and safety, and sector-specific regulations (e.g., FCA for financial services). AISI is actively evaluating agentic capabilities as part of frontier model assessments.",
			relevance:
				"This AI system has agentic capabilities (autonomous action, tool use). While no UK-specific agentic framework exists, existing human oversight, accountability, and safety frameworks apply.",
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

	const icoTriggers = getMatchingIcoTriggers(ctx);

	// UK DPIA
	if (icoTriggers.some((t) => t.id === "ico-dpia-requirement")) {
		artifacts.push({
			type: "dpia",
			name: "UK Data Protection Impact Assessment",
			required: true,
			legalBasis: "UK GDPR Article 35 / ICO DPIA Guidance",
			description:
				"A UK DPIA is required before processing likely to result in a high risk to individuals. The ICO DPIA template must be used or an equivalent covering: description of processing, necessity and proportionality assessment, risk assessment, and measures to mitigate risks. The ICO must be consulted under Article 36 if residual risks remain high.",
			templateId: "dpia-uk",
		});
	}

	// Transparency notice (always when processing personal data)
	if (processesPersonalData(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "UK GDPR Privacy Notice / AI Transparency Statement",
			required: true,
			legalBasis: "UK GDPR Articles 13-14 / ICO AI Guidance",
			description:
				"Privacy notice compliant with UK GDPR informing data subjects about AI processing purposes, legal basis, retention periods, data subject rights, and contact details. For AI systems, must include meaningful information about the logic involved in automated processing and the significance and envisaged consequences.",
			templateId: "transparency-notice",
		});
	}

	// Risk assessment for frontier/foundation models
	if (isFrontierModelProvider(ctx)) {
		artifacts.push(
			{
				type: "risk-assessment",
				name: "AISI Frontier Model Safety Assessment",
				required: true,
				legalBasis: "AISI Frontier Model Framework",
				description:
					"Safety assessment for frontier model deployment covering dangerous capabilities evaluation, societal impact assessment, autonomous operation risks, and mitigation measures. Aligns with AISI safety evaluation framework and voluntary safety commitments.",
			},
			{
				type: "model-card",
				name: "Frontier Model System Card / Technical Documentation",
				required: true,
				legalBasis: "AISI Frontier Model Framework / DSIT Principles",
				description:
					"Technical documentation for the frontier model covering capabilities, limitations, safety testing results, known risks, intended uses, and prohibited uses. Must be aligned with AISI evaluation expectations and DSIT transparency principles.",
				templateId: "model-card",
			},
		);
	}

	// DSIT-aligned model documentation for non-frontier foundation models
	if (isFoundationModelProduct(ctx) && !isFrontierModelProvider(ctx)) {
		artifacts.push({
			type: "model-card",
			name: "Foundation Model Documentation (DSIT-Aligned)",
			required: false,
			legalBasis: "DSIT Foundation Model Principles",
			description:
				"Documentation of the foundation model covering capabilities, limitations, training data summary, known risks, and intended use. Aligned with DSIT foundation model transparency principles. Recommended for all foundation model deployers.",
			templateId: "model-card",
		});
	}

	// GenAI content disclosure policy
	if (isGenAiProduct(ctx)) {
		artifacts.push({
			type: "genai-content-policy",
			name: "AI-Generated Content Disclosure Policy (UK)",
			required: false,
			legalBasis: "ICO AI Guidance / DSIT Principles",
			description:
				"Policy documenting AI-generated content disclosure practices, content labeling mechanisms, and watermarking approaches. While not yet statutory in the UK, aligns with ICO transparency expectations and DSIT principles on responsible AI deployment.",
			templateId: "genai-content-policy",
		});
	}

	// Deepfake/synthetic media disclosure
	if (hasDeepfakeCapabilities(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "Synthetic Media / Deepfake Disclosure Notice",
			required: true,
			legalBasis: "Online Safety Act 2023 / ICO Guidance",
			description:
				"Disclosure notice for synthetic media capabilities. The Online Safety Act 2023 places obligations on platforms regarding deepfake content. AI systems capable of generating deepfakes or synthetic voices must provide clear disclosure to users and implement safeguards against misuse.",
		});
	}

	// FCA financial services model documentation
	if (isFinancialServicesAi(ctx)) {
		artifacts.push({
			type: "risk-assessment",
			name: "FCA AI Model Risk Assessment",
			required: true,
			legalBasis: "FCA Principles / SM&CR / PRA Supervisory Statement",
			description:
				"Risk assessment for AI models used in regulated financial services, covering model governance, bias testing, explainability measures, consumer outcome analysis, and SM&CR accountability mapping. Must demonstrate compliance with FCA principles and Consumer Duty.",
		});

		const fcaTriggers = getMatchingFcaTriggers(ctx);
		if (fcaTriggers.some((t) => t.id === "fca-credit-ai")) {
			artifacts.push({
				type: "bias-audit",
				name: "FCA Credit AI Fairness Assessment",
				required: true,
				legalBasis: "FCA CONC / Consumer Duty / Equality Act 2010",
				description:
					"Assessment of AI credit model for discriminatory outcomes across protected characteristics under the Equality Act 2010. Must include testing methodology, results, and remediation measures. FCA expects firms to demonstrate fair consumer outcomes from AI credit decisions.",
				templateId: "bias-audit-nyc",
			});
		}
	}

	// Children's Code compliance documentation
	if (ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors")) {
		artifacts.push({
			type: "risk-assessment",
			name: "ICO Children's Code Impact Assessment",
			required: true,
			legalBasis: "Age Appropriate Design Code (Children's Code)",
			description:
				"Assessment of AI system compliance with the ICO Age Appropriate Design Code (Children's Code). Must address all 15 standards including best interests assessment, age-appropriate application, transparency, data minimisation, geolocation, parental controls, profiling, and default settings.",
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

	const icoTriggers = getMatchingIcoTriggers(ctx);
	const aisiTriggers = getMatchingAisiTriggers(ctx);
	const dsitTriggers = getMatchingDsitTriggers(ctx);
	const fcaTriggers = getMatchingFcaTriggers(ctx);

	// ─── ICO / UK GDPR Actions ───────────────────────────────────────────

	if (processesPersonalData(ctx)) {
		actions.push(
			{
				id: "uk-legal-basis-assessment",
				title: "Determine lawful basis for processing under UK GDPR",
				description:
					"Identify and document the lawful basis (UK GDPR Article 6) for each processing purpose. For legitimate interest, conduct a three-part Legitimate Interest Assessment (purpose test, necessity test, balancing test) per ICO guidance. For consent, implement mechanisms meeting UK GDPR standards (freely given, specific, informed, unambiguous).",
				priority: "critical",
				legalBasis: "UK GDPR Articles 6-7",
				jurisdictions: ["uk"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "uk-data-subject-rights",
				title: "Implement UK GDPR data subject rights mechanisms",
				description:
					"Enable data subjects to exercise their rights under UK GDPR: access (Art 15), rectification (Art 16), erasure (Art 17), restriction (Art 18), portability (Art 20), objection (Art 21). For AI systems, consider how rights apply to automated processing, profiling, and model training data. ICO guidance requires clear processes for handling rights requests related to AI.",
				priority: "critical",
				legalBasis: "UK GDPR Articles 12-23",
				jurisdictions: ["uk"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "uk-privacy-notice",
				title: "Publish UK GDPR-compliant privacy notice with AI transparency",
				description:
					"Provide transparent information to data subjects about processing purposes, legal basis, data categories, retention periods, and their rights. For AI systems, include meaningful information about the logic involved in automated decision-making and its envisaged consequences per ICO AI guidance.",
				priority: "critical",
				legalBasis: "UK GDPR Articles 13-14 / ICO Guidance",
				jurisdictions: ["uk"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
		);

		// DPIA action
		if (icoTriggers.some((t) => t.id === "ico-dpia-requirement")) {
			actions.push({
				id: "uk-conduct-dpia",
				title: "Conduct UK Data Protection Impact Assessment",
				description:
					"Conduct a DPIA using the ICO template or equivalent before processing begins. Must systematically describe processing, assess necessity and proportionality, assess risks to rights and freedoms, and identify mitigation measures. If residual risks remain high, consult the ICO under Article 36 before proceeding.",
				priority: "critical",
				legalBasis: "UK GDPR Article 35 / ICO DPIA Guidance",
				jurisdictions: ["uk"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			});
		}

		// Automated decision-making safeguards
		if (icoTriggers.some((t) => t.id === "ico-automated-decisions")) {
			actions.push({
				id: "uk-automated-decision-safeguards",
				title: "Implement UK GDPR Article 22 automated decision safeguards",
				description:
					"Implement safeguards for automated decisions with legal or similarly significant effects: (1) right to obtain human intervention, (2) right to express their point of view, (3) right to contest the decision, (4) meaningful information about the logic involved. ICO guidance requires organisations to identify all automated decisions and proactively offer human review.",
				priority: "critical",
				legalBasis: "UK GDPR Article 22 / ICO Automated Decision-Making Guidance",
				jurisdictions: ["uk"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			});
		}

		// Special category data
		if (icoTriggers.some((t) => t.id === "ico-special-category")) {
			actions.push({
				id: "uk-special-category-basis",
				title: "Establish legal basis for special category data processing",
				description:
					"Identify both a UK GDPR Article 9(2) condition AND a Data Protection Act 2018 Schedule 1 condition for processing special category data. The UK requires dual conditions, unlike the EU GDPR. For criminal offence data, identify an Article 10 / Schedule 1 Part 2 condition. Document an appropriate policy for sensitive processing.",
				priority: "critical",
				legalBasis: "UK GDPR Article 9 / DPA 2018 Schedule 1",
				jurisdictions: ["uk"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			});
		}

		// Children's data
		if (icoTriggers.some((t) => t.id === "ico-children-data")) {
			actions.push({
				id: "uk-children-code-compliance",
				title: "Comply with ICO Age Appropriate Design Code (Children's Code)",
				description:
					"Assess and implement compliance with all 15 standards of the Children's Code: best interests, age-appropriate application, transparency, detrimental use, policies and community standards, default settings, data minimisation, data sharing, geolocation, parental controls, profiling, nudge techniques, connected toys/devices, online tools, and data protection impact assessments. The code applies to online services likely to be accessed by children.",
				priority: "critical",
				legalBasis: "ICO Age Appropriate Design Code",
				jurisdictions: ["uk"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			});
		}

		// Training data compliance
		if (icoTriggers.some((t) => t.id === "ico-lawful-basis-ai-training")) {
			actions.push(
				{
					id: "uk-training-data-legal-basis",
					title: "Establish lawful basis for AI training data processing",
					description:
						"Determine and document the lawful basis for personal data used in model training under UK GDPR. If relying on legitimate interest (Art 6(1)(f)), conduct a three-part ICO Legitimate Interest Assessment. For web-scraped data, address Article 14 transparency obligations. Implement opt-out mechanisms for data subjects. ICO has published specific guidance on AI training and personal data.",
					priority: "critical",
					legalBasis: "UK GDPR Articles 5-6, 14 / ICO AI Guidance",
					jurisdictions: ["uk"],
					estimatedEffort: "2-4 weeks",
					deadline: null,
				},
				{
					id: "uk-training-data-erasure-policy",
					title: "Develop policy for right to erasure in trained models",
					description:
						"Document the approach to handling erasure requests (UK GDPR Art 17) for personal data that may be encoded in model weights. ICO expects organisations to take reasonable steps to comply with erasure requests, considering technical feasibility. Consider retraining, unlearning techniques, or input/output filtering as mitigation measures.",
					priority: "important",
					legalBasis: "UK GDPR Article 17 / ICO AI Guidance",
					jurisdictions: ["uk"],
					estimatedEffort: "2-4 weeks",
					deadline: null,
				},
			);
		}

		// Security measures
		actions.push({
			id: "uk-security-measures",
			title: "Implement UK GDPR-compliant security measures for AI system",
			description:
				"Implement appropriate technical and organisational measures to ensure security of processing, including pseudonymisation, encryption, confidentiality, integrity, availability, resilience, and regular testing. For AI systems, consider model security, adversarial robustness, access controls, and data pipeline security.",
			priority: "important",
			legalBasis: "UK GDPR Article 32",
			jurisdictions: ["uk"],
			estimatedEffort: "2-6 weeks",
			deadline: null,
		});
	}

	// ─── AISI Frontier Model Actions ─────────────────────────────────────

	if (aisiTriggers.length > 0) {
		if (isFrontierModelProvider(ctx)) {
			actions.push(
				{
					id: "uk-aisi-safety-evaluation",
					title: "Submit frontier model for AISI safety evaluation",
					description:
						"Engage with the AI Safety Institute (AISI) for pre-deployment safety evaluation of the frontier model. AISI conducts evaluations assessing dangerous capabilities (CBRN, cyber, persuasion, deception), societal impact risks, and autonomous operation risks. While currently voluntary, frontier model developers are increasingly expected to participate.",
					priority: "critical",
					legalBasis: "AISI Frontier Model Framework",
					jurisdictions: ["uk"],
					estimatedEffort: "4-8 weeks",
					deadline: null,
				},
				{
					id: "uk-aisi-pre-deployment-testing",
					title: "Conduct pre-deployment safety testing aligned with AISI protocols",
					description:
						"Conduct pre-deployment safety testing following AISI evaluation protocols. This includes red-teaming for dangerous capabilities, adversarial testing, bias evaluation, and assessment of potential for misuse. Document testing methodology, results, and mitigations.",
					priority: "critical",
					legalBasis: "AISI Frontier Model Framework",
					jurisdictions: ["uk"],
					estimatedEffort: "4-8 weeks",
					deadline: null,
				},
				{
					id: "uk-aisi-safety-commitments",
					title: "Make and implement AISI safety commitments",
					description:
						"Establish and implement safety commitments aligned with AISI expectations. These include: (1) safety testing before deployment, (2) responsible release practices, (3) incident reporting to AISI, (4) ongoing monitoring for emerging risks, (5) responsible capability scaling. These commitments are voluntary but increasingly expected for UK market access.",
					priority: "critical",
					legalBasis: "AISI Frontier Model Framework / Bletchley Declaration",
					jurisdictions: ["uk"],
					estimatedEffort: "2-4 weeks",
					deadline: null,
				},
			);
		}

		if (aisiTriggers.some((t) => t.id === "aisi-agentic-capability-evaluation")) {
			actions.push({
				id: "uk-aisi-agentic-assessment",
				title: "Conduct AISI-aligned agentic capability assessment",
				description:
					"Assess agentic capabilities of the frontier model system per AISI evaluation priorities. Evaluate risks of autonomous action including tool use misuse, uncontrolled behaviour, deception, resource acquisition, and self-replication. Implement appropriate guardrails including human checkpoints, action logging, kill switches, and scope limitations.",
				priority: "critical",
				legalBasis: "AISI Frontier Model Framework",
				jurisdictions: ["uk"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			});
		}
	}

	// ─── DSIT Foundation Model Actions ────────────────────────────────────

	if (dsitTriggers.length > 0) {
		actions.push({
			id: "uk-dsit-transparency-disclosure",
			title: "Implement DSIT foundation model transparency disclosures",
			description:
				"Align with DSIT foundation model transparency principles: disclose model capabilities and limitations, publish training data information, document known risks and biases, and provide clear guidance on intended uses and restrictions. These principles apply to both foundation model developers and deployers, with proportionate obligations.",
			priority: "important",
			legalBasis: "DSIT Foundation Model Taskforce Principles",
			jurisdictions: ["uk"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});

		if (
			ctx.productType === "foundation-model" ||
			ctx.generativeAiContext?.foundationModelSource === "self-trained"
		) {
			actions.push({
				id: "uk-dsit-safety-standards",
				title: "Implement DSIT foundation model safety standards",
				description:
					"Implement safety standards aligned with DSIT principles for foundation model developers: (1) conduct pre-deployment safety testing, (2) establish incident reporting mechanisms, (3) implement ongoing monitoring for emerging risks, (4) document and communicate safety measures to deployers and end-users.",
				priority: "important",
				legalBasis: "DSIT Foundation Model Taskforce Principles",
				jurisdictions: ["uk"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			});
		}
	}

	// ─── GenAI-Specific Actions ───────────────────────────────────────────

	if (isGenAiProduct(ctx) && !isFrontierModelProvider(ctx)) {
		actions.push({
			id: "uk-genai-content-disclosure",
			title: "Implement AI-generated content disclosure mechanisms",
			description:
				"Establish clear disclosure mechanisms for AI-generated content aligned with UK regulatory expectations. While not yet statutory, ICO guidance on transparency and DSIT principles expect clear labeling of AI-generated content. Implement metadata tagging, visible labeling, or watermarking as appropriate. Pay particular attention to synthetic media that could be mistaken for real content.",
			priority: "important",
			legalBasis: "ICO AI Guidance / DSIT Principles / Online Safety Act 2023",
			jurisdictions: ["uk"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	if (hasDeepfakeCapabilities(ctx)) {
		actions.push({
			id: "uk-deepfake-safeguards",
			title: "Implement deepfake and synthetic media safeguards",
			description:
				"Implement safeguards against misuse of deepfake/synthetic media capabilities. The Online Safety Act 2023 creates obligations for platforms hosting synthetic content. Developers must implement: (1) content provenance mechanisms, (2) user consent requirements for likeness generation, (3) clear synthetic media labeling, (4) misuse prevention measures. Consider C2PA content credentials integration.",
			priority: "critical",
			legalBasis: "Online Safety Act 2023 / ICO Guidance",
			jurisdictions: ["uk"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});
	}

	// ─── Agentic AI Actions (Existing Frameworks) ─────────────────────────

	if (isAgenticAi(ctx) && aisiTriggers.length === 0) {
		actions.push(
			{
				id: "uk-agentic-human-oversight",
				title: "Implement human oversight for agentic AI system",
				description:
					"Implement meaningful human oversight mechanisms for the agentic AI system. While the UK does not have a dedicated agentic AI framework, existing requirements apply: UK GDPR Article 22 safeguards for automated decisions, ICO guidance on human review, and general duty of care. Ensure human checkpoints for high-impact actions, implement kill switches, and maintain comprehensive action logging.",
				priority: "critical",
				legalBasis: "UK GDPR Article 22 / ICO AI Guidance / DSIT Principles",
				jurisdictions: ["uk"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "uk-agentic-action-logging",
				title: "Establish comprehensive audit logging for agent actions",
				description:
					"Implement comprehensive logging of all agentic AI actions to ensure accountability and enable investigation. Logs should include: timestamp, action type, action parameters, user context, approval status, outcome, and any human oversight events. Retain logs for a period aligned with UK GDPR accountability obligations.",
				priority: "important",
				legalBasis: "UK GDPR Article 5(2) (Accountability) / ICO Guidance",
				jurisdictions: ["uk"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	// ─── FCA Financial Services Actions ───────────────────────────────────

	if (fcaTriggers.length > 0) {
		actions.push({
			id: "uk-fca-fair-outcomes",
			title: "Demonstrate fair consumer outcomes from AI",
			description:
				"Conduct and document analysis demonstrating that AI systems produce fair outcomes for customers, aligned with FCA Principle 6 (fair treatment) and the Consumer Duty. Test for discriminatory outcomes across protected characteristics under the Equality Act 2010. Document methodology, results, and any remediation measures.",
			priority: "critical",
			legalBasis: "FCA Principles / Consumer Duty / Equality Act 2010",
			jurisdictions: ["uk"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});

		actions.push({
			id: "uk-fca-consumer-duty-ai",
			title: "Assess AI against FCA Consumer Duty requirements",
			description:
				"Assess the AI system against all four Consumer Duty outcomes: (1) products and services — ensure AI-driven products/services are designed to meet customer needs, (2) price and value — ensure AI pricing delivers fair value, (3) consumer understanding — ensure AI interactions are clear and not misleading, (4) consumer support — ensure customers can access help and resolve issues with AI decisions. Document compliance evidence for each outcome.",
			priority: "critical",
			legalBasis: "FCA Consumer Duty (PS22/9, FG22/5)",
			jurisdictions: ["uk"],
			estimatedEffort: "3-6 weeks",
			deadline: null,
		});

		if (fcaTriggers.some((t) => t.id === "fca-smcr-accountability")) {
			actions.push({
				id: "uk-fca-smcr-mapping",
				title: "Map SM&CR accountability for AI governance",
				description:
					"Identify and document which senior manager(s) under SM&CR are accountable for AI governance, including model risk management, bias testing, and consumer outcomes. Ensure the management responsibilities map covers AI decision-making. Provide adequate training to senior managers on AI risks relevant to their areas of responsibility.",
				priority: "critical",
				legalBasis: "SM&CR / FCA SYSC 4",
				jurisdictions: ["uk"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-ai-explainability")) {
			actions.push({
				id: "uk-fca-explainability",
				title: "Implement AI explainability for regulated decisions",
				description:
					"Implement explainability mechanisms for AI-driven financial decisions. FCA expects firms to explain AI decisions to consumers (in plain language) and to regulators (with technical detail). Use model interpretability techniques (SHAP, LIME, or equivalent) to generate decision-level explanations. Document the explainability approach and its limitations.",
				priority: "critical",
				legalBasis: "FCA Principles / Consumer Duty",
				jurisdictions: ["uk"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-credit-ai")) {
			actions.push({
				id: "uk-fca-credit-fairness",
				title: "Conduct fair lending analysis for AI credit model",
				description:
					"Analyse the AI credit model for disparate impact across protected characteristics under the Equality Act 2010 (age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion, sex, sexual orientation). Ensure adverse action reasons are clear, specific, and meaningful. FCA Consumer Duty requires firms to deliver good outcomes — document evidence of fair outcomes.",
				priority: "critical",
				legalBasis: "FCA CONC / Consumer Duty / Equality Act 2010",
				jurisdictions: ["uk"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-insurance-ai")) {
			actions.push({
				id: "uk-fca-insurance-fairness",
				title: "Ensure fair value in AI insurance pricing",
				description:
					"Review AI-driven insurance pricing for compliance with FCA fair value requirements. Ensure AI pricing models do not unfairly discriminate, particularly against protected characteristics or vulnerable customers. Document how the AI pricing model delivers fair value to customers per the Consumer Duty's price and value outcome.",
				priority: "critical",
				legalBasis: "FCA ICOBS / Consumer Duty",
				jurisdictions: ["uk"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			});
		}

		if (fcaTriggers.some((t) => t.id === "fca-trading-ai")) {
			actions.push(
				{
					id: "uk-fca-algo-trading-controls",
					title: "Implement FCA algorithmic trading controls",
					description:
						"Implement required controls for AI-driven algorithmic trading: pre-trade risk controls, real-time monitoring, kill functionality, and post-trade surveillance. Conduct and document algorithm testing before deployment and after material changes. Maintain records of algorithmic trading activity. Notify the FCA of significant algorithmic trading activity.",
					priority: "critical",
					legalBasis: "FCA MAR 7A / MiFID II Implementation",
					jurisdictions: ["uk"],
					estimatedEffort: "4-8 weeks",
					deadline: null,
				},
				{
					id: "uk-fca-algo-testing",
					title: "Conduct AI trading algorithm testing and validation",
					description:
						"Test and validate AI trading algorithms in a controlled environment before deployment. Testing must cover market scenarios including stressed conditions. Document testing methodology, results, and any identified risks. Re-test after material changes to the algorithm.",
					priority: "critical",
					legalBasis: "FCA MAR 7A / MiFID II Algorithmic Trading",
					jurisdictions: ["uk"],
					estimatedEffort: "3-6 weeks",
					deadline: null,
				},
			);
		}

		// AI model risk governance for all financial services
		actions.push({
			id: "uk-fca-model-governance",
			title: "Establish AI model risk governance framework",
			description:
				"Implement an AI model risk governance framework aligned with FCA expectations: model inventory, model risk appetite, independent validation, ongoing monitoring, and documented change management. While the UK does not have a direct equivalent of US SR 11-7, PRA and FCA expect supervised firms to manage model risk proportionately. The Consumer Duty reinforces the need for governance ensuring good customer outcomes.",
			priority: "important",
			legalBasis: "FCA Principles / PRA Supervisory Statement / Consumer Duty",
			jurisdictions: ["uk"],
			estimatedEffort: "4-8 weeks",
			deadline: null,
		});
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(ctx: ProductContext, risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	notes.push(
		"UK AI regulation follows a principles-based, pro-innovation approach. There is no single UK AI Act equivalent. Obligations arise from existing laws (UK GDPR, Data Protection Act 2018, Equality Act 2010, sector-specific regulations) supplemented by regulatory guidance and frameworks.",
	);

	if (processesPersonalData(ctx)) {
		notes.push(
			"UK GDPR and the Data Protection Act 2018 have been in force since 1 January 2021 (post-Brexit transition). All data protection obligations apply immediately.",
		);
	}

	if (risk.level === "high" && isFrontierModelProvider(ctx)) {
		notes.push(
			"AISI frontier model safety evaluations have been operational since 2024. While currently voluntary, frontier model developers are strongly encouraged to participate. The UK government has signalled intent to move towards statutory AI safety requirements for the most powerful AI systems.",
		);
	}

	if (isFoundationModelProduct(ctx)) {
		notes.push(
			"DSIT foundation model principles were published in 2024. These are currently non-statutory but represent the UK government's expected standards for foundation model developers and deployers. They may form the basis of future legislation.",
		);
	}

	if (isFinancialServicesAi(ctx)) {
		notes.push(
			"FCA and PRA supervisory expectations for AI in financial services apply immediately to regulated firms. The FCA Consumer Duty came into force on 31 July 2023 for open products and 31 July 2024 for closed products, reinforcing outcomes-focused obligations relevant to AI use.",
		);
	}

	if (ctx.dataProcessed.includes("minor") || ctx.userPopulations.includes("minors")) {
		notes.push(
			"The ICO Age Appropriate Design Code (Children's Code) has been in force since 2 September 2021. Online services likely to be accessed by children must comply with all 15 standards.",
		);
	}

	if (processesPersonalData(ctx)) {
		notes.push(
			"NOTE: UK GDPR has diverged from EU GDPR in several areas. Key differences include: the UK has its own adequacy assessment process for international transfers (not governed by EU adequacy decisions), the ICO has issued UK-specific AI guidance that differs from EDPB guidance in emphasis, and the Data Protection and Digital Information Bill (if enacted) may create further divergence. Products targeting both UK and EU markets should assess compliance with each regime separately.",
		);
	}

	notes.push(
		"REGULATORY HORIZON: The UK AI regulatory landscape is actively evolving. The UK government's pro-innovation approach relies on existing regulators (ICO, FCA, CMA, Ofcom, MHRA) applying AI guidance through their existing mandates. However, there are ongoing consultations on whether a cross-cutting AI regulatory framework or AI authority is needed. Monitor UK government announcements and sector-specific regulator publications for developments.",
	);

	const aisiTriggers = getMatchingAisiTriggers(ctx);
	if (aisiTriggers.length > 0) {
		notes.push(
			"FRONTIER MODEL DEFINITION: AISI does not publish a formal threshold for 'frontier model' classification. In practice, frontier models are assessed based on: compute scale (generally >10^24 FLOPs training compute), novel capability evaluations, potential for dangerous capabilities (CBRN, cyber, persuasion), and whether the developer has engaged with AISI. The definition is evolving and may be formalised in future legislation.",
		);
	}

	const deadlines = [
		{
			date: "2021-01-01",
			description:
				"UK GDPR and Data Protection Act 2018 became the UK's domestic data protection framework following the end of the Brexit transition period.",
			provision: "UK GDPR / DPA 2018",
			isMandatory: true,
		},
		{
			date: "2021-09-02",
			description:
				"ICO Age Appropriate Design Code (Children's Code) came into force, requiring online services likely to be accessed by children to comply with 15 standards.",
			provision: "Children's Code",
			isMandatory: true,
		},
		{
			date: "2023-03-29",
			description:
				"UK government published its AI regulatory framework white paper (pro-innovation approach), setting out principles-based regulation through existing regulators.",
			provision: "AI Regulation White Paper",
			isMandatory: false,
		},
		{
			date: "2023-07-31",
			description:
				"FCA Consumer Duty came into force for new and existing open products and services, requiring firms to deliver good outcomes for retail customers.",
			provision: "FCA Consumer Duty",
			isMandatory: true,
		},
		{
			date: "2023-10-26",
			description:
				"Online Safety Act 2023 received Royal Assent. Creates obligations for platforms regarding harmful content including deepfakes and AI-generated content.",
			provision: "Online Safety Act 2023",
			isMandatory: true,
		},
		{
			date: "2023-11-01",
			description:
				"Bletchley Declaration on AI Safety signed. The UK AI Safety Institute (AISI) established to evaluate frontier AI model safety.",
			provision: "AISI / Bletchley Declaration",
			isMandatory: false,
		},
		{
			date: "2024-02-06",
			description:
				"UK government response to AI regulation white paper consultation. Confirmed principles-based approach through existing regulators with potential for statutory backing.",
			provision: "AI Regulation Framework",
			isMandatory: false,
		},
		{
			date: "2024-04-15",
			description:
				"DSIT foundation model taskforce principles published, setting transparency, accountability, and safety expectations for foundation model developers and deployers.",
			provision: "DSIT Foundation Model Principles",
			isMandatory: false,
		},
		{
			date: "2024-10-01",
			description:
				"FCA AI guidance published, setting out principles-based expectations for AI use in financial services, including fair treatment, bias avoidance, and explainability.",
			provision: "FCA AI Guidance",
			isMandatory: false,
		},
	];

	return {
		effectiveDate: "2021-01-01",
		deadlines,
		notes,
	};
}

// ─── UK Jurisdiction Module ───────────────────────────────────────────────

export const ukModule: JurisdictionModule = {
	id: "uk",
	name: "UK AI Regulatory Framework",
	jurisdiction: "uk",

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
	processesPersonalData,
	isFrontierModelProvider,
	isFoundationModelProduct,
	isGenAiProduct,
	isFinancialServicesAi,
	isAutomatedEmploymentDecision,
	hasDeepfakeCapabilities,
	isAgenticAi,
	getMatchingAisiTriggers,
	getMatchingDsitTriggers,
	getMatchingIcoTriggers,
	getMatchingFcaTriggers,
	AISI_TRIGGERS,
	DSIT_TRIGGERS,
	ICO_TRIGGERS,
	FCA_TRIGGERS,
};
