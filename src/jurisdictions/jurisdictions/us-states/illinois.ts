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

const BIPA_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "bipa-biometric-collection",
		name: "Biometric Information Collection",
		framework: "BIPA (740 ILCS 14)",
		matchesContext: (ctx) => ctx.dataProcessed.includes("biometric"),
	},
	{
		id: "bipa-biometric-sale",
		name: "Sale/Disclosure of Biometric Information",
		framework: "BIPA (740 ILCS 14/15(c))",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.dataProcessed.includes("biometric") &&
				(desc.includes("share") ||
					desc.includes("sale") ||
					desc.includes("sell") ||
					desc.includes("third-party") ||
					desc.includes("disclose"))
			);
		},
	},
];

const EMPLOYMENT_AI_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "il-hra-ai-employment",
		name: "AI in Employment Decisions (Illinois Human Rights Act)",
		framework: "Illinois Human Rights Act (HRA) AI Amendment",
		matchesContext: (ctx) => {
			const isEmployment =
				ctx.userPopulations.includes("job-applicants") || ctx.userPopulations.includes("employees");
			const hasImpact = ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return isEmployment && hasImpact;
		},
	},
	{
		id: "il-aiaaa-video-interview",
		name: "AI Video Interview Act",
		framework: "Illinois AI Video Interview Act (820 ILCS 42)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.userPopulations.includes("job-applicants") &&
				(desc.includes("video interview") ||
					desc.includes("video analysis") ||
					(desc.includes("interview") && desc.includes("ai analysis")))
			);
		},
	},
];

const GENAI_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "il-genai-deepfake",
		name: "AI-Generated Deepfake Content",
		framework: "Illinois Deepfake Laws",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.canGenerateDeepfakes === true ||
			ctx.generativeAiContext?.canGenerateSyntheticVoice === true,
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingBipaTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return BIPA_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingEmploymentTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return EMPLOYMENT_AI_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingGenAiTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return GENAI_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function processesBiometricData(ctx: ProductContext): boolean {
	return ctx.dataProcessed.includes("biometric");
}

function isEmploymentAi(ctx: ProductContext): boolean {
	return (
		(ctx.userPopulations.includes("job-applicants") || ctx.userPopulations.includes("employees")) &&
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative")
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

// ─── Risk Classification ──────────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const bipaTriggers = getMatchingBipaTriggers(ctx);
	const employmentTriggers = getMatchingEmploymentTriggers(ctx);

	// BIPA: biometric data processing is the highest risk in Illinois
	if (bipaTriggers.length > 0) {
		return {
			level: "high",
			justification:
				"This AI system processes biometric data in Illinois, triggering the Biometric Information Privacy Act (BIPA). BIPA is the strictest biometric data law in the US with a private right of action and statutory damages of $1,000-$5,000 per violation. Compliance is mandatory before any biometric data collection.",
			applicableCategories: bipaTriggers.map((t) => t.id),
			provisions: ["BIPA (740 ILCS 14)"],
		};
	}

	// Employment AI: HRA AI amendment
	if (employmentTriggers.length > 0) {
		return {
			level: "high",
			justification:
				"This AI system is used in employment decisions in Illinois, triggering the Illinois Human Rights Act AI amendment. Employers using AI for employment decisions must ensure AI does not produce discriminatory outcomes based on protected classes.",
			applicableCategories: employmentTriggers.map((t) => t.id),
			provisions: employmentTriggers.map((t) => t.framework),
		};
	}

	// GenAI deepfake concerns
	const genAiTriggers = getMatchingGenAiTriggers(ctx);
	if (genAiTriggers.length > 0) {
		return {
			level: "limited",
			justification:
				"This AI system can generate synthetic media, which may be subject to Illinois deepfake and synthetic media disclosure requirements.",
			applicableCategories: genAiTriggers.map((t) => t.id),
			provisions: ["Illinois Deepfake Laws"],
		};
	}

	// General personal data
	if (
		ctx.dataProcessed.some(
			(d) =>
				d === "personal" ||
				d === "sensitive" ||
				d === "health" ||
				d === "financial" ||
				d === "location" ||
				d === "behavioral",
		) &&
		ctx.userPopulations.includes("consumers")
	) {
		return {
			level: "limited",
			justification:
				"This AI system processes personal data of Illinois consumers. General consumer protection obligations apply.",
			applicableCategories: ["il-consumer-data"],
			provisions: ["Illinois Consumer Privacy"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific Illinois regulatory obligations. No biometric data processing, employment AI decisions, or consumer data concerns identified.",
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

	// BIPA provisions
	if (processesBiometricData(ctx)) {
		provisions.push(
			{
				id: "us-il-bipa-consent",
				law: "BIPA",
				article: "740 ILCS 14/15(b)",
				title: "Written Consent Before Biometric Collection",
				summary:
					"Private entities must inform individuals in writing that biometric data is being collected or stored, the specific purpose, and the length of retention. Written consent must be obtained before collection.",
				relevance:
					"This AI system collects biometric data, requiring prior written consent under BIPA Section 15(b).",
			},
			{
				id: "us-il-bipa-retention",
				law: "BIPA",
				article: "740 ILCS 14/15(a)",
				title: "Biometric Data Retention and Destruction Policy",
				summary:
					"Entities possessing biometric data must develop a written, publicly available retention schedule and destruction guidelines. Data must be destroyed when the initial purpose is satisfied or within 3 years of last interaction, whichever comes first.",
				relevance:
					"This AI system stores biometric data, requiring a published retention and destruction policy.",
			},
			{
				id: "us-il-bipa-no-sale",
				law: "BIPA",
				article: "740 ILCS 14/15(c)",
				title: "Prohibition on Sale of Biometric Data",
				summary:
					"No private entity may sell, lease, trade, or otherwise profit from a person's biometric data.",
				relevance:
					"This AI system handles biometric data — any monetisation or sharing of biometric data is prohibited.",
			},
			{
				id: "us-il-bipa-security",
				law: "BIPA",
				article: "740 ILCS 14/15(e)",
				title: "Biometric Data Security",
				summary:
					"Biometric data must be stored, transmitted, and protected using the reasonable standard of care in the industry, and in a manner that is the same or more protective than other confidential and sensitive information.",
				relevance: "This AI system must apply industry-standard security to biometric data.",
			},
		);
	}

	// Employment AI provisions
	if (isEmploymentAi(ctx)) {
		provisions.push({
			id: "us-il-hra-ai",
			law: "Illinois Human Rights Act",
			article: "HRA AI Amendment",
			title: "AI in Employment Decisions — Non-Discrimination",
			summary:
				"Employers using AI for employment decisions must ensure the AI does not produce discriminatory outcomes based on protected classes (race, colour, religion, sex, national origin, ancestry, age, disability, marital status, military status, sexual orientation, pregnancy). The use of zip codes as a proxy for protected classes is prohibited.",
			relevance:
				"This AI system makes employment decisions in Illinois, requiring non-discrimination testing and compliance.",
		});
	}

	// AI Video Interview Act
	const videoTriggers = EMPLOYMENT_AI_TRIGGERS.filter(
		(t) => t.id === "il-aiaaa-video-interview" && t.matchesContext(ctx),
	);
	if (videoTriggers.length > 0) {
		provisions.push({
			id: "us-il-video-interview",
			law: "Illinois AI Video Interview Act",
			article: "820 ILCS 42",
			title: "AI Analysis of Video Interviews",
			summary:
				"Employers using AI to analyse video interviews must: (1) notify applicants that AI will be used, (2) explain how AI works and what characteristics it evaluates, (3) obtain consent before the interview. Employers must destroy videos within 30 days of applicant request. Sharing of video is restricted.",
			relevance:
				"This AI system analyses video interviews for employment purposes, triggering the AI Video Interview Act.",
		});
	}

	// GenAI provisions
	if (isGenAiProduct(ctx)) {
		const genAiTriggers = getMatchingGenAiTriggers(ctx);
		if (genAiTriggers.length > 0) {
			provisions.push({
				id: "us-il-deepfake-disclosure",
				law: "Illinois Deepfake Laws",
				article: "Illinois Criminal Code Amendments",
				title: "Synthetic Media and Deepfake Disclosure",
				summary:
					"Illinois law addresses deceptive synthetic media, particularly in the context of non-consensual intimate imagery and election interference. Creating or distributing deceptive deepfake content may result in criminal and civil liability.",
				relevance:
					"This AI system can generate synthetic media, triggering disclosure and consent obligations under Illinois deepfake provisions.",
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

	// BIPA biometric compliance
	if (processesBiometricData(ctx)) {
		artifacts.push(
			{
				type: "risk-assessment",
				name: "BIPA Compliance Assessment",
				required: true,
				legalBasis: "BIPA (740 ILCS 14)",
				description:
					"Assessment of biometric data collection, storage, use, and destruction practices for BIPA compliance. Must include written retention and destruction policy, consent mechanisms, and security measures.",
			},
			{
				type: "transparency-notice",
				name: "BIPA Biometric Data Notice",
				required: true,
				legalBasis: "BIPA 740 ILCS 14/15(b)",
				description:
					"Written notice to individuals that biometric data is being collected, the purpose of collection, and the retention period. Must be provided before any biometric data collection.",
				templateId: "transparency-notice",
			},
		);
	}

	// Employment AI bias audit
	if (isEmploymentAi(ctx)) {
		artifacts.push({
			type: "bias-audit",
			name: "Illinois Employment AI Bias Audit",
			required: true,
			legalBasis: "Illinois Human Rights Act AI Amendment",
			description:
				"Bias audit of AI system used in employment decisions, testing for discriminatory outcomes across Illinois-protected classes (race, colour, religion, sex, national origin, ancestry, age, disability, marital status, military status, sexual orientation, pregnancy).",
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

	if (risk.level === "minimal") return actions;

	// BIPA actions
	if (processesBiometricData(ctx)) {
		actions.push(
			{
				id: "us-il-bipa-consent-mechanism",
				title: "Implement BIPA written consent mechanism",
				description:
					"Implement a process to inform individuals in writing about biometric data collection, its purpose, and retention period, and obtain written consent BEFORE any biometric data is collected. Consent must be specific to biometric data — general terms of service are insufficient.",
				priority: "critical",
				legalBasis: "BIPA 740 ILCS 14/15(b)",
				jurisdictions: ["us-il"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "us-il-bipa-retention-policy",
				title: "Publish biometric data retention and destruction policy",
				description:
					"Develop and make publicly available a written policy establishing retention schedules and guidelines for permanently destroying biometric data when the initial purpose is satisfied or within 3 years of last interaction, whichever is earlier.",
				priority: "critical",
				legalBasis: "BIPA 740 ILCS 14/15(a)",
				jurisdictions: ["us-il"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "us-il-bipa-security",
				title: "Implement biometric data security measures",
				description:
					"Store, transmit, and protect biometric data using a reasonable standard of care, with protections equal to or greater than those applied to other confidential and sensitive information.",
				priority: "critical",
				legalBasis: "BIPA 740 ILCS 14/15(e)",
				jurisdictions: ["us-il"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "us-il-bipa-no-monetisation",
				title: "Ensure no sale or profit from biometric data",
				description:
					"Verify that biometric data is not sold, leased, traded, or otherwise monetised. Review all third-party data sharing arrangements to ensure compliance with BIPA Section 15(c) prohibition.",
				priority: "critical",
				legalBasis: "BIPA 740 ILCS 14/15(c)",
				jurisdictions: ["us-il"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
		);
	}

	// Employment AI actions
	if (isEmploymentAi(ctx)) {
		actions.push(
			{
				id: "us-il-hra-bias-testing",
				title: "Conduct employment AI bias testing for Illinois protected classes",
				description:
					"Test the AI system for discriminatory outcomes across all Illinois HRA protected classes: race, colour, religion, sex, national origin, ancestry, age (40+), disability, marital status, military status, sexual orientation, and pregnancy. Ensure zip codes are not used as proxies for protected classes.",
				priority: "critical",
				legalBasis: "Illinois Human Rights Act AI Amendment",
				jurisdictions: ["us-il"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "us-il-hra-notice",
				title: "Provide notice of AI use in employment decisions",
				description:
					"Inform applicants and employees that AI is being used in employment decisions, what data is being analysed, and how the AI factors into the decision-making process.",
				priority: "important",
				legalBasis: "Illinois Human Rights Act AI Amendment",
				jurisdictions: ["us-il"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
		);
	}

	// Video Interview Act actions
	const videoTriggers = EMPLOYMENT_AI_TRIGGERS.filter(
		(t) => t.id === "il-aiaaa-video-interview" && t.matchesContext(ctx),
	);
	if (videoTriggers.length > 0) {
		actions.push({
			id: "us-il-video-interview-compliance",
			title: "Implement AI Video Interview Act compliance",
			description:
				"Before using AI to analyse video interviews: (1) notify applicants of AI use, (2) explain how AI works and what characteristics it evaluates, (3) obtain applicant consent. Implement video destruction within 30 days of request. Restrict video sharing.",
			priority: "critical",
			legalBasis: "Illinois AI Video Interview Act (820 ILCS 42)",
			jurisdictions: ["us-il"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	// GenAI/deepfake actions
	if (
		ctx.generativeAiContext?.canGenerateDeepfakes ||
		ctx.generativeAiContext?.canGenerateSyntheticVoice
	) {
		actions.push({
			id: "us-il-deepfake-safeguards",
			title: "Implement deepfake safeguards for Illinois compliance",
			description:
				"Implement safeguards against the creation and distribution of deceptive synthetic media. Ensure AI-generated content is properly labelled and cannot be easily used for non-consensual intimate imagery or election interference.",
			priority: "important",
			legalBasis: "Illinois Deepfake Laws",
			jurisdictions: ["us-il"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	if (risk.level === "high" && risk.applicableCategories.some((c) => c.includes("bipa"))) {
		notes.push(
			"CRITICAL: BIPA has been in effect since 2008 with active enforcement. Private right of action allows individuals to sue directly. Statutory damages range from $1,000 (negligent) to $5,000 (intentional/reckless) per violation. Class action exposure is significant — settlements have exceeded $650 million (Facebook/Meta).",
		);
	}

	if (risk.applicableCategories.some((c) => c.includes("employment"))) {
		notes.push(
			"The Illinois Human Rights Act AI amendment is in effect. Employers must proactively test AI systems for discriminatory outcomes.",
		);
	}

	return {
		effectiveDate: "2008-10-03",
		deadlines: [
			{
				date: "2008-10-03",
				description:
					"BIPA enacted. All biometric data collection requires written consent and a published retention/destruction policy.",
				provision: "BIPA (740 ILCS 14)",
				isMandatory: true,
			},
			{
				date: "2020-01-01",
				description:
					"Illinois AI Video Interview Act took effect. Employers using AI to analyse video interviews must notify applicants, explain AI use, and obtain consent.",
				provision: "820 ILCS 42",
				isMandatory: true,
			},
			{
				date: "2026-01-01",
				description:
					"Illinois Human Rights Act AI amendment effective date. AI in employment decisions must not produce discriminatory outcomes.",
				provision: "Illinois HRA AI Amendment",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── Illinois Jurisdiction Module ─────────────────────────────────────────

export const illinoisModule: JurisdictionModule = {
	id: "us-il",
	name: "Illinois AI & Biometric Regulations (BIPA, HRA AI Amendment)",
	jurisdiction: "us-il",

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
	getMatchingBipaTriggers,
	getMatchingEmploymentTriggers,
	getMatchingGenAiTriggers,
	processesBiometricData,
	isEmploymentAi,
	isGenAiProduct,
	BIPA_TRIGGERS,
	EMPLOYMENT_AI_TRIGGERS,
	GENAI_TRIGGERS,
};
