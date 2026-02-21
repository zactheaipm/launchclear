import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	CONSEQUENTIAL_DECISION_AREAS,
	classifyRisk,
	coloradoModule,
	getMatchingConsequentialAreas,
	hasAgenticCapabilities,
	isConsequentialDecision,
	isDeployer,
	isDeveloper,
	isFinancialServicesContext,
	isGenAiInConsequentialArea,
	isHighRiskAiSystem,
} from "../../src/jurisdictions/jurisdictions/us-states/colorado.js";

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
		targetMarkets: overrides.targetMarkets ?? ["us-co"],
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

describe("Colorado AI Act Risk Classification", () => {
	describe("High risk — consequential decisions with material impact", () => {
		it("classifies employment AI with material impact as high risk", () => {
			const ctx = makeContext({
				description: "AI resume screening tool for hiring decisions",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("Employment");
			expect(risk.provisions).toContain("SB 24-205 §6-1-1702");
		});

		it("classifies financial services AI with determinative impact as high risk", () => {
			const ctx = makeContext({
				description: "AI credit scoring model for consumer lending",
				userPopulations: ["credit-applicants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("co-financial-services");
		});

		it("classifies healthcare AI with material impact as high risk", () => {
			const ctx = makeContext({
				description: "AI clinical diagnosis assistant",
				userPopulations: ["patients"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("co-healthcare");
		});

		it("classifies housing AI as high risk", () => {
			const ctx = makeContext({
				description: "AI tenant screening system",
				userPopulations: ["tenants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("co-housing");
		});

		it("classifies education AI as high risk", () => {
			const ctx = makeContext({
				description: "AI admissions screening tool for universities",
				userPopulations: ["students"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("co-education");
		});

		it("classifies insurance AI as high risk", () => {
			const ctx = makeContext({
				description: "AI insurance underwriting and claims processing tool",
				decisionImpact: "determinative",
				sectorContext: {
					sector: "financial-services",
					financialServices: {
						subSector: "insurance",
						involvesCredit: false,
						involvesInsurancePricing: true,
						involvesTrading: false,
						involvesAmlKyc: false,
						involvesRegulatoryReporting: false,
						regulatoryBodies: [],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});

		it("classifies government services AI as high risk", () => {
			const ctx = makeContext({
				description:
					"AI system for government service eligibility determination and public benefit allocation",
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("co-government-services");
		});

		it("classifies legal services AI as high risk", () => {
			const ctx = makeContext({
				description: "AI system for judicial sentencing recommendations",
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("co-legal-services");
		});
	});

	describe("Limited risk — consequential area without material impact", () => {
		it("classifies employment context with advisory impact as limited", () => {
			const ctx = makeContext({
				description: "AI tool for hiring workflow optimisation",
				userPopulations: ["job-applicants"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Limited risk — personal data without consequential decision", () => {
		it("classifies consumer personal data processing as limited", () => {
			const ctx = makeContext({
				dataProcessed: ["personal"],
				userPopulations: ["consumers"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-consumer internal AI as minimal risk", () => {
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

describe("Colorado Helper Functions", () => {
	it("getMatchingConsequentialAreas returns all 8 area types", () => {
		expect(CONSEQUENTIAL_DECISION_AREAS.length).toBe(8);
	});

	it("isConsequentialDecision matches employment context", () => {
		const ctx = makeContext({ userPopulations: ["job-applicants"] });
		expect(isConsequentialDecision(ctx)).toBe(true);
	});

	it("isHighRiskAiSystem requires consequential area AND material/determinative impact", () => {
		const highCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		expect(isHighRiskAiSystem(highCtx)).toBe(true);

		const lowCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "advisory",
		});
		expect(isHighRiskAiSystem(lowCtx)).toBe(false);
	});

	it("isDeveloper detects foundation model type", () => {
		const ctx = makeContext({ productType: "foundation-model" });
		expect(isDeveloper(ctx)).toBe(true);
	});

	it("isDeveloper detects self-trained models", () => {
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
		expect(isDeveloper(ctx)).toBe(true);
	});

	it("isDeployer always returns true (most LaunchClear users are deployers)", () => {
		const ctx = makeContext({});
		expect(isDeployer(ctx)).toBe(true);
	});

	it("isGenAiInConsequentialArea requires both GenAI and consequential area", () => {
		const ctx = makeContext({
			productType: "generator",
			userPopulations: ["job-applicants"],
		});
		expect(isGenAiInConsequentialArea(ctx)).toBe(true);
	});

	it("hasAgenticCapabilities detects agentic context", () => {
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
		expect(hasAgenticCapabilities(ctx)).toBe(true);
	});

	it("isFinancialServicesContext checks sector", () => {
		const ctx = makeContext({
			sectorContext: { sector: "financial-services" },
		});
		expect(isFinancialServicesContext(ctx)).toBe(true);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("Colorado Module Methods", () => {
	it("getRequiredArtifacts returns impact assessment for high-risk deployer", () => {
		const ctx = makeContext({
			description: "AI hiring screening tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "determinative",
		});
		const artifacts = coloradoModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
		expect(artifacts.some((a) => a.type === "algorithmic-impact")).toBe(true);
		expect(artifacts.some((a) => a.type === "risk-assessment")).toBe(true);
		expect(artifacts.some((a) => a.type === "transparency-notice")).toBe(true);
	});

	it("getRequiredArtifacts includes developer documentation for developers", () => {
		const ctx = makeContext({
			description: "AI model developed and provided to downstream employers",
			productType: "foundation-model",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const artifacts = coloradoModule.getRequiredArtifacts(ctx);
		expect(artifacts.some((a) => a.type === "model-card")).toBe(true);
	});

	it("getRequiredArtifacts includes bias audit for financial services", () => {
		const ctx = makeContext({
			description: "AI credit scoring tool",
			userPopulations: ["credit-applicants"],
			decisionImpact: "material",
			sectorContext: { sector: "financial-services" },
		});
		const artifacts = coloradoModule.getRequiredArtifacts(ctx);
		expect(artifacts.some((a) => a.type === "bias-audit")).toBe(true);
	});

	it("getRequiredArtifacts returns empty for non-high-risk", () => {
		const ctx = makeContext({
			description: "Generic consumer chatbot",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
		});
		const artifacts = coloradoModule.getRequiredArtifacts(ctx);
		expect(artifacts).toEqual([]);
	});

	it("getRequiredActions returns critical actions for high-risk systems", () => {
		const ctx = makeContext({
			description: "AI hiring screening tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const actions = coloradoModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
		expect(actions.some((a) => a.id === "co-risk-management-policy")).toBe(true);
		expect(actions.some((a) => a.id === "co-impact-assessment")).toBe(true);
		expect(actions.some((a) => a.id === "co-consumer-notice")).toBe(true);
	});

	it("getRequiredActions includes GenAI-specific controls for GenAI in consequential areas", () => {
		const ctx = makeContext({
			description: "GenAI-powered hiring assessment tool",
			productType: "generator",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
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
		const actions = coloradoModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "co-genai-consequential-controls")).toBe(true);
	});

	it("getRequiredActions includes agentic oversight for agentic AI in consequential areas", () => {
		const ctx = makeContext({
			description: "Agentic AI hiring assistant",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "bounded",
				toolAccess: ["email", "calendar"],
				actionScope: ["schedule-interview", "send-rejection"],
				hasHumanCheckpoints: true,
				isMultiAgent: false,
				canAccessExternalSystems: true,
				canModifyData: true,
				canMakeFinancialTransactions: false,
				hasFailsafeMechanisms: true,
				hasActionLogging: true,
			},
		});
		const actions = coloradoModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "co-agentic-oversight")).toBe(true);
	});

	it("getApplicableProvisions includes scope and deployer provisions for high-risk", () => {
		const ctx = makeContext({
			description: "AI hiring screening tool",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const provisions = coloradoModule.getApplicableProvisions(ctx);
		expect(provisions.some((p) => p.id === "co-sb205-scope")).toBe(true);
		expect(provisions.some((p) => p.id === "co-sb205-deployer-risk-mgmt")).toBe(true);
	});

	it("getTimeline returns effective date of 2026-02-01", () => {
		const ctx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const timeline = coloradoModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBe("2026-02-01");
		expect(timeline.deadlines.some((d) => d.date === "2026-02-01")).toBe(true);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		const actions = coloradoModule.getRequiredActions(ctx);
		expect(actions).toEqual([]);
	});
});
