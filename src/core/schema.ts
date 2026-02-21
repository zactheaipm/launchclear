import { z } from "zod";

// ─── Enums / Union Schemas ─────────────────────────────────────────────────

export const ProductTypeSchema = z.enum([
	"classifier",
	"recommender",
	"generator",
	"predictor",
	"detector",
	"ranker",
	"agent",
	"foundation-model",
	"other",
]);

export const DataCategorySchema = z.enum([
	"personal",
	"sensitive",
	"biometric",
	"health",
	"financial",
	"location",
	"behavioral",
	"minor",
	"employment",
	"criminal",
	"political",
	"genetic",
	"public",
	"anonymized",
	"pseudonymized",
	"other",
]);

export const UserPopulationSchema = z.enum([
	"consumers",
	"businesses",
	"minors",
	"employees",
	"patients",
	"students",
	"job-applicants",
	"credit-applicants",
	"tenants",
	"general-public",
	"other",
]);

export const DecisionImpactSchema = z.enum(["advisory", "material", "determinative"]);

export const AutomationLevelSchema = z.enum([
	"fully-automated",
	"human-in-the-loop",
	"human-on-the-loop",
]);

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);

export const SourceModeSchema = z.enum(["cli-interview", "codebase-hybrid"]);

export const MarketReadinessStatusSchema = z.enum(["ready", "action-required", "blocked"]);

export const ActionPrioritySchema = z.enum(["critical", "important", "recommended"]);

export const RiskLevelSchema = z.enum([
	"unacceptable",
	"high",
	"limited",
	"minimal",
	"undetermined",
]);

export const RegulatoryForceSchema = z.enum([
	"binding-law",
	"binding-regulation",
	"supervisory-guidance",
	"voluntary-framework",
	"pending-legislation",
]);

export const ArtifactTypeSchema = z.enum([
	"dpia",
	"risk-classification",
	"conformity-assessment",
	"model-card",
	"transparency-notice",
	"bias-audit",
	"risk-assessment",
	"algorithmic-impact",
	"gpai-technical-documentation",
	"gpai-training-data-summary",
	"gpai-systemic-risk-assessment",
	"genai-content-policy",
]);

export const QuestionTypeSchema = z.enum([
	"free-text",
	"single-select",
	"multi-select",
	"yes-no",
	"yes-no-elaborate",
	"scale",
]);

export const QuestionCategorySchema = z.enum([
	"core",
	"data-practices",
	"automated-decisions",
	"minors",
	"biometric",
	"employment",
	"health",
	"training-data",
	"jurisdiction-specific",
	"gpai",
	"generative-ai",
	"agentic-ai",
	"financial-services",
]);

export const JurisdictionSchema = z.enum([
	"eu-ai-act",
	"eu-gdpr",
	"us-federal",
	"us-ca",
	"us-co",
	"us-il",
	"us-ny",
	"us-tx",
	"uk",
	"singapore",
	"china",
	"brazil",
]);

// ─── Error Taxonomy ──────────────────────────────────────────────────────────

export const LaunchClearErrorCategorySchema = z.enum([
	"template-load",
	"llm-provider",
	"validation",
	"provision-not-found",
	"file-io",
	"intake",
	"jurisdiction-mapping",
]);

export const LaunchClearErrorSchema = z.object({
	category: LaunchClearErrorCategorySchema,
	message: z.string(),
});

// ─── GPAI (General-Purpose AI) ─────────────────────────────────────────────

export const GpaiRoleSchema = z.enum(["provider", "deployer", "both"]);

export const GpaiInfoSchema = z.object({
	isGpaiModel: z.boolean(),
	gpaiRole: GpaiRoleSchema,
	modelName: z.string().optional(),
	isOpenSource: z.boolean(),
	computeFlops: z.number().optional(),
	exceedsSystemicRiskThreshold: z.boolean(),
	commissionDesignated: z.boolean(),
	providesDownstreamDocumentation: z.boolean(),
	hasAcceptableUsePolicy: z.boolean(),
	copyrightComplianceMechanism: z.string().optional(),
});

export const GpaiClassificationSchema = z.object({
	isGpai: z.boolean(),
	hasSystemicRisk: z.boolean(),
	isOpenSource: z.boolean(),
	role: GpaiRoleSchema,
	justification: z.string(),
	provisions: z.array(z.string()),
});

// ─── Generative AI Context ──────────────────────────────────────────────────

export const TrainingDataCategorySchema = z.enum([
	"public-web-scrape",
	"licensed-datasets",
	"user-generated-content",
	"proprietary-data",
	"synthetic-data",
	"copyrighted-works",
	"personal-data",
	"government-data",
	"open-source-datasets",
]);

export const GenerativeAiContextSchema = z.object({
	usesFoundationModel: z.boolean(),
	foundationModelSource: z.enum(["self-trained", "third-party-api", "fine-tuned", "open-source"]),
	modelIdentifier: z.string().optional(),
	generatesContent: z.boolean(),
	outputModalities: z.array(z.enum(["text", "image", "audio", "video", "code", "multimodal"])),
	canGenerateDeepfakes: z.boolean(),
	canGenerateSyntheticVoice: z.boolean(),
	hasOutputWatermarking: z.boolean(),
	hasOutputFiltering: z.boolean(),
	trainingDataIncludes: z.array(TrainingDataCategorySchema),
	finetuningPerformed: z.boolean(),
	finetuningDataDescription: z.string().optional(),
	usesRAG: z.boolean(),
	usesAgenticCapabilities: z.boolean(),
	algorithmFilingStatus: z.enum(["not-filed", "filed", "approved", "not-applicable"]).optional(),
	providesContentModeration: z.boolean().optional(),
	isFrontierModel: z.boolean().optional(),
	followsIMDAGuidelines: z.boolean().optional(),
});

// ─── Agentic AI Context ────────────────────────────────────────────────────

export const AutonomyLevelSchema = z.enum(["narrow", "bounded", "broad"]);

export const AgenticAiContextSchema = z.object({
	isAgentic: z.boolean(),
	autonomyLevel: AutonomyLevelSchema,
	toolAccess: z.array(z.string()),
	actionScope: z.array(z.string()),
	hasHumanCheckpoints: z.boolean(),
	humanCheckpointDescription: z.string().optional(),
	isMultiAgent: z.boolean(),
	canAccessExternalSystems: z.boolean(),
	canModifyData: z.boolean(),
	canMakeFinancialTransactions: z.boolean(),
	hasFailsafeMechanisms: z.boolean(),
	hasActionLogging: z.boolean(),
});

// ─── Sector Context ────────────────────────────────────────────────────────

export const AISectorSchema = z.enum([
	"financial-services",
	"healthcare",
	"employment",
	"education",
	"law-enforcement",
	"critical-infrastructure",
	"general",
]);

export const FinancialSubSectorSchema = z.enum([
	"banking",
	"insurance",
	"investment",
	"payments",
	"lending",
	"trading",
]);

export const FinancialServicesContextSchema = z.object({
	subSector: FinancialSubSectorSchema,
	involvesCredit: z.boolean(),
	involvesInsurancePricing: z.boolean(),
	involvesTrading: z.boolean(),
	involvesAmlKyc: z.boolean(),
	involvesRegulatoryReporting: z.boolean(),
	regulatoryBodies: z.array(z.string()),
	hasMaterialityAssessment: z.boolean(),
	hasModelRiskGovernance: z.boolean(),
});

export const SectorContextSchema = z.object({
	sector: AISectorSchema,
	financialServices: FinancialServicesContextSchema.optional(),
});

// ─── Training Data ─────────────────────────────────────────────────────────

export const TrainingDataInfoSchema = z.object({
	usesTrainingData: z.boolean(),
	sources: z.array(z.string()),
	containsPersonalData: z.boolean(),
	consentObtained: z.boolean().nullable(),
	optOutMechanism: z.boolean(),
	syntheticData: z.boolean(),
});

// ─── Existing Measures ─────────────────────────────────────────────────────

export const ExistingMeasureSchema = z.object({
	type: z.string(),
	description: z.string(),
	implemented: z.boolean(),
});

// ─── Answer ────────────────────────────────────────────────────────────────

export const AnswerSchema = z.object({
	questionId: z.string(),
	value: z.union([z.string(), z.array(z.string()), z.boolean()]),
	freeText: z.string().optional(),
	timestamp: z.string(),
});

// ─── Codebase Inference ────────────────────────────────────────────────────

export const CodebaseInferenceSchema = z.object({
	field: z.string(),
	inferredValue: z.unknown(),
	confidence: ConfidenceLevelSchema,
	codeEvidence: z.array(z.string()),
	confirmedByUser: z.boolean(),
	userOverride: z.unknown().optional(),
});

// ─── Product Context ───────────────────────────────────────────────────────

export const ProductContextSchema = z.object({
	description: z.string(),
	productType: ProductTypeSchema,
	dataProcessed: z.array(DataCategorySchema),
	userPopulations: z.array(UserPopulationSchema),
	decisionImpact: DecisionImpactSchema,
	automationLevel: AutomationLevelSchema,
	trainingData: TrainingDataInfoSchema,
	targetMarkets: z.array(JurisdictionSchema),
	existingMeasures: z.array(ExistingMeasureSchema),
	answers: z.record(z.string(), AnswerSchema),
	sourceMode: SourceModeSchema,
	launchDate: z.string().optional(),
	codebaseInferences: z.array(CodebaseInferenceSchema).optional(),
	gpaiInfo: GpaiInfoSchema.optional(),
	generativeAiContext: GenerativeAiContextSchema.optional(),
	agenticAiContext: AgenticAiContextSchema.optional(),
	sectorContext: SectorContextSchema.optional(),
});

// ─── Intake Questions ──────────────────────────────────────────────────────

export const QuestionOptionSchema = z.object({
	value: z.string(),
	label: z.string(),
	description: z.string().optional(),
});

export const QuestionConditionSchema = z.object({
	field: z.string(),
	operator: z.enum(["includes", "equals", "not-equals", "exists"]),
	value: z.union([z.string(), z.array(z.string()), z.boolean()]),
});

export const IntakeQuestionSchema = z.object({
	id: z.string(),
	text: z.string(),
	type: QuestionTypeSchema,
	category: QuestionCategorySchema,
	options: z.array(QuestionOptionSchema).optional(),
	regulatoryRelevance: z.string(),
	jurisdictionRelevance: z.array(JurisdictionSchema).optional(),
	requiredWhen: QuestionConditionSchema.optional(),
});

export const IntakeAnswerSchema = z.object({
	questionId: z.string(),
	questionText: z.string(),
	answer: z.union([z.string(), z.array(z.string()), z.boolean()]),
	freeText: z.string().optional(),
});

// ─── Provisions ────────────────────────────────────────────────────────────

export const ApplicableProvisionSchema = z.object({
	id: z.string(),
	law: z.string(),
	article: z.string(),
	title: z.string(),
	summary: z.string(),
	relevance: z.string(),
	url: z.string().optional(),
	regulatoryForce: RegulatoryForceSchema.optional(),
	enforcementAuthority: z.string().optional(),
	maxPenalty: z.string().optional(),
});

export const ApplicableLawSchema = z.object({
	id: z.string(),
	name: z.string(),
	jurisdiction: z.string(),
	provisions: z.array(ApplicableProvisionSchema),
});

// ─── Risk Classification ───────────────────────────────────────────────────

export const RiskClassificationSchema = z.object({
	level: RiskLevelSchema,
	justification: z.string(),
	applicableCategories: z.array(z.string()),
	provisions: z.array(z.string()),
	riskFramework: z.string().optional(),
});

// ─── Compliance Timeline ───────────────────────────────────────────────────

export const ComplianceDeadlineSchema = z.object({
	date: z.string(),
	description: z.string(),
	provision: z.string(),
	isMandatory: z.boolean(),
});

export const ComplianceTimelineSchema = z.object({
	effectiveDate: z.string().nullable(),
	deadlines: z.array(ComplianceDeadlineSchema),
	notes: z.array(z.string()),
});

// ─── Artifact Requirements ─────────────────────────────────────────────────

export const ArtifactRequirementSchema = z.object({
	type: ArtifactTypeSchema,
	name: z.string(),
	required: z.boolean(),
	legalBasis: z.string(),
	description: z.string(),
	templateId: z.string().optional(),
});

export const ArtifactSectionSchema = z.object({
	title: z.string(),
	content: z.string(),
	required: z.boolean(),
});

export const CitationSchema = z.object({
	law: z.string(),
	article: z.string(),
	text: z.string(),
	url: z.string().optional(),
});

export const GeneratedArtifactSchema = z.object({
	type: ArtifactTypeSchema,
	jurisdiction: z.string(),
	filename: z.string(),
	content: z.string(),
	sections: z.array(ArtifactSectionSchema),
	reviewNotes: z.array(z.string()),
	citations: z.array(CitationSchema),
});

// ─── Action Requirements ───────────────────────────────────────────────────

export const ActionRequirementSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	priority: ActionPrioritySchema,
	legalBasis: z.string(),
	jurisdictions: z.array(z.string()),
	estimatedEffort: z.string().optional(),
	deadline: z.string().nullable().optional(),
});

export const ActionItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	jurisdiction: z.array(z.string()),
	legalBasis: z.string(),
	bestPractice: z.string(),
	estimatedEffort: z.string(),
	deadline: z.string().nullable(),
	verificationCriteria: z.array(z.string()),
	basePriority: ActionPrioritySchema.optional(),
	dependsOn: z.array(z.string()).readonly().optional(),
	conflictsWith: z.array(z.string()).readonly().optional(),
});

export const ActionPlanSchema = z.object({
	critical: z.array(ActionItemSchema),
	important: z.array(ActionItemSchema),
	recommended: z.array(ActionItemSchema),
});

// ─── Market Readiness ──────────────────────────────────────────────────────

export const MarketReadinessSchema = z.object({
	jurisdiction: z.string(),
	status: MarketReadinessStatusSchema,
	blockers: z.array(z.string()),
	estimatedTimeToCompliance: z.string(),
});

// ─── Enforcement Cases ─────────────────────────────────────────────────────

export const EnforcementCaseSchema = z.object({
	id: z.string(),
	jurisdiction: z.string(),
	authority: z.string(),
	date: z.string(),
	respondent: z.string(),
	summary: z.string(),
	relevantProvisions: z.array(z.string()),
	outcome: z.string(),
	fine: z.number().optional(),
	url: z.string().optional(),
});

// ─── Jurisdiction Result ───────────────────────────────────────────────────

export const JurisdictionResultSchema = z.object({
	jurisdiction: z.string(),
	applicableLaws: z.array(ApplicableLawSchema),
	riskClassification: RiskClassificationSchema,
	requiredArtifacts: z.array(ArtifactRequirementSchema),
	requiredActions: z.array(ActionRequirementSchema),
	recommendedActions: z.array(ActionRequirementSchema),
	complianceTimeline: ComplianceTimelineSchema,
	enforcementPrecedent: z.array(EnforcementCaseSchema),
	gpaiClassification: GpaiClassificationSchema.optional(),
});

// ─── Report ────────────────────────────────────────────────────────────────

export const ReportSummarySchema = z.object({
	canLaunch: z.array(MarketReadinessSchema),
	highestRiskMarket: z.string(),
	lowestFrictionMarket: z.string(),
	criticalBlockers: z.array(z.string()),
	totalArtifactsNeeded: z.number(),
	totalActionsNeeded: z.number(),
	estimatedComplianceTimeline: z.string(),
});

export const ReportMetadataSchema = z.object({
	provider: z.string(),
	model: z.string(),
	knowledgeBaseVersion: z.string(),
	intakeTranscript: z.array(IntakeAnswerSchema),
});

export const LaunchClearReportSchema = z.object({
	id: z.string(),
	generatedAt: z.string(),
	productContext: ProductContextSchema,
	jurisdictionResults: z.array(JurisdictionResultSchema),
	summary: ReportSummarySchema,
	artifacts: z.array(GeneratedArtifactSchema),
	actionPlan: ActionPlanSchema,
	metadata: ReportMetadataSchema,
});

// ─── LLM Provider Types ───────────────────────────────────────────────────

export const LLMMessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
});

export const LLMRequestSchema = z.object({
	messages: z.array(LLMMessageSchema),
	systemPrompt: z.string().optional(),
	maxTokens: z.number().optional(),
	temperature: z.number().optional(),
});

export const LLMResponseSchema = z.object({
	content: z.string(),
	usage: z.object({
		inputTokens: z.number(),
		outputTokens: z.number(),
	}),
});

// ─── Codebase Analysis ─────────────────────────────────────────────────────

export const SignalCategorySchema = z.enum([
	"data-collection",
	"data-storage",
	"pii",
	"third-party",
	"automated-decision",
	"user-auth",
	"consent",
	"training-data",
	"genai",
	"rag",
	"content-safety",
	"watermarking",
	"agentic",
	"financial-services",
]);

export const CodebaseSignalSchema = z.object({
	category: SignalCategorySchema,
	type: z.string(),
	description: z.string(),
	filePath: z.string(),
	lineNumber: z.number().optional(),
	confidence: ConfidenceLevelSchema,
	evidence: z.string(),
});

export const CodebaseContextSchema = z.object({
	dataCollected: z.array(CodebaseSignalSchema),
	piiDetected: z.array(CodebaseSignalSchema),
	thirdParties: z.array(CodebaseSignalSchema),
	automatedDecisions: z.array(CodebaseSignalSchema),
	consentMechanisms: z.array(CodebaseSignalSchema),
	authFlows: z.array(CodebaseSignalSchema),
	trainingDataSources: z.array(CodebaseSignalSchema),
	genAiSignals: z.array(CodebaseSignalSchema),
	ragSignals: z.array(CodebaseSignalSchema),
	contentSafetySignals: z.array(CodebaseSignalSchema),
	watermarkingSignals: z.array(CodebaseSignalSchema),
	agenticSignals: z.array(CodebaseSignalSchema),
	financialServiceSignals: z.array(CodebaseSignalSchema),
});

export const SignalPatternSchema = z.object({
	id: z.string(),
	category: SignalCategorySchema,
	description: z.string(),
	pattern: z.string(),
	confidence: ConfidenceLevelSchema,
	fileGlobs: z.array(z.string()).optional(),
});

export const ExtractorResultSchema = z.object({
	signals: z.array(CodebaseSignalSchema),
});

export const CodebaseAnalysisResultSchema = z.object({
	context: CodebaseContextSchema,
	inferences: z.array(CodebaseInferenceSchema),
	remainingQuestions: z.array(IntakeQuestionSchema),
});

// ─── Regulation Pipeline ───────────────────────────────────────────────────

export const RegulationSourceSchema = z.object({
	id: z.string(),
	name: z.string(),
	jurisdiction: z.string(),
	url: z.string(),
	type: z.enum(["api", "scrape"]),
	lastFetched: z.string().optional(),
});

export const SectionDiffSchema = z.object({
	sectionId: z.string(),
	type: z.enum(["added", "removed", "modified"]),
	previousText: z.string().optional(),
	currentText: z.string().optional(),
	summary: z.string(),
});

export const RegulationDiffSchema = z.object({
	sourceId: z.string(),
	previousVersion: z.string(),
	currentVersion: z.string(),
	changedSections: z.array(SectionDiffSchema),
	timestamp: z.string(),
});

// ─── Regulation Pipeline Extended Schemas ─────────────────────────────────

export const RegulationFormatSchema = z.enum(["json", "html", "xml", "pdf"]);

export const ApiSourceConfigSchema = z.object({
	apiKeyEnvVar: z.string().optional(),
	headers: z.record(z.string(), z.string()).optional(),
	queryParams: z.record(z.string(), z.string()).optional(),
	resultPath: z.string().optional(),
});

export const ScrapeSourceConfigSchema = z.object({
	articleSelector: z.string(),
	sectionSelector: z.string(),
	titleSelector: z.string().optional(),
	encoding: z.string().optional(),
});

export const RegulationSourceConfigSchema = z.object({
	id: z.string(),
	name: z.string(),
	jurisdiction: z.string(),
	baseUrl: z.string().url(),
	type: z.enum(["api", "scrape"]),
	format: RegulationFormatSchema,
	rateLimitMs: z.number().int().min(0),
	apiConfig: ApiSourceConfigSchema.optional(),
	scrapeConfig: ScrapeSourceConfigSchema.optional(),
	lastFetched: z.string().optional(),
});

export const FetchedRegulationSchema = z.object({
	sourceId: z.string(),
	fetchedAt: z.string(),
	rawContent: z.string(),
	format: RegulationFormatSchema,
	url: z.string(),
	etag: z.string().optional(),
	contentHash: z.string(),
});

export const ProcessedSectionSchema = z.object({
	id: z.string(),
	title: z.string(),
	article: z.string(),
	content: z.string(),
	topics: z.array(z.string()),
});

export const ProcessedRegulationSchema = z.object({
	sourceId: z.string(),
	processedAt: z.string(),
	manifest: z.lazy(() => ProvisionManifestSchema),
	sections: z.array(ProcessedSectionSchema),
});

export const ValidationErrorSchema = z.object({
	sectionId: z.string(),
	message: z.string(),
	severity: z.enum(["error", "warning"]),
});

export const ValidationWarningSchema = z.object({
	sectionId: z.string(),
	message: z.string(),
	suggestion: z.string(),
});

export const ValidationResultSchema = z.object({
	isValid: z.boolean(),
	errors: z.array(ValidationErrorSchema),
	warnings: z.array(ValidationWarningSchema),
});

export const ChangelogEntrySchema = z.object({
	sectionId: z.string(),
	type: z.enum(["added", "removed", "modified"]),
	title: z.string(),
	description: z.string(),
});

export const RegulationChangelogSchema = z.object({
	sourceId: z.string(),
	generatedAt: z.string(),
	previousVersion: z.string(),
	currentVersion: z.string(),
	summary: z.string(),
	entries: z.array(ChangelogEntrySchema),
	affectedMappings: z.array(z.string()),
});

export const RegulationPipelineResultSchema = z.object({
	sourceId: z.string(),
	fetched: FetchedRegulationSchema,
	processed: ProcessedRegulationSchema,
	diff: RegulationDiffSchema.nullable(),
	changelog: RegulationChangelogSchema.nullable(),
	validation: ValidationResultSchema,
	snapshotPath: z.string(),
});

// ─── Configuration ─────────────────────────────────────────────────────────

export const ProviderConfigSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.string().optional(),
	model: z.string().optional(),
});

export const ServerConfigSchema = z.object({
	port: z.number().default(3000),
	apiKey: z.string().optional(),
});

export const FeatureFlagsSchema = z.object({
	enableCache: z.boolean().default(true),
	enableStreaming: z.boolean().default(true),
});

export const LaunchClearConfigSchema = z.object({
	defaultProvider: z.string(),
	providers: z.record(z.string(), ProviderConfigSchema),
	server: ServerConfigSchema,
	features: FeatureFlagsSchema,
});

// ─── Provision Manifest ────────────────────────────────────────────────────

export const ProvisionSectionSchema = z.object({
	id: z.string(),
	title: z.string(),
	article: z.string(),
	file: z.string(),
	topics: z.array(z.string()),
});

export const ProvisionManifestSchema = z.object({
	id: z.string(),
	law: z.string(),
	jurisdiction: z.string(),
	lastUpdated: z.string(),
	sections: z.array(ProvisionSectionSchema),
});

// ─── Inferred Types (Zod as source of truth) ──────────────────────────────

export type ProductContextInput = z.input<typeof ProductContextSchema>;
export type ProductContextOutput = z.output<typeof ProductContextSchema>;
export type LaunchClearReportInput = z.input<typeof LaunchClearReportSchema>;
export type LaunchClearConfigInput = z.input<typeof LaunchClearConfigSchema>;
export type IntakeQuestionInput = z.input<typeof IntakeQuestionSchema>;
export type SignalPatternInput = z.input<typeof SignalPatternSchema>;
export type ExtractorResultInput = z.input<typeof ExtractorResultSchema>;
export type CodebaseAnalysisResultInput = z.input<typeof CodebaseAnalysisResultSchema>;
export type RegulationPipelineResultInput = z.input<typeof RegulationPipelineResultSchema>;
