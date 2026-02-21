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

const LL144_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "ll144-aedt-hiring",
		name: "Automated Employment Decision Tool — Hiring",
		framework: "NYC Local Law 144",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			const isHiring =
				ctx.userPopulations.includes("job-applicants") ||
				desc.includes("hiring") ||
				desc.includes("recruit") ||
				desc.includes("resume screen") ||
				desc.includes("candidate screen") ||
				desc.includes("application screen");
			const hasImpact = ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return isHiring && hasImpact;
		},
	},
	{
		id: "ll144-aedt-promotion",
		name: "Automated Employment Decision Tool — Promotion",
		framework: "NYC Local Law 144",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			const isPromotion =
				ctx.userPopulations.includes("employees") &&
				(desc.includes("promot") ||
					desc.includes("advancement") ||
					desc.includes("performance evaluation"));
			const hasImpact = ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
			return isPromotion && hasImpact;
		},
	},
];

const GENAI_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "ny-genai-deepfake",
		name: "AI-Generated Deepfake Content",
		framework: "New York Deepfake Laws",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.canGenerateDeepfakes === true ||
			ctx.generativeAiContext?.canGenerateSyntheticVoice === true,
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingLl144Triggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return LL144_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function isAedt(ctx: ProductContext): boolean {
	return getMatchingLl144Triggers(ctx).length > 0;
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

// ─── Risk Classification ──────────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const ll144Triggers = getMatchingLl144Triggers(ctx);

	// NYC LL144: AEDTs require annual bias audit — highest compliance obligation
	if (ll144Triggers.length > 0) {
		return {
			level: "high",
			justification: `This AI system qualifies as an Automated Employment Decision Tool (AEDT) under NYC Local Law 144, triggering mandatory annual bias audit by an independent auditor and candidate/employee notification requirements. Applies to: ${ll144Triggers.map((t) => t.name).join("; ")}.`,
			applicableCategories: ll144Triggers.map((t) => t.id),
			provisions: ["NYC Local Law 144 (Int. 1894-2020)"],
		};
	}

	// Financial services AI
	if (isFinancialServicesAi(ctx)) {
		return {
			level: "limited",
			justification:
				"This AI system operates in financial services in New York. The NYDFS (New York Department of Financial Services) applies cybersecurity and consumer protection requirements to AI systems at regulated financial institutions.",
			applicableCategories: ["ny-financial-ai"],
			provisions: ["NYDFS Cybersecurity Regulation (23 NYCRR 500)"],
		};
	}

	// GenAI products
	if (isGenAiProduct(ctx)) {
		const genAiTriggers = GENAI_TRIGGERS.filter((t) => t.matchesContext(ctx));
		if (genAiTriggers.length > 0) {
			return {
				level: "limited",
				justification:
					"This AI system can generate synthetic media. New York has deepfake-related provisions addressing non-consensual intimate imagery and election interference.",
				applicableCategories: genAiTriggers.map((t) => t.id),
				provisions: ["New York Deepfake Laws"],
			};
		}
	}

	// General consumer-facing AI
	if (ctx.userPopulations.includes("consumers")) {
		return {
			level: "limited",
			justification:
				"This AI system is consumer-facing in New York. General consumer protection laws apply, including the New York General Business Law and potential NYDFS oversight for financial products.",
			applicableCategories: ["ny-consumer-protection"],
			provisions: ["NY General Business Law"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific New York regulatory obligations. NYC LL144 does not apply (not an automated employment decision tool), and no other specific AI triggers identified.",
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

	// NYC LL144 provisions
	if (isAedt(ctx)) {
		provisions.push(
			{
				id: "us-ny-ll144-bias-audit",
				law: "NYC Local Law 144",
				article: "Section 20-871(b)",
				title: "Annual Independent Bias Audit Requirement",
				summary:
					"An AEDT may not be used unless it has been the subject of a bias audit conducted no more than one year prior to the use. The audit must be conducted by an independent auditor and must test for impact ratios across sex/gender, race/ethnicity, and intersectional categories.",
				relevance:
					"This system is an AEDT subject to mandatory annual bias audit before use in NYC.",
			},
			{
				id: "us-ny-ll144-notice",
				law: "NYC Local Law 144",
				article: "Section 20-871(c)-(d)",
				title: "Candidate/Employee Notice Requirements",
				summary:
					"Employers/employment agencies must notify candidates/employees at least 10 business days before use of an AEDT. Notice must include: that an AEDT will be used, the job qualifications and characteristics the AEDT will assess, information about data retention, and instructions for requesting an alternative selection process or accommodation.",
				relevance:
					"This system requires candidate/employee notification at least 10 business days before AEDT use.",
			},
			{
				id: "us-ny-ll144-summary-publication",
				law: "NYC Local Law 144",
				article: "Section 20-871(b)(2)",
				title: "Bias Audit Summary Publication",
				summary:
					"The summary of the most recent bias audit, including the source and explanation of data used, the number of individuals assessed, and the impact ratio for each category, must be made publicly available on the employer's website.",
				relevance:
					"This AEDT requires public posting of bias audit results on the employer's website.",
			},
			{
				id: "us-ny-ll144-data-collection",
				law: "NYC Local Law 144",
				article: "Section 20-871(c)",
				title: "AEDT Data Collection Transparency",
				summary:
					"Employers must inform candidates/employees of the type of data collected by the AEDT, the data retention policy, and provide the ability to request that data collected be deleted. Notice must also indicate the data source and how data will be used.",
				relevance: "This AEDT must disclose data collection and retention practices.",
			},
		);
	}

	// GenAI provisions
	if (
		ctx.generativeAiContext?.canGenerateDeepfakes ||
		ctx.generativeAiContext?.canGenerateSyntheticVoice
	) {
		provisions.push({
			id: "us-ny-deepfake",
			law: "New York Deepfake Laws",
			article: "NY Penal Law / Civil Rights Law Amendments",
			title: "Synthetic Media and Deepfake Provisions",
			summary:
				"New York law addresses non-consensual intimate deepfake imagery and deceptive political deepfakes. Creation or distribution of such content may result in civil and criminal liability.",
			relevance:
				"This AI system can generate synthetic media, triggering New York deepfake provisions.",
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

	// NYC LL144: bias audit is the core artifact
	if (isAedt(ctx)) {
		artifacts.push(
			{
				type: "bias-audit",
				name: "NYC LL144 Independent Bias Audit",
				required: true,
				legalBasis: "NYC Local Law 144, Section 20-871(b)",
				description:
					"Annual independent bias audit of the AEDT testing for disparate impact across sex/gender categories, race/ethnicity categories, and intersectional categories. Must include selection/scoring rates, impact ratios, and be conducted within the past year.",
				templateId: "bias-audit-nyc",
			},
			{
				type: "transparency-notice",
				name: "NYC LL144 Candidate/Employee Notice",
				required: true,
				legalBasis: "NYC Local Law 144, Section 20-871(c)-(d)",
				description:
					"Written notice to candidates/employees at least 10 business days before AEDT use, including: AEDT will be used, qualifications assessed, data retention policy, alternative process request instructions, and bias audit summary availability.",
				templateId: "transparency-notice",
			},
		);
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

	// NYC LL144 actions
	if (isAedt(ctx)) {
		actions.push(
			{
				id: "us-ny-ll144-engage-auditor",
				title: "Engage independent auditor for LL144 bias audit",
				description:
					"Identify and engage an independent auditor to conduct the LL144 bias audit. The auditor must not be involved in the development, use, or provision of the AEDT. The audit must test impact ratios for sex/gender, race/ethnicity, and intersectional categories using either historical data or test data.",
				priority: "critical",
				legalBasis: "NYC Local Law 144, Section 20-871(b)",
				jurisdictions: ["us-ny"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "us-ny-ll144-conduct-audit",
				title: "Complete annual bias audit",
				description:
					"Conduct the LL144 bias audit calculating selection rates and impact ratios (scoring rates for scoring tools) for each category: sex categories, race/ethnicity categories, and intersectional categories of sex and race/ethnicity. Document results including the number of individuals assessed and the date of the audit.",
				priority: "critical",
				legalBasis: "NYC Local Law 144, Section 20-871(b)",
				jurisdictions: ["us-ny"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "us-ny-ll144-publish-results",
				title: "Publish bias audit summary on employer website",
				description:
					"Make the most recent bias audit summary publicly available on the employer's or employment agency's website, including the source and explanation of data used, the number of individuals the AEDT assessed, and the results including impact ratios for each category.",
				priority: "critical",
				legalBasis: "NYC Local Law 144, Section 20-871(b)(2)",
				jurisdictions: ["us-ny"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "us-ny-ll144-candidate-notice",
				title: "Implement 10-day advance candidate notification",
				description:
					"Implement a process to notify candidates and employees at least 10 business days before use of the AEDT. Notice must be provided via the job posting, the employer's website, or via US mail/email. Include: what the AEDT will assess, data collected and retention policy, and how to request alternatives or accommodations.",
				priority: "critical",
				legalBasis: "NYC Local Law 144, Section 20-871(c)-(d)",
				jurisdictions: ["us-ny"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "us-ny-ll144-data-deletion",
				title: "Implement AEDT data deletion process",
				description:
					"Implement a process for candidates/employees to request that data collected by the AEDT about them be deleted. Response must be provided within 30 days.",
				priority: "important",
				legalBasis: "NYC Local Law 144, Section 20-871(c)",
				jurisdictions: ["us-ny"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
		);
	}

	// GenAI/deepfake actions
	if (
		ctx.generativeAiContext?.canGenerateDeepfakes ||
		ctx.generativeAiContext?.canGenerateSyntheticVoice
	) {
		actions.push({
			id: "us-ny-deepfake-safeguards",
			title: "Implement deepfake safeguards for New York compliance",
			description:
				"Implement safeguards against creation and distribution of non-consensual intimate deepfakes and deceptive political deepfakes. Ensure AI-generated synthetic media is properly labelled and that consent mechanisms are in place for likeness use.",
			priority: "important",
			legalBasis: "New York Deepfake Laws",
			jurisdictions: ["us-ny"],
			estimatedEffort: "2-4 weeks",
			deadline: null,
		});
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	if (risk.applicableCategories.some((c) => c.includes("ll144"))) {
		notes.push(
			"NYC Local Law 144 has been in effect and enforced since July 5, 2023. AEDTs cannot be used in NYC without a completed bias audit from the past year and proper candidate notification. DCWP (Department of Consumer and Worker Protection) enforces with fines of $500 for first violation and $500-$1,500 for subsequent violations per day per AEDT.",
		);
	}

	return {
		effectiveDate: "2023-07-05",
		deadlines: [
			{
				date: "2023-07-05",
				description:
					"NYC Local Law 144 enforcement begins. All AEDTs used in NYC hiring or promotion must have a completed bias audit and provide candidate notice.",
				provision: "NYC Local Law 144",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── New York Jurisdiction Module ─────────────────────────────────────────

export const newYorkModule: JurisdictionModule = {
	id: "us-ny",
	name: "New York City Automated Employment Decision Tools Law (LL144)",
	jurisdiction: "us-ny",

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
	getMatchingLl144Triggers,
	isAedt,
	isGenAiProduct,
	isFinancialServicesAi,
	LL144_TRIGGERS,
	GENAI_TRIGGERS,
};
