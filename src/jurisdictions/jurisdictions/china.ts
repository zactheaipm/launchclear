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

// CAC Interim Measures for GenAI Services
const CAC_GENAI_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "cn-cac-genai-public",
		name: "Public-Facing GenAI Service",
		framework: "CAC Interim Measures for GenAI Services",
		matchesContext: (ctx) => {
			const isGenAi =
				ctx.generativeAiContext?.generatesContent === true ||
				ctx.productType === "generator" ||
				ctx.productType === "foundation-model";
			const isPublic =
				ctx.userPopulations.includes("consumers") || ctx.userPopulations.includes("general-public");
			return isGenAi && isPublic;
		},
	},
	{
		id: "cn-cac-genai-training-data",
		name: "GenAI Training Data Legality",
		framework: "CAC Interim Measures for GenAI Services",
		matchesContext: (ctx) =>
			(ctx.generativeAiContext?.usesFoundationModel === true ||
				ctx.generativeAiContext?.finetuningPerformed === true) &&
			ctx.trainingData.usesTrainingData,
	},
	{
		id: "cn-cac-genai-content-labeling",
		name: "AI-Generated Content Labeling",
		framework: "CAC Interim Measures for GenAI Services",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true || ctx.productType === "generator",
	},
	{
		id: "cn-cac-genai-content-review",
		name: "GenAI Content Review Obligation",
		framework: "CAC Interim Measures for GenAI Services",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true || ctx.productType === "generator",
	},
];

// Deep Synthesis Regulations
const DEEP_SYNTHESIS_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "cn-deep-synthesis-face",
		name: "Face Generation/Manipulation (Deep Synthesis)",
		framework: "Provisions on Deep Synthesis",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.canGenerateDeepfakes === true ||
			(ctx.generativeAiContext?.outputModalities.includes("image") === true &&
				ctx.generativeAiContext?.outputModalities.includes("video") === true),
	},
	{
		id: "cn-deep-synthesis-voice",
		name: "Voice Synthesis/Cloning (Deep Synthesis)",
		framework: "Provisions on Deep Synthesis",
		matchesContext: (ctx) => ctx.generativeAiContext?.canGenerateSyntheticVoice === true,
	},
	{
		id: "cn-deep-synthesis-text",
		name: "Text Generation (Deep Synthesis)",
		framework: "Provisions on Deep Synthesis",
		matchesContext: (ctx) =>
			ctx.generativeAiContext?.generatesContent === true &&
			ctx.generativeAiContext?.outputModalities.includes("text"),
	},
];

// Recommendation Algorithm Provisions
const RECOMMENDATION_TRIGGERS: readonly RegulatoryTrigger[] = [
	{
		id: "cn-recommendation-algo",
		name: "Recommendation Algorithm Service",
		framework: "Provisions on Recommendation Algorithms",
		matchesContext: (ctx) => {
			const desc = ctx.description.toLowerCase();
			return (
				ctx.productType === "recommender" ||
				desc.includes("recommend") ||
				desc.includes("personali") ||
				desc.includes("content feed") ||
				desc.includes("newsfeed") ||
				desc.includes("suggestion engine") ||
				desc.includes("ranking algorithm")
			);
		},
	},
];

// ─── Helper Functions ─────────────────────────────────────────────────────

function getMatchingCacGenAiTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return CAC_GENAI_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingDeepSynthesisTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return DEEP_SYNTHESIS_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function getMatchingRecommendationTriggers(ctx: ProductContext): readonly RegulatoryTrigger[] {
	return RECOMMENDATION_TRIGGERS.filter((t) => t.matchesContext(ctx));
}

function isPublicFacingGenAi(ctx: ProductContext): boolean {
	const isGenAi =
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model";
	const isPublic =
		ctx.userPopulations.includes("consumers") || ctx.userPopulations.includes("general-public");
	return isGenAi && isPublic;
}

function isDeepSynthesisProduct(ctx: ProductContext): boolean {
	return getMatchingDeepSynthesisTriggers(ctx).length > 0;
}

function isGenAiProduct(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true ||
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model"
	);
}

function isRecommendationSystem(ctx: ProductContext): boolean {
	return getMatchingRecommendationTriggers(ctx).length > 0;
}

function requiresAlgorithmFiling(ctx: ProductContext): boolean {
	return isPublicFacingGenAi(ctx) || isRecommendationSystem(ctx) || isDeepSynthesisProduct(ctx);
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
			d === "minor",
	);
}

// ─── Risk Classification ──────────────────────────────────────────────────

function classifyRisk(ctx: ProductContext): RiskClassification {
	const cacTriggers = getMatchingCacGenAiTriggers(ctx);
	const deepSynthesisTriggers = getMatchingDeepSynthesisTriggers(ctx);
	const recoTriggers = getMatchingRecommendationTriggers(ctx);

	const allCategories = [
		...cacTriggers.map((t) => t.id),
		...deepSynthesisTriggers.map((t) => t.id),
		...recoTriggers.map((t) => t.id),
	];

	// Public-facing GenAI: mandatory algorithm filing, content review, labeling
	if (cacTriggers.some((t) => t.id === "cn-cac-genai-public")) {
		return {
			level: "high",
			justification:
				"This is a public-facing generative AI service in China, triggering mandatory CAC algorithm filing, training data legality verification, content review obligations, AI-generated content labeling, user identity verification, and complaint mechanisms. Non-compliance can result in service suspension.",
			applicableCategories: allCategories,
			provisions: [
				"CAC Interim Measures for GenAI Services",
				...(deepSynthesisTriggers.length > 0 ? ["Provisions on Deep Synthesis"] : []),
			],
		};
	}

	// Deep synthesis capabilities (even without being public-facing GenAI service)
	if (deepSynthesisTriggers.length > 0) {
		return {
			level: "high",
			justification: `This AI system has deep synthesis capabilities (${deepSynthesisTriggers.map((t) => t.name).join("; ")}), triggering mandatory labeling, technology support provider obligations, and potential algorithm filing under China's deep synthesis regulations.`,
			applicableCategories: allCategories,
			provisions: ["Provisions on Deep Synthesis"],
		};
	}

	// Recommendation algorithms
	if (recoTriggers.length > 0) {
		return {
			level: "limited",
			justification:
				"This AI system uses recommendation algorithms, triggering algorithm filing requirements, user profiling transparency obligations, and opt-out mechanisms under China's recommendation algorithm provisions.",
			applicableCategories: recoTriggers.map((t) => t.id),
			provisions: ["Provisions on Recommendation Algorithms"],
		};
	}

	// Non-public GenAI (internal use)
	if (isGenAiProduct(ctx)) {
		return {
			level: "limited",
			justification:
				"This GenAI system is not public-facing but may still be subject to certain Chinese AI regulations depending on deployment scope. Internal-only GenAI has reduced obligations but training data legality verification may still apply.",
			applicableCategories: ["cn-internal-genai"],
			provisions: ["CAC Interim Measures for GenAI Services (limited)"],
		};
	}

	// Automated decisions affecting individuals
	if (
		(ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative") &&
		ctx.automationLevel === "fully-automated"
	) {
		return {
			level: "limited",
			justification:
				"This AI system makes automated decisions affecting individuals in China. General personal information protection obligations under PIPL may apply.",
			applicableCategories: ["cn-pipl-automated"],
			provisions: ["PIPL (Personal Information Protection Law)"],
		};
	}

	return {
		level: "minimal",
		justification:
			"This AI system does not trigger specific Chinese AI regulatory obligations. It is not a public-facing GenAI service, does not use deep synthesis technology, and does not employ recommendation algorithms.",
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

	// CAC GenAI Interim Measures
	const cacTriggers = getMatchingCacGenAiTriggers(ctx);
	if (cacTriggers.length > 0) {
		provisions.push(
			{
				id: "cn-cac-algorithm-filing",
				law: "CAC Interim Measures for GenAI Services",
				article: "Article 17",
				title: "Algorithm Filing with CAC",
				summary:
					"Public-facing GenAI service providers must file their algorithm with the Cyberspace Administration of China (CAC) through the Internet Information Service Algorithm Filing System within 10 working days of providing the service.",
				relevance:
					"This GenAI service must be filed with CAC before or within 10 working days of launch.",
			},
			{
				id: "cn-cac-training-data",
				law: "CAC Interim Measures for GenAI Services",
				article: "Article 7",
				title: "Training Data Legality Verification",
				summary:
					"GenAI providers must verify the legality of training data sources, ensure intellectual property rights are respected, obtain consent for personal information, and ensure training data does not contain content prohibited by Chinese law. Training data quality measures must be implemented.",
				relevance:
					"Training data used by this GenAI system must meet legality and quality requirements.",
			},
			{
				id: "cn-cac-content-review",
				law: "CAC Interim Measures for GenAI Services",
				article: "Articles 4, 9",
				title: "Content Review and Core Values Alignment",
				summary:
					"Generated content must adhere to socialist core values, must not subvert state power, endanger national security, damage national unity, promote terrorism, incite ethnic hatred, contain violence, obscenity, false information, or content prohibited by laws. Providers must establish content review mechanisms.",
				relevance:
					"This GenAI service must implement content review mechanisms ensuring generated content compliance with Chinese law.",
			},
			{
				id: "cn-cac-content-labeling",
				law: "CAC Interim Measures for GenAI Services",
				article: "Article 12",
				title: "Mandatory AI-Generated Content Labeling",
				summary:
					"All AI-generated content must be labelled/watermarked in accordance with relevant national standards. Labels must not be easily removable. This applies to text, images, audio, video, and other generated modalities.",
				relevance:
					"All content generated by this system must be labelled as AI-generated with non-removable watermarks.",
			},
			{
				id: "cn-cac-user-identity",
				law: "CAC Interim Measures for GenAI Services",
				article: "Article 11",
				title: "User Identity Verification",
				summary:
					"GenAI service providers must verify user identity through real-name registration in accordance with existing Chinese cybersecurity regulations.",
				relevance: "Users of this GenAI service must undergo real-name identity verification.",
			},
			{
				id: "cn-cac-complaint-mechanism",
				law: "CAC Interim Measures for GenAI Services",
				article: "Article 15",
				title: "Complaint and Reporting Mechanism",
				summary:
					"GenAI service providers must establish convenient complaint and reporting mechanisms, publicly disclose complaint channels, accept and process public complaints, and provide timely feedback.",
				relevance: "This GenAI service must have a user complaint and reporting mechanism.",
			},
			{
				id: "cn-cac-compliance-personnel",
				law: "CAC Interim Measures for GenAI Services",
				article: "Articles 17-18",
				title: "Compliance and Security Personnel Designation",
				summary:
					"GenAI service providers must designate dedicated compliance and security personnel responsible for overseeing content review, safety assessments, training data verification, user complaint handling, and incident response. Providers must accept supervision and inspection by relevant authorities and cooperate by providing necessary technical and data support for regulatory review.",
				relevance:
					"This GenAI service must designate compliance and security personnel and accept regulatory supervision.",
			},
		);
	}

	// Internal vs public deployment scope note
	if (isGenAiProduct(ctx) && !isPublicFacingGenAi(ctx)) {
		provisions.push({
			id: "cn-cac-internal-deployment-note",
			law: "CAC Interim Measures for GenAI Services",
			article: "General Scope",
			title: "Internal vs Public Deployment Scope",
			summary:
				"Note: CAC GenAI measures apply primarily to GenAI services provided to the public within China. Purely internal-use systems may have reduced obligations, but algorithm filing may still apply.",
			relevance:
				"This GenAI system appears to be non-public-facing. Obligations may be reduced but not eliminated — algorithm filing may still apply depending on deployment scope.",
		});
	}

	// Deep Synthesis Regulations
	const deepSynthesisTriggers = getMatchingDeepSynthesisTriggers(ctx);
	if (deepSynthesisTriggers.length > 0) {
		provisions.push(
			{
				id: "cn-deep-synthesis-labeling",
				law: "Provisions on Deep Synthesis",
				article: "Articles 16-17",
				title: "Deep Synthesis Content Labeling",
				summary:
					"Deep synthesis content (deepfakes, synthetic faces, cloned voices, generated video) must be clearly labelled in a manner that cannot be easily removed. Both visible labels and embedded metadata identifiers are required.",
				relevance:
					"This system generates deep synthesis content that must be labelled per Chinese regulation.",
			},
			{
				id: "cn-deep-synthesis-provider",
				law: "Provisions on Deep Synthesis",
				article: "Articles 6-10",
				title: "Deep Synthesis Provider Obligations",
				summary:
					"Technology support providers must implement content review, real-name registration for service users, records retention, and cooperation with regulatory inspections. Providers must not facilitate illegal deep synthesis content.",
				relevance:
					"This system provides deep synthesis technology capabilities, triggering provider obligations.",
			},
		);
	}

	// Recommendation Algorithm Provisions
	const recoTriggers = getMatchingRecommendationTriggers(ctx);
	if (recoTriggers.length > 0) {
		provisions.push(
			{
				id: "cn-reco-algo-filing",
				law: "Provisions on Recommendation Algorithms",
				article: "Article 24",
				title: "Recommendation Algorithm Filing",
				summary:
					"Providers of recommendation algorithm services with public opinion or social mobilisation capabilities must file with the Cyberspace Administration within 10 working days of providing the service.",
				relevance:
					"This recommendation system may require algorithm filing with Chinese authorities.",
			},
			{
				id: "cn-reco-algo-transparency",
				law: "Provisions on Recommendation Algorithms",
				article: "Articles 16-17",
				title: "Recommendation Algorithm Transparency",
				summary:
					"Users must be informed of the use of recommendation algorithms. Users must be provided with an option to turn off recommendation features. User profiling based on personal characteristics must be transparent.",
				relevance:
					"This recommendation system must provide transparency and opt-out mechanisms to users.",
			},
		);
	}

	// PIPL (Personal Information Protection Law)
	if (processesPersonalData(ctx)) {
		provisions.push(
			{
				id: "cn-pipl-lawful-basis",
				law: "PIPL (Personal Information Protection Law)",
				article: "Articles 13-14",
				title: "Lawful Basis for Personal Information Processing",
				summary:
					"PIPL requires a lawful basis for processing personal information of individuals in China. Unlike GDPR, legitimate interest is not a standalone basis — consent is the primary mechanism unless a specific exception applies (contract performance, HR management, public health emergency, news reporting, or publicly disclosed information). Consent must be informed, voluntary, and explicit.",
				relevance:
					"This AI system processes personal data of individuals in China. A lawful basis under PIPL must be established for each processing activity.",
			},
			{
				id: "cn-pipl-sensitive-pi",
				law: "PIPL (Personal Information Protection Law)",
				article: "Articles 28-32",
				title: "Sensitive Personal Information Protection",
				summary:
					"Processing sensitive personal information (biometric, religious, medical, financial, location, minors' data) requires separate consent, a specific and sufficient necessity justification, and a Personal Information Protection Impact Assessment (PIPIA). Processors must inform individuals of the necessity and impact on their rights.",
				relevance:
					"This AI system may process sensitive personal information, triggering enhanced PIPL protections.",
			},
			{
				id: "cn-pipl-cross-border",
				law: "PIPL (Personal Information Protection Law)",
				article: "Articles 38-43",
				title: "Cross-Border Data Transfer Requirements",
				summary:
					"Transferring personal information outside China requires one of: (a) passing a CAC security assessment (mandatory for critical information infrastructure operators or transfers exceeding 100,000 individuals' data or 10,000 individuals' sensitive data), (b) certification by a recognized body, or (c) Standard Contract filed with local CAC office. Separate consent for cross-border transfer is required.",
				relevance:
					"If this AI system transfers personal data outside China, PIPL cross-border transfer mechanisms must be established.",
			},
			{
				id: "cn-pipl-automated-decisions",
				law: "PIPL (Personal Information Protection Law)",
				article: "Article 24",
				title: "Automated Decision-Making Transparency",
				summary:
					"Where personal information is used for automated decision-making, organizations must ensure transparency and fairness of results. Individuals have the right to request an explanation and the right to refuse decisions made solely through automated processing that significantly affect their rights. Marketing or price differentiation via automated decisions must offer a non-personalized option.",
				relevance:
					"This AI system uses personal data for processing that may constitute automated decision-making under PIPL Article 24.",
			},
			{
				id: "cn-pipl-impact-assessment",
				law: "PIPL (Personal Information Protection Law)",
				article: "Article 55",
				title: "Personal Information Protection Impact Assessment",
				summary:
					"A Personal Information Protection Impact Assessment (PIPIA) is required before: processing sensitive personal information, using personal information for automated decision-making, entrusting processing to third parties, transferring personal information abroad, or any processing that may significantly affect individuals' rights. The assessment must evaluate legality, necessity, and risk mitigation measures.",
				relevance:
					"This AI system's processing activities likely require a PIPIA under PIPL Article 55.",
			},
		);
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

	// Algorithm filing document
	if (requiresAlgorithmFiling(ctx)) {
		artifacts.push({
			type: "risk-assessment",
			name: "China Algorithm Filing Document",
			required: true,
			legalBasis: "CAC Algorithm Filing Requirements",
			description:
				"Algorithm filing document for submission to CAC through the Internet Information Service Algorithm Filing System. Must include: algorithm name and description, application scenarios, service scope, technical principles, security assessment results, and intended purpose.",
			templateId: "china-algorithm-filing",
		});
	}

	// GenAI safety assessment
	if (isPublicFacingGenAi(ctx)) {
		artifacts.push(
			{
				type: "risk-assessment",
				name: "China GenAI Safety Assessment",
				required: true,
				legalBasis: "CAC Interim Measures for GenAI Services, Article 17",
				description:
					"Safety assessment of the GenAI service covering: training data legality, content generation safety, user protection measures, security measures, compliance with content requirements. Required before launch.",
				templateId: "china-genai-assessment",
			},
			{
				type: "genai-content-policy",
				name: "Content Review and Moderation Policy",
				required: true,
				legalBasis: "CAC Interim Measures for GenAI Services, Articles 4, 9",
				description:
					"Documented policy for content review and moderation of AI-generated outputs, ensuring compliance with Chinese content requirements including alignment with socialist core values and prohibition of unlawful content.",
			},
		);
	}

	// Deep synthesis labeling documentation
	if (isDeepSynthesisProduct(ctx)) {
		artifacts.push({
			type: "genai-content-policy",
			name: "Deep Synthesis Content Labeling Policy",
			required: true,
			legalBasis: "Provisions on Deep Synthesis, Articles 16-17",
			description:
				"Policy documenting the labeling and watermarking approach for deep synthesis content: visible labels, embedded metadata, non-removable identifiers, and compliance verification procedures.",
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

	// Algorithm filing
	if (requiresAlgorithmFiling(ctx)) {
		const filingStatus = ctx.generativeAiContext?.algorithmFilingStatus;
		const filingPriority: ActionRequirement["priority"] =
			filingStatus === "approved"
				? "recommended"
				: filingStatus === "filed"
					? "important"
					: "critical";
		const filingDescription =
			filingStatus === "approved"
				? "Algorithm filing with the CAC has been approved. Maintain filing currency: update the filing within 10 working days when material changes are made to the algorithm. Monitor for renewal requirements and annual reporting obligations."
				: filingStatus === "filed"
					? "Algorithm filing has been submitted to the CAC and is pending review (CAC review takes up to 30 working days). Monitor filing status and respond promptly to any CAC requests for supplementary materials."
					: "File the algorithm with the Cyberspace Administration of China (CAC) through the Internet Information Service Algorithm Filing System. Filing must be completed within 10 working days of providing the service. Required information includes: algorithm name, application scenarios, service scope, technical principles, and security self-assessment.";
		actions.push({
			id: "cn-algorithm-filing",
			title: "File algorithm with CAC",
			description: filingDescription,
			priority: filingPriority,
			legalBasis: "CAC Algorithm Filing Requirements",
			jurisdictions: ["china"],
			estimatedEffort: filingStatus === "approved" ? "ongoing" : "2-4 weeks",
			deadline: null,
		});
	}

	// CAC GenAI specific actions
	if (isPublicFacingGenAi(ctx)) {
		actions.push(
			{
				id: "cn-cac-training-data-verification",
				title: "Verify training data legality",
				description:
					"Verify the legality of all training data sources: ensure data was lawfully obtained, intellectual property rights are respected, consent was obtained for personal information, and no prohibited content is included. Implement training data quality management measures. Document verification results.",
				priority: "critical",
				legalBasis: "CAC Interim Measures for GenAI Services, Article 7",
				jurisdictions: ["china"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "cn-cac-content-review-mechanism",
				title: "Implement content review mechanism",
				description:
					"Establish a content review mechanism ensuring AI-generated content does not violate Chinese law, adheres to socialist core values, and does not contain prohibited content (content subverting state power, endangering national security, promoting terrorism, inciting ethnic hatred, violence, obscenity, or false information). Implement both automated and human review processes.",
				priority: "critical",
				legalBasis: "CAC Interim Measures for GenAI Services, Articles 4, 9",
				jurisdictions: ["china"],
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "cn-cac-content-labeling",
				title: "Implement mandatory AI-generated content labeling",
				description:
					"Label all AI-generated content (text, images, audio, video) with non-removable watermarks and identifiers per national standards. Both visible labels (user-facing) and embedded metadata (machine-readable) are required.",
				priority: "critical",
				legalBasis: "CAC Interim Measures for GenAI Services, Article 12",
				jurisdictions: ["china"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "cn-cac-user-identity-verification",
				title: "Implement real-name user identity verification",
				description:
					"Implement real-name registration and identity verification for users of the GenAI service in compliance with Chinese cybersecurity regulations. Users must be verified before accessing GenAI capabilities.",
				priority: "critical",
				legalBasis: "CAC Interim Measures for GenAI Services, Article 11",
				jurisdictions: ["china"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "cn-cac-complaint-mechanism",
				title: "Establish complaint and reporting mechanism",
				description:
					"Establish convenient complaint and reporting channels, publicly disclose contact information, accept and process public complaints in a timely manner, and provide feedback to complainants.",
				priority: "important",
				legalBasis: "CAC Interim Measures for GenAI Services, Article 15",
				jurisdictions: ["china"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
			{
				id: "cn-cac-safety-assessment",
				title: "Conduct GenAI safety assessment",
				description:
					"Complete a safety assessment covering training data legality, content generation safety, user protection measures, security mechanisms, and compliance with content requirements. The assessment must be completed before service launch. Practical timeline: security assessments typically take 2-4 months. Begin well before planned service launch.",
				priority: "critical",
				legalBasis: "CAC Interim Measures for GenAI Services, Article 17",
				jurisdictions: ["china"],
				estimatedEffort: "8-16 weeks",
				deadline: null,
			},
			{
				id: "cn-safety-governance-committee",
				title: "Establish GenAI safety governance committee",
				description:
					"Designate compliance and security personnel per Articles 17-18. Establish a safety governance committee responsible for content review, training data verification, user complaint handling, and incident response.",
				priority: "critical",
				legalBasis: "CAC Interim Measures for GenAI Services Articles 17-18",
				jurisdictions: ["china"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	// Deep synthesis specific actions
	if (isDeepSynthesisProduct(ctx)) {
		actions.push(
			{
				id: "cn-deep-synthesis-labeling",
				title: "Implement deep synthesis content labeling",
				description:
					"Implement mandatory labeling for all deep synthesis outputs (face generation/manipulation, voice cloning, video synthesis). Labels must be clearly visible and embedded in metadata. Labels must not be easily removable by users.",
				priority: "critical",
				legalBasis: "Provisions on Deep Synthesis, Articles 16-17",
				jurisdictions: ["china"],
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "cn-deep-synthesis-records",
				title: "Maintain deep synthesis service records",
				description:
					"Maintain detailed records of deep synthesis service usage including: user identity information, service logs, generated content records. Records must be retained for at least 6 months and made available for regulatory inspection.",
				priority: "critical",
				legalBasis: "Provisions on Deep Synthesis, Articles 6-10",
				jurisdictions: ["china"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	// Recommendation algorithm actions
	if (isRecommendationSystem(ctx)) {
		actions.push(
			{
				id: "cn-reco-transparency",
				title: "Implement recommendation algorithm transparency",
				description:
					"Inform users of the use of recommendation algorithms. Display clear indicators that content or products are recommended via algorithms. Provide user-facing information about how recommendations are generated.",
				priority: "important",
				legalBasis: "Provisions on Recommendation Algorithms, Article 16",
				jurisdictions: ["china"],
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "cn-reco-opt-out",
				title: "Implement recommendation opt-out mechanism",
				description:
					"Provide users with a convenient option to turn off recommendation algorithm features entirely. Users must also be able to delete or modify their user tags/profiles used for personalisation.",
				priority: "important",
				legalBasis: "Provisions on Recommendation Algorithms, Article 17",
				jurisdictions: ["china"],
				estimatedEffort: "1-2 weeks",
				deadline: null,
			},
		);
	}

	// PIPL obligations (triggered when processing personal data of individuals in China)
	if (processesPersonalData(ctx)) {
		actions.push(
			{
				id: "china-pipl-consent",
				title: "Establish lawful basis for personal information processing under PIPL",
				description:
					"Under PIPL Articles 13-14, establish consent or other lawful basis for processing personal information of individuals in China. For AI systems, legitimate interest is not recognized — consent is the primary basis unless a specific exception applies (contract performance, HR management, public health emergency, news reporting, or publicly disclosed information).",
				jurisdictions: ["china"],
				legalBasis: "PIPL Articles 13-14",
				priority: "critical",
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
			{
				id: "china-pipl-sensitive-pi",
				title: "Implement enhanced protections for sensitive personal information",
				description:
					"Under PIPL Articles 28-32, processing sensitive personal information (biometric, religious, medical, financial, location, minors' data) requires separate consent, necessity justification, and a Personal Information Protection Impact Assessment.",
				jurisdictions: ["china"],
				legalBasis: "PIPL Articles 28-32",
				priority: "critical",
				estimatedEffort: "3-6 weeks",
				deadline: null,
			},
			{
				id: "china-pipl-cross-border",
				title: "Comply with cross-border data transfer requirements",
				description:
					"Under PIPL Articles 38-43, transferring personal information outside China requires one of: (a) passing a CAC security assessment (mandatory for critical information infrastructure operators or large-volume transfers), (b) certification by a recognized body, or (c) Standard Contract filed with local CAC office. Data localization may be required for certain data categories.",
				jurisdictions: ["china"],
				legalBasis: "PIPL Articles 38-43",
				priority: "critical",
				estimatedEffort: "4-8 weeks",
				deadline: null,
			},
			{
				id: "china-pipl-automated-decisions",
				title: "Provide transparency and opt-out for automated decision-making",
				description:
					"Under PIPL Article 24, where personal information is used for automated decision-making, the organization must ensure transparency and fairness. Individuals have the right to request an explanation of automated decisions and the right to refuse decisions made solely through automated processing that significantly affect their rights.",
				jurisdictions: ["china"],
				legalBasis: "PIPL Article 24",
				priority: "important",
				estimatedEffort: "2-4 weeks",
				deadline: null,
			},
		);
	}

	return actions;
}

// ─── Compliance Timeline ──────────────────────────────────────────────────

function buildTimeline(ctx: ProductContext, risk: RiskClassification): ComplianceTimeline {
	const notes: string[] = [];

	notes.push(
		"China has the most prescriptive AI-specific regulations globally, with distinct laws for recommendation algorithms (2022), deep synthesis/deepfakes (2023), and generative AI (2023). All obligations are mandatory with enforcement by the Cyberspace Administration of China (CAC).",
	);

	if (isPublicFacingGenAi(ctx)) {
		notes.push(
			"CRITICAL: The CAC Interim Measures for GenAI Services have been in force since August 15, 2023. Algorithm filing, content review, training data verification, and output labeling are mandatory. Non-compliance may result in service suspension, fines, or referral for criminal investigation.",
		);
	}

	if (isDeepSynthesisProduct(ctx)) {
		notes.push(
			"Deep Synthesis regulations have been in force since January 10, 2023. All deep synthesis content must be labelled. Service providers must maintain usage records and cooperate with inspections.",
		);
	}

	if (isRecommendationSystem(ctx)) {
		notes.push(
			"Recommendation Algorithm provisions have been in force since March 1, 2022. Algorithm filing, user transparency, and opt-out mechanisms are required.",
		);
	}

	const filingStatus = ctx.generativeAiContext?.algorithmFilingStatus;
	if (filingStatus === "not-filed" && requiresAlgorithmFiling(ctx)) {
		notes.push(
			"WARNING: This service requires algorithm filing with CAC but has not yet been filed. Filing must be completed within 10 working days of providing the service. Operating without filing is a violation.",
		);
	}

	return {
		effectiveDate: "2022-03-01",
		deadlines: [
			{
				date: "2022-03-01",
				description:
					"Provisions on the Management of Algorithmic Recommendations took effect. Recommendation algorithm services must file with CAC and provide user transparency/opt-out.",
				provision: "Provisions on Recommendation Algorithms",
				isMandatory: true,
			},
			{
				date: "2023-01-10",
				description:
					"Provisions on the Management of Deep Synthesis took effect. Deep synthesis content must be labelled. Service providers have mandatory obligations.",
				provision: "Provisions on Deep Synthesis",
				isMandatory: true,
			},
			{
				date: "2023-08-15",
				description:
					"CAC Interim Measures for the Management of Generative AI Services took effect. Public-facing GenAI services must file with CAC, verify training data, implement content review, label outputs, and verify user identity.",
				provision: "CAC Interim Measures for GenAI Services",
				isMandatory: true,
			},
		],
		notes,
	};
}

// ─── China Jurisdiction Module ────────────────────────────────────────────

export const chinaModule: JurisdictionModule = {
	id: "china",
	name: "China AI Regulations (PIPL, CAC GenAI, Deep Synthesis, Recommendation Algorithms)",
	jurisdiction: "china",

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
	getMatchingCacGenAiTriggers,
	getMatchingDeepSynthesisTriggers,
	getMatchingRecommendationTriggers,
	isPublicFacingGenAi,
	isDeepSynthesisProduct,
	isGenAiProduct,
	isRecommendationSystem,
	requiresAlgorithmFiling,
	processesPersonalData,
	CAC_GENAI_TRIGGERS,
	DEEP_SYNTHESIS_TRIGGERS,
	RECOMMENDATION_TRIGGERS,
};
