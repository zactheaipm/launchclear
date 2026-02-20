import type {
	AISector,
	AgenticAiContext,
	Answer,
	AutomationLevel,
	AutonomyLevel,
	DataCategory,
	DecisionImpact,
	ExistingMeasure,
	FinancialServicesContext,
	FinancialSubSector,
	GenerativeAiContext,
	GpaiInfo,
	GpaiRole,
	Jurisdiction,
	ProductContext,
	ProductType,
	Result,
	SectorContext,
	TrainingDataCategory,
	TrainingDataInfo,
	UserPopulation,
} from "../core/types.js";

interface ContextBuildError {
	readonly field: string;
	readonly message: string;
}

function getStringAnswer(
	answers: Readonly<Record<string, Answer>>,
	questionId: string,
): string | undefined {
	const answer = answers[questionId];
	if (!answer) return undefined;
	return typeof answer.value === "string" ? answer.value : undefined;
}

function getArrayAnswer(
	answers: Readonly<Record<string, Answer>>,
	questionId: string,
): readonly string[] {
	const answer = answers[questionId];
	if (!answer) return [];
	return Array.isArray(answer.value) ? answer.value : [];
}

function getBooleanAnswer(
	answers: Readonly<Record<string, Answer>>,
	questionId: string,
): boolean | undefined {
	const answer = answers[questionId];
	if (!answer) return undefined;
	return typeof answer.value === "boolean" ? answer.value : undefined;
}

function buildGpaiInfo(answers: Readonly<Record<string, Answer>>): GpaiInfo | undefined {
	const gpaiRole = getStringAnswer(answers, "gpai-role") as GpaiRole | undefined;
	if (!gpaiRole) return undefined;

	const isProvider = gpaiRole === "provider" || gpaiRole === "both";

	const computeAnswer = getStringAnswer(answers, "gpai-compute-threshold");
	const exceedsThreshold = computeAnswer === "yes";
	const commissionDesignated = getBooleanAnswer(answers, "gpai-systemic-risk-designated") ?? false;

	return {
		isGpaiModel: true,
		gpaiRole,
		modelName: getStringAnswer(answers, "gpai-model-name"),
		isOpenSource: isProvider ? (getBooleanAnswer(answers, "gpai-open-source") ?? false) : false,
		computeFlops: undefined,
		exceedsSystemicRiskThreshold: exceedsThreshold,
		commissionDesignated,
		providesDownstreamDocumentation:
			getBooleanAnswer(answers, "gpai-downstream-documentation") ?? false,
		hasAcceptableUsePolicy: getBooleanAnswer(answers, "gpai-acceptable-use-policy") ?? false,
		copyrightComplianceMechanism: answers["gpai-copyright-compliance"]?.freeText,
	};
}

function buildTrainingDataInfo(_answers: Readonly<Record<string, Answer>>): TrainingDataInfo {
	return {
		usesTrainingData: false,
		sources: [],
		containsPersonalData: false,
		consentObtained: null,
		optOutMechanism: false,
		syntheticData: false,
	};
}

function buildGenerativeAiContext(
	answers: Readonly<Record<string, Answer>>,
): GenerativeAiContext | undefined {
	const source = getStringAnswer(answers, "genai-foundation-model-source") as
		| GenerativeAiContext["foundationModelSource"]
		| undefined;
	if (!source) return undefined;

	const outputModalities = getArrayAnswer(
		answers,
		"genai-output-modalities",
	) as readonly GenerativeAiContext["outputModalities"][number][];

	const trainingDataIncludes = getArrayAnswer(
		answers,
		"genai-training-data-categories",
	) as readonly TrainingDataCategory[];

	const finetunedFromApi = getBooleanAnswer(answers, "genai-finetuning-performed") ?? false;
	const isSelfFineTuned = source === "fine-tuned";

	const algorithmFiling = getStringAnswer(answers, "genai-china-algorithm-filing") as
		| GenerativeAiContext["algorithmFilingStatus"]
		| undefined;

	const ukFrontier = getStringAnswer(answers, "genai-uk-frontier-model");

	return {
		usesFoundationModel: true,
		foundationModelSource: source,
		modelIdentifier: getStringAnswer(answers, "genai-model-identifier"),
		generatesContent: outputModalities.length > 0,
		outputModalities,
		canGenerateDeepfakes: getBooleanAnswer(answers, "genai-deepfake-capability") ?? false,
		canGenerateSyntheticVoice: getBooleanAnswer(answers, "genai-synthetic-voice") ?? false,
		hasOutputWatermarking: getBooleanAnswer(answers, "genai-watermarking") ?? false,
		hasOutputFiltering: getBooleanAnswer(answers, "genai-output-filtering") ?? false,
		trainingDataIncludes,
		finetuningPerformed: isSelfFineTuned || finetunedFromApi,
		finetuningDataDescription: getStringAnswer(answers, "genai-finetuning-data-description"),
		usesRAG: getBooleanAnswer(answers, "genai-uses-rag") ?? false,
		usesAgenticCapabilities: getBooleanAnswer(answers, "genai-agentic-capabilities") ?? false,
		algorithmFilingStatus: algorithmFiling,
		providesContentModeration: getBooleanAnswer(answers, "genai-china-content-moderation"),
		isFrontierModel: ukFrontier === "yes" ? true : ukFrontier === "no" ? false : undefined,
		followsIMDAGuidelines: getBooleanAnswer(answers, "genai-singapore-imda"),
	};
}

function buildAgenticAiContext(
	answers: Readonly<Record<string, Answer>>,
): AgenticAiContext | undefined {
	const isAgentic = getBooleanAnswer(answers, "genai-agentic-capabilities");
	if (isAgentic !== true) return undefined;

	const autonomyLevel = (getStringAnswer(answers, "agentic-autonomy-level") ??
		"narrow") as AutonomyLevel;

	const toolAccessRaw = getStringAnswer(answers, "agentic-tool-access") ?? "";
	const toolAccess = toolAccessRaw
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	const actionScope = getArrayAnswer(answers, "agentic-action-scope");

	return {
		isAgentic: true,
		autonomyLevel,
		toolAccess,
		actionScope,
		hasHumanCheckpoints: getBooleanAnswer(answers, "agentic-human-checkpoints") ?? false,
		humanCheckpointDescription: answers["agentic-human-checkpoints"]?.freeText,
		isMultiAgent: getBooleanAnswer(answers, "agentic-multi-agent") ?? false,
		canAccessExternalSystems: getBooleanAnswer(answers, "agentic-external-systems") ?? false,
		canModifyData: actionScope.includes("modify-data"),
		canMakeFinancialTransactions: actionScope.includes("make-payments"),
		hasFailsafeMechanisms: getBooleanAnswer(answers, "agentic-failsafe-mechanisms") ?? false,
		hasActionLogging: getBooleanAnswer(answers, "agentic-action-logging") ?? false,
	};
}

function buildSectorContext(answers: Readonly<Record<string, Answer>>): SectorContext | undefined {
	const decisionDomains = getArrayAnswer(answers, "decision-domains");
	const isFinancial = decisionDomains.some((d) => ["credit", "insurance"].includes(d));

	if (!isFinancial) return undefined;

	const subSector = (getStringAnswer(answers, "financial-sub-sector") ??
		"banking") as FinancialSubSector;

	const financialServices: FinancialServicesContext = {
		subSector,
		involvesCredit: getBooleanAnswer(answers, "financial-involves-credit") ?? false,
		involvesInsurancePricing:
			getBooleanAnswer(answers, "financial-involves-insurance-pricing") ?? false,
		involvesTrading: getBooleanAnswer(answers, "financial-involves-trading") ?? false,
		involvesAmlKyc: getBooleanAnswer(answers, "financial-involves-aml-kyc") ?? false,
		involvesRegulatoryReporting: false,
		regulatoryBodies: getArrayAnswer(answers, "financial-regulatory-bodies"),
		hasMaterialityAssessment:
			getBooleanAnswer(answers, "financial-materiality-assessment") ?? false,
		hasModelRiskGovernance: getBooleanAnswer(answers, "financial-model-risk-governance") ?? false,
	};

	return {
		sector: "financial-services" as AISector,
		financialServices,
	};
}

function buildExistingMeasures(
	answers: Readonly<Record<string, Answer>>,
): readonly ExistingMeasure[] {
	const measures: ExistingMeasure[] = [];

	const contestability = getBooleanAnswer(answers, "contestability");
	if (contestability === true) {
		measures.push({
			type: "contestability",
			description: answers.contestability?.freeText ?? "Appeal mechanism in place",
			implemented: true,
		});
	}

	const humanReview = getBooleanAnswer(answers, "human-review-process");
	if (humanReview === true) {
		measures.push({
			type: "human-review",
			description: answers["human-review-process"]?.freeText ?? "Human review process in place",
			implemented: true,
		});
	}

	const biasTesting = getBooleanAnswer(answers, "bias-testing");
	if (biasTesting === true) {
		measures.push({
			type: "bias-testing",
			description: answers["bias-testing"]?.freeText ?? "Bias testing conducted",
			implemented: true,
		});
	}

	const explainability = getBooleanAnswer(answers, "explainability");
	if (explainability === true) {
		measures.push({
			type: "explainability",
			description: answers.explainability?.freeText ?? "Explainability mechanism in place",
			implemented: true,
		});
	}

	const dataSubjectRights = getArrayAnswer(answers, "data-subject-rights");
	if (dataSubjectRights.length > 0 && !dataSubjectRights.includes("none")) {
		measures.push({
			type: "data-subject-rights",
			description: `Data subject rights implemented: ${dataSubjectRights.join(", ")}`,
			implemented: true,
		});
	}

	const candidateNotification = getBooleanAnswer(answers, "candidate-notification");
	if (candidateNotification === true) {
		measures.push({
			type: "ai-notification",
			description:
				answers["candidate-notification"]?.freeText ?? "Candidates/employees notified of AI use",
			implemented: true,
		});
	}

	return measures;
}

export function buildProductContext(
	answers: Readonly<Record<string, Answer>>,
): Result<ProductContext, readonly ContextBuildError[]> {
	const errors: ContextBuildError[] = [];

	const description = getStringAnswer(answers, "product-description");
	if (!description) {
		errors.push({ field: "description", message: "Product description is required" });
	}

	const productType = getStringAnswer(answers, "product-type") as ProductType | undefined;
	if (!productType) {
		errors.push({ field: "productType", message: "Product type is required" });
	}

	const dataProcessed = getArrayAnswer(answers, "data-categories") as readonly DataCategory[];
	if (dataProcessed.length === 0) {
		errors.push({
			field: "dataProcessed",
			message: "At least one data category must be selected",
		});
	}

	const userPopulations = getArrayAnswer(answers, "user-populations") as readonly UserPopulation[];
	if (userPopulations.length === 0) {
		errors.push({
			field: "userPopulations",
			message: "At least one user population must be selected",
		});
	}

	const decisionImpact = getStringAnswer(answers, "decision-impact") as DecisionImpact | undefined;
	if (!decisionImpact) {
		errors.push({
			field: "decisionImpact",
			message: "Decision impact level is required",
		});
	}

	const automationLevel = getStringAnswer(answers, "automation-level") as
		| AutomationLevel
		| undefined;
	if (!automationLevel) {
		errors.push({
			field: "automationLevel",
			message: "Automation level is required",
		});
	}

	const targetMarkets = getArrayAnswer(answers, "target-markets") as readonly Jurisdiction[];
	if (targetMarkets.length === 0) {
		errors.push({
			field: "targetMarkets",
			message: "At least one target market must be selected",
		});
	}

	if (errors.length > 0) {
		return { ok: false, error: errors };
	}

	const context: ProductContext = {
		description: description as string,
		productType: productType as ProductType,
		dataProcessed,
		userPopulations,
		decisionImpact: decisionImpact as DecisionImpact,
		automationLevel: automationLevel as AutomationLevel,
		trainingData: buildTrainingDataInfo(answers),
		targetMarkets,
		existingMeasures: buildExistingMeasures(answers),
		answers,
		sourceMode: "cli-interview",
		gpaiInfo: buildGpaiInfo(answers),
		generativeAiContext: buildGenerativeAiContext(answers),
		agenticAiContext: buildAgenticAiContext(answers),
		sectorContext: buildSectorContext(answers),
	};

	return { ok: true, value: context };
}
