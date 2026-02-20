import { beforeEach, describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	classifyRisk,
	euGdprModule,
	getMatchingDpiaTriggers,
	involvesDataTransfers,
	isAutomatedDecisionMaking,
	isGenAiWithPersonalDataConcerns,
	processesPersonalData,
	requiresLargeScaleProcessingDpo,
} from "../../src/jurisdictions/jurisdictions/eu-gdpr.js";
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
		targetMarkets: overrides.targetMarkets ?? ["eu-gdpr"],
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

describe("GDPR Risk Classification", () => {
	describe("High-risk (DPIA required)", () => {
		it("triggers DPIA for automated decision-making with significant effects", () => {
			const ctx = makeContext({
				description: "AI system that automatically approves or denies loan applications",
				productType: "classifier",
				dataProcessed: ["personal", "financial"],
				userPopulations: ["credit-applicants"],
				decisionImpact: "determinative",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-automated-decision-making");
			expect(risk.justification).toContain("DPIA");
		});

		it("triggers DPIA for profiling with legal effects", () => {
			const ctx = makeContext({
				description:
					"AI-powered scoring and profiling system that evaluates personal creditworthiness for insurance pricing decisions",
				productType: "classifier",
				dataProcessed: ["personal", "financial"],
				userPopulations: ["consumers"],
				decisionImpact: "material",
				automationLevel: "fully-automated",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-systematic-evaluation");
		});

		it("triggers DPIA for large-scale special category data processing", () => {
			const ctx = makeContext({
				description: "AI health monitoring system processing patient biometric data",
				productType: "detector",
				dataProcessed: ["health", "biometric"],
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-large-scale-special-category");
		});

		it("triggers DPIA for public area monitoring", () => {
			const ctx = makeContext({
				description:
					"AI-powered CCTV system for systematic monitoring and tracking of individuals in public spaces",
				productType: "detector",
				dataProcessed: ["personal", "biometric"],
				userPopulations: ["general-public"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-public-monitoring");
		});

		it("triggers DPIA for sensitive data processing (biometric)", () => {
			const ctx = makeContext({
				description: "Facial recognition system for building access control",
				productType: "detector",
				dataProcessed: ["biometric", "personal"],
				userPopulations: ["employees"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-sensitive-data-processing");
		});

		it("triggers DPIA for children's data processing", () => {
			const ctx = makeContext({
				description: "AI educational tutor for children",
				productType: "generator",
				dataProcessed: ["personal", "minor"],
				userPopulations: ["minors"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-minor-data");
		});

		it("triggers DPIA for GenAI product using personal data in training", () => {
			const ctx = makeContext({
				description: "AI chatbot trained on user conversations",
				productType: "generator",
				dataProcessed: ["personal"],
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
				trainingData: {
					usesTrainingData: true,
					sources: ["user-conversations"],
					containsPersonalData: true,
					consentObtained: null,
					optOutMechanism: false,
					syntheticData: false,
				},
				generativeAiContext: {
					usesFoundationModel: true,
					foundationModelSource: "fine-tuned",
					generatesContent: true,
					outputModalities: ["text"],
					canGenerateDeepfakes: false,
					canGenerateSyntheticVoice: false,
					hasOutputWatermarking: false,
					hasOutputFiltering: true,
					trainingDataIncludes: ["user-generated-content", "personal-data"],
					finetuningPerformed: true,
					finetuningDataDescription: "Fine-tuned on user conversations",
					usesRAG: false,
					usesAgenticCapabilities: false,
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("dpia-training-data-personal");
		});
	});

	describe("Limited risk (personal data, no DPIA triggers)", () => {
		it("classifies simple personal data processing as limited", () => {
			const ctx = makeContext({
				description: "AI product recommendation engine",
				productType: "recommender",
				dataProcessed: ["personal", "behavioral"],
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
				automationLevel: "human-in-the-loop",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.justification).toContain("GDPR principles");
		});
	});

	describe("Minimal risk (no personal data)", () => {
		it("classifies system with no personal data as minimal", () => {
			const ctx = makeContext({
				description: "AI inventory management system",
				productType: "predictor",
				dataProcessed: ["anonymized"],
				userPopulations: ["businesses"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
			expect(risk.justification).toContain("does not process personal data");
		});
	});
});

// ─── Applicable Provisions Tests ──────────────────────────────────────────

describe("GDPR Applicable Provisions", () => {
	it("includes Article 22 for fully automated decisions with significant effects", () => {
		const ctx = makeContext({
			description: "AI system that auto-approves or auto-denies insurance claims",
			productType: "classifier",
			dataProcessed: ["personal", "health"],
			userPopulations: ["consumers"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});

		const provisions = euGdprModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("gdpr-art22");
		expect(provisionIds).toContain("gdpr-art35-dpia");
	});

	it("includes special category provisions for health data", () => {
		const ctx = makeContext({
			description: "AI system processing patient health data",
			productType: "classifier",
			dataProcessed: ["personal", "health"],
			userPopulations: ["patients"],
			decisionImpact: "advisory",
		});

		const provisions = euGdprModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("gdpr-art9-special-category");
	});

	it("includes children's provisions for minors", () => {
		const ctx = makeContext({
			description: "AI learning platform for children",
			productType: "recommender",
			dataProcessed: ["personal", "minor"],
			userPopulations: ["minors"],
			decisionImpact: "advisory",
		});

		const provisions = euGdprModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("gdpr-art8-children");
	});

	it("includes GenAI training data provisions for GenAI with personal training data", () => {
		const ctx = makeContext({
			description: "AI assistant using foundation model fine-tuned on user data",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
			trainingData: {
				usesTrainingData: true,
				sources: ["user-data"],
				containsPersonalData: true,
				consentObtained: null,
				optOutMechanism: false,
				syntheticData: false,
			},
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "fine-tuned",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: ["personal-data"],
				finetuningPerformed: true,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});

		const provisions = euGdprModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("gdpr-genai-training-data");
		expect(provisionIds).toContain("gdpr-genai-erasure");
	});

	it("includes data transfer provisions for third-party AI API usage", () => {
		const ctx = makeContext({
			description: "AI system using third-party API for inference",
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
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});

		const provisions = euGdprModule.getApplicableProvisions(ctx);
		const provisionIds = provisions.map((p) => p.id);
		expect(provisionIds).toContain("gdpr-art44-49-transfers");
	});

	it("returns no provisions for non-personal data processing", () => {
		const ctx = makeContext({
			description: "AI system for weather prediction",
			productType: "predictor",
			dataProcessed: ["anonymized"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const provisions = euGdprModule.getApplicableProvisions(ctx);
		expect(provisions.length).toBe(0);
	});
});

// ─── Required Artifacts Tests ─────────────────────────────────────────────

describe("GDPR Required Artifacts", () => {
	it("requires DPIA for high-risk processing", () => {
		const ctx = makeContext({
			description: "AI credit scoring system with fully automated decisions",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});

		const artifacts = euGdprModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("dpia");
		expect(types).toContain("transparency-notice");
	});

	it("requires transparency notice but not DPIA for limited-risk processing", () => {
		const ctx = makeContext({
			description: "AI product recommendation engine",
			productType: "recommender",
			dataProcessed: ["personal", "behavioral"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
		});

		const artifacts = euGdprModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("transparency-notice");
		expect(types).not.toContain("dpia");
	});

	it("requires model card for GenAI with personal training data", () => {
		const ctx = makeContext({
			description: "AI chatbot fine-tuned on user data",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
			trainingData: {
				usesTrainingData: true,
				sources: ["user-data"],
				containsPersonalData: true,
				consentObtained: null,
				optOutMechanism: false,
				syntheticData: false,
			},
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "fine-tuned",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: ["personal-data"],
				finetuningPerformed: true,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});

		const artifacts = euGdprModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("model-card");
	});

	it("returns no artifacts for non-personal data processing", () => {
		const ctx = makeContext({
			description: "AI for weather prediction",
			productType: "predictor",
			dataProcessed: ["anonymized"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const artifacts = euGdprModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBe(0);
	});
});

// ─── Required Actions Tests ───────────────────────────────────────────────

describe("GDPR Required Actions", () => {
	it("requires core GDPR actions for personal data processing", () => {
		const ctx = makeContext({
			description: "AI product recommendation engine",
			productType: "recommender",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Determine and document legal basis for processing");
		expect(titles).toContain("Implement data subject rights mechanisms");
		expect(titles).toContain("Prepare and publish privacy notice");
		expect(titles).toContain("Maintain records of processing activities");
	});

	it("requires Article 22 safeguards for fully automated decisions", () => {
		const ctx = makeContext({
			description: "AI system that automatically denies insurance claims",
			productType: "classifier",
			dataProcessed: ["personal", "health"],
			userPopulations: ["consumers"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain(
			"Implement Article 22 automated decision-making safeguards",
		);
	});

	it("requires DPO appointment for large-scale sensitive data processing", () => {
		const ctx = makeContext({
			description: "AI health screening system processing patient biometric data",
			productType: "classifier",
			dataProcessed: ["personal", "biometric", "health"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Appoint a Data Protection Officer");
	});

	it("requires children's consent mechanisms for minors data", () => {
		const ctx = makeContext({
			description: "AI educational platform for students under 16",
			productType: "recommender",
			dataProcessed: ["personal", "minor"],
			userPopulations: ["minors"],
			decisionImpact: "advisory",
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Implement age verification and parental consent");
	});

	it("requires GenAI training data legal basis for GenAI with personal data", () => {
		const ctx = makeContext({
			description: "AI chatbot fine-tuned on user conversations",
			productType: "generator",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
			trainingData: {
				usesTrainingData: true,
				sources: ["user-data"],
				containsPersonalData: true,
				consentObtained: null,
				optOutMechanism: false,
				syntheticData: false,
			},
			generativeAiContext: {
				usesFoundationModel: true,
				foundationModelSource: "fine-tuned",
				generatesContent: true,
				outputModalities: ["text"],
				canGenerateDeepfakes: false,
				canGenerateSyntheticVoice: false,
				hasOutputWatermarking: false,
				hasOutputFiltering: false,
				trainingDataIncludes: ["personal-data"],
				finetuningPerformed: true,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Establish legal basis for AI training data processing");
		expect(titles).toContain("Develop policy for right of erasure in trained models");
	});

	it("requires data transfer mechanisms for third-party API usage", () => {
		const ctx = makeContext({
			description: "AI system using third-party API",
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
				hasOutputFiltering: false,
				trainingDataIncludes: [],
				finetuningPerformed: false,
				usesRAG: false,
				usesAgenticCapabilities: false,
			},
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Establish valid data transfer mechanisms");
	});

	it("returns no actions for non-personal data processing", () => {
		const ctx = makeContext({
			description: "AI for weather prediction",
			productType: "predictor",
			dataProcessed: ["anonymized"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const actions = euGdprModule.getRequiredActions(ctx);
		expect(actions.length).toBe(0);
	});
});

// ─── Compliance Timeline Tests ────────────────────────────────────────────

describe("GDPR Compliance Timeline", () => {
	it("notes GDPR is already in force", () => {
		const ctx = makeContext();
		const timeline = euGdprModule.getTimeline(ctx);
		expect(timeline.effectiveDate).toBe("2018-05-25");
		expect(timeline.notes.some((n) => n.includes("2018"))).toBe(true);
	});

	it("notes DPIA requirement for high-risk processing", () => {
		const ctx = makeContext({
			description: "AI system with fully automated credit decisions",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});

		const timeline = euGdprModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("DPIA must be conducted BEFORE"))).toBe(true);
	});
});

// ─── Helper Function Tests ────────────────────────────────────────────────

describe("GDPR Helper Functions", () => {
	it("detects personal data processing", () => {
		expect(processesPersonalData(makeContext({ dataProcessed: ["personal"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["health"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["biometric"] }))).toBe(true);
		expect(processesPersonalData(makeContext({ dataProcessed: ["anonymized"] }))).toBe(false);
		expect(processesPersonalData(makeContext({ dataProcessed: ["public"] }))).toBe(false);
	});

	it("detects automated decision-making", () => {
		expect(
			isAutomatedDecisionMaking(
				makeContext({
					automationLevel: "fully-automated",
					decisionImpact: "determinative",
				}),
			),
		).toBe(true);
		expect(
			isAutomatedDecisionMaking(
				makeContext({
					automationLevel: "human-in-the-loop",
					decisionImpact: "determinative",
				}),
			),
		).toBe(false);
		expect(
			isAutomatedDecisionMaking(
				makeContext({
					automationLevel: "fully-automated",
					decisionImpact: "advisory",
				}),
			),
		).toBe(false);
	});

	it("detects data transfers for third-party API usage", () => {
		expect(
			involvesDataTransfers(
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
	});

	it("detects GenAI with personal data concerns", () => {
		expect(
			isGenAiWithPersonalDataConcerns(
				makeContext({
					trainingData: {
						usesTrainingData: true,
						sources: [],
						containsPersonalData: true,
						consentObtained: null,
						optOutMechanism: false,
						syntheticData: false,
					},
					generativeAiContext: {
						usesFoundationModel: true,
						foundationModelSource: "fine-tuned",
						generatesContent: true,
						outputModalities: ["text"],
						canGenerateDeepfakes: false,
						canGenerateSyntheticVoice: false,
						hasOutputWatermarking: false,
						hasOutputFiltering: false,
						trainingDataIncludes: ["personal-data"],
						finetuningPerformed: true,
						usesRAG: false,
						usesAgenticCapabilities: false,
					},
				}),
			),
		).toBe(true);
	});

	it("detects DPO requirement for large-scale sensitive processing", () => {
		expect(
			requiresLargeScaleProcessingDpo(
				makeContext({
					dataProcessed: ["personal", "biometric"],
					userPopulations: ["consumers"],
				}),
			),
		).toBe(true);
		expect(
			requiresLargeScaleProcessingDpo(
				makeContext({
					dataProcessed: ["personal"],
					userPopulations: ["consumers"],
				}),
			),
		).toBe(false);
	});
});

// ─── Registry + Requirement Mapper Integration ────────────────────────────

describe("GDPR Registry and Requirement Mapper", () => {
	beforeEach(() => {
		clearRegistry();
		registerJurisdiction({
			id: "eu-gdpr",
			name: "EU General Data Protection Regulation",
			region: "EU",
			description: "GDPR regulates the processing of personal data in the EU.",
			module: euGdprModule,
		});
	});

	it("maps GDPR jurisdiction correctly for high-risk processing", () => {
		const ctx = makeContext({
			description: "AI system with fully automated credit decisions",
			productType: "classifier",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			automationLevel: "fully-automated",
		});

		const result = mapJurisdiction(ctx, "eu-gdpr");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("high");
			expect(result.value.requiredArtifacts.length).toBeGreaterThan(0);
			expect(result.value.requiredActions.length).toBeGreaterThan(0);
		}
	});

	it("maps GDPR jurisdiction correctly for limited-risk processing", () => {
		const ctx = makeContext({
			description: "AI product recommendation engine",
			productType: "recommender",
			dataProcessed: ["personal"],
			userPopulations: ["consumers"],
			decisionImpact: "advisory",
		});

		const result = mapJurisdiction(ctx, "eu-gdpr");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("limited");
			expect(result.value.requiredArtifacts.length).toBeGreaterThan(0);
		}
	});

	it("maps GDPR jurisdiction correctly for minimal-risk processing", () => {
		const ctx = makeContext({
			description: "AI for weather prediction",
			productType: "predictor",
			dataProcessed: ["anonymized"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
		});

		const result = mapJurisdiction(ctx, "eu-gdpr");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("minimal");
			expect(result.value.requiredArtifacts.length).toBe(0);
		}
	});
});
