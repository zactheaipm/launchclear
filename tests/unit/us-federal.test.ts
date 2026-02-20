import { beforeEach, describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	classifyRisk,
	getMatchingFinancialTriggers,
	getMatchingFtcTriggers,
	getMatchingNistTriggers,
	isCreditScoringAi,
	isFinancialServicesAi,
	isGenAiProduct,
	isHighImpactAutomatedDecision,
	usFederalModule,
} from "../../src/jurisdictions/jurisdictions/us-federal.js";
import { clearRegistry, registerJurisdiction } from "../../src/jurisdictions/registry.js";
import { mapJurisdiction } from "../../src/jurisdictions/requirement-mapper.js";

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
		targetMarkets: overrides.targetMarkets ?? ["us-federal"],
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

describe("US Federal Risk Classification", () => {
	describe("High-risk: Financial services AI", () => {
		it("classifies credit scoring AI as high-risk", () => {
			const ctx = makeContext({
				description: "AI system for credit scoring and creditworthiness assessment",
				productType: "classifier",
				dataProcessed: ["personal", "financial"],
				userPopulations: ["credit-applicants"],
				decisionImpact: "determinative",
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "lending",
						involvesCredit: true,
						involvesInsurancePricing: false,
						involvesTrading: false,
						involvesAmlKyc: false,
						involvesRegulatoryReporting: false,
						regulatoryBodies: ["OCC", "CFPB"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("credit-scoring");
			expect(risk.provisions).toContain("ECOA/Regulation B");
			expect(risk.provisions).toContain("SR 11-7");
		});

		it("classifies credit scoring via description keywords as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system that evaluates credit scoring of loan applicants based on financial history",
				productType: "classifier",
				dataProcessed: ["personal", "financial"],
				userPopulations: ["credit-applicants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("credit-scoring");
		});

		it("classifies financial services AI with model risk as high-risk", () => {
			const ctx = makeContext({
				description: "AI system for insurance pricing and underwriting",
				productType: "predictor",
				dataProcessed: ["personal", "financial"],
				userPopulations: ["consumers"],
				decisionImpact: "material",
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "insurance",
						involvesCredit: false,
						involvesInsurancePricing: true,
						involvesTrading: false,
						involvesAmlKyc: false,
						involvesRegulatoryReporting: false,
						regulatoryBodies: ["NAIC"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: true,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("Limited risk: GenAI and consumer AI", () => {
		it("classifies GenAI content generator as limited risk", () => {
			const ctx = makeContext({
				description: "AI chatbot that generates content for consumers",
				productType: "generator",
				dataProcessed: ["personal"],
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
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
			expect(risk.applicableCategories).toContain("ftc-genai-synthetic-content");
			expect(risk.provisions).toContain("NIST AI 600-1");
		});

		it("classifies high-impact automated decision as limited risk", () => {
			const ctx = makeContext({
				description: "AI system that automatically screens tenant applications",
				productType: "classifier",
				dataProcessed: ["personal"],
				userPopulations: ["tenants"],
				decisionImpact: "determinative",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.justification).toContain("FTC");
		});

		it("classifies consumer-facing AI as limited risk", () => {
			const ctx = makeContext({
				description: "AI product recommendation system for consumers",
				productType: "recommender",
				dataProcessed: ["personal", "behavioral"],
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Minimal risk", () => {
		it("classifies B2B AI with no consumer impact as minimal", () => {
			const ctx = makeContext({
				description: "AI inventory management system for warehouses",
				productType: "predictor",
				dataProcessed: ["other"],
				userPopulations: ["businesses"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
			expect(risk.justification).toContain("NIST AI RMF is recommended");
		});
	});
});

// ─── Applicable Provisions Tests ──────────────────────────────────────────

describe("US Federal Applicable Provisions", () => {
	it("always includes NIST AI RMF", () => {
		const ctx = makeContext({
			description: "Any AI system",
			productType: "other",
			dataProcessed: ["other"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const provisions = usFederalModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("us-nist-ai-rmf");
	});

	it("includes FTC Section 5 for consumer-facing AI", () => {
		const ctx = makeContext({
			description: "AI product for consumers",
			productType: "recommender",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
		});

		const provisions = usFederalModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("us-ftc-section5");
	});

	it("includes NIST GenAI profile for generative AI products", () => {
		const ctx = makeContext({
			description: "AI image generation tool",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["image"],
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

		const provisions = usFederalModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("us-nist-genai-profile");
	});

	it("includes FTC deepfake guidance for deepfake-capable systems", () => {
		const ctx = makeContext({
			description: "AI video generation platform",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "third-party-api",
				generatesContent: true,
				outputModalities: ["video"],
				canGenerateDeepfakes: true,
				canGenerateSyntheticVoice: true,
				hasOutputWatermarking: false,
				hasOutputFiltering: true,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});

		const provisions = usFederalModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("us-ftc-genai-deepfakes");
	});

	it("includes SR 11-7 for financial services AI", () => {
		const ctx = makeContext({
			description: "AI model for credit decisions at a bank",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});

		const provisions = usFederalModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("us-sr-11-7");
		expect(provisionIds).toContain("us-cfpb-fair-lending");
	});

	it("includes SEC provisions for investment advisory AI", () => {
		const ctx = makeContext({
			description: "AI robo-advisor for portfolio management",
			productType: "recommender",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["consumers"],
			decisionImpact: "material",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "investment",
					involvesCredit: false,
					involvesInsurancePricing: false,
					involvesTrading: true,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["SEC"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: true,
				},
			},
		});

		const provisions = usFederalModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("us-sec-ai-advisory");
	});
});

// ─── Required Artifacts Tests ─────────────────────────────────────────────

describe("US Federal Required Artifacts", () => {
	it("requires risk assessment for high-risk financial AI", () => {
		const ctx = makeContext({
			description: "AI credit scoring model",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});

		const artifacts = usFederalModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("risk-assessment");
		expect(types).toContain("model-card");
		expect(types).toContain("bias-audit");
	});

	it("requires transparency notice for GenAI products", () => {
		const ctx = makeContext({
			description: "AI chatbot",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
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

		const artifacts = usFederalModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("transparency-notice");
	});

	it("requires model documentation for financial services AI", () => {
		const ctx = makeContext({
			description: "AI model for insurance pricing",
			productType: "predictor",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["consumers"],
			decisionImpact: "material",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "insurance",
					involvesCredit: false,
					involvesInsurancePricing: true,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["NAIC"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: true,
				},
			},
		});

		const artifacts = usFederalModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("model-card");
	});
});

// ─── Required Actions Tests ───────────────────────────────────────────────

describe("US Federal Required Actions", () => {
	it("recommends NIST AI RMF alignment for all AI", () => {
		const ctx = makeContext({
			description: "Any AI system",
			productType: "other",
			dataProcessed: ["other"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const actions = usFederalModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "us-nist-rmf-alignment")).toBe(true);
		const nistAction = actions.find((a) => a.id === "us-nist-rmf-alignment");
		expect(nistAction?.priority).toBe("recommended");
	});

	it("requires GenAI risk management for generative AI products", () => {
		const ctx = makeContext({
			description: "AI text generation service",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
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

		const actions = usFederalModule.getRequiredActions(ctx);
		const actionIds = actions.map((a) => a.id);
		expect(actionIds).toContain("us-nist-genai-risk-management");
		expect(actionIds).toContain("us-ftc-genai-disclosure");
	});

	it("requires SR 11-7 model risk governance for financial services AI", () => {
		const ctx = makeContext({
			description: "AI credit scoring model at a supervised bank",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});

		const actions = usFederalModule.getRequiredActions(ctx);
		const actionIds = actions.map((a) => a.id);
		expect(actionIds).toContain("us-sr-11-7-governance");
		expect(actionIds).toContain("us-sr-11-7-validation");
		expect(actionIds).toContain("us-sr-11-7-monitoring");
	});

	it("requires CFPB fair lending actions for credit scoring AI", () => {
		const ctx = makeContext({
			description: "AI credit scoring model",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});

		const actions = usFederalModule.getRequiredActions(ctx);
		const actionIds = actions.map((a) => a.id);
		expect(actionIds).toContain("us-cfpb-adverse-action");
		expect(actionIds).toContain("us-cfpb-fair-lending-testing");

		const adverseAction = actions.find((a) => a.id === "us-cfpb-adverse-action");
		expect(adverseAction?.priority).toBe("critical");
	});

	it("requires SEC disclosure for investment advisory AI", () => {
		const ctx = makeContext({
			description: "AI robo-advisor for portfolio management",
			productType: "recommender",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["consumers"],
			decisionImpact: "material",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "investment",
					involvesCredit: false,
					involvesInsurancePricing: false,
					involvesTrading: true,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["SEC"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: true,
				},
			},
		});

		const actions = usFederalModule.getRequiredActions(ctx);
		const actionIds = actions.map((a) => a.id);
		expect(actionIds).toContain("us-sec-ai-disclosure");
	});

	it("requires FTC fairness testing for high-impact automated decisions", () => {
		const ctx = makeContext({
			description: "AI system that automatically screens tenant applications",
			productType: "classifier",
			dataProcessed: ["personal"],
			userPopulations: ["tenants"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});

		const actions = usFederalModule.getRequiredActions(ctx);
		const actionIds = actions.map((a) => a.id);
		expect(actionIds).toContain("us-ftc-fair-ai-decisions");
	});
});

// ─── Compliance Timeline Tests ────────────────────────────────────────────

describe("US Federal Compliance Timeline", () => {
	it("notes enforcement-driven regulatory approach", () => {
		const ctx = makeContext();
		const timeline = usFederalModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBeNull();
		expect(timeline.notes.some((n) => n.includes("enforcement-driven"))).toBe(true);
	});

	it("notes immediate financial services obligations for high-risk", () => {
		const ctx = makeContext({
			description: "AI credit scoring at a bank",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});

		const timeline = usFederalModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("supervisory expectations"))).toBe(true);
	});

	it("notes NIST GenAI profile for GenAI products", () => {
		const ctx = makeContext({
			description: "AI content generation tool",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
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

		const timeline = usFederalModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("NIST AI 600-1"))).toBe(true);
	});
});

// ─── Helper Function Tests ────────────────────────────────────────────────

describe("US Federal Helper Functions", () => {
	it("detects GenAI products", () => {
		expect(
			isGenAiProduct(
				makeContext({
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
				}),
			),
		).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "generator" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "foundation-model" }))).toBe(true);
		expect(isGenAiProduct(makeContext({ productType: "classifier" }))).toBe(false);
	});

	it("detects financial services AI", () => {
		expect(
			isFinancialServicesAi(
				makeContext({
					sectorContext: {
						sector: "financial-services",
						financialServices: {
							subSector: "lending",
							involvesCredit: true,
							involvesInsurancePricing: false,
							involvesTrading: false,
							involvesAmlKyc: false,
							involvesRegulatoryReporting: false,
							regulatoryBodies: ["OCC"],
							hasMaterialityAssessment: false,
							hasModelRiskGovernance: false,
						},
					},
				}),
			),
		).toBe(true);
		expect(isFinancialServicesAi(makeContext())).toBe(false);
	});

	it("detects credit scoring AI", () => {
		expect(
			isCreditScoringAi(makeContext({ userPopulations: ["credit-applicants"] })),
		).toBe(true);
		expect(
			isCreditScoringAi(
				makeContext({ description: "AI credit scoring system" }),
			),
		).toBe(true);
		expect(
			isCreditScoringAi(
				makeContext({
					sectorContext: {
						sector: "financial-services",
						financialServices: {
							subSector: "lending",
							involvesCredit: true,
							involvesInsurancePricing: false,
							involvesTrading: false,
							involvesAmlKyc: false,
							involvesRegulatoryReporting: false,
							regulatoryBodies: ["CFPB"],
							hasMaterialityAssessment: false,
							hasModelRiskGovernance: false,
						},
					},
				}),
			),
		).toBe(true);
		expect(isCreditScoringAi(makeContext({ description: "AI spam filter" }))).toBe(false);
	});

	it("detects high-impact automated decisions", () => {
		expect(
			isHighImpactAutomatedDecision(
				makeContext({
					decisionImpact: "determinative",
					automationLevel: "fully-automated",
					userPopulations: ["consumers"],
				}),
			),
		).toBe(true);
		expect(
			isHighImpactAutomatedDecision(
				makeContext({
					decisionImpact: "advisory",
					automationLevel: "fully-automated",
					userPopulations: ["consumers"],
				}),
			),
		).toBe(false);
		expect(
			isHighImpactAutomatedDecision(
				makeContext({
					decisionImpact: "determinative",
					automationLevel: "human-in-the-loop",
					userPopulations: ["consumers"],
				}),
			),
		).toBe(false);
	});

	it("matches FTC triggers for consumer AI", () => {
		const ctx = makeContext({
			productType: "recommender",
			userPopulations: ["consumers"],
		});
		const triggers = getMatchingFtcTriggers(ctx);
		expect(triggers.some((t) => t.id === "ftc-deceptive-ai")).toBe(true);
	});

	it("matches NIST triggers for all AI", () => {
		const ctx = makeContext();
		const triggers = getMatchingNistTriggers(ctx);
		expect(triggers.some((t) => t.id === "nist-ai-rmf-general")).toBe(true);
	});

	it("matches financial triggers for credit AI", () => {
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
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});
		const triggers = getMatchingFinancialTriggers(ctx);
		expect(triggers.some((t) => t.id === "sr-11-7-model-risk")).toBe(true);
		expect(triggers.some((t) => t.id === "cfpb-fair-lending")).toBe(true);
	});
});

// ─── Registry + Requirement Mapper Integration ────────────────────────────

describe("US Federal Registry and Requirement Mapper", () => {
	beforeEach(() => {
		clearRegistry();
		registerJurisdiction({
			id: "us-federal",
			name: "US Federal AI Regulatory Framework",
			region: "US",
			description:
				"US federal AI regulation through FTC, CFPB, SEC, and banking regulators.",
			module: usFederalModule,
		});
	});

	it("maps US Federal jurisdiction correctly for credit scoring AI", () => {
		const ctx = makeContext({
			description: "AI credit scoring model at a bank",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			sectorContext: {
				sector: "financial-services",
				financialServices: {
					subSector: "lending",
					involvesCredit: true,
					involvesInsurancePricing: false,
					involvesTrading: false,
					involvesAmlKyc: false,
					involvesRegulatoryReporting: false,
					regulatoryBodies: ["OCC", "CFPB"],
					hasMaterialityAssessment: false,
					hasModelRiskGovernance: false,
				},
			},
		});

		const result = mapJurisdiction(ctx, "us-federal");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("high");
			expect(result.value.requiredArtifacts.length).toBeGreaterThan(0);
			expect(result.value.requiredActions.length).toBeGreaterThan(0);
		}
	});

	it("maps US Federal jurisdiction correctly for GenAI product", () => {
		const ctx = makeContext({
			description: "AI chatbot for consumer support",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
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

		const result = mapJurisdiction(ctx, "us-federal");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("limited");
			expect(result.value.requiredArtifacts.length).toBeGreaterThan(0);
		}
	});

	it("maps US Federal jurisdiction correctly for minimal-risk B2B AI", () => {
		const ctx = makeContext({
			description: "AI inventory management",
			productType: "predictor",
			dataProcessed: ["other"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const result = mapJurisdiction(ctx, "us-federal");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("minimal");
		}
	});
});
