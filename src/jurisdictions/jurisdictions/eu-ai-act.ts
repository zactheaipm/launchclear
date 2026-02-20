import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	GpaiClassification,
	JurisdictionModule,
	ProductContext,
	RiskClassification,
} from "../../core/types.js";

// ─── Annex III High-Risk Categories ───────────────────────────────────────

interface AnnexIIICategory {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const ANNEX_III_CATEGORIES: readonly AnnexIIICategory[] = [
	{
		id: "annex-iii-1-biometrics",
		name: "Biometrics",
		description:
			"Remote biometric identification, biometric categorisation, emotion recognition systems",
		matchesContext: (ctx) =>
			ctx.dataProcessed.includes("biometric") || isEmotionRecognitionSystem(ctx),
	},
	{
		id: "annex-iii-2-critical-infrastructure",
		name: "Critical Infrastructure",
		description:
			"Safety components in management/operation of critical digital infrastructure, road traffic, water/gas/heating/electricity supply",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("critical infrastructure") ||
				desc.includes("power grid") ||
				desc.includes("water supply") ||
				desc.includes("electricity") ||
				desc.includes("gas supply") ||
				desc.includes("road traffic") ||
				desc.includes("traffic management") ||
				desc.includes("digital infrastructure")
			);
		},
	},
	{
		id: "annex-iii-3-education",
		name: "Education and Vocational Training",
		description:
			"AI for determining access/admission to education, evaluating learning outcomes, assessing education level, monitoring students during tests",
		matchesContext: (ctx) =>
			ctx.userPopulations.includes("students") &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "annex-iii-4-employment",
		name: "Employment, Workers Management, Access to Self-Employment",
		description:
			"AI for recruitment/selection, job ad targeting, filtering applications, evaluating candidates, decisions on work terms, promotions, termination, task allocation, monitoring/evaluating worker performance",
		matchesContext: (ctx) =>
			(ctx.userPopulations.includes("job-applicants") ||
				ctx.userPopulations.includes("employees")) &&
			(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative"),
	},
	{
		id: "annex-iii-5-essential-services",
		name: "Access to Essential Private and Public Services",
		description:
			"AI for credit scoring/creditworthiness, risk assessment in life/health insurance, evaluating emergency calls, assessing eligibility for public benefits",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			const isCreditScoring =
				ctx.userPopulations.includes("credit-applicants") ||
				desc.includes("credit scor") ||
				desc.includes("creditworth");
			const isInsuranceRisk =
				(ctx.dataProcessed.includes("health") &&
					(desc.includes("insurance") || desc.includes("risk assessment"))) ||
				(desc.includes("life insurance") &&
					(desc.includes("risk") || desc.includes("pricing") || desc.includes("underwriting"))) ||
				(desc.includes("health insurance") &&
					(desc.includes("risk") || desc.includes("pricing") || desc.includes("underwriting"))) ||
				(desc.includes("insurance") &&
					(desc.includes("risk assessment") || desc.includes("risk pricing")) &&
					(desc.includes("life") || desc.includes("health")));
			const isInsurancePricing =
				ctx.sectorContext?.financialServices?.involvesInsurancePricing === true;
			const isEmergencyDispatch = desc.includes("emergency call");
			const isPublicBenefits =
				desc.includes("public benefit") ||
				desc.includes("public assistance") ||
				desc.includes("welfare") ||
				desc.includes("social benefit");
			return (
				isCreditScoring ||
				isInsuranceRisk ||
				isInsurancePricing ||
				isEmergencyDispatch ||
				isPublicBenefits
			);
		},
	},
	{
		id: "annex-iii-6-law-enforcement",
		name: "Law Enforcement",
		description:
			"AI for individual risk assessment in law enforcement, polygraphs, evidence reliability, victimisation risk, crime analytics",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("law enforcement") ||
				desc.includes("police") ||
				desc.includes("crime analytic") ||
				desc.includes("recidivism") ||
				(desc.includes("polygraph") && desc.includes("law enforcement"))
			);
		},
	},
	{
		id: "annex-iii-7-migration",
		name: "Migration, Asylum, and Border Control",
		description:
			"AI for examining asylum/visa/residence permit applications, risk assessments regarding irregular migration",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("asylum") ||
				desc.includes("migration") ||
				desc.includes("border control") ||
				desc.includes("visa application") ||
				desc.includes("residence permit")
			);
		},
	},
	{
		id: "annex-iii-8-justice",
		name: "Administration of Justice and Democratic Processes",
		description:
			"AI assisting judicial authorities in researching/interpreting facts and law, influencing election outcomes or voting behaviour",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("judicial") ||
				desc.includes("court") ||
				desc.includes("legal research") ||
				desc.includes("election") ||
				desc.includes("voting") ||
				desc.includes("democratic process")
			);
		},
	},
];

// ─── Prohibited Practice Checks ──────────────────────────────────────────

interface ProhibitedPractice {
	readonly id: string;
	readonly name: string;
	readonly article: string;
	readonly matchesContext: (ctx: ProductContext) => boolean;
}

const PROHIBITED_PRACTICES: readonly ProhibitedPractice[] = [
	{
		id: "art5-1c-social-scoring",
		name: "Social Scoring",
		article: "Article 5(1)(c)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("social scor") ||
				desc.includes("social credit") ||
				desc.includes("citizen score") ||
				(desc.includes("behaviour score") && desc.includes("social context"))
			);
		},
	},
	{
		id: "art5-1a-subliminal-manipulation",
		name: "Subliminal/Manipulative Techniques",
		article: "Article 5(1)(a)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("subliminal") ||
				(desc.includes("manipulat") && desc.includes("beyond") && desc.includes("consciousness"))
			);
		},
	},
	{
		id: "art5-1b-vulnerability-exploitation",
		name: "Exploitation of Vulnerabilities",
		article: "Article 5(1)(b)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("exploit") &&
				(desc.includes("vulnerab") || desc.includes("disability") || desc.includes("elderly")) &&
				desc.includes("distort")
			);
		},
	},
	{
		id: "art5-1d-predictive-policing",
		name: "Predictive Policing (Individual Risk Based on Profiling)",
		article: "Article 5(1)(d)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				(desc.includes("predict") && desc.includes("criminal") && desc.includes("profiling")) ||
				(desc.includes("predictive policing") && desc.includes("personality"))
			);
		},
	},
	{
		id: "art5-1e-facial-recognition-scraping",
		name: "Untargeted Facial Recognition Database Building",
		article: "Article 5(1)(e)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("facial recognition") &&
				(desc.includes("scraping") || desc.includes("untargeted") || desc.includes("scrape"))
			);
		},
	},
	{
		id: "art5-1f-workplace-emotion-recognition",
		name: "Emotion Recognition in Workplace/Education",
		article: "Article 5(1)(f)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			const isEmotionRecognition =
				desc.includes("emotion recognition") || desc.includes("emotion detect");
			const isWorkplaceOrEducation =
				ctx.userPopulations.includes("employees") || ctx.userPopulations.includes("students");
			const isMedicalOrSafety = desc.includes("medical") || desc.includes("safety");
			return isEmotionRecognition && isWorkplaceOrEducation && !isMedicalOrSafety;
		},
	},
	{
		id: "art5-1g-biometric-sensitive-categorisation",
		name: "Biometric Categorisation for Sensitive Attributes",
		article: "Article 5(1)(g)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.dataProcessed.includes("biometric") &&
				(desc.includes("race") ||
					desc.includes("political opinion") ||
					desc.includes("religion") ||
					desc.includes("sexual orientation") ||
					desc.includes("trade union"))
			);
		},
	},
	{
		id: "art5-1h-realtime-biometric-public",
		name: "Real-Time Remote Biometric Identification in Public Spaces",
		article: "Article 5(1)(h)",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				desc.includes("real-time") &&
				desc.includes("biometric identification") &&
				(desc.includes("public space") || desc.includes("public area"))
			);
		},
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function isEmotionRecognitionSystem(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	return (
		desc.includes("emotion recognition") ||
		desc.includes("emotion detect") ||
		desc.includes("sentiment analysis on face") ||
		desc.includes("facial emotion")
	);
}

function isChatbotOrConversationalAI(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	return (
		desc.includes("chatbot") ||
		desc.includes("conversational ai") ||
		desc.includes("virtual assistant") ||
		desc.includes("ai assistant") ||
		desc.includes("customer service ai") ||
		(ctx.productType === "generator" && desc.includes("interact"))
	);
}

function isDeepfakeSystem(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	return (
		desc.includes("deepfake") ||
		desc.includes("face swap") ||
		(ctx.productType === "generator" &&
			(desc.includes("generate image") ||
				desc.includes("generate video") ||
				desc.includes("generate audio") ||
				desc.includes("synthetic media")))
	);
}

function isLimitedRiskSystem(ctx: ProductContext): boolean {
	return (
		isChatbotOrConversationalAI(ctx) || isDeepfakeSystem(ctx) || isEmotionRecognitionSystem(ctx)
	);
}

function passesSignificantRiskFilter(ctx: ProductContext): boolean {
	const desc = ctx.description.toLowerCase();
	const isNarrowProcedural = desc.includes("narrow procedural") || desc.includes("procedural task");
	const improvesHumanActivity = desc.includes("improves") && desc.includes("human");
	const detectsPatterns = desc.includes("detect pattern") && !desc.includes("replace");
	const isPreparatory = desc.includes("preparatory task");
	const doesProfiling = desc.includes("profiling") || desc.includes("profile");

	if (doesProfiling) {
		return true;
	}

	return !(isNarrowProcedural || improvesHumanActivity || detectsPatterns || isPreparatory);
}

function getMatchingAnnexIIICategories(ctx: ProductContext): readonly AnnexIIICategory[] {
	return ANNEX_III_CATEGORIES.filter((cat) => cat.matchesContext(ctx));
}

function getMatchingProhibitedPractices(ctx: ProductContext): readonly ProhibitedPractice[] {
	return PROHIBITED_PRACTICES.filter((p) => p.matchesContext(ctx));
}

// ─── Risk Classification Logic ────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	// Step 1: Check for prohibited practices
	const prohibited = getMatchingProhibitedPractices(ctx);
	if (prohibited.length > 0) {
		return {
			level: "unacceptable",
			justification: `This AI system matches prohibited practice(s) under Article 5 of the EU AI Act: ${prohibited.map((p) => p.name).join(", ")}. These practices are banned in the EU regardless of safeguards.`,
			applicableCategories: prohibited.map((p) => p.id),
			provisions: prohibited.map((p) => p.article),
		};
	}

	// Step 2: Check for Annex III high-risk categories
	const annexIIIMatches = getMatchingAnnexIIICategories(ctx);
	if (annexIIIMatches.length > 0) {
		// Apply the Article 6(3) significant risk filter
		if (!passesSignificantRiskFilter(ctx)) {
			return {
				level: "minimal",
				justification:
					"This AI system falls within an Annex III category but does not pose a significant risk of harm under Article 6(3). It performs a narrow procedural task, improves a previously completed human activity, detects patterns without replacing human assessment, or performs a preparatory task.",
				applicableCategories: annexIIIMatches.map((c) => c.id),
				provisions: ["Article 6(3)"],
			};
		}

		return {
			level: "high",
			justification: `This AI system falls within Annex III high-risk category: ${annexIIIMatches.map((c) => c.name).join(", ")}. It must comply with requirements under Articles 8-15.`,
			applicableCategories: annexIIIMatches.map((c) => c.id),
			provisions: ["Article 6(2)", "Annex III", ...annexIIIMatches.map((c) => c.id)],
		};
	}

	// Step 3: Check for limited-risk (transparency obligations)
	if (isLimitedRiskSystem(ctx)) {
		return {
			level: "limited",
			justification:
				"This AI system has transparency obligations under Articles 50-52 of the EU AI Act. Users must be informed they are interacting with an AI system, and/or AI-generated content must be labelled.",
			applicableCategories: [
				...(isChatbotOrConversationalAI(ctx) ? ["chatbot-disclosure"] : []),
				...(isDeepfakeSystem(ctx) ? ["deepfake-labeling"] : []),
				...(isEmotionRecognitionSystem(ctx) ? ["emotion-recognition-disclosure"] : []),
			],
			provisions: ["Article 50"],
		};
	}

	// Step 4: Minimal risk (default)
	return {
		level: "minimal",
		justification:
			"This AI system does not fall into the prohibited, high-risk, or limited-risk categories under the EU AI Act. No mandatory requirements apply beyond voluntary codes of conduct.",
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

	if (risk.level === "unacceptable") {
		provisions.push({
			id: "eu-ai-act-art5",
			law: "EU AI Act",
			article: "Article 5",
			title: "Prohibited AI Practices",
			summary:
				"This AI system falls under a prohibited practice and cannot be placed on the EU market or used within the EU.",
			relevance: "The system's intended purpose matches one or more prohibited use cases.",
		});
	}

	if (risk.level === "high") {
		provisions.push(
			{
				id: "eu-ai-act-art6",
				law: "EU AI Act",
				article: "Articles 6-7",
				title: "High-Risk Classification",
				summary: "This AI system is classified as high-risk under Annex III of the EU AI Act.",
				relevance: risk.justification,
			},
			{
				id: "eu-ai-act-art9",
				law: "EU AI Act",
				article: "Article 9",
				title: "Risk Management System",
				summary:
					"A continuous risk management system must be established, identifying and mitigating risks throughout the lifecycle.",
				relevance: "Required for all high-risk AI systems under Article 9.",
			},
			{
				id: "eu-ai-act-art10",
				law: "EU AI Act",
				article: "Article 10",
				title: "Data and Data Governance",
				summary:
					"Training, validation, and testing datasets must meet quality criteria including relevance, representativeness, and bias examination.",
				relevance: "Required for all high-risk AI systems under Article 10.",
			},
			{
				id: "eu-ai-act-art11",
				law: "EU AI Act",
				article: "Article 11",
				title: "Technical Documentation",
				summary:
					"Technical documentation must be drawn up before the system is placed on the market.",
				relevance: "Required for all high-risk AI systems under Article 11.",
			},
			{
				id: "eu-ai-act-art12",
				law: "EU AI Act",
				article: "Article 12",
				title: "Record-Keeping",
				summary:
					"The system must automatically record events (logs) with at least 6-month retention.",
				relevance: "Required for all high-risk AI systems under Article 12.",
			},
			{
				id: "eu-ai-act-art13",
				law: "EU AI Act",
				article: "Article 13",
				title: "Transparency and Information to Deployers",
				summary:
					"Instructions for use must be provided to deployers with system capabilities, limitations, and oversight measures.",
				relevance: "Required for all high-risk AI systems under Article 13.",
			},
			{
				id: "eu-ai-act-art14",
				law: "EU AI Act",
				article: "Article 14",
				title: "Human Oversight",
				summary:
					"The system must be designed for effective human oversight, including the ability to override, reverse, or stop the system.",
				relevance: "Required for all high-risk AI systems under Article 14.",
			},
			{
				id: "eu-ai-act-art15",
				law: "EU AI Act",
				article: "Article 15",
				title: "Accuracy, Robustness, and Cybersecurity",
				summary:
					"Appropriate levels of accuracy, robustness against errors, and cybersecurity must be ensured.",
				relevance: "Required for all high-risk AI systems under Article 15.",
			},
		);
	}

	if (risk.level === "limited" || isLimitedRiskSystem(ctx)) {
		provisions.push({
			id: "eu-ai-act-art50",
			law: "EU AI Act",
			article: "Articles 50-52",
			title: "Transparency Obligations",
			summary:
				"Users must be informed of AI interaction, AI-generated content must be labelled, and/or emotion recognition/biometric categorisation must be disclosed.",
			relevance:
				"This system has transparency obligations based on its interaction with natural persons or content generation capabilities.",
		});
	}

	return provisions;
}

// ─── Required Artifacts ───────────────────────────────────────────────────

function buildRequiredArtifacts(
	risk: RiskClassification,
	ctx: ProductContext,
): readonly ArtifactRequirement[] {
	const artifacts: ArtifactRequirement[] = [];

	if (risk.level === "high") {
		artifacts.push(
			{
				type: "risk-classification",
				name: "EU AI Act Risk Classification Report",
				required: true,
				legalBasis: "Articles 6-7, Annex III",
				description:
					"Document explaining the risk classification of the AI system, including the applicable Annex III category and why the system qualifies as high-risk.",
				templateId: "ai-act-risk-assessment",
			},
			{
				type: "conformity-assessment",
				name: "EU AI Act Conformity Assessment",
				required: true,
				legalBasis: "Articles 43-44",
				description:
					"Conformity assessment demonstrating compliance with Articles 8-15. For most Annex III systems, this is a self-assessment (internal control per Annex VI). Biometric identification systems require third-party assessment.",
				templateId: "ai-act-conformity",
			},
			{
				type: "risk-assessment",
				name: "Risk Management System Documentation",
				required: true,
				legalBasis: "Article 9",
				description:
					"Documentation of the risk management system covering identification, evaluation, and mitigation of risks throughout the AI system lifecycle.",
			},
			{
				type: "model-card",
				name: "Technical Documentation / Model Card",
				required: true,
				legalBasis: "Article 11",
				description:
					"Comprehensive technical documentation covering system description, development process, capabilities, limitations, and intended use.",
				templateId: "model-card",
			},
		);

		// Biometric systems need third-party conformity assessment
		if (ctx.dataProcessed.includes("biometric")) {
			artifacts.push({
				type: "conformity-assessment",
				name: "Third-Party Conformity Assessment (Notified Body)",
				required: true,
				legalBasis: "Article 43(1), Annex VII",
				description:
					"Biometric identification systems require conformity assessment by an independent notified body under Annex VII, rather than self-assessment.",
			});
		}
	}

	if (risk.level === "limited" || isLimitedRiskSystem(ctx)) {
		artifacts.push({
			type: "transparency-notice",
			name: "AI Transparency Notice",
			required: true,
			legalBasis: "Articles 50-52",
			description:
				"User-facing transparency notice informing individuals of AI interaction, AI-generated content, or emotion recognition/biometric categorisation.",
			templateId: "transparency-notice",
		});
	}

	if (risk.level === "unacceptable") {
		artifacts.push({
			type: "risk-classification",
			name: "EU AI Act Prohibition Analysis",
			required: true,
			legalBasis: "Article 5",
			description:
				"Analysis documenting why this AI system falls under a prohibited practice. This system CANNOT be placed on the EU market. This document should be used to explore redesign options or market exclusion.",
		});
	}

	return artifacts;
}

// ─── Required Actions ─────────────────────────────────────────────────────

function buildRequiredActions(
	risk: RiskClassification,
	ctx: ProductContext,
): readonly ActionRequirement[] {
	const actions: ActionRequirement[] = [];

	if (risk.level === "unacceptable") {
		actions.push({
			id: "eu-ai-act-stop-prohibited",
			title: "Do not deploy this AI system in the EU",
			description:
				"This AI system falls under a prohibited practice (Article 5). It cannot be placed on the EU market, put into service, or used within the EU. Consider redesigning the system to remove the prohibited characteristics or exclude the EU from target markets.",
			priority: "critical",
			legalBasis: "Article 5",
			jurisdictions: ["eu-ai-act"],
			deadline: null,
		});
		return actions;
	}

	if (risk.level === "high") {
		actions.push(
			{
				id: "eu-ai-act-risk-management",
				title: "Establish risk management system",
				description:
					"Implement a continuous, iterative risk management process covering identification, analysis, evaluation, and mitigation of risks. Must be maintained throughout the AI system lifecycle.",
				priority: "critical",
				legalBasis: "Article 9",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "4-8 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-data-governance",
				title: "Implement data governance and quality measures",
				description:
					"Ensure training, validation, and testing datasets meet quality criteria: relevance, representativeness, freedom from errors, completeness. Document design choices and conduct bias examination.",
				priority: "critical",
				legalBasis: "Article 10",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "4-12 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-technical-docs",
				title: "Prepare technical documentation",
				description:
					"Create comprehensive technical documentation covering system description, development process, monitoring capabilities, and compliance evidence. Must be completed before placing the system on the market.",
				priority: "critical",
				legalBasis: "Article 11",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "2-4 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-logging",
				title: "Implement automatic event logging",
				description:
					"Design the system to automatically record events (logs) throughout its lifetime, with at least 6-month retention. Logs must include usage periods, input data references, and human verification records.",
				priority: "critical",
				legalBasis: "Article 12",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "2-4 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-human-oversight",
				title: "Implement human oversight mechanisms",
				description:
					"Design effective human oversight including ability to understand system output, monitor for automation bias, override or reverse decisions, and stop the system. For biometric identification, require two persons to verify results.",
				priority: "critical",
				legalBasis: "Article 14",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "3-6 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-conformity-assessment",
				title: "Complete conformity assessment",
				description:
					"Undergo conformity assessment (self-assessment via Annex VI for most Annex III systems, or third-party assessment via Annex VII for biometric identification). Affix CE marking upon successful completion.",
				priority: "critical",
				legalBasis: "Articles 43-44",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "4-8 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-eu-database-registration",
				title: "Register in EU AI database",
				description:
					"Register the high-risk AI system in the EU database before placing it on the market or putting it into service.",
				priority: "critical",
				legalBasis: "Article 49",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "1-2 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-accuracy-robustness",
				title: "Validate accuracy, robustness, and cybersecurity",
				description:
					"Ensure and document appropriate levels of accuracy for the intended purpose, robustness against errors and adversarial inputs, and cybersecurity protections against exploitation.",
				priority: "important",
				legalBasis: "Article 15",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "3-6 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-post-market-monitoring",
				title: "Establish post-market monitoring system",
				description:
					"Set up a post-market monitoring system to collect and review performance and compliance data after deployment. Must include serious incident reporting procedures.",
				priority: "important",
				legalBasis: "Articles 72-73",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "2-4 weeks",
				deadline: "2026-08-02",
			},
			{
				id: "eu-ai-act-quality-management",
				title: "Implement quality management system",
				description:
					"Establish a quality management system covering compliance strategies, design and development control, testing procedures, data management, and resource allocation.",
				priority: "important",
				legalBasis: "Article 17",
				jurisdictions: ["eu-ai-act"],
				estimatedEffort: "4-8 weeks",
				deadline: "2026-08-02",
			},
		);
	}

	if (risk.level === "limited" || isLimitedRiskSystem(ctx)) {
		actions.push({
			id: "eu-ai-act-transparency-disclosure",
			title: "Implement transparency disclosures",
			description:
				"Ensure users are clearly informed they are interacting with an AI system (for chatbots/conversational AI), that content is AI-generated (for deepfakes/synthetic media), or that emotion recognition/biometric categorisation is in use.",
			priority: "critical",
			legalBasis: "Articles 50-52",
			jurisdictions: ["eu-ai-act"],
			estimatedEffort: "1-2 weeks",
			deadline: "2026-08-02",
		});
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(
	risk: RiskClassification,
	gpai?: GpaiClassification | undefined,
): ComplianceTimeline {
	const deadlines = [
		{
			date: "2025-02-02",
			description:
				"Prohibited AI practices (Article 5) become enforceable. Systems matching prohibited categories must cease EU operations.",
			provision: "Article 5",
			isMandatory: true,
		},
		{
			date: "2025-08-02",
			description:
				"Obligations for GPAI models apply. Transparency obligations for GPAI providers take effect.",
			provision: "Articles 51-56",
			isMandatory: true,
		},
		{
			date: "2026-08-02",
			description:
				"High-risk AI system obligations apply. All requirements under Articles 8-15, conformity assessment, EU database registration, and post-market monitoring must be in place.",
			provision: "Articles 6-49, 72-73",
			isMandatory: true,
		},
		{
			date: "2027-08-02",
			description:
				"High-risk AI systems covered by Annex I Union harmonisation legislation (product safety) must comply. Extended deadline for AI systems already on the market as components of products covered by Annex I legislation.",
			provision: "Article 6(1), Annex I",
			isMandatory: true,
		},
	];

	const notes: string[] = [];

	if (risk.level === "unacceptable") {
		notes.push(
			"CRITICAL: Prohibited practices have been enforceable since 2 February 2025. Immediate action required.",
		);
	}

	if (risk.level === "high") {
		notes.push(
			"High-risk system obligations apply from 2 August 2026. Plan conformity assessment and documentation well in advance.",
			"Post-market monitoring and serious incident reporting obligations also apply from August 2026.",
		);
	}

	if (risk.level === "limited") {
		notes.push("Transparency obligations for non-GPAI systems apply from 2 August 2026.");
	}

	if (gpai?.isGpai) {
		notes.push(
			"URGENT: GPAI model obligations under Articles 51-56 have been in force since 2 August 2025. Immediate compliance action required.",
		);
		if (gpai.hasSystemicRisk) {
			notes.push(
				"Systemic risk obligations (model evaluation, adversarial testing, risk assessment, incident reporting, cybersecurity) are also in force since 2 August 2025.",
			);
		}
	}

	return {
		effectiveDate: "2024-08-01",
		deadlines,
		notes,
	};
}

// ─── GPAI Classification Logic ────────────────────────────────────────────

const GPAI_DESCRIPTION_KEYWORDS = [
	"large language model",
	"llm",
	"foundation model",
	"general-purpose ai",
	"general purpose ai",
	"gpai",
	"generative ai",
	"multimodal model",
	"text generation model",
	"image generation model",
	"diffusion model",
	"transformer model",
	"pre-trained model",
	"pretrained model",
];

function isGpaiApplicable(ctx: ProductContext): boolean {
	// Explicit GPAI info provided
	if (ctx.gpaiInfo?.isGpaiModel) return true;

	// Product type is foundation-model
	if (ctx.productType === "foundation-model") return true;

	// Description-based detection
	const desc = ctx.description.toLowerCase();
	return GPAI_DESCRIPTION_KEYWORDS.some((kw) => desc.includes(kw));
}

function classifyGpai(ctx: ProductContext): GpaiClassification | undefined {
	if (!isGpaiApplicable(ctx)) return undefined;

	const gpai = ctx.gpaiInfo;
	const role = gpai?.gpaiRole ?? (ctx.productType === "foundation-model" ? "provider" : "deployer");
	const isOpenSource = gpai?.isOpenSource ?? false;

	const hasSystemicRisk =
		(gpai?.exceedsSystemicRiskThreshold ?? false) || (gpai?.commissionDesignated ?? false);

	const provisions: string[] = ["Article 51"];

	const isProvider = role === "provider" || role === "both";

	if (isProvider) {
		if (isOpenSource && !hasSystemicRisk) {
			// Open-source exemption: only copyright + training data summary
			provisions.push("Article 53(1)(c)", "Article 53(1)(d)", "Article 53(2)");
		} else {
			provisions.push(
				"Article 53(1)(a)",
				"Article 53(1)(b)",
				"Article 53(1)(c)",
				"Article 53(1)(d)",
			);
		}

		if (hasSystemicRisk) {
			provisions.push(
				"Article 55(1)(a)",
				"Article 55(1)(b)",
				"Article 55(1)(c)",
				"Article 55(1)(d)",
			);
		}
	}

	const justificationParts: string[] = [];
	justificationParts.push(`GPAI model role: ${role}.`);
	if (isOpenSource) justificationParts.push("Model is open-source.");
	if (hasSystemicRisk) {
		const reasons: string[] = [];
		if (gpai?.exceedsSystemicRiskThreshold) reasons.push("compute exceeds 10^25 FLOPs threshold");
		if (gpai?.commissionDesignated) reasons.push("designated by European Commission");
		justificationParts.push(`Systemic risk: ${reasons.join(", ")}.`);
	}

	return {
		isGpai: true,
		hasSystemicRisk,
		isOpenSource,
		role,
		justification: justificationParts.join(" "),
		provisions,
	};
}

function buildGpaiProvisions(gpai: GpaiClassification): readonly ApplicableProvision[] {
	const provisions: ApplicableProvision[] = [];
	const isProvider = gpai.role === "provider" || gpai.role === "both";

	provisions.push({
		id: "eu-ai-act-art51",
		law: "EU AI Act",
		article: "Article 51",
		title: "Classification of GPAI Models",
		summary:
			"This product involves a general-purpose AI model subject to GPAI obligations under the EU AI Act.",
		relevance: gpai.justification,
	});

	if (isProvider) {
		if (gpai.isOpenSource && !gpai.hasSystemicRisk) {
			provisions.push({
				id: "eu-ai-act-art53-2",
				law: "EU AI Act",
				article: "Article 53(2)",
				title: "Open-Source GPAI Exemption",
				summary:
					"Open-source GPAI models are exempt from technical documentation and downstream documentation obligations (Article 53(1)(a)-(b)), but must still comply with copyright and training data summary obligations.",
				relevance:
					"This model qualifies for the open-source exemption. Copyright compliance and training data summary are still required.",
			});
		} else {
			provisions.push({
				id: "eu-ai-act-art53",
				law: "EU AI Act",
				article: "Article 53",
				title: "GPAI Provider Obligations",
				summary:
					"GPAI model providers must maintain technical documentation, provide downstream documentation, comply with copyright law, and publish a training data summary.",
				relevance: "Required for all GPAI model providers under Article 53.",
			});
		}

		if (gpai.hasSystemicRisk) {
			provisions.push({
				id: "eu-ai-act-art55",
				law: "EU AI Act",
				article: "Article 55",
				title: "Systemic Risk Obligations",
				summary:
					"GPAI models with systemic risk must undergo model evaluation, adversarial testing, systemic risk assessment, incident reporting, and cybersecurity measures.",
				relevance:
					"This GPAI model has been identified as having systemic risk, triggering additional obligations under Article 55.",
			});
		}
	}

	return provisions;
}

function buildGpaiArtifacts(gpai: GpaiClassification): readonly ArtifactRequirement[] {
	const artifacts: ArtifactRequirement[] = [];
	const isProvider = gpai.role === "provider" || gpai.role === "both";

	if (isProvider) {
		// Open-source models without systemic risk skip tech docs and downstream docs
		if (!gpai.isOpenSource || gpai.hasSystemicRisk) {
			artifacts.push(
				{
					type: "gpai-technical-documentation",
					name: "GPAI Technical Documentation (Annex XI)",
					required: true,
					legalBasis: "Article 53(1)(a), Annex XI",
					description:
						"Technical documentation of the GPAI model including training and testing process, evaluation results, model architecture, compute resources, and capability limitations.",
				},
				{
					type: "model-card",
					name: "GPAI Downstream Documentation / Model Card",
					required: true,
					legalBasis: "Article 53(1)(b)",
					description:
						"Information and documentation for downstream AI system providers covering capabilities, limitations, intended uses, known risks, and integration guidance.",
					templateId: "model-card",
				},
			);
		}

		artifacts.push({
			type: "gpai-training-data-summary",
			name: "GPAI Training Data Summary",
			required: true,
			legalBasis: "Article 53(1)(d)",
			description:
				"Sufficiently detailed, publicly available summary of the content used for training the GPAI model, following the AI Office template.",
		});

		if (gpai.hasSystemicRisk) {
			artifacts.push({
				type: "gpai-systemic-risk-assessment",
				name: "GPAI Systemic Risk Assessment",
				required: true,
				legalBasis: "Article 55(1)(b)",
				description:
					"Assessment and mitigation plan for possible systemic risks at Union level, including risk sources from development, market placement, or use of the model.",
			});
		}
	}

	return artifacts;
}

function buildGpaiActions(gpai: GpaiClassification): readonly ActionRequirement[] {
	const actions: ActionRequirement[] = [];
	const isProvider = gpai.role === "provider" || gpai.role === "both";
	const isDeployer = gpai.role === "deployer" || gpai.role === "both";

	if (isProvider) {
		actions.push({
			id: "eu-ai-act-gpai-copyright",
			title: "Implement copyright compliance policy",
			description:
				"Put in place a policy to comply with EU copyright law, including identifying and respecting text and data mining opt-outs under Directive (EU) 2019/790 Article 4(3).",
			priority: "critical",
			legalBasis: "Article 53(1)(c)",
			jurisdictions: ["eu-ai-act"],
			estimatedEffort: "2-4 weeks",
			deadline: "2025-08-02",
		});

		actions.push({
			id: "eu-ai-act-gpai-training-summary",
			title: "Publish training data summary",
			description:
				"Draw up and make publicly available a sufficiently detailed summary of the content used for training the GPAI model, according to the AI Office template.",
			priority: "critical",
			legalBasis: "Article 53(1)(d)",
			jurisdictions: ["eu-ai-act"],
			estimatedEffort: "2-4 weeks",
			deadline: "2025-08-02",
		});

		if (!gpai.isOpenSource || gpai.hasSystemicRisk) {
			actions.push(
				{
					id: "eu-ai-act-gpai-tech-docs",
					title: "Prepare GPAI technical documentation",
					description:
						"Draw up and maintain technical documentation of the GPAI model covering training process, testing, evaluation results, model architecture, and capability limitations per Annex XI.",
					priority: "critical",
					legalBasis: "Article 53(1)(a)",
					jurisdictions: ["eu-ai-act"],
					estimatedEffort: "4-8 weeks",
					deadline: "2025-08-02",
				},
				{
					id: "eu-ai-act-gpai-downstream-docs",
					title: "Provide downstream documentation to integrators",
					description:
						"Make available information and documentation to downstream AI system providers to enable understanding of model capabilities, limitations, and compliance with their own obligations.",
					priority: "critical",
					legalBasis: "Article 53(1)(b)",
					jurisdictions: ["eu-ai-act"],
					estimatedEffort: "2-4 weeks",
					deadline: "2025-08-02",
				},
			);
		}

		if (gpai.hasSystemicRisk) {
			actions.push(
				{
					id: "eu-ai-act-gpai-model-evaluation",
					title: "Perform model evaluation with standardised protocols",
					description:
						"Conduct model evaluation in accordance with standardised protocols and tools reflecting the state of the art, including conducting and documenting adversarial testing.",
					priority: "critical",
					legalBasis: "Article 55(1)(a)",
					jurisdictions: ["eu-ai-act"],
					estimatedEffort: "4-8 weeks",
					deadline: "2025-08-02",
				},
				{
					id: "eu-ai-act-gpai-systemic-risk-assessment",
					title: "Assess and mitigate systemic risks",
					description:
						"Assess and mitigate possible systemic risks at Union level, including their sources, that may stem from the development, placement on market, or use of the GPAI model.",
					priority: "critical",
					legalBasis: "Article 55(1)(b)",
					jurisdictions: ["eu-ai-act"],
					estimatedEffort: "4-8 weeks",
					deadline: "2025-08-02",
				},
				{
					id: "eu-ai-act-gpai-incident-reporting",
					title: "Establish incident tracking and reporting",
					description:
						"Keep track of, document, and report serious incidents and possible corrective measures to the AI Office and national competent authorities.",
					priority: "critical",
					legalBasis: "Article 55(1)(c)",
					jurisdictions: ["eu-ai-act"],
					estimatedEffort: "2-4 weeks",
					deadline: "2025-08-02",
				},
				{
					id: "eu-ai-act-gpai-cybersecurity",
					title: "Ensure adequate cybersecurity for GPAI model",
					description:
						"Ensure an adequate level of cybersecurity protection for the GPAI model with systemic risk and its physical infrastructure.",
					priority: "critical",
					legalBasis: "Article 55(1)(d)",
					jurisdictions: ["eu-ai-act"],
					estimatedEffort: "4-8 weeks",
					deadline: "2025-08-02",
				},
			);
		}
	}

	if (isDeployer) {
		actions.push({
			id: "eu-ai-act-gpai-deployer-verify",
			title: "Verify GPAI provider compliance",
			description:
				"Verify that the upstream GPAI model provider has met their documentation and transparency obligations under Article 53. Request and review technical documentation and downstream integration guidance.",
			priority: "important",
			legalBasis: "Article 53(1)(b)",
			jurisdictions: ["eu-ai-act"],
			estimatedEffort: "1-2 weeks",
			deadline: "2025-08-02",
		});
	}

	return actions;
}

// ─── EU AI Act Jurisdiction Module ────────────────────────────────────────

export const euAiActModule: JurisdictionModule = {
	id: "eu-ai-act",
	name: "EU Artificial Intelligence Act",
	jurisdiction: "eu-ai-act",

	getApplicableProvisions(ctx: ProductContext): readonly ApplicableProvision[] {
		const risk = classifyRisk(ctx);
		const provisions = [...buildApplicableProvisions(ctx, risk)];
		const gpai = classifyGpai(ctx);
		if (gpai) provisions.push(...buildGpaiProvisions(gpai));
		return provisions;
	},

	getRequiredArtifacts(ctx: ProductContext): readonly ArtifactRequirement[] {
		const risk = classifyRisk(ctx);
		const artifacts = [...buildRequiredArtifacts(risk, ctx)];
		const gpai = classifyGpai(ctx);
		if (gpai) artifacts.push(...buildGpaiArtifacts(gpai));
		return artifacts;
	},

	getRequiredActions(ctx: ProductContext): readonly ActionRequirement[] {
		const risk = classifyRisk(ctx);
		const actions = [...buildRequiredActions(risk, ctx)];
		const gpai = classifyGpai(ctx);
		if (gpai) actions.push(...buildGpaiActions(gpai));
		return actions;
	},

	getRiskLevel(ctx: ProductContext): RiskClassification {
		return classifyRisk(ctx);
	},

	getTimeline(ctx: ProductContext): ComplianceTimeline {
		const risk = classifyRisk(ctx);
		const gpai = classifyGpai(ctx);
		return buildTimeline(risk, gpai);
	},

	getGpaiClassification(ctx: ProductContext): GpaiClassification | undefined {
		return classifyGpai(ctx);
	},
};

// ─── Exported Helpers (for testing) ───────────────────────────────────────

export {
	classifyRisk,
	classifyGpai,
	isGpaiApplicable,
	getMatchingAnnexIIICategories,
	getMatchingProhibitedPractices,
	isLimitedRiskSystem,
	isChatbotOrConversationalAI,
	isDeepfakeSystem,
	passesSignificantRiskFilter,
	ANNEX_III_CATEGORIES,
	PROHIBITED_PRACTICES,
};
