import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	CCPA_TRIGGERS,
	DEEPFAKE_TRIGGERS,
	FINANCIAL_TRIGGERS,
	SB_243_TRIGGERS,
	SB_942_TRIGGERS,
	californiaModule,
	classifyRisk,
	getMatchingCcpaTriggers,
	getMatchingDeepfakeTriggers,
	getMatchingFinancialTriggers,
	getMatchingSb243Triggers,
	getMatchingSb942Triggers,
	hasDeepfakeCapabilities,
	hasPoliticalDeepfakeConcerns,
	involvesMinors,
	isAgenticAi,
	isAutomatedDecisionMakingOnConsumers,
	isFinancialServicesAi,
	isGenAiProduct,
	processesConsumerPersonalData,
} from "../../src/jurisdictions/jurisdictions/us-states/california.js";

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
		targetMarkets: overrides.targetMarkets ?? ["us-ca"],
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

describe("California Risk Classification", () => {
	describe("High risk — automated decisions in high-stakes domains", () => {
		it("classifies hiring AI with automated decisions as high risk", () => {
			const ctx = makeContext({
				description: "AI system for screening job applicants and auto-rejecting low scorers",
				userPopulations: ["consumers", "job-applicants"],
				decisionImpact: "determinative",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("automated decisions");
			expect(risk.provisions).toContain("SB 243");
		});

		it("classifies credit scoring AI as high risk", () => {
			const ctx = makeContext({
				description: "AI credit scoring model for consumer lending decisions",
				userPopulations: ["consumers", "credit-applicants"],
				decisionImpact: "material",
				automationLevel: "human-on-the-loop",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("us-ca-sb243-ai-regulation");
		});

		it("classifies housing AI with determinative impact as high risk", () => {
			const ctx = makeContext({
				description: "AI tenant screening system for housing applications",
				userPopulations: ["consumers", "tenants"],
				decisionImpact: "determinative",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — biometric data", () => {
		it("classifies biometric consumer data processing as high risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal", "biometric"],
				userPopulations: ["consumers"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.provisions).toContain("CPRA §1798.121");
		});
	});

	describe("High risk — political deepfakes", () => {
		it("classifies political deepfake AI as high risk", () => {
			const ctx = makeContext({
				description:
					"AI image generator that could create political candidate deepfakes during election season",
				productType: "generator",
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
			expect(risk.applicableCategories).toContain("us-ca-ab730-political-deepfakes");
			expect(risk.provisions).toContain("AB 730 (Cal. Elec. Code §20010)");
		});
	});

	describe("High risk — sexual deepfakes (AB 602)", () => {
		it("classifies deepfake image/video generator as high risk for AB 602", () => {
			const ctx = makeContext({
				description: "AI video generator with face-swap capabilities",
				productType: "generator",
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
			expect(risk.applicableCategories).toContain("us-ca-ab602-sexual-deepfakes");
		});
	});

	describe("Limited risk — consumer personal data", () => {
		it("classifies consumer personal data processing as limited risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal", "behavioral"],
				userPopulations: ["consumers"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("CCPA/CPRA");
		});
	});

	describe("Limited risk — SB 942 GenAI transparency", () => {
		it("classifies GenAI content generator for consumers as limited risk", () => {
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

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("SB 942");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-consumer internal AI as minimal risk", () => {
			const ctx = makeContext({
				description: "Internal analytics tool",
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

describe("California Helper Functions", () => {
	it("processesConsumerPersonalData returns true for consumers with personal data", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
		});
		expect(processesConsumerPersonalData(ctx)).toBe(true);
	});

	it("processesConsumerPersonalData returns false for non-consumers", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
			userPopulations: ["internal-users"],
		});
		expect(processesConsumerPersonalData(ctx)).toBe(false);
	});

	it("isGenAiProduct detects generator product type", () => {
		const ctx = makeContext({ productType: "generator" });
		expect(isGenAiProduct(ctx)).toBe(true);
	});

	it("isGenAiProduct detects generativeAiContext.generatesContent", () => {
		const ctx = makeContext({
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
		expect(isGenAiProduct(ctx)).toBe(true);
	});

	it("isAutomatedDecisionMakingOnConsumers requires fully-automated or human-on-loop with material impact on consumers", () => {
		const ctx = makeContext({
			userPopulations: ["consumers"],
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		expect(isAutomatedDecisionMakingOnConsumers(ctx)).toBe(true);
	});

	it("involvesMinors detects minor populations", () => {
		const ctx = makeContext({ userPopulations: ["consumers", "minors"] });
		expect(involvesMinors(ctx)).toBe(true);
	});

	it("hasDeepfakeCapabilities detects canGenerateDeepfakes", () => {
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
		expect(hasDeepfakeCapabilities(ctx)).toBe(true);
	});

	it("hasPoliticalDeepfakeConcerns requires deepfake + political context", () => {
		const ctx = makeContext({
			description: "AI tool for election campaign video generation",
			productType: "generator",
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
		expect(hasPoliticalDeepfakeConcerns(ctx)).toBe(true);
	});

	it("isFinancialServicesAi checks sectorContext", () => {
		const ctx = makeContext({
			sectorContext: {
				sector: "financial-services",
			},
		});
		expect(isFinancialServicesAi(ctx)).toBe(true);
	});

	it("isAgenticAi checks agenticAiContext", () => {
		const ctx = makeContext({
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
		expect(isAgenticAi(ctx)).toBe(true);
	});
});

// ─── Trigger Matching Tests ───────────────────────────────────────────────

describe("California Trigger Matching", () => {
	it("CCPA triggers match consumer personal data", () => {
		const ctx = makeContext({
			dataProcessed: ["personal", "sensitive"],
			userPopulations: ["consumers"],
		});
		const triggers = getMatchingCcpaTriggers(ctx);
		expect(triggers.length).toBeGreaterThan(0);
		expect(triggers.some((t) => t.id === "us-ca-ccpa-personal-info")).toBe(true);
	});

	it("SB 942 triggers match GenAI content generation for consumers", () => {
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
		const triggers = getMatchingSb942Triggers(ctx);
		expect(triggers.length).toBeGreaterThan(0);
	});

	it("deepfake triggers match canGenerateDeepfakes with image/video", () => {
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
		const triggers = getMatchingDeepfakeTriggers(ctx);
		expect(triggers.length).toBeGreaterThan(0);
	});

	it("trigger arrays have expected number of entries", () => {
		expect(CCPA_TRIGGERS.length).toBeGreaterThan(0);
		expect(SB_942_TRIGGERS.length).toBeGreaterThan(0);
		expect(DEEPFAKE_TRIGGERS.length).toBeGreaterThan(0);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("California Module Methods", () => {
	it("getRequiredArtifacts returns artifacts for high-risk contexts", () => {
		const ctx = makeContext({
			description: "AI hiring tool with automated resume screening",
			userPopulations: ["consumers", "job-applicants"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});
		const artifacts = californiaModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
	});

	it("getRequiredActions returns actions for high-risk contexts", () => {
		const ctx = makeContext({
			description: "AI hiring tool with automated resume screening",
			userPopulations: ["consumers", "job-applicants"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});
		const actions = californiaModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
		expect(actions.some((a) => a.priority === "critical")).toBe(true);
	});

	it("getApplicableProvisions returns provisions for consumer data", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
		});
		const provisions = californiaModule.getApplicableProvisions(ctx);
		expect(provisions.length).toBeGreaterThan(0);
		expect(provisions.some((p) => p.law === "CCPA/CPRA")).toBe(true);
	});

	it("getTimeline returns timeline with effective dates", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
		});
		const timeline = californiaModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBeDefined();
		expect(timeline.deadlines.length).toBeGreaterThan(0);
	});

	it("returns no artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		const artifacts = californiaModule.getRequiredArtifacts(ctx);
		expect(artifacts).toEqual([]);
	});

	it("returns no actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		const actions = californiaModule.getRequiredActions(ctx);
		expect(actions).toEqual([]);
	});
});
