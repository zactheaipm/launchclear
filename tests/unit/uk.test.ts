import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	AISI_TRIGGERS,
	DSIT_TRIGGERS,
	FCA_TRIGGERS,
	ICO_TRIGGERS,
	classifyRisk,
	getMatchingAisiTriggers,
	getMatchingDsitTriggers,
	getMatchingFcaTriggers,
	getMatchingIcoTriggers,
	hasDeepfakeCapabilities,
	isAgenticAi,
	isAutomatedEmploymentDecision,
	isFinancialServicesAi,
	isFoundationModelProduct,
	isFrontierModelProvider,
	isGenAiProduct,
	processesPersonalData,
	ukModule,
} from "../../src/jurisdictions/jurisdictions/uk.js";

// ─── Test Helper: Build a ProductContext ───────────────────────────────────

function makeContext(overrides: Partial<ProductContext> = {}): ProductContext {
	return {
		description: overrides.description ?? "A generic AI system",
		productType: overrides.productType ?? "other",
		dataProcessed: overrides.dataProcessed ?? ["personal"],
		userPopulations: overrides.userPopulations ?? ["consumers"],
		decisionImpact: overrides.decisionImpact ?? "advisory",
		automationLevel: overrides.automationLevel ?? "human-in-the-loop",
		trainingData: overrides.trainingData ?? {
			usesTrainingData: false,
			sources: [],
			containsPersonalData: false,
			consentObtained: null,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: overrides.targetMarkets ?? ["uk"],
		existingMeasures: overrides.existingMeasures ?? [],
		answers: overrides.answers ?? {},
		sourceMode: overrides.sourceMode ?? "cli-interview",
		codebaseInferences: overrides.codebaseInferences,
		gpaiInfo: overrides.gpaiInfo,
		generativeAiContext: overrides.generativeAiContext,
		agenticAiContext: overrides.agenticAiContext,
		sectorContext: overrides.sectorContext,
	};
}

// ─── Risk Classification Tests ────────────────────────────────────────────

describe("UK Risk Classification", () => {
	describe("High risk — frontier model provider", () => {
		it("classifies frontier model provider as high risk", () => {
			const ctx = makeContext({
				productType: "foundation-model",
				generativeAiContext: {
					usesFoundationModel: true,
					foundationModelSource: "self-trained",
					generatesContent: true,
					outputModalities: ["text", "code"],
					canGenerateDeepfakes: false,
					canGenerateSyntheticVoice: false,
					hasOutputWatermarking: true,
					hasOutputFiltering: true,
					trainingDataIncludes: ["public-web-scrape", "licensed-datasets"],
					finetuningPerformed: false,
					usesRAG: false,
					usesAgenticCapabilities: false,
					isFrontierModel: true,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("frontier model");
			expect(risk.provisions).toContain("AISI Frontier Model Framework");
			expect(risk.provisions).toContain("DSIT Foundation Model Principles");
		});
	});

	describe("High risk — financial services with material decisions", () => {
		it("classifies financial services AI with material impact as high risk", () => {
			const ctx = makeContext({
				description: "AI credit scoring model for UK banking",
				decisionImpact: "material",
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "lending",
						involvesCredit: true,
						involvesInsurancePricing: false,
						involvesTrading: false,
						involvesAmlKyc: false,
						involvesRegulatoryReporting: false,
						regulatoryBodies: ["FCA"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("FCA");
			expect(risk.provisions).toContain("FCA Principles-Based AI Guidance");
		});
	});

	describe("High risk — automated employment decisions", () => {
		it("classifies fully automated employment AI as high risk", () => {
			const ctx = makeContext({
				description: "AI hiring screening tool",
				userPopulations: ["job-applicants"],
				decisionImpact: "determinative",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("UK GDPR");
			expect(risk.provisions).toContain("UK GDPR Article 22");
		});
	});

	describe("High risk — biometric data", () => {
		it("classifies biometric processing as high risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal", "biometric"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.provisions).toContain("UK GDPR Article 9");
			expect(risk.provisions).toContain("UK GDPR Article 35");
		});
	});

	describe("Limited risk — foundation model deployer", () => {
		it("classifies third-party foundation model deployer as limited risk", () => {
			const ctx = makeContext({
				productType: "generator",
				generativeAiContext: {
					usesFoundationModel: true,
					foundationModelSource: "third-party-api",
					generatesContent: true,
					outputModalities: ["text"],
					canGenerateDeepfakes: false,
					canGenerateSyntheticVoice: false,
					hasOutputWatermarking: false,
					hasOutputFiltering: true,
					trainingDataIncludes: [],
					finetuningPerformed: false,
					usesRAG: false,
					usesAgenticCapabilities: false,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.applicableCategories).toContain("foundation-model-deployer");
		});
	});

	describe("Limited risk — GenAI content generation", () => {
		it("classifies GenAI content generator as limited risk", () => {
			const ctx = makeContext({
				productType: "generator",
				generativeAiContext: {
					usesFoundationModel: false,
					foundationModelSource: "third-party-api",
					generatesContent: true,
					outputModalities: ["text"],
					canGenerateDeepfakes: false,
					canGenerateSyntheticVoice: false,
					hasOutputWatermarking: false,
					hasOutputFiltering: false,
					trainingDataIncludes: [],
					finetuningPerformed: false,
					usesRAG: false,
					usesAgenticCapabilities: false,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Limited risk — personal data processing", () => {
		it("classifies personal data processing as limited risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-personal-data internal system as minimal", () => {
			const ctx = makeContext({
				dataProcessed: ["aggregated"],
				userPopulations: ["internal-users"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
		});
	});
});

// ─── Helper Function Tests ────────────────────────────────────────────────

describe("UK Helper Functions", () => {
	it("processesPersonalData detects personal data categories", () => {
		expect(processesPersonalData(makeContext({ dataProcessed: ["personal"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["biometric"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["health"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["aggregated"] }))).toBe(false);
	});

	it("isFrontierModelProvider requires frontier flag and self-trained/foundation-model", () => {
		const frontierCtx = makeContext({
			productType: "foundation-model",
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "self-trained",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
				isFrontierModel: true,
			},
		});
		expect(isFrontierModelProvider(frontierCtx)).toBe(true);

		const nonFrontierCtx = makeContext({
			productType: "generator",
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
				isFrontierModel: false,
			},
		});
		expect(isFrontierModelProvider(nonFrontierCtx)).toBe(false);
	});

	it("isFoundationModelProduct detects foundation model type or usesFoundationModel", () => {
		expect(isFoundationModelProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
		const ctx = makeContext({
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});
		expect(isFoundationModelProduct(ctx)).toBe(true);
	});

	it("isGenAiProduct detects various GenAI configurations", () => {
		expect(isGenAiProduct(makeContext({ productType: "generator" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
	});

	it("isFinancialServicesAi checks sector context", () => {
		const ctx = makeContext({ sectorContext: { sector: "financial-services" } });
		expect(isFinancialServicesAi(ctx)).toBe(true);
	});

	it("isAutomatedEmploymentDecision requires employment + material + fully-automated", () => {
		const trueCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		expect(isAutomatedEmploymentDecision(trueCtx)).toBe(true);

		const falseCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
			automationLevel: "human-in-the-loop",
		});
		expect(isAutomatedEmploymentDecision(falseCtx)).toBe(false);
	});

	it("hasDeepfakeCapabilities detects deepfake or synthetic voice", () => {
		const deepfakeCtx = makeContext({
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["video"],
				canGenerateDeepfakes: true,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});
		expect(hasDeepfakeCapabilities(deepfakeCtx)).toBe(true);
	});

	it("isAgenticAi checks agentic context or usesAgenticCapabilities", () => {
		const agenticCtx = makeContext({
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "bounded",
				toolAccess: [],
				actionScope: [],
				hasHumanCheckpoints: true,
				isMultiAgent: false,
				canAccessExternalSystems: false,
				canModifyData: false,
				canMakeFinancialTransactions: false,
				hasFailsafeMechanisms: true,
				hasActionLogging: true,
			},
		});
		expect(isAgenticAi(agenticCtx)).toBe(true);
	});
});

// ─── Trigger Matching Tests ───────────────────────────────────────────────

describe("UK Trigger Matching", () => {
	it("AISI triggers match frontier model providers", () => {
		const ctx = makeContext({
			productType: "foundation-model",
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "self-trained",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
				isFrontierModel: true,
			},
		});
		const triggers = getMatchingAisiTriggers(ctx);
		expect(triggers.length).toBeGreaterThan(0);
		expect(triggers.some((t) => t.id === "aisi-frontier-safety-evaluation")).toBe(true);
	});

	it("DSIT triggers match foundation model products", () => {
		const ctx = makeContext({
			productType: "foundation-model",
		});
		const triggers = getMatchingDsitTriggers(ctx);
		expect(triggers.length).toBeGreaterThan(0);
	});

	it("ICO triggers match personal data training with AI", () => {
		const ctx = makeContext({
			trainingData: {
				usesTrainingData: true,
				sources: ["web-scrape"],
				containsPersonalData: true,
				consentObtained: null,
				optOutMechanism: false,
				syntheticData: false,
			},
		});
		const triggers = getMatchingIcoTriggers(ctx);
		expect(triggers.some((t) => t.id === "ico-lawful-basis-ai-training")).toBe(true);
	});

	it("ICO triggers match biometric special category data", () => {
		const ctx = makeContext({
			dataProcessed: ["biometric"],
			userPopulations: ["consumers"],
		});
		const triggers = getMatchingIcoTriggers(ctx);
		expect(triggers.some((t) => t.id === "ico-dpia-requirement")).toBe(true);
		expect(triggers.some((t) => t.id === "ico-special-category")).toBe(true);
	});

	it("FCA triggers match financial services credit AI", () => {
		const ctx = makeContext({
			description: "AI credit scoring model",
			userPopulations: ["consumers", "credit-applicants"],
			decisionImpact: "material",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["FCA"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});
		const triggers = getMatchingFcaTriggers(ctx);
		expect(triggers.some((t) => t.id === "fca-credit-ai")).toBe(true);
		expect(triggers.some((t) => t.id === "fca-fair-treatment")).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(AISI_TRIGGERS.length).toBe(4);
		expect(DSIT_TRIGGERS.length).toBe(3);
		expect(ICO_TRIGGERS.length).toBe(6);
		expect(FCA_TRIGGERS.length).toBe(7);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("UK Module Methods", () => {
	it("getRequiredArtifacts returns artifacts for frontier model provider", () => {
		const ctx = makeContext({
			productType: "foundation-model",
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "self-trained",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: true,
				hasOutputFiltering: true,
				trainingDataIncludes: ["public-web-scrape"],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
				isFrontierModel: true,
			},
		});
		const artifacts = ukModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
	});

	it("getRequiredActions returns actions for high-risk financial services", () => {
		const ctx = makeContext({
			decisionImpact: "material",
			sectorContext: { sector: "financial-services" },
		});
		const actions = ukModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
	});

	it("getApplicableProvisions returns ICO provisions for personal data", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
		});
		const provisions = ukModule.getApplicableProvisions(ctx);
		expect(provisions.length).toBeGreaterThan(0);
	});

	it("getTimeline returns effective date", () => {
		const ctx = makeContext({});
		const timeline = ukModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBeDefined();
		expect(timeline.deadlines.length).toBeGreaterThan(0);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(ukModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(ukModule.getRequiredActions(ctx)).toEqual([]);
	});
});
