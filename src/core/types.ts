// ─── Error Taxonomy ──────────────────────────────────────────────────────────

export type LaunchClearErrorCategory =
	| "template-load"
	| "llm-provider"
	| "validation"
	| "provision-not-found"
	| "file-io"
	| "intake"
	| "jurisdiction-mapping";

export interface LaunchClearError {
	readonly category: LaunchClearErrorCategory;
	readonly message: string;
	readonly cause?: Error;
}

export function createLaunchClearError(
	category: LaunchClearErrorCategory,
	message: string,
	cause?: Error,
): LaunchClearError {
	return { category, message, cause };
}

// ─── Result Type (Errors as Values) ────────────────────────────────────────
export type Result<T, E = Error> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly error: E };

// ─── Enums / Union Types ───────────────────────────────────────────────────

export type ProductType =
	| "classifier"
	| "recommender"
	| "generator"
	| "predictor"
	| "detector"
	| "ranker"
	| "agent"
	| "foundation-model"
	| "other";

export type DataCategory =
	| "personal"
	| "sensitive"
	| "biometric"
	| "health"
	| "financial"
	| "location"
	| "behavioral"
	| "minor"
	| "employment"
	| "criminal"
	| "political"
	| "genetic"
	| "public"
	| "anonymized"
	| "pseudonymized"
	| "other";

export type UserPopulation =
	| "consumers"
	| "businesses"
	| "minors"
	| "employees"
	| "patients"
	| "students"
	| "job-applicants"
	| "credit-applicants"
	| "tenants"
	| "general-public"
	| "other";

export type DecisionImpact = "advisory" | "material" | "determinative";

export type AutomationLevel = "fully-automated" | "human-in-the-loop" | "human-on-the-loop";

export type ConfidenceLevel = "high" | "medium" | "low";

export type SourceMode = "cli-interview" | "codebase-hybrid";

export type MarketReadinessStatus = "ready" | "action-required" | "blocked";

export type ActionPriority = "critical" | "important" | "recommended";

export type RiskLevel = "unacceptable" | "high" | "limited" | "minimal" | "undetermined";

export type RegulatoryForce =
	| "binding-law"
	| "binding-regulation"
	| "supervisory-guidance"
	| "voluntary-framework"
	| "pending-legislation";

export type ArtifactType =
	| "dpia"
	| "risk-classification"
	| "conformity-assessment"
	| "model-card"
	| "transparency-notice"
	| "bias-audit"
	| "risk-assessment"
	| "algorithmic-impact"
	| "gpai-technical-documentation"
	| "gpai-training-data-summary"
	| "gpai-systemic-risk-assessment"
	| "genai-content-policy";

export type QuestionType =
	| "free-text"
	| "single-select"
	| "multi-select"
	| "yes-no"
	| "yes-no-elaborate"
	| "scale";

export type QuestionCategory =
	| "core"
	| "data-practices"
	| "automated-decisions"
	| "minors"
	| "biometric"
	| "employment"
	| "health"
	| "training-data"
	| "jurisdiction-specific"
	| "gpai"
	| "generative-ai"
	| "agentic-ai"
	| "financial-services";

// ─── Jurisdiction Identifiers ──────────────────────────────────────────────

export type Jurisdiction =
	| "eu-ai-act"
	| "eu-gdpr"
	| "us-federal"
	| "us-ca"
	| "us-co"
	| "us-il"
	| "us-ny"
	| "us-tx"
	| "uk"
	| "singapore"
	| "china"
	| "brazil";

// ─── GPAI (General-Purpose AI) ─────────────────────────────────────────────

export type GpaiRole = "provider" | "deployer" | "both";

export interface GpaiInfo {
	readonly isGpaiModel: boolean;
	readonly gpaiRole: GpaiRole;
	readonly modelName?: string;
	readonly isOpenSource: boolean;
	readonly computeFlops?: number;
	readonly exceedsSystemicRiskThreshold: boolean;
	readonly commissionDesignated: boolean;
	readonly providesDownstreamDocumentation: boolean;
	readonly hasAcceptableUsePolicy: boolean;
	readonly copyrightComplianceMechanism?: string;
}

export interface GpaiClassification {
	readonly isGpai: boolean;
	readonly hasSystemicRisk: boolean;
	readonly isOpenSource: boolean;
	readonly role: GpaiRole;
	readonly justification: string;
	readonly provisions: readonly string[];
}

// ─── Training Data ─────────────────────────────────────────────────────────

export interface TrainingDataInfo {
	readonly usesTrainingData: boolean;
	readonly sources: readonly string[];
	readonly containsPersonalData: boolean;
	readonly consentObtained: boolean | null;
	readonly optOutMechanism: boolean;
	readonly syntheticData: boolean;
}

// ─── Existing Measures ─────────────────────────────────────────────────────

export interface ExistingMeasure {
	readonly type: string;
	readonly description: string;
	readonly implemented: boolean;
}

// ─── Answer ────────────────────────────────────────────────────────────────

export interface Answer {
	readonly questionId: string;
	readonly value: string | readonly string[] | boolean;
	readonly freeText?: string;
	readonly timestamp: string;
}

// ─── Codebase Inference ────────────────────────────────────────────────────

export interface CodebaseInference {
	readonly field: string;
	readonly inferredValue: unknown;
	readonly confidence: ConfidenceLevel;
	readonly codeEvidence: readonly string[];
	readonly confirmedByUser: boolean;
	readonly userOverride?: unknown;
}

// ─── Generative AI Context ──────────────────────────────────────────────────

export type TrainingDataCategory =
	| "public-web-scrape"
	| "licensed-datasets"
	| "user-generated-content"
	| "proprietary-data"
	| "synthetic-data"
	| "copyrighted-works"
	| "personal-data"
	| "government-data"
	| "open-source-datasets";

export interface GenerativeAiContext {
	readonly usesFoundationModel: boolean;
	readonly foundationModelSource: "self-trained" | "third-party-api" | "fine-tuned" | "open-source";
	readonly modelIdentifier?: string;
	readonly generatesContent: boolean;
	readonly outputModalities: readonly (
		| "text"
		| "image"
		| "audio"
		| "video"
		| "code"
		| "multimodal"
	)[];
	readonly canGenerateDeepfakes: boolean;
	readonly canGenerateSyntheticVoice: boolean;
	readonly hasOutputWatermarking: boolean;
	readonly hasOutputFiltering: boolean;
	readonly trainingDataIncludes: readonly TrainingDataCategory[];
	readonly finetuningPerformed: boolean;
	readonly finetuningDataDescription?: string;
	readonly usesRAG: boolean;
	readonly usesAgenticCapabilities: boolean;
	readonly algorithmFilingStatus?: "not-filed" | "filed" | "approved" | "not-applicable";
	readonly providesContentModeration?: boolean;
	readonly isFrontierModel?: boolean;
	readonly followsIMDAGuidelines?: boolean;
}

// ─── Agentic AI Context ────────────────────────────────────────────────────

export type AutonomyLevel = "narrow" | "bounded" | "broad";

export interface AgenticAiContext {
	readonly isAgentic: boolean;
	readonly autonomyLevel: AutonomyLevel;
	readonly toolAccess: readonly string[];
	readonly actionScope: readonly string[];
	readonly hasHumanCheckpoints: boolean;
	readonly humanCheckpointDescription?: string;
	readonly isMultiAgent: boolean;
	readonly canAccessExternalSystems: boolean;
	readonly canModifyData: boolean;
	readonly canMakeFinancialTransactions: boolean;
	readonly hasFailsafeMechanisms: boolean;
	readonly hasActionLogging: boolean;
}

// ─── Sector Context ────────────────────────────────────────────────────────

export type AISector =
	| "financial-services"
	| "healthcare"
	| "employment"
	| "education"
	| "law-enforcement"
	| "critical-infrastructure"
	| "general";

export type FinancialSubSector =
	| "banking"
	| "insurance"
	| "investment"
	| "payments"
	| "lending"
	| "trading";

export interface FinancialServicesContext {
	readonly subSector: FinancialSubSector;
	readonly involvesCredit: boolean;
	readonly involvesInsurancePricing: boolean;
	readonly involvesTrading: boolean;
	readonly involvesAmlKyc: boolean;
	readonly involvesRegulatoryReporting: boolean;
	readonly regulatoryBodies: readonly string[];
	readonly hasMaterialityAssessment: boolean;
	readonly hasModelRiskGovernance: boolean;
}

export interface SectorContext {
	readonly sector: AISector;
	readonly financialServices?: FinancialServicesContext;
}

// ─── Product Context (Core Data Structure) ─────────────────────────────────

export interface ProductContext {
	readonly description: string;
	readonly productType: ProductType;
	readonly dataProcessed: readonly DataCategory[];
	readonly userPopulations: readonly UserPopulation[];
	readonly decisionImpact: DecisionImpact;
	readonly automationLevel: AutomationLevel;
	readonly trainingData: TrainingDataInfo;
	readonly targetMarkets: readonly Jurisdiction[];
	readonly existingMeasures: readonly ExistingMeasure[];
	readonly answers: Readonly<Record<string, Answer>>;
	readonly sourceMode: SourceMode;
	readonly launchDate?: string;
	readonly codebaseInferences?: readonly CodebaseInference[];
	readonly gpaiInfo?: GpaiInfo;
	readonly generativeAiContext?: GenerativeAiContext;
	readonly agenticAiContext?: AgenticAiContext;
	readonly sectorContext?: SectorContext;
}

// ─── Intake Questions ──────────────────────────────────────────────────────

export interface IntakeQuestion {
	readonly id: string;
	readonly text: string;
	readonly type: QuestionType;
	readonly category: QuestionCategory;
	readonly options?: readonly QuestionOption[];
	readonly regulatoryRelevance: string;
	readonly jurisdictionRelevance?: readonly Jurisdiction[];
	readonly requiredWhen?: QuestionCondition;
}

export interface QuestionOption {
	readonly value: string;
	readonly label: string;
	readonly description?: string;
}

export interface QuestionCondition {
	readonly field: string;
	readonly operator: "includes" | "equals" | "not-equals" | "exists";
	readonly value: string | readonly string[] | boolean;
}

export interface IntakeAnswer {
	readonly questionId: string;
	readonly questionText: string;
	readonly answer: string | readonly string[] | boolean;
	readonly freeText?: string;
}

// ─── Jurisdiction Module Interface ─────────────────────────────────────────

export interface JurisdictionModule {
	readonly id: string;
	readonly name: string;
	readonly jurisdiction: Jurisdiction;

	getApplicableProvisions(ctx: ProductContext): readonly ApplicableProvision[];
	getRequiredArtifacts(ctx: ProductContext): readonly ArtifactRequirement[];
	getRequiredActions(ctx: ProductContext): readonly ActionRequirement[];
	getRiskLevel(ctx: ProductContext): RiskClassification;
	getTimeline(ctx: ProductContext): ComplianceTimeline;
	getGpaiClassification?(ctx: ProductContext): GpaiClassification | undefined;
}

// ─── Provisions ────────────────────────────────────────────────────────────

export interface ApplicableProvision {
	readonly id: string;
	readonly law: string;
	readonly article: string;
	readonly title: string;
	readonly summary: string;
	readonly relevance: string;
	readonly url?: string;
	readonly regulatoryForce?: RegulatoryForce;
	readonly enforcementAuthority?: string;
	readonly maxPenalty?: string;
}

export interface ApplicableLaw {
	readonly id: string;
	readonly name: string;
	readonly jurisdiction: string;
	readonly provisions: readonly ApplicableProvision[];
}

// ─── Risk Classification ───────────────────────────────────────────────────

export interface RiskClassification {
	readonly level: RiskLevel;
	readonly justification: string;
	readonly applicableCategories: readonly string[];
	readonly provisions: readonly string[];
	readonly riskFramework?: string;
}

// ─── Compliance Timeline ───────────────────────────────────────────────────

export interface ComplianceTimeline {
	readonly effectiveDate: string | null;
	readonly deadlines: readonly ComplianceDeadline[];
	readonly notes: readonly string[];
}

export interface ComplianceDeadline {
	readonly date: string;
	readonly description: string;
	readonly provision: string;
	readonly isMandatory: boolean;
}

// ─── Artifact Requirements ─────────────────────────────────────────────────

export interface ArtifactRequirement {
	readonly type: ArtifactType;
	readonly name: string;
	readonly required: boolean;
	readonly legalBasis: string;
	readonly description: string;
	readonly templateId?: string;
}

export interface ArtifactSection {
	readonly title: string;
	readonly content: string;
	readonly required: boolean;
}

export interface Citation {
	readonly law: string;
	readonly article: string;
	readonly text: string;
	readonly url?: string;
}

export interface GeneratedArtifact {
	readonly type: ArtifactType;
	readonly jurisdiction: string;
	readonly filename: string;
	readonly content: string;
	readonly sections: readonly ArtifactSection[];
	readonly reviewNotes: readonly string[];
	readonly citations: readonly Citation[];
}

// ─── Action Requirements ───────────────────────────────────────────────────

export interface ActionRequirement {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly priority: ActionPriority;
	readonly legalBasis: string;
	readonly jurisdictions: readonly string[];
	readonly estimatedEffort?: string;
	readonly deadline?: string | null;
}

export interface ActionItem {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly jurisdiction: readonly string[];
	readonly legalBasis: string;
	readonly bestPractice: string;
	readonly estimatedEffort: string;
	readonly deadline: string | null;
	readonly verificationCriteria: readonly string[];
	readonly basePriority?: ActionPriority;
	readonly dependsOn?: readonly string[];
	readonly conflictsWith?: readonly string[];
}

export interface ActionPlan {
	readonly critical: readonly ActionItem[];
	readonly important: readonly ActionItem[];
	readonly recommended: readonly ActionItem[];
}

// ─── Market Readiness ──────────────────────────────────────────────────────

export interface MarketReadiness {
	readonly jurisdiction: string;
	readonly status: MarketReadinessStatus;
	readonly blockers: readonly string[];
	readonly estimatedTimeToCompliance: string;
}

// ─── Enforcement Cases ─────────────────────────────────────────────────────

export interface EnforcementCase {
	readonly id: string;
	readonly jurisdiction: string;
	readonly authority: string;
	readonly date: string;
	readonly respondent: string;
	readonly summary: string;
	readonly relevantProvisions: readonly string[];
	readonly outcome: string;
	readonly fine?: number;
	readonly url?: string;
}

// ─── Jurisdiction Result ───────────────────────────────────────────────────

export interface JurisdictionResult {
	readonly jurisdiction: string;
	readonly applicableLaws: readonly ApplicableLaw[];
	readonly riskClassification: RiskClassification;
	readonly requiredArtifacts: readonly ArtifactRequirement[];
	readonly requiredActions: readonly ActionRequirement[];
	readonly recommendedActions: readonly ActionRequirement[];
	readonly complianceTimeline: ComplianceTimeline;
	readonly enforcementPrecedent: readonly EnforcementCase[];
	readonly gpaiClassification?: GpaiClassification;
}

// ─── LaunchClear Report (Top-Level Output) ─────────────────────────────────

export interface LaunchClearReport {
	readonly id: string;
	readonly generatedAt: string;
	readonly productContext: ProductContext;
	readonly jurisdictionResults: readonly JurisdictionResult[];
	readonly summary: ReportSummary;
	readonly artifacts: readonly GeneratedArtifact[];
	readonly actionPlan: ActionPlan;
	readonly metadata: ReportMetadata;
}

export interface ReportSummary {
	readonly canLaunch: readonly MarketReadiness[];
	readonly highestRiskMarket: string;
	readonly lowestFrictionMarket: string;
	readonly criticalBlockers: readonly string[];
	readonly totalArtifactsNeeded: number;
	readonly totalActionsNeeded: number;
	readonly estimatedComplianceTimeline: string;
}

export interface ReportMetadata {
	readonly provider: string;
	readonly model: string;
	readonly knowledgeBaseVersion: string;
	readonly intakeTranscript: readonly IntakeAnswer[];
}

// ─── LLM Provider Interface ────────────────────────────────────────────────

export interface LLMProvider {
	readonly id: string;
	readonly name: string;

	complete(request: LLMRequest): Promise<Result<LLMResponse>>;
}

export interface LLMRequest {
	readonly messages: readonly LLMMessage[];
	readonly systemPrompt?: string;
	readonly maxTokens?: number;
	readonly temperature?: number;
}

export interface LLMMessage {
	readonly role: "user" | "assistant";
	readonly content: string;
}

export interface LLMResponse {
	readonly content: string;
	readonly usage: {
		readonly inputTokens: number;
		readonly outputTokens: number;
	};
}

// ─── Codebase Analysis Types ───────────────────────────────────────────────

export type SignalCategory =
	| "data-collection"
	| "data-storage"
	| "pii"
	| "third-party"
	| "automated-decision"
	| "user-auth"
	| "consent"
	| "training-data"
	| "genai"
	| "rag"
	| "content-safety"
	| "watermarking"
	| "agentic"
	| "financial-services";

export interface CodebaseContext {
	readonly dataCollected: readonly CodebaseSignal[];
	readonly piiDetected: readonly CodebaseSignal[];
	readonly thirdParties: readonly CodebaseSignal[];
	readonly automatedDecisions: readonly CodebaseSignal[];
	readonly consentMechanisms: readonly CodebaseSignal[];
	readonly authFlows: readonly CodebaseSignal[];
	readonly trainingDataSources: readonly CodebaseSignal[];
	readonly genAiSignals: readonly CodebaseSignal[];
	readonly ragSignals: readonly CodebaseSignal[];
	readonly contentSafetySignals: readonly CodebaseSignal[];
	readonly watermarkingSignals: readonly CodebaseSignal[];
	readonly agenticSignals: readonly CodebaseSignal[];
	readonly financialServiceSignals: readonly CodebaseSignal[];
}

export interface CodebaseSignal {
	readonly category: SignalCategory;
	readonly type: string;
	readonly description: string;
	readonly filePath: string;
	readonly lineNumber?: number;
	readonly confidence: ConfidenceLevel;
	readonly evidence: string;
}

export interface SignalPattern {
	readonly id: string;
	readonly category: SignalCategory;
	readonly description: string;
	readonly pattern: RegExp;
	readonly confidence: ConfidenceLevel;
	readonly fileGlobs?: readonly string[];
}

export interface ExtractorResult {
	readonly signals: readonly CodebaseSignal[];
}

export interface CodebaseAnalysisResult {
	readonly context: CodebaseContext;
	readonly inferences: readonly CodebaseInference[];
	readonly remainingQuestions: readonly IntakeQuestion[];
}

// ─── Regulation Pipeline Types ─────────────────────────────────────────────

export interface RegulationSource {
	readonly id: string;
	readonly name: string;
	readonly jurisdiction: string;
	readonly url: string;
	readonly type: "api" | "scrape";
	readonly lastFetched?: string;
}

export interface RegulationDiff {
	readonly sourceId: string;
	readonly previousVersion: string;
	readonly currentVersion: string;
	readonly changedSections: readonly SectionDiff[];
	readonly timestamp: string;
}

export interface SectionDiff {
	readonly sectionId: string;
	readonly type: "added" | "removed" | "modified";
	readonly previousText?: string;
	readonly currentText?: string;
	readonly summary: string;
}

// ─── Regulation Pipeline Extended Types ─────────────────────────────────────

export type RegulationFormat = "json" | "html" | "xml" | "pdf";

export interface ApiSourceConfig {
	readonly apiKeyEnvVar?: string;
	readonly headers?: Readonly<Record<string, string>>;
	readonly queryParams?: Readonly<Record<string, string>>;
	readonly resultPath?: string;
}

export interface ScrapeSourceConfig {
	readonly articleSelector: string;
	readonly sectionSelector: string;
	readonly titleSelector?: string;
	readonly encoding?: string;
}

export interface RegulationSourceConfig {
	readonly id: string;
	readonly name: string;
	readonly jurisdiction: string;
	readonly baseUrl: string;
	readonly type: "api" | "scrape";
	readonly format: RegulationFormat;
	readonly rateLimitMs: number;
	readonly apiConfig?: ApiSourceConfig;
	readonly scrapeConfig?: ScrapeSourceConfig;
	readonly lastFetched?: string;
}

export interface FetchedRegulation {
	readonly sourceId: string;
	readonly fetchedAt: string;
	readonly rawContent: string;
	readonly format: RegulationFormat;
	readonly url: string;
	readonly etag?: string;
	readonly contentHash: string;
}

export interface ProcessedSection {
	readonly id: string;
	readonly title: string;
	readonly article: string;
	readonly content: string;
	readonly topics: readonly string[];
}

export interface ProcessedRegulation {
	readonly sourceId: string;
	readonly processedAt: string;
	readonly manifest: ProvisionManifest;
	readonly sections: readonly ProcessedSection[];
}

export interface ValidationError {
	readonly sectionId: string;
	readonly message: string;
	readonly severity: "error" | "warning";
}

export interface ValidationWarning {
	readonly sectionId: string;
	readonly message: string;
	readonly suggestion: string;
}

export interface ValidationResult {
	readonly isValid: boolean;
	readonly errors: readonly ValidationError[];
	readonly warnings: readonly ValidationWarning[];
}

export interface ChangelogEntry {
	readonly sectionId: string;
	readonly type: "added" | "removed" | "modified";
	readonly title: string;
	readonly description: string;
}

export interface RegulationChangelog {
	readonly sourceId: string;
	readonly generatedAt: string;
	readonly previousVersion: string;
	readonly currentVersion: string;
	readonly summary: string;
	readonly entries: readonly ChangelogEntry[];
	readonly affectedMappings: readonly string[];
}

export interface RegulationPipelineResult {
	readonly sourceId: string;
	readonly fetched: FetchedRegulation;
	readonly processed: ProcessedRegulation;
	readonly diff: RegulationDiff | null;
	readonly changelog: RegulationChangelog | null;
	readonly validation: ValidationResult;
	readonly snapshotPath: string;
}

// ─── Configuration ─────────────────────────────────────────────────────────

export interface LaunchClearConfig {
	readonly defaultProvider: string;
	readonly providers: Readonly<Record<string, ProviderConfig>>;
	readonly server: ServerConfig;
	readonly features: FeatureFlags;
}

export interface ProviderConfig {
	readonly apiKey?: string;
	readonly baseUrl?: string;
	readonly model?: string;
}

export interface ServerConfig {
	readonly port: number;
	readonly apiKey?: string;
}

export interface FeatureFlags {
	readonly enableCache: boolean;
	readonly enableStreaming: boolean;
}

// ─── Provision Manifest (knowledge base) ───────────────────────────────────

export interface ProvisionManifest {
	readonly id: string;
	readonly law: string;
	readonly jurisdiction: string;
	readonly lastUpdated: string;
	readonly sections: readonly ProvisionSection[];
}

export interface ProvisionSection {
	readonly id: string;
	readonly title: string;
	readonly article: string;
	readonly file: string;
	readonly topics: readonly string[];
}
