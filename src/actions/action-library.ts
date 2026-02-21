import type { ActionPriority } from "../core/types.js";

// ─── Action Categories ───────────────────────────────────────────────────

export type ActionCategory =
	| "data-governance"
	| "transparency"
	| "human-oversight"
	| "bias-testing"
	| "consent"
	| "monitoring"
	| "documentation"
	| "genai-content-safety"
	| "genai-labeling"
	| "genai-training-data"
	| "algorithm-filing"
	| "risk-management"
	| "security"
	| "registration"
	| "financial-compliance";

// ─── Action Library Entry ────────────────────────────────────────────────

export interface ActionLibraryEntry {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly category: ActionCategory;
	readonly jurisdictions: readonly string[];
	readonly legalBasis: string;
	readonly defaultPriority: ActionPriority;
	readonly estimatedEffort: string;
	readonly deadline?: string | null;
	readonly verificationCriteria: readonly string[];
	readonly bestPracticeRef?: string;
	readonly dependsOn?: readonly string[];
	readonly conflictsWith?: readonly string[];
}

// ─── Action Library ──────────────────────────────────────────────────────

const ACTION_LIBRARY: readonly ActionLibraryEntry[] = [
	// ── Data Governance ──────────────────────────────────────────────────

	{
		id: "data-governance-quality",
		title: "Implement data governance and quality measures",
		description:
			"Ensure training, validation, and testing datasets meet quality criteria: relevance, representativeness, freedom from errors, completeness. Document design choices and conduct bias examination of datasets.",
		category: "data-governance",
		jurisdictions: ["eu-ai-act", "eu-gdpr", "us-federal", "uk", "singapore", "brazil"],
		legalBasis: "EU AI Act Article 10, GDPR Article 5(1)(d), NIST AI RMF",
		defaultPriority: "critical",
		estimatedEffort: "4-12 weeks",
		verificationCriteria: [
			"Data quality metrics defined and documented",
			"Dataset documentation (datasheets or data cards) completed",
			"Bias examination of training data performed and recorded",
			"Data collection and labeling processes documented",
			"Data retention and deletion policies established",
		],
		bestPracticeRef: "data-governance",
	},
	{
		id: "data-governance-legal-basis",
		title: "Determine and document legal basis for data processing",
		description:
			"Identify and document the legal basis for each data processing purpose. For consent-based processing, implement freely given, specific, informed, and unambiguous consent mechanisms. For legitimate interests, conduct and document a Legitimate Interest Assessment.",
		category: "data-governance",
		jurisdictions: ["eu-gdpr", "uk", "brazil", "singapore"],
		legalBasis: "GDPR Articles 6-7, UK DPA 2018, LGPD Article 7, PDPA",
		defaultPriority: "critical",
		estimatedEffort: "1-2 weeks",
		verificationCriteria: [
			"Legal basis identified for each processing purpose",
			"Legitimate Interest Assessment completed where applicable",
			"Consent mechanisms implemented and tested",
			"Legal basis documented in records of processing activities",
		],
	},
	{
		id: "data-governance-transfers",
		title: "Establish valid cross-border data transfer mechanisms",
		description:
			"Implement appropriate transfer mechanisms for international data transfers: adequacy decisions, Standard Contractual Clauses, Binding Corporate Rules, or derogations. Conduct Transfer Impact Assessments where required.",
		category: "data-governance",
		jurisdictions: ["eu-gdpr", "uk", "brazil", "singapore", "china"],
		legalBasis: "GDPR Articles 44-49, UK IDTA, LGPD Chapter V, PDPA Transfer Rules",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Data flows mapped across jurisdictions",
			"Transfer mechanisms identified and implemented for each flow",
			"Transfer Impact Assessment completed where required",
			"Standard Contractual Clauses or equivalent executed",
		],
	},
	{
		id: "data-governance-records",
		title: "Maintain records of processing activities",
		description:
			"Maintain written records of data processing activities including purposes, categories of data subjects and personal data, recipients, transfers, retention periods, and technical and organisational security measures.",
		category: "data-governance",
		jurisdictions: ["eu-gdpr", "uk", "brazil"],
		legalBasis: "GDPR Article 30, UK DPA 2018, LGPD Article 37",
		defaultPriority: "important",
		estimatedEffort: "1-2 weeks",
		verificationCriteria: [
			"Records of processing activities document created",
			"All processing purposes and data categories catalogued",
			"Retention periods specified for each data category",
			"Records reviewed and updated at least annually",
		],
	},
	{
		id: "data-governance-dpia",
		title: "Conduct Data Protection Impact Assessment",
		description:
			"Conduct a DPIA before high-risk processing begins. Systematically describe the processing, assess necessity and proportionality, assess risks to data subject rights and freedoms, and identify measures to address those risks.",
		category: "data-governance",
		jurisdictions: ["eu-gdpr", "uk"],
		legalBasis: "GDPR Articles 35-36, UK ICO DPIA Guidance",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"DPIA document completed with all required sections",
			"Necessity and proportionality assessment documented",
			"Risks to data subjects identified and assessed",
			"Mitigation measures identified and implementation planned",
			"Supervisory authority consultation completed if residual risk remains high",
		],
		dependsOn: ["data-governance-legal-basis"],
	},
	{
		id: "data-governance-data-subject-rights",
		title: "Implement data subject rights mechanisms",
		description:
			"Enable data subjects to exercise their rights: access, rectification, erasure, restriction, portability, and objection. For AI systems, consider how these rights apply to automated processing and model training data.",
		category: "data-governance",
		jurisdictions: ["eu-gdpr", "uk", "brazil", "us-ca"],
		legalBasis: "GDPR Articles 12-23, LGPD Articles 17-21, CCPA/CPRA",
		defaultPriority: "critical",
		estimatedEffort: "3-6 weeks",
		verificationCriteria: [
			"Rights request intake mechanism implemented (web form, email, etc.)",
			"Response process documented with timelines (30 days GDPR, 45 days CCPA)",
			"Identity verification process for requestors established",
			"Automated processing data accessible for subject access requests",
			"Model training data erasure process documented (if applicable)",
		],
	},

	// ── Transparency ─────────────────────────────────────────────────────

	{
		id: "transparency-notice",
		title: "Prepare and publish transparency or privacy notice",
		description:
			"Provide transparent information to users and data subjects about AI processing: purposes, legal basis, data categories, retention periods, rights, and meaningful information about the logic involved in automated decision-making.",
		category: "transparency",
		jurisdictions: ["eu-ai-act", "eu-gdpr", "uk", "us-federal", "us-ca", "singapore", "brazil"],
		legalBasis: "EU AI Act Articles 50-52, GDPR Articles 13-14, CCPA §1798.100, LGPD Article 9",
		defaultPriority: "critical",
		estimatedEffort: "1-2 weeks",
		verificationCriteria: [
			"Privacy/transparency notice published and accessible",
			"AI involvement in decision-making clearly disclosed",
			"Data categories and processing purposes described",
			"User rights and exercise mechanisms explained",
			"Notice reviewed by legal counsel",
		],
	},
	{
		id: "transparency-ai-interaction",
		title: "Disclose AI interaction to users",
		description:
			"Ensure users are clearly informed they are interacting with an AI system. For chatbots and conversational AI, disclose the AI nature at the start of interaction. For emotion recognition or biometric categorisation, inform subjects.",
		category: "transparency",
		jurisdictions: ["eu-ai-act", "uk", "us-federal", "singapore", "china", "brazil"],
		legalBasis: "EU AI Act Article 50, China CAC GenAI Measures Article 5",
		defaultPriority: "critical",
		estimatedEffort: "1-2 weeks",
		verificationCriteria: [
			"AI interaction disclosure displayed before or at start of interaction",
			"Disclosure is clear, prominent, and understandable to target audience",
			"Disclosure mechanism tested with representative users",
		],
	},
	{
		id: "transparency-automated-decisions",
		title: "Implement automated decision-making transparency",
		description:
			"Provide meaningful information about the logic involved in automated decisions. Implement mechanisms for human intervention, contestability, and explanation of significant decisions affecting individuals.",
		category: "transparency",
		jurisdictions: ["eu-gdpr", "eu-ai-act", "uk", "us-federal", "brazil"],
		legalBasis: "GDPR Article 22, EU AI Act Article 14, LGPD Article 20",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Decision logic explanation mechanism implemented",
			"Human intervention pathway established for contested decisions",
			"Appeal or contestation process documented and accessible",
			"Explanations tested for understandability by non-technical users",
		],
	},

	// ── Human Oversight ──────────────────────────────────────────────────

	{
		id: "human-oversight-mechanisms",
		title: "Implement human oversight mechanisms",
		description:
			"Design effective human oversight including ability to understand system output, monitor for automation bias, override or reverse decisions, and stop the system. Ensure oversight is meaningful and not a rubber-stamp process.",
		category: "human-oversight",
		jurisdictions: ["eu-ai-act", "uk", "singapore", "us-federal"],
		legalBasis: "EU AI Act Article 14, Singapore IMDA Framework, NIST AI RMF",
		defaultPriority: "critical",
		estimatedEffort: "3-6 weeks",
		verificationCriteria: [
			"Human oversight roles and responsibilities defined",
			"Override and stop mechanisms implemented and tested",
			"Training programme for oversight personnel established",
			"Automation bias mitigation measures in place",
			"Oversight effectiveness periodically evaluated",
		],
		bestPracticeRef: "human-oversight",
	},
	{
		id: "human-oversight-agentic",
		title: "Implement human checkpoints for agentic AI actions",
		description:
			"Define and implement human approval checkpoints for autonomous AI actions, especially those with financial, legal, or safety implications. Implement kill switches, rollback capabilities, and action scope limits. Log all autonomous actions for audit.",
		category: "human-oversight",
		jurisdictions: ["singapore", "eu-ai-act", "uk", "us-federal"],
		legalBasis: "Singapore IMDA Agentic AI Framework, EU AI Act Article 14, NIST AI RMF",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Human approval checkpoints defined for high-impact actions",
			"Kill switch / emergency stop mechanism implemented and tested",
			"Action scope limits configured and enforced",
			"Rollback capability for autonomous actions verified",
			"All autonomous actions logged with timestamps and context",
			"Escalation procedures documented for unexpected agent behaviour",
		],
	},

	// ── Bias Testing ─────────────────────────────────────────────────────

	{
		id: "bias-testing-fairness",
		title: "Conduct bias and fairness testing",
		description:
			"Test AI system for discriminatory outcomes across protected characteristics (race, gender, age, disability, religion, national origin, etc.). Document methodology, metrics, results, and remediation steps. Repeat testing on a regular schedule.",
		category: "bias-testing",
		jurisdictions: [
			"eu-ai-act",
			"eu-gdpr",
			"us-federal",
			"us-new-york",
			"us-colorado",
			"us-illinois",
			"uk",
		],
		legalBasis:
			"EU AI Act Article 10, NYC LL144, Colorado AI Act, FTC Act Section 5, UK Equality Act 2010",
		defaultPriority: "critical",
		estimatedEffort: "3-8 weeks",
		verificationCriteria: [
			"Protected characteristics identified for testing",
			"Fairness metrics defined (demographic parity, equal opportunity, etc.)",
			"Testing methodology documented and repeatable",
			"Test results documented with disaggregated analysis",
			"Remediation plan for identified disparities",
			"Re-testing schedule established",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "bias-testing-eu-protected-groups",
		title: "Conduct EU AI Act bias testing across protected grounds",
		description:
			"Test AI system for bias across EU-recognised protected grounds: racial or ethnic origin, sex, disability, age, religion or belief, sexual orientation, and nationality. EU AI Act Article 10(2)(f) requires bias examination of training data. Testing methodology should align with emerging EU harmonised standards for AI bias assessment.",
		category: "bias-testing",
		jurisdictions: ["eu-ai-act", "eu-gdpr"],
		legalBasis: "EU AI Act Article 10(2)(f), EU Charter of Fundamental Rights",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		dependsOn: ["data-governance-quality"],
		verificationCriteria: [
			"Testing covers all EU Treaty-recognised protected grounds",
			"Bias metrics calculated with disaggregated analysis per protected ground",
			"Training data bias examination documented per Article 10(2)(f)",
			"Testing methodology aligns with emerging EU harmonised standards",
			"Results documented for conformity assessment evidence",
			"Remediation measures documented for identified disparities",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "bias-testing-uk-equality-act",
		title: "Conduct UK Equality Act protected characteristics bias testing",
		description:
			"Test AI system for discriminatory outcomes across all nine protected characteristics under the Equality Act 2010: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation. FCA Consumer Duty reinforces outcomes-focused testing for financial services AI.",
		category: "bias-testing",
		jurisdictions: ["uk"],
		legalBasis: "Equality Act 2010, UK GDPR, FCA Consumer Duty",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Testing covers all nine Equality Act 2010 protected characteristics",
			"Disparate impact analysis completed for each characteristic",
			"Intersectional analysis performed where data permits",
			"Testing methodology documented for ICO / FCA review",
			"Consumer outcomes analysis completed (if financial services)",
			"Remediation plan for identified disparities documented",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "bias-testing-cfpb-fair-lending",
		title: "Conduct CFPB-aligned fair lending AI testing",
		description:
			"Test AI credit models for disparate impact across ECOA protected classes: race, color, religion, national origin, sex, marital status, age, receipt of public assistance. Generate specific and accurate adverse action reason codes per Regulation B. CFPB has stated that 'black box' AI models do not excuse failure to provide specific reasons for adverse actions.",
		category: "bias-testing",
		jurisdictions: ["us-federal"],
		legalBasis: "ECOA, Regulation B, CFPB Circular 2022-03",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		dependsOn: ["financial-model-risk-governance"],
		verificationCriteria: [
			"Disparate impact testing completed across all ECOA protected classes",
			"Four-fifths (80%) rule analysis documented",
			"Adverse action reason codes generated and validated for specificity",
			"CFPB 'black box' model risk addressed — explainability approach documented",
			"Less discriminatory alternative analysis completed",
			"Testing methodology documented for regulatory examination",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "bias-testing-singapore-fairness",
		title: "Conduct Singapore Model AI Governance Framework fairness testing",
		description:
			"Test AI system for fairness aligned with Singapore's Model AI Governance Framework and PDPC guidelines. Testing should be proportionate to risk materiality. For financial services AI, align with MAS expectations on fairness in AI-driven decisions.",
		category: "bias-testing",
		jurisdictions: ["singapore"],
		legalBasis: "PDPC Model AI Governance Framework, MAS AI Risk Management Guidelines",
		defaultPriority: "important",
		estimatedEffort: "3-6 weeks",
		verificationCriteria: [
			"Fairness metrics selected appropriate to use case and context",
			"Testing proportionate to risk materiality level",
			"Results documented with consideration of Singapore's multi-ethnic context",
			"For financial services: MAS fairness expectations addressed",
			"AI Verify toolkit considered for structured testing",
			"Remediation measures documented for identified issues",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "bias-testing-colorado-ai-act",
		title: "Conduct Colorado AI Act algorithmic discrimination testing",
		description:
			"Test high-risk AI system for algorithmic discrimination as required by the Colorado AI Act (SB 205). Deployers of high-risk AI must conduct impact assessments and test for discrimination based on age, color, disability, ethnicity, genetic information, national origin, race, religion, sex, veteran status, or other protected classes under Colorado law.",
		category: "bias-testing",
		jurisdictions: ["us-colorado"],
		legalBasis: "Colorado AI Act (SB 21-169, SB 24-205)",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Impact assessment completed per Colorado AI Act requirements",
			"Testing covers all Colorado-recognised protected classes",
			"Risk management policy for algorithmic discrimination documented",
			"Consumer notification mechanisms for AI decisions implemented",
			"Testing results retained per Colorado record-keeping requirements",
			"Annual review cycle established for high-risk AI assessments",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "bias-audit-nyc",
		title: "Complete NYC LL144 bias audit for automated employment decisions",
		description:
			"Engage an independent auditor to conduct a bias audit of the automated employment decision tool. Audit must analyse selection rates and scoring for sex, race/ethnicity, and intersectional categories. Publish audit summary on company website.",
		category: "bias-testing",
		jurisdictions: ["us-new-york"],
		legalBasis: "NYC Local Law 144 (2021)",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "Annual — within one year of prior audit",
		verificationCriteria: [
			"Independent auditor engaged",
			"Bias audit completed within the past year",
			"Selection rate / scoring analysis for sex categories completed",
			"Selection rate / scoring analysis for race/ethnicity categories completed",
			"Intersectional analysis completed",
			"Audit summary published on company website",
			"Candidates notified of AEDT use at least 10 business days before use",
		],
		dependsOn: ["bias-testing-fairness"],
	},

	// ── Consent ──────────────────────────────────────────────────────────

	{
		id: "consent-collection",
		title: "Implement consent collection mechanisms",
		description:
			"Design and implement consent collection that meets jurisdictional requirements: freely given, specific, informed, unambiguous (GDPR); clear affirmative act; ability to withdraw consent easily; separate consent for different processing purposes.",
		category: "consent",
		jurisdictions: ["eu-gdpr", "uk", "brazil", "singapore", "us-ca"],
		legalBasis: "GDPR Article 7, LGPD Article 8, PDPA, CCPA/CPRA",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Consent forms drafted and reviewed by legal counsel",
			"Granular consent options provided for separate purposes",
			"Consent withdrawal mechanism implemented and accessible",
			"Consent records stored with timestamps and versions",
			"Pre-ticked boxes or bundled consent avoided",
		],
		bestPracticeRef: "consent-mechanisms",
		dependsOn: ["data-governance-legal-basis"],
	},
	{
		id: "consent-children",
		title: "Implement age verification and parental consent",
		description:
			"Implement age verification mechanisms and parental/guardian consent for processing children's data. Provide child-friendly privacy notices. Ensure age thresholds comply with applicable jurisdiction (13 US/COPPA, 13-16 EU/GDPR member states).",
		category: "consent",
		jurisdictions: ["eu-gdpr", "us-federal", "uk", "singapore"],
		legalBasis: "GDPR Article 8, COPPA, UK Age Appropriate Design Code",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Age verification mechanism implemented",
			"Parental consent flow implemented and tested",
			"Child-friendly privacy notice created",
			"Data minimisation applied for children's data",
			"Compliance with applicable age thresholds verified",
		],
	},

	// ── Monitoring ───────────────────────────────────────────────────────

	{
		id: "monitoring-post-deployment",
		title: "Establish post-deployment monitoring system",
		description:
			"Set up monitoring to collect and review AI system performance and compliance data after deployment. Track accuracy, fairness, drift, and safety metrics. Implement incident detection and serious incident reporting procedures.",
		category: "monitoring",
		jurisdictions: ["eu-ai-act", "uk", "singapore", "us-federal"],
		legalBasis: "EU AI Act Articles 72-73, NIST AI RMF Measure function, IMDA AI Governance",
		defaultPriority: "important",
		estimatedEffort: "3-6 weeks",
		verificationCriteria: [
			"Key performance metrics identified and tracked",
			"Drift detection mechanisms implemented",
			"Alert thresholds configured for performance degradation",
			"Incident reporting procedure documented",
			"Monitoring dashboard accessible to oversight personnel",
			"Re-validation triggers defined",
		],
		bestPracticeRef: "monitoring",
		dependsOn: ["documentation-technical"],
	},
	{
		id: "monitoring-logging",
		title: "Implement automatic event logging",
		description:
			"Design the system to automatically record events throughout its lifetime. Logs must include usage periods, input data references, human verification records, and decision outputs. Maintain logs for at least the required retention period.",
		category: "monitoring",
		jurisdictions: ["eu-ai-act", "singapore", "china"],
		legalBasis: "EU AI Act Article 12, China CAC GenAI Measures",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Event logging implemented for all AI system interactions",
			"Logs include timestamps, inputs, outputs, and decision rationale",
			"Log retention period meets jurisdictional requirements (6+ months EU)",
			"Log integrity protected against tampering",
			"Log access restricted to authorised personnel",
		],
	},

	// ── Documentation ────────────────────────────────────────────────────

	{
		id: "documentation-technical",
		title: "Prepare comprehensive technical documentation",
		description:
			"Create technical documentation covering system description, development process, data handling, monitoring capabilities, and compliance evidence. Must be completed before placing the system on the market.",
		category: "documentation",
		jurisdictions: ["eu-ai-act", "uk", "singapore"],
		legalBasis: "EU AI Act Article 11, Annex IV",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		deadline: "2026-08-02",
		verificationCriteria: [
			"System description and intended purpose documented",
			"Development process and design choices documented",
			"Data handling and governance documented",
			"Performance metrics and testing results documented",
			"Monitoring and update procedures documented",
			"Documentation reviewed and approved by responsible parties",
		],
	},
	{
		id: "documentation-model-card",
		title: "Create model card or system card",
		description:
			"Produce a model card documenting the AI model's intended uses, limitations, training data, performance metrics, ethical considerations, and recommended use conditions. Publish alongside the model or system.",
		category: "documentation",
		jurisdictions: ["eu-ai-act", "us-federal", "uk", "singapore"],
		legalBasis: "EU AI Act Article 53, NIST AI RMF, IMDA Guidelines",
		defaultPriority: "important",
		estimatedEffort: "1-2 weeks",
		verificationCriteria: [
			"Model card created with all required sections",
			"Intended use and out-of-scope use documented",
			"Training data summary included",
			"Performance metrics reported with disaggregated results",
			"Known limitations and failure modes documented",
		],
	},
	{
		id: "documentation-risk-management",
		title: "Establish risk management system",
		description:
			"Implement a continuous, iterative risk management process covering identification, analysis, evaluation, and mitigation of risks. Must be maintained throughout the AI system lifecycle.",
		category: "risk-management",
		jurisdictions: ["eu-ai-act", "us-federal", "uk", "singapore"],
		legalBasis: "EU AI Act Article 9, NIST AI RMF, IMDA AI Governance",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Risk identification process established",
			"Risk assessment methodology defined",
			"Risk register created and maintained",
			"Mitigation measures identified for each significant risk",
			"Risk review cycle established (at least annually)",
			"Residual risk assessment completed",
		],
	},
	{
		id: "documentation-conformity-assessment",
		title: "Complete conformity assessment",
		description:
			"Undergo conformity assessment for high-risk AI systems. Self-assessment via internal procedure (Annex VI) for most systems, or third-party assessment (Annex VII) for biometric identification. Affix CE marking upon completion.",
		category: "documentation",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Articles 43-44",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "2026-08-02",
		verificationCriteria: [
			"Conformity assessment procedure completed",
			"Quality management system established (Article 17)",
			"Technical documentation meets Annex IV requirements",
			"Declaration of conformity issued",
			"CE marking affixed",
			"Third-party notified body engaged (if biometric identification)",
		],
		dependsOn: ["documentation-technical", "documentation-risk-management"],
	},
	{
		id: "documentation-quality-management",
		title: "Implement quality management system",
		description:
			"Establish a quality management system covering compliance strategies, design and development control, testing procedures, data management, resource allocation, and accountability framework.",
		category: "documentation",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Article 17",
		defaultPriority: "important",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Quality management policy documented",
			"Design and development control procedures established",
			"Testing and verification procedures documented",
			"Non-conformity management process defined",
			"Accountability structure documented",
		],
	},

	// ── GenAI Content Safety ─────────────────────────────────────────────

	{
		id: "genai-content-safety-filters",
		title: "Implement content safety filters on AI-generated output",
		description:
			"Deploy content safety filters to prevent harmful, illegal, or policy-violating generated content. Use moderation APIs, custom classifiers, or human review for high-risk output categories. Test filters across diverse inputs and edge cases.",
		category: "genai-content-safety",
		jurisdictions: ["eu-ai-act", "china", "us-federal", "uk", "singapore", "brazil"],
		legalBasis: "EU AI Act Article 55, China CAC GenAI Measures Articles 4-7, FTC Act Section 5",
		defaultPriority: "critical",
		estimatedEffort: "3-6 weeks",
		verificationCriteria: [
			"Content safety filters deployed on all generation endpoints",
			"Harmful content categories defined and filter rules configured",
			"Filter effectiveness tested with adversarial and edge-case inputs",
			"False positive rate measured and acceptable",
			"Human review escalation process for borderline content established",
			"Filter bypass monitoring in place",
		],
		bestPracticeRef: "genai-content-safety",
	},
	{
		id: "genai-content-moderation-china",
		title: "Implement China-specific content moderation requirements",
		description:
			"Implement content review mechanisms as required by China CAC GenAI measures. Generated content must not incite subversion of state power, undermine national unity, promote terrorism, contain false information, or violate other legal content requirements.",
		category: "genai-content-safety",
		jurisdictions: ["china"],
		legalBasis: "CAC Interim Measures for GenAI Services Articles 4-7",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "Before providing GenAI services in China",
		verificationCriteria: [
			"Content review system implemented per CAC requirements",
			"Prohibited content categories from CAC measures addressed",
			"Content review results logged and retained",
			"Feedback and reporting mechanism available for users",
			"Regular content review audits conducted",
		],
	},

	// ── GenAI Labeling ───────────────────────────────────────────────────

	{
		id: "genai-labeling-content",
		title: "Implement AI-generated content labeling and watermarking",
		description:
			"Mark AI-generated content with machine-readable and/or human-visible indicators of its AI origin. Implement watermarking, metadata embedding, or content provenance mechanisms (C2PA). Different jurisdictions have different labeling requirements.",
		category: "genai-labeling",
		jurisdictions: ["eu-ai-act", "china", "us-federal", "us-ca", "uk", "singapore"],
		legalBasis: "EU AI Act Article 50, China CAC GenAI Measures Article 12, California SB 942",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"AI-generated content labeling mechanism implemented",
			"Machine-readable metadata embedded in generated content",
			"Human-visible disclosure for user-facing content",
			"Labeling persists through typical content distribution",
			"Compliance with jurisdiction-specific labeling format requirements verified",
		],
		bestPracticeRef: "genai-content-labeling",
	},
	{
		id: "genai-labeling-deepfake",
		title: "Implement deepfake and synthetic media disclosures",
		description:
			"For AI systems that can generate realistic synthetic media of real people (deepfakes), implement clear disclosure and labeling. Multiple jurisdictions have specific deepfake disclosure requirements with varying definitions and penalties.",
		category: "genai-labeling",
		jurisdictions: ["eu-ai-act", "china", "us-federal", "us-ca", "us-texas"],
		legalBasis:
			"EU AI Act Article 50(4), China Deep Synthesis Regulations, California AB 730/AB 602",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Deepfake content clearly labeled as AI-generated",
			"Disclosure mechanism visible before and during content consumption",
			"Metadata indicates synthetic origin of audio/video/image content",
			"Consent mechanism for use of real persons' likeness implemented",
			"Deepfake-specific terms of service provisions added",
		],
		dependsOn: ["genai-labeling-content"],
	},

	// ── GenAI Training Data ──────────────────────────────────────────────

	{
		id: "genai-training-data-copyright",
		title: "Establish training data copyright compliance",
		description:
			"Document training data sources and copyright status. Implement opt-out mechanisms for rights holders. For EU, provide sufficiently detailed summaries of copyrighted training data (AI Act Article 53(1)(c)). Maintain records of licensing arrangements.",
		category: "genai-training-data",
		jurisdictions: ["eu-ai-act", "us-federal", "uk", "china", "brazil"],
		legalBasis:
			"EU AI Act Article 53(1)(c), EU Copyright Directive Article 4, China CAC Measures Article 7",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Training data sources inventoried and documented",
			"Copyright status assessed for each data source",
			"Licensing arrangements documented where applicable",
			"Opt-out mechanism for rights holders implemented",
			"Copyright compliance summary prepared (EU AI Act requirement)",
			"Training data provenance chain documented",
		],
		bestPracticeRef: "training-data-compliance",
	},
	{
		id: "genai-training-data-disclosure",
		title: "Prepare training data disclosure documentation",
		description:
			"Create transparent documentation about training data: sources, collection methods, data categories, processing applied, and any personal data involved. Different jurisdictions require different levels of detail.",
		category: "genai-training-data",
		jurisdictions: ["eu-ai-act", "china", "brazil", "uk", "us-federal"],
		legalBasis: "EU AI Act Article 53, China CAC Measures Article 7, Brazil AI Bill",
		defaultPriority: "important",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Training data summary document created",
			"Data sources described with sufficient detail",
			"Processing and filtering methods documented",
			"Personal data handling in training documented",
			"Disclosure meets jurisdiction-specific requirements",
		],
	},
	{
		id: "genai-training-data-legality-china",
		title: "Verify training data legality for China market",
		description:
			"Verify the legality of training data sources as required by China CAC GenAI measures. Training data must be lawfully obtained, must not infringe intellectual property, and must not contain content prohibited by Chinese law.",
		category: "genai-training-data",
		jurisdictions: ["china"],
		legalBasis: "CAC Interim Measures for GenAI Services Article 7",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "Before providing GenAI services in China",
		verificationCriteria: [
			"Training data sources verified for lawful acquisition",
			"Intellectual property assessment completed",
			"Prohibited content screening of training data performed",
			"Data legality verification documentation maintained",
			"Training data quality assessment completed per CAC requirements",
		],
	},

	// ── Algorithm Filing ─────────────────────────────────────────────────

	{
		id: "algorithm-filing-china",
		title: "File algorithm with China CAC registry",
		description:
			"Register the AI algorithm with China's Cyberspace Administration (CAC) algorithm registry. Filing is mandatory for algorithms that provide internet information services within China. Includes detailed algorithm description, purpose, and operation mechanism.",
		category: "algorithm-filing",
		jurisdictions: ["china"],
		legalBasis: "CAC Algorithm Recommendation Provisions, CAC GenAI Measures",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "10 working days from service launch",
		verificationCriteria: [
			"Algorithm filing application submitted to CAC",
			"Algorithm description and technical details provided",
			"Service purpose and target audience documented",
			"Algorithm assessment report completed",
			"Filing number received and displayed as required",
			"Periodic review and update of filing conducted",
		],
	},
	{
		id: "algorithm-genai-assessment-china",
		title: "Complete China GenAI safety assessment",
		description:
			"Complete the safety assessment required before providing GenAI services in China. Assessment must cover content safety, data security, personal information protection, and societal impact.",
		category: "algorithm-filing",
		jurisdictions: ["china"],
		legalBasis: "CAC Interim Measures for GenAI Services Article 17",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "Before providing GenAI services in China",
		verificationCriteria: [
			"Safety assessment completed covering all required areas",
			"Content safety evaluation documented",
			"Data security assessment completed",
			"Personal information protection assessment completed",
			"Assessment report filed with relevant authorities",
		],
	},

	// ── Registration ─────────────────────────────────────────────────────

	{
		id: "registration-eu-database",
		title: "Register in EU AI database",
		description:
			"Register the high-risk AI system in the EU database before placing it on the market or putting it into service. Registration includes system description, intended purpose, conformity assessment status, and contact information.",
		category: "registration",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Article 49",
		defaultPriority: "critical",
		estimatedEffort: "1-2 weeks",
		deadline: "2026-08-02",
		verificationCriteria: [
			"EU AI database registration completed",
			"System description and intended purpose provided",
			"Conformity assessment status recorded",
			"Registration maintained and updated for material changes",
		],
		dependsOn: ["documentation-conformity-assessment"],
	},

	// ── Security ─────────────────────────────────────────────────────────

	{
		id: "security-measures",
		title: "Implement appropriate technical and organisational security measures",
		description:
			"Implement security measures appropriate to the risk: encryption, access controls, pseudonymisation, confidentiality, integrity, availability, resilience. For AI systems, consider model security, adversarial robustness, and inference-time attacks.",
		category: "security",
		jurisdictions: ["eu-gdpr", "eu-ai-act", "uk", "singapore", "brazil"],
		legalBasis: "GDPR Article 32, EU AI Act Article 15, PDPA",
		defaultPriority: "important",
		estimatedEffort: "2-6 weeks",
		verificationCriteria: [
			"Security risk assessment completed",
			"Encryption at rest and in transit implemented",
			"Access controls configured with least privilege",
			"Model security assessment completed (adversarial robustness)",
			"Security testing (penetration testing, vulnerability scanning) conducted",
			"Incident response plan established",
		],
	},
	{
		id: "security-cybersecurity-gpai",
		title: "Ensure cybersecurity for GPAI model with systemic risk",
		description:
			"GPAI models designated as having systemic risk must implement adequate cybersecurity protections. This includes protection against adversarial attacks, model theft, and infrastructure security for training and serving.",
		category: "security",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Article 55(1)(d)",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		deadline: "2025-08-02",
		verificationCriteria: [
			"Cybersecurity assessment for GPAI model completed",
			"Protection against adversarial attacks implemented",
			"Model access controls and anti-theft measures in place",
			"Infrastructure security hardened",
			"Cybersecurity incident response plan established",
		],
	},

	// ── Financial Compliance ─────────────────────────────────────────────

	{
		id: "financial-model-risk-governance",
		title: "Establish AI model risk governance framework",
		description:
			"Implement model risk governance aligned with applicable requirements: define model inventory, establish model risk appetite, assign model ownership, and create model risk management policies. Board and senior management must provide effective challenge and oversight.",
		category: "financial-compliance",
		jurisdictions: ["us-federal", "uk", "singapore"],
		legalBasis: "SR 11-7 / OCC 2011-12, MAS AI Risk Management Guidelines, FCA Guidance",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Model inventory established including all AI/ML models",
			"Model risk appetite defined and approved by board",
			"Model ownership and accountability assigned",
			"Model risk management policies documented",
			"Board/senior management oversight documented",
		],
	},
	{
		id: "financial-model-validation",
		title: "Conduct independent AI model validation",
		description:
			"Perform independent validation of AI/ML models by persons not involved in model development. Must include evaluation of conceptual soundness, outcome analysis, ongoing monitoring, and benchmarking. Re-validate when models are materially changed.",
		category: "financial-compliance",
		jurisdictions: ["us-federal", "singapore"],
		legalBasis: "SR 11-7 / OCC 2011-12, MAS AI Risk Management Guidelines",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Independent validation team engaged (separate from development)",
			"Conceptual soundness evaluation completed",
			"Outcome analysis comparing predictions to actuals completed",
			"Ongoing monitoring framework established",
			"Re-validation triggers defined for material changes",
		],
		dependsOn: ["financial-model-risk-governance"],
	},
	{
		id: "financial-fair-lending",
		title: "Conduct fair lending testing on AI credit model",
		description:
			"Test AI credit models for disparate impact across protected classes. Implement specific and accurate adverse action reason codes. CFPB expects proactive testing of AI credit models for discriminatory outcomes.",
		category: "financial-compliance",
		jurisdictions: ["us-federal"],
		legalBasis: "ECOA / Regulation B, CFPB Fair Lending Guidance",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Disparate impact testing completed across all protected classes",
			"Testing methodology documented and repeatable",
			"Adverse action reason codes generated by model explainability",
			"Reason codes reviewed for specificity and accuracy",
			"Remediation plan for identified disparities documented",
		],
	},
	{
		id: "financial-materiality-assessment",
		title: "Conduct AI risk materiality assessment",
		description:
			"Assess the risk materiality of AI use cases as required by the MAS Guidelines. Categorise AI applications by their potential impact on customers, financial stability, and the institution. Apply proportionate controls based on materiality level.",
		category: "financial-compliance",
		jurisdictions: ["singapore"],
		legalBasis: "MAS Guidelines on AI Risk Management for Financial Institutions",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"AI use cases inventoried and categorised by materiality",
			"Risk materiality assessment methodology documented",
			"Proportionate controls assigned to each materiality tier",
			"Board/senior management review and approval of assessments",
			"Assessment reviewed at least annually or on material change",
		],
	},

	// ── GPAI-Specific ────────────────────────────────────────────────────

	{
		id: "gpai-technical-documentation",
		title: "Prepare GPAI technical documentation",
		description:
			"Create technical documentation for general-purpose AI models as required by Article 53. Must include training methodology, computational resources, data governance, intended uses, capabilities, and limitations.",
		category: "documentation",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Article 53(1)(a-b), Annex XI",
		defaultPriority: "critical",
		estimatedEffort: "3-6 weeks",
		deadline: "2025-08-02",
		verificationCriteria: [
			"Technical documentation prepared per Annex XI requirements",
			"Training methodology and computational resources documented",
			"Model capabilities, limitations, and known risks described",
			"Intended downstream uses documented",
			"Documentation made available to AI Office upon request",
		],
	},
	{
		id: "gpai-downstream-documentation",
		title: "Provide documentation to downstream deployers",
		description:
			"GPAI model providers must supply sufficient information and documentation to downstream deployers to enable their compliance. This includes information needed for deployer's risk assessments and conformity assessments.",
		category: "documentation",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Article 53(1)(b)",
		defaultPriority: "critical",
		estimatedEffort: "2-4 weeks",
		deadline: "2025-08-02",
		verificationCriteria: [
			"Downstream deployer documentation package prepared",
			"Information sufficient for deployer compliance assessments",
			"Acceptable use policy included",
			"Model capabilities and limitations clearly communicated",
			"Update and notification process for downstream deployers established",
		],
		dependsOn: ["gpai-technical-documentation"],
	},
	{
		id: "gpai-systemic-risk-assessment",
		title: "Conduct systemic risk evaluation and mitigation",
		description:
			"GPAI models with systemic risk (>10^25 FLOPs or Commission-designated) must perform model evaluations, adversarial testing, and systemic risk assessments. Must track, document, and report serious incidents to the AI Office.",
		category: "risk-management",
		jurisdictions: ["eu-ai-act"],
		legalBasis: "EU AI Act Article 55",
		defaultPriority: "critical",
		estimatedEffort: "6-12 weeks",
		deadline: "2025-08-02",
		verificationCriteria: [
			"Model evaluation conducted with standardised protocols",
			"Adversarial testing (red-teaming) performed",
			"Systemic risk assessment documented",
			"Incident tracking and reporting mechanism established",
			"Risk mitigation measures implemented",
			"Evaluation results reported to AI Office",
		],
	},

	// ── EEOC Employment AI ──────────────────────────────────────────────

	{
		id: "eeoc-disparate-impact-testing",
		title: "Conduct EEOC-aligned disparate impact testing for AI employment tool",
		description:
			"Per EEOC guidance on AI and Title VII, test the AI system for disparate impact on protected classes (race, color, religion, sex, national origin). Document selection rates, adverse impact ratios (four-fifths rule), and any less discriminatory alternatives considered. Employers remain liable for vendor-provided AI tools.",
		category: "bias-testing",
		jurisdictions: ["us-federal"],
		legalBasis:
			"EEOC Technical Assistance on AI and Title VII (2023), Title VII of the Civil Rights Act",
		defaultPriority: "critical",
		estimatedEffort: "4-8 weeks",
		verificationCriteria: [
			"Selection rates calculated for all protected classes",
			"Four-fifths (80%) rule analysis completed",
			"Adverse impact ratios documented",
			"Less discriminatory alternatives evaluated",
			"Testing methodology documented and repeatable",
			"Remediation plan for identified disparities created",
		],
		bestPracticeRef: "bias-testing",
	},
	{
		id: "eeoc-ada-screening",
		title: "Review AI employment tool for ADA compliance",
		description:
			"Ensure the AI tool does not screen out or disadvantage applicants/employees with disabilities in violation of the ADA. Consider whether the tool asks health-related questions, assesses physical/mental characteristics, or uses criteria that correlate with disability status.",
		category: "bias-testing",
		jurisdictions: ["us-federal"],
		legalBasis:
			"EEOC Technical Assistance on AI and the ADA (2022), Americans with Disabilities Act",
		defaultPriority: "important",
		estimatedEffort: "2-4 weeks",
		verificationCriteria: [
			"Assessment of health-related inquiry risks completed",
			"Disability screening-out risk analysis documented",
			"Reasonable accommodation procedures reviewed for AI tool context",
			"ADA compliance review documented",
		],
	},
] as const;

// ─── Lookup Functions ────────────────────────────────────────────────────

export function getActionById(id: string): ActionLibraryEntry | undefined {
	return ACTION_LIBRARY.find((a) => a.id === id);
}

export function getActionsByCategory(category: ActionCategory): readonly ActionLibraryEntry[] {
	return ACTION_LIBRARY.filter((a) => a.category === category);
}

export function getActionsByJurisdiction(jurisdiction: string): readonly ActionLibraryEntry[] {
	return ACTION_LIBRARY.filter((a) => a.jurisdictions.includes(jurisdiction));
}

export function getAllActions(): readonly ActionLibraryEntry[] {
	return ACTION_LIBRARY;
}

export function getActionCategories(): readonly ActionCategory[] {
	const categories = new Set(ACTION_LIBRARY.map((a) => a.category));
	return [...categories];
}
