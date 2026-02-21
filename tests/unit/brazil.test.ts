import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	AI_BILL_TRIGGERS,
	LGPD_TRIGGERS,
	brazilModule,
	classifyRisk,
	getMatchingAiBillTriggers,
	getMatchingLgpdTriggers,
	isAutomatedDecisionMaking,
	isFinancialServicesAi,
	isFoundationModelProvider,
	isGenAiProduct,
	processesPersonalData,
} from "../../src/jurisdictions/jurisdictions/brazil.js";

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
		targetMarkets: overrides.targetMarkets ?? ["brazil"],
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

describe("Brazil Risk Classification", () => {
	describe("High risk — LGPD Article 20 automated decisions", () => {
		it("classifies fully automated material decisions as high risk", () => {
			const ctx = makeContext({
				description: "AI loan approval system",
				decisionImpact: "material",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("LGPD Article 20");
			expect(risk.provisions).toContain("LGPD Article 20");
		});

		it("classifies human-on-the-loop determinative decisions as high risk", () => {
			const ctx = makeContext({
				description: "AI credit scoring",
				decisionImpact: "determinative",
				automationLevel: "human-on-the-loop",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — foundation model provider", () => {
		it("classifies foundation model provider as high risk", () => {
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
					hasOutputFiltering: true,
					trainingDataIncludes: ["public-web-scrape"],
					finetuningPerformed: false,
					usesRAG: false,
					usesAgenticCapabilities: false,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.provisions).toContain("AI Bill (PL 2338/2023)");
		});

		it("classifies self-trained model as high risk foundation model provider", () => {
			const ctx = makeContext({
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
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — sensitive personal data", () => {
		it("classifies sensitive data processing as high risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal", "sensitive"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.provisions).toContain("LGPD Article 11");
		});

		it("classifies biometric data processing as high risk", () => {
			const ctx = makeContext({
				dataProcessed: ["biometric"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});

		it("classifies health data processing as high risk", () => {
			const ctx = makeContext({
				dataProcessed: ["health"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — financial services", () => {
		it("classifies financial services AI as high risk", () => {
			const ctx = makeContext({
				sectorContext: { sector: "financial-services" },
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("Limited risk — GenAI content generation", () => {
		it("classifies GenAI product as limited risk", () => {
			const ctx = makeContext({
				productType: "generator",
				dataProcessed: ["aggregated"],
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
			expect(risk.provisions).toContain("AI Bill (PL 2338/2023)");
		});
	});

	describe("Limited risk — personal data processing", () => {
		it("classifies personal data processing as limited risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("LGPD");
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
			expect(risk.applicableCategories).toEqual([]);
		});
	});
});

// ─── Helper Function Tests ────────────────────────────────────────────────

describe("Brazil Helper Functions", () => {
	it("processesPersonalData detects personal data categories", () => {
		expect(processesPersonalData(makeContext({ dataProcessed: ["personal"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["sensitive"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["biometric"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["health"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["genetic"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["political"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["aggregated"] }))).toBe(false);
	});

	it("isAutomatedDecisionMaking requires material/determinative AND automated/human-on-loop", () => {
		expect(
			isAutomatedDecisionMaking(
				makeContext({ decisionImpact: "material", automationLevel: "fully-automated" }),
			),
		).toBe(true);
		expect(
			isAutomatedDecisionMaking(
				makeContext({ decisionImpact: "determinative", automationLevel: "human-on-the-loop" }),
			),
		).toBe(true);
		expect(
			isAutomatedDecisionMaking(
				makeContext({ decisionImpact: "advisory", automationLevel: "fully-automated" }),
			),
		).toBe(false);
		expect(
			isAutomatedDecisionMaking(
				makeContext({ decisionImpact: "material", automationLevel: "human-in-the-loop" }),
			),
		).toBe(false);
	});

	it("isGenAiProduct detects generator and foundation-model types", () => {
		expect(isGenAiProduct(makeContext({ productType: "generator" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "classifier" }))).toBe(false);
	});

	it("isFoundationModelProvider detects foundation-model type and self-trained", () => {
		expect(isFoundationModelProvider(makeContext({ productType: "foundation-model" }))).toBe(true);
		const selfTrained = makeContext({
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
			},
		});
		expect(isFoundationModelProvider(selfTrained)).toBe(true);
	});

	it("isFinancialServicesAi checks sector context", () => {
		const ctx = makeContext({ sectorContext: { sector: "financial-services" } });
		expect(isFinancialServicesAi(ctx)).toBe(true);
	});
});

// ─── Trigger Matching Tests ───────────────────────────────────────────────

describe("Brazil Trigger Matching", () => {
	it("LGPD triggers match personal data processing", () => {
		const ctx = makeContext({ dataProcessed: ["personal"] });
		const triggers = getMatchingLgpdTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-lgpd-personal-data")).toBe(true);
	});

	it("LGPD triggers match automated decisions", () => {
		const ctx = makeContext({
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		const triggers = getMatchingLgpdTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-lgpd-automated-decisions")).toBe(true);
	});

	it("LGPD triggers match sensitive data", () => {
		const ctx = makeContext({ dataProcessed: ["sensitive"] });
		const triggers = getMatchingLgpdTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-lgpd-sensitive-data")).toBe(true);
	});

	it("LGPD triggers match children's data", () => {
		const ctx = makeContext({ userPopulations: ["consumers", "minors"] });
		const triggers = getMatchingLgpdTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-lgpd-minors")).toBe(true);
	});

	it("AI Bill triggers match high-risk AI in consequential domains", () => {
		const ctx = makeContext({
			description: "AI credit scoring system",
			userPopulations: ["consumers", "credit-applicants"],
			decisionImpact: "material",
		});
		const triggers = getMatchingAiBillTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-ai-bill-high-risk")).toBe(true);
	});

	it("AI Bill triggers match foundation model provider", () => {
		const ctx = makeContext({ productType: "foundation-model" });
		const triggers = getMatchingAiBillTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-ai-bill-foundation-model")).toBe(true);
	});

	it("AI Bill triggers match GenAI transparency", () => {
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
		const triggers = getMatchingAiBillTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-ai-bill-genai-transparency")).toBe(true);
	});

	it("AI Bill triggers match training data disclosure", () => {
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
				trainingDataIncludes: ["public-web-scrape"],
				finetuningPerformed: true,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
			trainingData: {
				usesTrainingData: true,
				sources: [],
				containsPersonalData: false,
				consentObtained: null,
				optOutMechanism: false,
				syntheticData: false,
			},
		});
		const triggers = getMatchingAiBillTriggers(ctx);
		expect(triggers.some((t) => t.id === "br-ai-bill-training-data")).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(LGPD_TRIGGERS.length).toBe(4);
		expect(AI_BILL_TRIGGERS.length).toBe(4);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("Brazil Module Methods", () => {
	it("getRequiredArtifacts returns artifacts for automated decisions", () => {
		const ctx = makeContext({
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		const artifacts = brazilModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
	});

	it("getRequiredActions returns actions for high-risk systems", () => {
		const ctx = makeContext({
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});
		const actions = brazilModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
	});

	it("getApplicableProvisions returns LGPD provisions for personal data", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
		});
		const provisions = brazilModule.getApplicableProvisions(ctx);
		expect(provisions.length).toBeGreaterThan(0);
		expect(provisions.some((p) => p.law === "LGPD")).toBe(true);
	});

	it("getApplicableProvisions returns LGPD Article 20 for automated decisions", () => {
		const ctx = makeContext({
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		const provisions = brazilModule.getApplicableProvisions(ctx);
		expect(provisions.some((p) => p.id === "br-lgpd-art20-automated")).toBe(true);
	});

	it("getTimeline returns timeline information", () => {
		const ctx = makeContext({
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		const timeline = brazilModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBeDefined();
		expect(timeline.deadlines.length).toBeGreaterThan(0);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(brazilModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(brazilModule.getRequiredActions(ctx)).toEqual([]);
	});
});
