import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	GENAI_TRIGGERS,
	LL144_TRIGGERS,
	classifyRisk,
	getMatchingLl144Triggers,
	isAedt,
	isFinancialServicesAi,
	isGenAiProduct,
	newYorkModule,
} from "../../src/jurisdictions/jurisdictions/us-states/new-york.js";

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
		targetMarkets: overrides.targetMarkets ?? ["us-ny"],
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

describe("New York Risk Classification", () => {
	describe("High risk — LL144 AEDT hiring", () => {
		it("classifies hiring AEDT as high risk", () => {
			const ctx = makeContext({
				description: "AI resume screening tool for hiring decisions",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("AEDT");
			expect(risk.justification).toContain("NYC Local Law 144");
			expect(risk.provisions).toContain("NYC Local Law 144 (Int. 1894-2020)");
		});

		it("classifies candidate screening with determinative impact as high risk", () => {
			const ctx = makeContext({
				description: "AI system that auto-rejects candidate applications based on screening",
				userPopulations: ["job-applicants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("ll144-aedt-hiring");
		});
	});

	describe("High risk — LL144 AEDT promotion", () => {
		it("classifies promotion evaluation AI as high risk", () => {
			const ctx = makeContext({
				description: "AI system for employee performance evaluation and promotion decisions",
				userPopulations: ["employees"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("ll144-aedt-promotion");
		});

		it("classifies advancement assessment AI as high risk", () => {
			const ctx = makeContext({
				description: "AI-driven employee advancement scoring system",
				userPopulations: ["employees"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("Limited risk — financial services", () => {
		it("classifies financial services AI as limited risk", () => {
			const ctx = makeContext({
				description: "AI risk assessment tool for banking",
				sectorContext: { sector: "financial-services" },
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.justification).toContain("NYDFS");
			expect(risk.provisions).toContain("NYDFS Cybersecurity Regulation (23 NYCRR 500)");
		});
	});

	describe("Limited risk — GenAI deepfakes", () => {
		it("classifies deepfake-capable GenAI as limited risk", () => {
			const ctx = makeContext({
				description: "AI content generation platform",
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
			expect(risk.provisions).toContain("New York Deepfake Laws");
		});
	});

	describe("Limited risk — consumer-facing AI", () => {
		it("classifies general consumer AI as limited risk", () => {
			const ctx = makeContext({
				userPopulations: ["consumers"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.justification).toContain("consumer-facing");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-triggering AI as minimal", () => {
			const ctx = makeContext({
				description: "Internal code analysis tool",
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

describe("New York Helper Functions", () => {
	it("isAedt returns true for hiring AI with material impact", () => {
		const ctx = makeContext({
			description: "AI hiring tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		expect(isAedt(ctx)).toBe(true);
	});

	it("isAedt returns false for advisory-only hiring AI", () => {
		const ctx = makeContext({
			description: "AI hiring tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "advisory",
		});
		expect(isAedt(ctx)).toBe(false);
	});

	it("getMatchingLl144Triggers returns hiring trigger", () => {
		const ctx = makeContext({
			description: "AI resume screening for hiring",
			userPopulations: ["job-applicants"],
			decisionImpact: "determinative",
		});
		const triggers = getMatchingLl144Triggers(ctx);
		expect(triggers.some((t) => t.id === "ll144-aedt-hiring")).toBe(true);
	});

	it("getMatchingLl144Triggers returns promotion trigger", () => {
		const ctx = makeContext({
			description: "AI employee promotion evaluation",
			userPopulations: ["employees"],
			decisionImpact: "material",
		});
		const triggers = getMatchingLl144Triggers(ctx);
		expect(triggers.some((t) => t.id === "ll144-aedt-promotion")).toBe(true);
	});

	it("isGenAiProduct detects generative AI context", () => {
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
		expect(isGenAiProduct(ctx)).toBe(true);
	});

	it("isFinancialServicesAi detects financial sector", () => {
		const ctx = makeContext({ sectorContext: { sector: "financial-services" } });
		expect(isFinancialServicesAi(ctx)).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(LL144_TRIGGERS.length).toBe(2);
		expect(GENAI_TRIGGERS.length).toBe(1);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("New York Module Methods", () => {
	it("getRequiredArtifacts returns bias audit and notice for AEDT", () => {
		const ctx = makeContext({
			description: "AI hiring tool with automated resume screening",
			userPopulations: ["job-applicants"],
			decisionImpact: "determinative",
		});
		const artifacts = newYorkModule.getRequiredArtifacts(ctx);
		expect(artifacts.some((a) => a.type === "bias-audit")).toBe(true);
		expect(artifacts.some((a) => a.type === "transparency-notice")).toBe(true);
		expect(artifacts.some((a) => a.name.includes("LL144"))).toBe(true);
	});

	it("getRequiredActions returns all LL144 critical actions for AEDT", () => {
		const ctx = makeContext({
			description: "AI hiring tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const actions = newYorkModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "us-ny-ll144-engage-auditor")).toBe(true);
		expect(actions.some((a) => a.id === "us-ny-ll144-conduct-audit")).toBe(true);
		expect(actions.some((a) => a.id === "us-ny-ll144-publish-results")).toBe(true);
		expect(actions.some((a) => a.id === "us-ny-ll144-candidate-notice")).toBe(true);
		expect(actions.some((a) => a.id === "us-ny-ll144-data-deletion")).toBe(true);
	});

	it("getRequiredActions returns deepfake safeguards for synthetic media GenAI", () => {
		const ctx = makeContext({
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
		const actions = newYorkModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "us-ny-deepfake-safeguards")).toBe(true);
	});

	it("getApplicableProvisions returns LL144 provisions for AEDT", () => {
		const ctx = makeContext({
			description: "AI hiring tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "determinative",
		});
		const provisions = newYorkModule.getApplicableProvisions(ctx);
		expect(provisions.some((p) => p.id === "us-ny-ll144-bias-audit")).toBe(true);
		expect(provisions.some((p) => p.id === "us-ny-ll144-notice")).toBe(true);
		expect(provisions.some((p) => p.id === "us-ny-ll144-summary-publication")).toBe(true);
		expect(provisions.some((p) => p.id === "us-ny-ll144-data-collection")).toBe(true);
	});

	it("getApplicableProvisions returns deepfake provisions for synthetic media", () => {
		const ctx = makeContext({
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["image"],
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
		const provisions = newYorkModule.getApplicableProvisions(ctx);
		expect(provisions.some((p) => p.id === "us-ny-deepfake")).toBe(true);
	});

	it("getTimeline references LL144 enforcement date of 2023-07-05", () => {
		const ctx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const timeline = newYorkModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBe("2023-07-05");
		expect(timeline.deadlines.some((d) => d.date === "2023-07-05")).toBe(true);
	});

	it("getTimeline notes mention DCWP enforcement fines", () => {
		const ctx = makeContext({
			description: "AI hiring tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const timeline = newYorkModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("$500") && n.includes("DCWP"))).toBe(true);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(newYorkModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(newYorkModule.getRequiredActions(ctx)).toEqual([]);
	});
});
