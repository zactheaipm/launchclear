import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	CAC_GENAI_TRIGGERS,
	DEEP_SYNTHESIS_TRIGGERS,
	RECOMMENDATION_TRIGGERS,
	chinaModule,
	classifyRisk,
	getMatchingCacGenAiTriggers,
	getMatchingDeepSynthesisTriggers,
	getMatchingRecommendationTriggers,
	isDeepSynthesisProduct,
	isGenAiProduct,
	isPublicFacingGenAi,
	isRecommendationSystem,
	requiresAlgorithmFiling,
} from "../../src/jurisdictions/jurisdictions/china.js";

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
		targetMarkets: overrides.targetMarkets ?? ["china"],
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

describe("China Risk Classification", () => {
	describe("High risk — public-facing GenAI service", () => {
		it("classifies public-facing GenAI chatbot as high risk", () => {
			const ctx = makeContext({
				description: "AI chatbot for consumer customer service",
				productType: "generator",
				userPopulations: ["consumers"],
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
					usesRAG: true,
					usesAgenticCapabilities: false,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("CAC");
			expect(risk.justification).toContain("algorithm filing");
			expect(risk.provisions).toContain("CAC Interim Measures for GenAI Services");
		});

		it("classifies foundation model provider serving public as high risk", () => {
			const ctx = makeContext({
				productType: "foundation-model",
				userPopulations: ["consumers", "general-public"],
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
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — deep synthesis capabilities", () => {
		it("classifies face generation/manipulation AI as high risk", () => {
			const ctx = makeContext({
				description: "AI face-swap video tool",
				userPopulations: ["internal-users"],
				generativeAiContext: {
					usesFoundationModel: true,
					foundationModelSource: "third-party-api",
					generatesContent: true,
					outputModalities: ["image", "video"],
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

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.provisions).toContain("Provisions on Deep Synthesis");
		});

		it("classifies voice synthesis AI as high risk", () => {
			const ctx = makeContext({
				description: "AI voice cloning tool",
				userPopulations: ["internal-users"],
				generativeAiContext: {
					usesFoundationModel: true,
					foundationModelSource: "third-party-api",
					generatesContent: true,
					outputModalities: ["audio"],
					canGenerateDeepfakes: false,
					canGenerateSyntheticVoice: true,
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

	describe("Limited risk — recommendation algorithms", () => {
		it("classifies recommendation system as limited risk", () => {
			const ctx = makeContext({
				description: "AI content recommendation engine for personalized content feed",
				productType: "recommender",
				userPopulations: ["internal-users"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("Provisions on Recommendation Algorithms");
		});

		it("classifies suggestion engine as limited risk via description matching", () => {
			const ctx = makeContext({
				description: "AI suggestion engine for product recommendations",
				userPopulations: ["internal-users"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Limited risk — non-public GenAI", () => {
		it("classifies internal-only GenAI (non-generating) as limited risk", () => {
			const ctx = makeContext({
				productType: "classifier",
				userPopulations: ["internal-users"],
				generativeAiContext: {
					usesFoundationModel: true,
					foundationModelSource: "third-party-api",
					generatesContent: false,
					outputModalities: [],
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
			expect(risk.applicableCategories).toContain("cn-internal-genai");
		});
	});

	describe("Limited risk — automated decisions", () => {
		it("classifies fully automated material decisions as limited risk", () => {
			const ctx = makeContext({
				decisionImpact: "material",
				automationLevel: "fully-automated",
				userPopulations: ["internal-users"],
				dataProcessed: ["aggregated"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("PIPL (Personal Information Protection Law)");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-GenAI non-recommendation internal system as minimal", () => {
			const ctx = makeContext({
				description: "Internal analytics tool",
				productType: "other",
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

describe("China Helper Functions", () => {
	it("isPublicFacingGenAi requires GenAI AND public-facing", () => {
		const publicCtx = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		expect(isPublicFacingGenAi(publicCtx)).toBe(true);

		const internalCtx = makeContext({
			productType: "generator",
			userPopulations: ["internal-users"],
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
		expect(isPublicFacingGenAi(internalCtx)).toBe(false);
	});

	it("isDeepSynthesisProduct detects deepfake and voice synthesis", () => {
		const deepfakeCtx = makeContext({
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["image", "video"],
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
		expect(isDeepSynthesisProduct(deepfakeCtx)).toBe(true);
	});

	it("isRecommendationSystem detects recommender product type", () => {
		const ctx = makeContext({ productType: "recommender" });
		expect(isRecommendationSystem(ctx)).toBe(true);
	});

	it("isRecommendationSystem detects recommendation keywords in description", () => {
		const ctx = makeContext({
			description: "AI personalization engine for content feed",
		});
		expect(isRecommendationSystem(ctx)).toBe(true);
	});

	it("requiresAlgorithmFiling for public GenAI, recommendation, or deep synthesis", () => {
		const publicGenAi = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		expect(requiresAlgorithmFiling(publicGenAi)).toBe(true);

		const recommender = makeContext({ productType: "recommender" });
		expect(requiresAlgorithmFiling(recommender)).toBe(true);
	});

	it("isGenAiProduct detects generator and foundation-model types", () => {
		expect(isGenAiProduct(makeContext({ productType: "generator" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
	});
});

// ─── Trigger Matching Tests ───────────────────────────────────────────────

describe("China Trigger Matching", () => {
	it("CAC GenAI triggers match public-facing GenAI service", () => {
		const ctx = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		const triggers = getMatchingCacGenAiTriggers(ctx);
		expect(triggers.some((t) => t.id === "cn-cac-genai-public")).toBe(true);
		expect(triggers.some((t) => t.id === "cn-cac-genai-content-labeling")).toBe(true);
		expect(triggers.some((t) => t.id === "cn-cac-genai-content-review")).toBe(true);
	});

	it("CAC GenAI triggers match training data legality", () => {
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
		const triggers = getMatchingCacGenAiTriggers(ctx);
		expect(triggers.some((t) => t.id === "cn-cac-genai-training-data")).toBe(true);
	});

	it("deep synthesis triggers match face generation", () => {
		const ctx = makeContext({
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["image", "video"],
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
		const triggers = getMatchingDeepSynthesisTriggers(ctx);
		expect(triggers.some((t) => t.id === "cn-deep-synthesis-face")).toBe(true);
	});

	it("deep synthesis triggers match text generation", () => {
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
		const triggers = getMatchingDeepSynthesisTriggers(ctx);
		expect(triggers.some((t) => t.id === "cn-deep-synthesis-text")).toBe(true);
	});

	it("recommendation triggers match recommender type", () => {
		const ctx = makeContext({ productType: "recommender" });
		const triggers = getMatchingRecommendationTriggers(ctx);
		expect(triggers.some((t) => t.id === "cn-recommendation-algo")).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(CAC_GENAI_TRIGGERS.length).toBe(4);
		expect(DEEP_SYNTHESIS_TRIGGERS.length).toBe(3);
		expect(RECOMMENDATION_TRIGGERS.length).toBe(1);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("China Module Methods", () => {
	it("getRequiredArtifacts returns artifacts for public-facing GenAI", () => {
		const ctx = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		const artifacts = chinaModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
	});

	it("getRequiredActions returns algorithm filing and content review actions for public GenAI", () => {
		const ctx = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		const actions = chinaModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
		expect(actions.some((a) => a.priority === "critical")).toBe(true);
	});

	it("getApplicableProvisions returns CAC provisions for public GenAI", () => {
		const ctx = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		const provisions = chinaModule.getApplicableProvisions(ctx);
		expect(provisions.some((p) => p.id === "cn-cac-algorithm-filing")).toBe(true);
		expect(provisions.some((p) => p.id === "cn-cac-content-review")).toBe(true);
		expect(provisions.some((p) => p.id === "cn-cac-content-labeling")).toBe(true);
	});

	it("getTimeline includes CAC GenAI measures effective date", () => {
		const ctx = makeContext({
			productType: "generator",
			userPopulations: ["consumers"],
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
		const timeline = chinaModule.getTimeline(ctx);
		expect(timeline.deadlines.some((d) => d.date === "2023-08-15")).toBe(true);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			description: "Internal analytics tool",
			productType: "other",
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(chinaModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			description: "Internal analytics tool",
			productType: "other",
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(chinaModule.getRequiredActions(ctx)).toEqual([]);
	});
});
