import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	DEEPFAKE_TRIGGERS,
	TRAIGA_TRIGGERS,
	classifyRisk,
	getMatchingDeepfakeTriggers,
	getMatchingTraigaTriggers,
	isGenAiProduct,
	isHighRiskAi,
	texasModule,
} from "../../src/jurisdictions/jurisdictions/us-states/texas.js";

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
		targetMarkets: overrides.targetMarkets ?? ["us-tx"],
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

describe("Texas Risk Classification", () => {
	describe("High risk — TRAIGA employment", () => {
		it("classifies employment AI with material impact as high risk", () => {
			const ctx = makeContext({
				description: "AI hiring screening tool",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("TRAIGA");
			expect(risk.provisions).toContain("TRAIGA (Texas Responsible AI Governance Act)");
		});
	});

	describe("High risk — TRAIGA education", () => {
		it("classifies education AI with determinative impact as high risk", () => {
			const ctx = makeContext({
				description: "AI student admissions evaluation tool",
				userPopulations: ["students"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("traiga-education");
		});
	});

	describe("High risk — TRAIGA financial", () => {
		it("classifies credit AI as high risk", () => {
			const ctx = makeContext({
				description: "AI credit scoring for lending decisions",
				userPopulations: ["credit-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("traiga-financial");
		});
	});

	describe("High risk — TRAIGA housing", () => {
		it("classifies housing AI as high risk", () => {
			const ctx = makeContext({
				description: "AI tenant screening system",
				userPopulations: ["tenants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("traiga-housing");
		});
	});

	describe("High risk — TRAIGA healthcare", () => {
		it("classifies healthcare AI as high risk", () => {
			const ctx = makeContext({
				description: "AI clinical decision support",
				userPopulations: ["patients"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("traiga-healthcare");
		});
	});

	describe("High risk — TRAIGA government", () => {
		it("classifies government services AI as high risk", () => {
			const ctx = makeContext({
				description:
					"AI system for public benefit eligibility determination and welfare allocation",
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("traiga-government");
		});
	});

	describe("High risk — TRAIGA legal", () => {
		it("classifies legal services AI as high risk", () => {
			const ctx = makeContext({
				description: "AI system for judicial sentencing recommendations",
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("traiga-legal");
		});
	});

	describe("Limited risk — deepfakes", () => {
		it("classifies election deepfake AI as limited risk", () => {
			const ctx = makeContext({
				description: "AI tool that could generate political campaign content and candidate imagery",
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
			expect(risk.level).toBe("limited");
			expect(risk.applicableCategories).toContain("tx-deepfake-election");
		});

		it("classifies sexual deepfake AI as limited risk", () => {
			const ctx = makeContext({
				description: "AI image/video generator with face-swap",
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
			expect(risk.level).toBe("limited");
			expect(risk.applicableCategories).toContain("tx-deepfake-sexual");
		});
	});

	describe("Limited risk — GenAI content generation", () => {
		it("classifies GenAI text generator as limited risk", () => {
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
			expect(risk.provisions).toContain("TRAIGA GenAI Provisions");
		});
	});

	describe("Limited risk — consumer-facing AI", () => {
		it("classifies general consumer AI as limited risk", () => {
			const ctx = makeContext({
				userPopulations: ["consumers"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-consumer internal AI as minimal", () => {
			const ctx = makeContext({
				description: "Internal analytics dashboard",
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

describe("Texas Helper Functions", () => {
	it("isHighRiskAi requires TRAIGA trigger match", () => {
		const highCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		expect(isHighRiskAi(highCtx)).toBe(true);

		const lowCtx = makeContext({
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
		});
		expect(isHighRiskAi(lowCtx)).toBe(false);
	});

	it("isGenAiProduct detects generator and foundation-model", () => {
		expect(isGenAiProduct(makeContext({ productType: "generator" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
	});

	it("getMatchingTraigaTriggers returns matching employment trigger", () => {
		const ctx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "determinative",
		});
		const triggers = getMatchingTraigaTriggers(ctx);
		expect(triggers.some((t) => t.id === "traiga-employment")).toBe(true);
	});

	it("getMatchingDeepfakeTriggers returns election trigger for political deepfakes", () => {
		const ctx = makeContext({
			description: "AI tool for generating political election campaign content",
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
		const triggers = getMatchingDeepfakeTriggers(ctx);
		expect(triggers.some((t) => t.id === "tx-deepfake-election")).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(TRAIGA_TRIGGERS.length).toBe(7);
		expect(DEEPFAKE_TRIGGERS.length).toBe(2);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("Texas Module Methods", () => {
	it("getRequiredArtifacts returns governance artifacts for high-risk", () => {
		const ctx = makeContext({
			description: "AI hiring screening tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const artifacts = texasModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
	});

	it("getRequiredActions returns actions for high-risk systems", () => {
		const ctx = makeContext({
			description: "AI hiring screening tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const actions = texasModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
		expect(actions.some((a) => a.priority === "critical")).toBe(true);
	});

	it("getApplicableProvisions returns TRAIGA provisions for high-risk", () => {
		const ctx = makeContext({
			description: "AI credit scoring",
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
		});
		const provisions = texasModule.getApplicableProvisions(ctx);
		expect(provisions.length).toBeGreaterThan(0);
	});

	it("getTimeline includes both TRAIGA and deepfake deadlines", () => {
		const ctx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const timeline = texasModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBe("2025-09-01");
		expect(timeline.deadlines.some((d) => d.provision === "TRAIGA")).toBe(true);
		expect(timeline.deadlines.some((d) => d.provision === "Texas Election Code § 255.004")).toBe(
			true,
		);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(texasModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(texasModule.getRequiredActions(ctx)).toEqual([]);
	});
});
