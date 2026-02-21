import { describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	BIPA_TRIGGERS,
	EMPLOYMENT_AI_TRIGGERS,
	GENAI_TRIGGERS,
	classifyRisk,
	getMatchingBipaTriggers,
	getMatchingEmploymentTriggers,
	getMatchingGenAiTriggers,
	illinoisModule,
	isEmploymentAi,
	isGenAiProduct,
	processesBiometricData,
} from "../../src/jurisdictions/jurisdictions/us-states/illinois.js";

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
		targetMarkets: overrides.targetMarkets ?? ["us-il"],
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

describe("Illinois Risk Classification", () => {
	describe("High risk — BIPA biometric data", () => {
		it("classifies biometric data collection as high risk", () => {
			const ctx = makeContext({
				dataProcessed: ["personal", "biometric"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("BIPA");
			expect(risk.justification).toContain("private right of action");
			expect(risk.provisions).toContain("BIPA (740 ILCS 14)");
		});

		it("classifies biometric data sale/sharing as high risk with additional trigger", () => {
			const ctx = makeContext({
				description: "Biometric identity service that shares data with third-party partners",
				dataProcessed: ["biometric"],
			});

			const triggers = getMatchingBipaTriggers(ctx);
			expect(triggers.some((t) => t.id === "bipa-biometric-collection")).toBe(true);
			expect(triggers.some((t) => t.id === "bipa-biometric-sale")).toBe(true);
		});
	});

	describe("High risk — HRA AI Employment", () => {
		it("classifies employment AI with material impact as high risk", () => {
			const ctx = makeContext({
				description: "AI system for employee performance evaluation",
				userPopulations: ["employees"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("Illinois Human Rights Act");
		});

		it("classifies hiring AI with determinative impact as high risk", () => {
			const ctx = makeContext({
				description: "AI resume screening tool",
				userPopulations: ["job-applicants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("il-hra-ai-employment");
		});
	});

	describe("High risk — Video Interview Act", () => {
		it("classifies AI video interview analysis as employment AI high risk", () => {
			const ctx = makeContext({
				description: "AI system for video interview analysis of job applicants",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");

			// Video interview triggers are part of employment triggers
			const empTriggers = getMatchingEmploymentTriggers(ctx);
			expect(empTriggers.some((t) => t.id === "il-aiaaa-video-interview")).toBe(true);
		});
	});

	describe("Limited risk — GenAI deepfakes", () => {
		it("classifies deepfake-capable GenAI as limited risk", () => {
			const ctx = makeContext({
				description: "AI image generation tool",
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

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.provisions).toContain("Illinois Deepfake Laws");
		});

		it("classifies synthetic voice AI as limited risk", () => {
			const ctx = makeContext({
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
			expect(risk.level).toBe("limited");
		});
	});

	describe("Limited risk — consumer personal data", () => {
		it("classifies consumer personal data without biometric/employment as limited", () => {
			const ctx = makeContext({
				dataProcessed: ["personal", "behavioral"],
				userPopulations: ["consumers"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});
	});

	describe("Minimal risk", () => {
		it("classifies non-consumer system without triggers as minimal", () => {
			const ctx = makeContext({
				description: "Internal data pipeline tool",
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

describe("Illinois Helper Functions", () => {
	it("processesBiometricData detects biometric in dataProcessed", () => {
		const ctx = makeContext({ dataProcessed: ["biometric"] });
		expect(processesBiometricData(ctx)).toBe(true);
	});

	it("processesBiometricData returns false without biometric", () => {
		const ctx = makeContext({ dataProcessed: ["personal"] });
		expect(processesBiometricData(ctx)).toBe(false);
	});

	it("isEmploymentAi requires employment population AND material/determinative impact", () => {
		const trueCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		expect(isEmploymentAi(trueCtx)).toBe(true);

		const falseCtx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "advisory",
		});
		expect(isEmploymentAi(falseCtx)).toBe(false);
	});

	it("isGenAiProduct detects generator type", () => {
		const ctx = makeContext({ productType: "generator" });
		expect(isGenAiProduct(ctx)).toBe(true);
	});

	it("isGenAiProduct detects foundation-model type", () => {
		const ctx = makeContext({ productType: "foundation-model" });
		expect(isGenAiProduct(ctx)).toBe(true);
	});

	it("trigger arrays have expected entries", () => {
		expect(BIPA_TRIGGERS.length).toBe(2);
		expect(EMPLOYMENT_AI_TRIGGERS.length).toBe(2);
		expect(GENAI_TRIGGERS.length).toBe(1);
	});
});

// ─── Module Method Tests ──────────────────────────────────────────────────

describe("Illinois Module Methods", () => {
	it("getRequiredArtifacts returns BIPA compliance artifacts for biometric data", () => {
		const ctx = makeContext({
			dataProcessed: ["biometric"],
		});
		const artifacts = illinoisModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBeGreaterThan(0);
		expect(artifacts.some((a) => a.type === "risk-assessment")).toBe(true);
		expect(artifacts.some((a) => a.type === "transparency-notice")).toBe(true);
	});

	it("getRequiredArtifacts returns bias audit for employment AI", () => {
		const ctx = makeContext({
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const artifacts = illinoisModule.getRequiredArtifacts(ctx);
		expect(artifacts.some((a) => a.type === "bias-audit")).toBe(true);
	});

	it("getRequiredActions returns BIPA consent and retention actions for biometric data", () => {
		const ctx = makeContext({
			dataProcessed: ["biometric"],
		});
		const actions = illinoisModule.getRequiredActions(ctx);
		expect(actions.length).toBeGreaterThan(0);
		expect(actions.some((a) => a.id === "us-il-bipa-consent-mechanism")).toBe(true);
		expect(actions.some((a) => a.id === "us-il-bipa-retention-policy")).toBe(true);
		expect(actions.some((a) => a.id === "us-il-bipa-security")).toBe(true);
		expect(actions.some((a) => a.id === "us-il-bipa-no-monetisation")).toBe(true);
	});

	it("getRequiredActions returns employment bias testing for HRA", () => {
		const ctx = makeContext({
			userPopulations: ["employees"],
			decisionImpact: "material",
		});
		const actions = illinoisModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "us-il-hra-bias-testing")).toBe(true);
		expect(actions.some((a) => a.id === "us-il-hra-notice")).toBe(true);
	});

	it("getRequiredActions returns video interview compliance for AI video analysis", () => {
		const ctx = makeContext({
			description: "AI video interview analysis tool for hiring",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const actions = illinoisModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "us-il-video-interview-compliance")).toBe(true);
	});

	it("getRequiredActions returns deepfake safeguards for synthetic media GenAI", () => {
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
		const actions = illinoisModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.id === "us-il-deepfake-safeguards")).toBe(true);
	});

	it("getApplicableProvisions returns BIPA provisions for biometric data", () => {
		const ctx = makeContext({
			dataProcessed: ["biometric"],
		});
		const provisions = illinoisModule.getApplicableProvisions(ctx);
		expect(provisions.some((p) => p.id === "us-il-bipa-consent")).toBe(true);
		expect(provisions.some((p) => p.id === "us-il-bipa-retention")).toBe(true);
		expect(provisions.some((p) => p.id === "us-il-bipa-no-sale")).toBe(true);
		expect(provisions.some((p) => p.id === "us-il-bipa-security")).toBe(true);
	});

	it("getTimeline includes BIPA and HRA dates", () => {
		const ctx = makeContext({
			dataProcessed: ["biometric"],
			userPopulations: ["employees"],
			decisionImpact: "material",
		});
		const timeline = illinoisModule.getTimeline(ctx);
		expect(timeline.deadlines.some((d) => d.provision === "BIPA (740 ILCS 14)")).toBe(true);
		expect(timeline.deadlines.some((d) => d.provision === "Illinois HRA AI Amendment")).toBe(true);
	});

	it("getTimeline mentions BIPA statutory damages in notes for biometric high risk", () => {
		const ctx = makeContext({
			dataProcessed: ["biometric"],
		});
		const timeline = illinoisModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("$1,000") && n.includes("$5,000"))).toBe(true);
	});

	it("returns empty artifacts for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(illinoisModule.getRequiredArtifacts(ctx)).toEqual([]);
	});

	it("returns empty actions for minimal risk", () => {
		const ctx = makeContext({
			dataProcessed: ["aggregated"],
			userPopulations: ["internal-users"],
		});
		expect(illinoisModule.getRequiredActions(ctx)).toEqual([]);
	});
});
