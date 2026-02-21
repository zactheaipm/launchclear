import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	IMDA_AGENTIC_TRIGGERS,
	IMDA_GENAI_TRIGGERS,
	MAS_TRIGGERS,
	PDPC_TRIGGERS,
	classifyRisk,
	getMatchingAgenticTriggers,
	getMatchingGenAiTriggers,
	getMatchingMasTriggers,
	getMatchingPdpcTriggers,
	isAgenticAi,
	isFinancialServicesAi,
	isGenAiProduct,
	singaporeModule,
} from "../../src/jurisdictions/jurisdictions/singapore.js";

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
		targetMarkets: overrides.targetMarkets ?? ["singapore"],
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

describe("Singapore Risk Classification", () => {
	describe("High risk — MAS financial services AI", () => {
		it("classifies financial services AI as high risk", () => {
			const ctx = makeContext({
				description: "AI credit scoring for Singapore bank",
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "lending",
						involvesCredit: true,
						involvesInsurancePricing: false,
						involvesTrading: false,
						involvesAmlKyc: false,
						involvesRegulatoryReporting: false,
						regulatoryBodies: ["MAS"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("MAS");
			expect(risk.provisions).toContain("MAS AI Risk Management Guidelines");
		});

		it("classifies insurance AI as high risk", () => {
			const ctx = makeContext({
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "insurance",
						involvesCredit: false,
						involvesInsurancePricing: true,
						involvesTrading: false,
						involvesAmlKyc: false,
						involvesRegulatoryReporting: false,
						regulatoryBodies: ["MAS"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});

		it("classifies AML/KYC AI as high risk", () => {
			const ctx = makeContext({
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "banking",
						involvesCredit: false,
						involvesInsurancePricing: false,
						involvesTrading: false,
						involvesAmlKyc: true,
						involvesRegulatoryReporting: false,
						regulatoryBodies: ["MAS"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — agentic AI with broad autonomy", () => {
		it("classifies broad autonomy agentic AI as high risk", () => {
			const ctx = makeContext({
				agenticAiContext: {
					isAgentic: true,
					autonomyLevel: "broad",
					toolAccess: ["web-browser", "code-executor", "file-system"],
					actionScope: ["browse-web", "execute-code", "write-files"],
					hasHumanCheckpoints: false,
					isMultiAgent: false,
					canAccessExternalSystems: true,
					canModifyData: true,
					canMakeFinancialTransactions: false,
					hasFailsafeMechanisms: true,
					hasActionLogging: true,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("IMDA");
			expect(risk.justification).toContain("risk bounding");
			expect(risk.provisions).toContain("IMDA Agentic AI Framework");
		});
	});

	describe("High risk — agentic AI with financial transactions", () => {
		it("classifies agentic AI that makes payments as high risk", () => {
			const ctx = makeContext({
				agenticAiContext: {
					isAgentic: true,
					autonomyLevel: "bounded",
					toolAccess: ["payment-api"],
					actionScope: ["make-payment"],
					hasHumanCheckpoints: true,
					isMultiAgent: false,
					canAccessExternalSystems: true,
					canModifyData: false,
					canMakeFinancialTransactions: true,
					hasFailsafeMechanisms: true,
					hasActionLogging: true,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("High risk — foundation model provider", () => {
		it("classifies foundation model provider as high risk", () => {
			const ctx = makeContext({
				productType: "foundation-model",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.provisions).toContain("IMDA GenAI Governance Framework");
		});
	});

	describe("Limited risk — GenAI content generation", () => {
		it("classifies GenAI product as limited risk", () => {
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
			expect(risk.provisions).toContain("IMDA GenAI Governance Framework");
		});
	});

	describe("Limited risk — basic agentic AI", () => {
		it("classifies narrow autonomy agentic AI as limited risk", () => {
			const ctx = makeContext({
				agenticAiContext: {
					isAgentic: true,
					autonomyLevel: "narrow",
					toolAccess: ["email"],
					actionScope: ["send-email"],
					hasHumanCheckpoints: true,
					isMultiAgent: false,
					canAccessExternalSystems: false,
					canModifyData: false,
					canMakeFinancialTransactions: false,
					hasFailsafeMechanisms: true,
					hasActionLogging: true,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("IMDA Agentic AI Framework");
		});
	});

	describe("Limited risk — personal data processing", () => {
		it("classifies personal data processing as limited risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("PDPA");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-triggering system as minimal", () => {
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

describe("Singapore Helper Functions", () => {
	it("isGenAiProduct detects generator and foundation model types", () => {
		expect(isGenAiProduct(makeContext({ productType: "generator" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
	});

	it("isAgenticAi detects agentic context", () => {
		const ctx = makeContext({
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "narrow",
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

	it("isFinancialServicesAi checks sector context", () => {
		const ctx = makeContext({ sectorContext: { sector: "financial-services" } });
		expect(isFinancialServicesAi(ctx)).toBe(true);
	});
});

// ─── Trigger Matching Tests ───────────────────────────────────────────────

describe("Singapore Trigger Matching", () => {
	it("PDPC triggers match personal data processing", () => {
		const ctx = makeContext({ dataProcessed: ["personal"] });
		const triggers = getMatchingPdpcTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-pdpc-personal-data")).toBe(true);
	});

	it("PDPC triggers match fully automated material decisions", () => {
		const ctx = makeContext({
			decisionImpact: "material",
			automationLevel: "fully-automated",
		});
		const triggers = getMatchingPdpcTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-pdpc-automated-decisions")).toBe(true);
	});

	it("IMDA GenAI triggers match foundation model usage", () => {
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
		const triggers = getMatchingGenAiTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-imda-genai-foundation")).toBe(true);
		expect(triggers.some((t) => t.id === "sg-imda-genai-content")).toBe(true);
	});

	it("IMDA GenAI triggers match deepfake capabilities", () => {
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
		const triggers = getMatchingGenAiTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-imda-genai-deepfake")).toBe(true);
	});

	it("IMDA Agentic triggers match basic agentic AI", () => {
		const ctx = makeContext({
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "narrow",
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
		const triggers = getMatchingAgenticTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-imda-agentic-basic")).toBe(true);
	});

	it("IMDA Agentic triggers match broad autonomy", () => {
		const ctx = makeContext({
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "broad",
				toolAccess: [],
				actionScope: [],
				hasHumanCheckpoints: false,
				isMultiAgent: false,
				canAccessExternalSystems: true,
				canModifyData: true,
				canMakeFinancialTransactions: false,
				hasFailsafeMechanisms: true,
				hasActionLogging: true,
			},
		});
		const triggers = getMatchingAgenticTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-imda-agentic-broad")).toBe(true);
	});

	it("IMDA Agentic triggers match multi-agent systems", () => {
		const ctx = makeContext({
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "bounded",
				toolAccess: [],
				actionScope: [],
				hasHumanCheckpoints: true,
				isMultiAgent: true,
				canAccessExternalSystems: false,
				canModifyData: false,
				canMakeFinancialTransactions: false,
				hasFailsafeMechanisms: true,
				hasActionLogging: true,
			},
		});
		const triggers = getMatchingAgenticTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-imda-agentic-multi-agent")).toBe(true);
	});

	it("MAS triggers match credit scoring", () => {
		const ctx = makeContext({
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["MAS"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});
		const triggers = getMatchingMasTriggers(ctx);
		expect(triggers.some((t) => t.id === "sg-mas-financial-ai")).toBe(true);
		expect(triggers.some((t) => t.id === "sg-mas-credit-scoring")).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(PDPC_TRIGGERS.length).toBe(2);
		expect(IMDA_GENAI_TRIGGERS.length).toBe(3);
		expect(IMDA_AGENTIC_TRIGGERS.length).toBe(4);
		expect(MAS_TRIGGERS.length).toBe(6);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("Singapore Module Methods", () => {
	it("getRequiredArtifacts returns artifacts for MAS financial AI", () => {
		const ctx = makeContext({
			sectorContext: { sector: "financial-services" },
		});
		const artifacts = singaporeModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
	});

	it("getRequiredActions returns actions for GenAI products", () => {
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
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});
		const actions = singaporeModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
	});

	it("getApplicableProvisions returns PDPA provisions for personal data", () => {
		const ctx = makeContext({
			dataProcessed: ["personal"],
		});
		const provisions = singaporeModule.getApplicableProvisions(ctx);
		expect(provisions.length).toBeGreaterThan(0);
		expect(provisions.some((p) => p.law === "PDPA")).toBe(true);
	});

	it("getTimeline returns timeline information", () => {
		const ctx = makeContext({
			sectorContext: { sector: "financial-services" },
		});
		const timeline = singaporeModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBeDefined();
		expect(timeline.deadlines.length).toBeGreaterThan(0);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(singaporeModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(singaporeModule.getRequiredActions(ctx)).toEqual([]);
	});
});
