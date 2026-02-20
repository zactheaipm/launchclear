import { beforeEach, describe, expect, it } from "vitest";
import type { ProductContext } from "../../src/core/types.js";
import {
	classifyGpai,
	classifyRisk,
	euAiActModule,
	getMatchingAnnexIIICategories,
	getMatchingProhibitedPractices,
	isChatbotOrConversationalAI,
	isDeepfakeSystem,
	isGpaiApplicable,
	isLimitedRiskSystem,
} from "../../src/jurisdictions/jurisdictions/eu-ai-act.js";
import { clearRegistry, registerJurisdiction } from "../../src/jurisdictions/registry.js";
import {
	aggregateRequirements,
	mapAllJurisdictions,
	mapJurisdiction,
} from "../../src/jurisdictions/requirement-mapper.js";

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
		targetMarkets: overrides.targetMarkets ?? ["eu-ai-act"],
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

describe("EU AI Act Risk Classification", () => {
	describe("Prohibited practices (unacceptable risk)", () => {
		it("classifies social scoring as prohibited", () => {
			const ctx = makeContext({
				description:
					"AI system for social scoring of citizens based on social behaviour, assigning social credit scores that affect access to services",
				productType: "classifier",
				userPopulations: ["general-public"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("unacceptable");
			expect(risk.justification).toContain("Social Scoring");
			expect(risk.provisions).toContain("Article 5(1)(c)");
		});

		it("classifies subliminal manipulation as prohibited", () => {
			const ctx = makeContext({
				description:
					"AI system that deploys subliminal techniques beyond a person's consciousness to influence purchasing decisions",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("unacceptable");
			expect(risk.applicableCategories).toContain("art5-1a-subliminal-manipulation");
		});

		it("classifies real-time biometric identification in public spaces as prohibited", () => {
			const ctx = makeContext({
				description:
					"Real-time biometric identification system for monitoring public spaces and public areas",
				dataProcessed: ["biometric"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("unacceptable");
			expect(risk.applicableCategories).toContain("art5-1h-realtime-biometric-public");
		});

		it("classifies untargeted facial recognition scraping as prohibited", () => {
			const ctx = makeContext({
				description:
					"AI system for facial recognition database building through scraping images from the internet",
				dataProcessed: ["biometric"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("unacceptable");
		});

		it("classifies workplace emotion recognition as prohibited", () => {
			const ctx = makeContext({
				description:
					"AI system for emotion recognition and emotion detection of employees during work hours",
				userPopulations: ["employees"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("unacceptable");
			expect(risk.applicableCategories).toContain("art5-1f-workplace-emotion-recognition");
		});

		it("does NOT classify medical emotion recognition in workplace as prohibited", () => {
			const ctx = makeContext({
				description:
					"AI system for emotion recognition in the workplace for medical safety monitoring purposes",
				userPopulations: ["employees"],
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).not.toBe("unacceptable");
		});
	});

	describe("High-risk classification (Annex III)", () => {
		it("classifies an AI hiring tool as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI-powered resume screening tool that evaluates job applications and ranks candidates for interview selection",
				productType: "ranker",
				dataProcessed: ["personal", "employment"],
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
				automationLevel: "human-on-the-loop",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.justification).toContain("Employment");
			expect(risk.applicableCategories).toContain("annex-iii-4-employment");
		});

		it("classifies AI worker monitoring as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system that monitors and evaluates employee performance through productivity tracking",
				productType: "classifier",
				userPopulations: ["employees"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-4-employment");
		});

		it("classifies a credit scoring system as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system for credit scoring and creditworthiness assessment of loan applicants",
				productType: "classifier",
				dataProcessed: ["personal", "financial"],
				userPopulations: ["credit-applicants"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-5-essential-services");
		});

		it("classifies a biometric identification system as high-risk", () => {
			const ctx = makeContext({
				description: "Remote biometric identification system for identity verification",
				productType: "detector",
				dataProcessed: ["biometric", "personal"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-1-biometrics");
		});

		it("classifies an education admission AI as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system that evaluates student applications and determines admission to university programs",
				productType: "classifier",
				userPopulations: ["students"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-3-education");
		});

		it("classifies a critical infrastructure safety AI as high-risk", () => {
			const ctx = makeContext({
				description: "AI system for managing electricity supply and power grid optimization",
				productType: "predictor",
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-2-critical-infrastructure");
		});

		it("classifies law enforcement risk assessment as high-risk", () => {
			const ctx = makeContext({
				description: "AI system used by law enforcement for individual recidivism risk assessment",
				productType: "predictor",
				dataProcessed: ["personal", "criminal"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-6-law-enforcement");
		});

		it("classifies asylum application assessment as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system for examining asylum applications and assisting with migration risk assessment",
				productType: "classifier",
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-7-migration");
		});

		it("classifies judicial assistance AI as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system assisting judicial authorities with legal research and case law interpretation",
				productType: "generator",
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-8-justice");
		});
	});

	describe("Financial services high-risk (Annex III §5)", () => {
		it("classifies insurance risk/pricing AI as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system for life insurance risk assessment and pricing of policy premiums based on applicant health profiles",
				productType: "predictor",
				dataProcessed: ["personal", "health"],
				userPopulations: ["consumers"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-5-essential-services");
		});

		it("classifies health insurance underwriting AI as high-risk", () => {
			const ctx = makeContext({
				description:
					"AI system for health insurance risk pricing and underwriting decisions based on medical history",
				productType: "classifier",
				dataProcessed: ["personal", "health"],
				userPopulations: ["consumers"],
				decisionImpact: "determinative",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-5-essential-services");
		});

		it("classifies insurance pricing via sectorContext as high-risk", () => {
			const ctx = makeContext({
				description: "AI system for automated insurance policy premium calculations",
				productType: "predictor",
				dataProcessed: ["personal", "health"],
				userPopulations: ["consumers"],
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
						regulatoryBodies: ["EIOPA"],
						hasMaterialityAssessment: false,
						hasModelRiskGovernance: false,
					},
				},
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
			expect(risk.applicableCategories).toContain("annex-iii-5-essential-services");
		});
	});

	describe("Article 6(3) significant risk filter", () => {
		it("downgrades an employment system performing only narrow procedural tasks", () => {
			const ctx = makeContext({
				description:
					"AI tool that performs a narrow procedural task of formatting resumes into a standard template for HR review",
				productType: "generator",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
			expect(risk.provisions).toContain("Article 6(3)");
		});

		it("does NOT downgrade a profiling system even if it seems narrow", () => {
			const ctx = makeContext({
				description:
					"AI system performing profiling of job applicants based on a narrow procedural task of scoring keywords",
				productType: "ranker",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");
		});
	});

	describe("Limited-risk classification", () => {
		it("classifies a chatbot as limited risk", () => {
			const ctx = makeContext({
				description: "AI chatbot for customer support that answers questions about products",
				productType: "generator",
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.justification).toContain("transparency obligations");
			expect(risk.applicableCategories).toContain("chatbot-disclosure");
		});

		it("classifies a virtual assistant as limited risk", () => {
			const ctx = makeContext({
				description:
					"Virtual assistant that helps users navigate the application and answer questions",
				productType: "generator",
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
		});

		it("classifies a deepfake generator as limited risk", () => {
			const ctx = makeContext({
				description:
					"AI system that generates synthetic media and deepfake content for entertainment",
				productType: "generator",
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("limited");
			expect(risk.applicableCategories).toContain("deepfake-labeling");
		});
	});

	describe("Minimal-risk classification", () => {
		it("classifies a recommendation engine as minimal risk", () => {
			const ctx = makeContext({
				description:
					"AI-powered product recommendation engine that suggests items based on browsing history",
				productType: "recommender",
				dataProcessed: ["behavioral"],
				userPopulations: ["consumers"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
			expect(risk.justification).toContain(
				"does not fall into the prohibited, high-risk, or limited-risk categories",
			);
		});

		it("classifies a spam filter as minimal risk", () => {
			const ctx = makeContext({
				description: "AI-powered email spam filter",
				productType: "classifier",
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
		});

		it("classifies an inventory management system as minimal risk", () => {
			const ctx = makeContext({
				description: "AI system for inventory management and demand forecasting for retail",
				productType: "predictor",
				dataProcessed: ["other"],
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
		});

		it("classifies an AI video game as minimal risk", () => {
			const ctx = makeContext({
				description: "AI-powered game with intelligent NPC behaviour",
				productType: "agent",
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");
		});
	});
});

// ─── Required Artifacts Tests ─────────────────────────────────────────────

describe("EU AI Act Required Artifacts", () => {
	it("requires conformity assessment and risk docs for high-risk systems", () => {
		const ctx = makeContext({
			description: "AI-powered resume screening tool that evaluates and ranks job applications",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});

		const artifacts = euAiActModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("risk-classification");
		expect(types).toContain("conformity-assessment");
		expect(types).toContain("risk-assessment");
		expect(types).toContain("model-card");
		expect(artifacts.every((a) => a.required)).toBe(true);
	});

	it("requires third-party conformity for biometric systems", () => {
		const ctx = makeContext({
			description: "Remote biometric identification system for identity verification",
			productType: "detector",
			dataProcessed: ["biometric", "personal"],
			decisionImpact: "determinative",
		});

		const artifacts = euAiActModule.getRequiredArtifacts(ctx);
		const conformityArtifacts = artifacts.filter((a) => a.type === "conformity-assessment");
		expect(conformityArtifacts.length).toBeGreaterThanOrEqual(2);
		expect(conformityArtifacts.some((a) => a.name.includes("Third-Party"))).toBe(true);
	});

	it("requires transparency notice for chatbots", () => {
		const ctx = makeContext({
			description: "AI chatbot for customer service",
			productType: "generator",
			decisionImpact: "advisory",
		});

		const artifacts = euAiActModule.getRequiredArtifacts(ctx);
		const types = artifacts.map((a) => a.type);
		expect(types).toContain("transparency-notice");
	});

	it("requires prohibition analysis for prohibited systems", () => {
		const ctx = makeContext({
			description: "AI system for social scoring of citizens based on their social behaviour",
			productType: "classifier",
			decisionImpact: "determinative",
		});

		const artifacts = euAiActModule.getRequiredArtifacts(ctx);
		expect(
			artifacts.some((a) => a.type === "risk-classification" && a.legalBasis === "Article 5"),
		).toBe(true);
	});

	it("returns no mandatory artifacts for minimal-risk systems", () => {
		const ctx = makeContext({
			description: "AI-powered product recommendation engine",
			productType: "recommender",
			decisionImpact: "advisory",
		});

		const artifacts = euAiActModule.getRequiredArtifacts(ctx);
		expect(artifacts.length).toBe(0);
	});
});

// ─── Required Actions Tests ───────────────────────────────────────────────

describe("EU AI Act Required Actions", () => {
	it("blocks EU launch for prohibited systems", () => {
		const ctx = makeContext({
			description: "AI system for social scoring based on social behaviour",
			productType: "classifier",
			decisionImpact: "determinative",
		});

		const actions = euAiActModule.getRequiredActions(ctx);
		expect(actions.length).toBe(1);
		expect(actions[0]?.priority).toBe("critical");
		expect(actions[0]?.title).toContain("Do not deploy");
	});

	it("requires comprehensive actions for high-risk systems", () => {
		const ctx = makeContext({
			description: "AI-powered hiring tool that screens and ranks job applicants",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});

		const actions = euAiActModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Establish risk management system");
		expect(titles).toContain("Implement data governance and quality measures");
		expect(titles).toContain("Prepare technical documentation");
		expect(titles).toContain("Implement automatic event logging");
		expect(titles).toContain("Implement human oversight mechanisms");
		expect(titles).toContain("Complete conformity assessment");
		expect(titles).toContain("Register in EU AI database");

		const criticalActions = actions.filter((a) => a.priority === "critical");
		expect(criticalActions.length).toBeGreaterThanOrEqual(6);
	});

	it("requires transparency disclosure for chatbots", () => {
		const ctx = makeContext({
			description: "AI chatbot for customer support",
			productType: "generator",
			decisionImpact: "advisory",
		});

		const actions = euAiActModule.getRequiredActions(ctx);
		expect(actions.some((a) => a.title.includes("transparency"))).toBe(true);
	});

	it("returns no actions for minimal-risk systems", () => {
		const ctx = makeContext({
			description: "AI-powered product recommendation engine",
			productType: "recommender",
			decisionImpact: "advisory",
		});

		const actions = euAiActModule.getRequiredActions(ctx);
		expect(actions.length).toBe(0);
	});
});

// ─── Compliance Timeline Tests ────────────────────────────────────────────

describe("EU AI Act Compliance Timeline", () => {
	it("includes all major deadlines", () => {
		const ctx = makeContext({
			description: "AI hiring tool",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});

		const timeline = euAiActModule.getTimeline(ctx);
		const dates = timeline.deadlines.map((d) => d.date);
		expect(dates).toContain("2025-02-02");
		expect(dates).toContain("2025-08-02");
		expect(dates).toContain("2026-08-02");
		expect(dates).toContain("2027-08-02");
	});

	it("flags urgency for prohibited systems", () => {
		const ctx = makeContext({
			description: "Social scoring system for social credit",
			productType: "classifier",
			decisionImpact: "determinative",
		});

		const timeline = euAiActModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("CRITICAL"))).toBe(true);
	});

	it("notes high-risk timeline for high-risk systems", () => {
		const ctx = makeContext({
			description: "AI hiring tool for screening job applicants",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});

		const timeline = euAiActModule.getTimeline(ctx);
		expect(timeline.notes.some((n) => n.includes("August 2026"))).toBe(true);
	});
});

// ─── Registry + Requirement Mapper Integration ────────────────────────────

describe("Jurisdiction Registry and Requirement Mapper", () => {
	beforeEach(() => {
		clearRegistry();
		registerJurisdiction({
			id: "eu-ai-act",
			name: "EU Artificial Intelligence Act",
			region: "EU",
			description:
				"The EU AI Act regulates AI systems placed on the EU market based on risk level.",
			module: euAiActModule,
		});
	});

	it("maps a single jurisdiction correctly", () => {
		const ctx = makeContext({
			description: "AI hiring tool that screens and ranks job applicants",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});

		const result = mapJurisdiction(ctx, "eu-ai-act");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.riskClassification.level).toBe("high");
			expect(result.value.requiredArtifacts.length).toBeGreaterThan(0);
			expect(result.value.requiredActions.length).toBeGreaterThan(0);
		}
	});

	it("returns error for unregistered jurisdiction", () => {
		const ctx = makeContext();
		const result = mapJurisdiction(ctx, "eu-gdpr");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("eu-gdpr");
		}
	});

	it("maps all target markets from ProductContext", () => {
		const ctx = makeContext({
			description: "AI hiring tool for screening job applicants",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
			targetMarkets: ["eu-ai-act"],
		});

		const { results, errors } = mapAllJurisdictions(ctx);
		expect(results.length).toBe(1);
		expect(errors.length).toBe(0);
		expect(results[0]?.riskClassification.level).toBe("high");
	});

	it("collects errors for unregistered jurisdictions without failing", () => {
		const ctx = makeContext({
			description: "AI chatbot",
			productType: "generator",
			decisionImpact: "advisory",
			targetMarkets: ["eu-ai-act", "eu-gdpr"],
		});

		const { results, errors } = mapAllJurisdictions(ctx);
		expect(results.length).toBe(1);
		expect(errors.length).toBe(1);
		expect(errors[0]?.jurisdiction).toBe("eu-gdpr");
	});

	it("aggregates requirements across jurisdictions", () => {
		const ctx = makeContext({
			description: "AI hiring tool for screening job applicants",
			productType: "ranker",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
			targetMarkets: ["eu-ai-act"],
		});

		const { results } = mapAllJurisdictions(ctx);
		const aggregated = aggregateRequirements(results);
		expect(aggregated.totalArtifacts).toBeGreaterThan(0);
		expect(aggregated.totalActions).toBeGreaterThan(0);
		expect(aggregated.highestRiskLevel?.level).toBe("high");
	});
});

// ─── Helper Function Tests ────────────────────────────────────────────────

describe("Helper Functions", () => {
	it("detects chatbot/conversational AI", () => {
		expect(
			isChatbotOrConversationalAI(makeContext({ description: "AI chatbot for customer support" })),
		).toBe(true);
		expect(
			isChatbotOrConversationalAI(
				makeContext({
					description: "Virtual assistant for product navigation",
				}),
			),
		).toBe(true);
		expect(
			isChatbotOrConversationalAI(makeContext({ description: "Spam filter for emails" })),
		).toBe(false);
	});

	it("detects deepfake systems", () => {
		expect(
			isDeepfakeSystem(
				makeContext({
					description: "Deepfake video generation tool",
					productType: "generator",
				}),
			),
		).toBe(true);
		expect(
			isDeepfakeSystem(
				makeContext({
					description: "AI tool to generate images of products",
					productType: "generator",
				}),
			),
		).toBe(true);
		expect(isDeepfakeSystem(makeContext({ description: "Text summarization tool" }))).toBe(false);
	});

	it("detects limited-risk systems", () => {
		expect(isLimitedRiskSystem(makeContext({ description: "Customer service chatbot" }))).toBe(
			true,
		);
		expect(isLimitedRiskSystem(makeContext({ description: "Inventory management AI" }))).toBe(
			false,
		);
	});

	it("matches Annex III categories correctly", () => {
		const hiringCtx = makeContext({
			description: "AI tool for evaluating job candidates",
			userPopulations: ["job-applicants"],
			decisionImpact: "material",
		});
		const categories = getMatchingAnnexIIICategories(hiringCtx);
		expect(categories.some((c) => c.id === "annex-iii-4-employment")).toBe(true);
	});

	it("matches prohibited practices correctly", () => {
		const socialScoringCtx = makeContext({
			description: "AI system for social scoring of citizens",
		});
		const practices = getMatchingProhibitedPractices(socialScoringCtx);
		expect(practices.some((p) => p.id === "art5-1c-social-scoring")).toBe(true);
	});
});

// ─── GPAI Classification Tests ───────────────────────────────────────────

describe("GPAI Classification", () => {
	const gpaiProviderInfo = {
		isGpaiModel: true,
		gpaiRole: "provider" as const,
		modelName: "TestModel-70B",
		isOpenSource: false,
		exceedsSystemicRiskThreshold: false,
		commissionDesignated: false,
		providesDownstreamDocumentation: true,
		hasAcceptableUsePolicy: true,
	};

	const gpaiDeployerInfo = {
		isGpaiModel: true,
		gpaiRole: "deployer" as const,
		modelName: "Claude",
		isOpenSource: false,
		exceedsSystemicRiskThreshold: false,
		commissionDesignated: false,
		providesDownstreamDocumentation: false,
		hasAcceptableUsePolicy: false,
	};

	describe("GPAI detection", () => {
		it("detects GPAI provider via gpaiInfo", () => {
			const ctx = makeContext({ gpaiInfo: gpaiProviderInfo });
			expect(isGpaiApplicable(ctx)).toBe(true);
			const gpai = classifyGpai(ctx);
			expect(gpai).toBeDefined();
			expect(gpai?.role).toBe("provider");
		});

		it("detects GPAI deployer via gpaiInfo", () => {
			const ctx = makeContext({ gpaiInfo: gpaiDeployerInfo });
			expect(isGpaiApplicable(ctx)).toBe(true);
			const gpai = classifyGpai(ctx);
			expect(gpai).toBeDefined();
			expect(gpai?.role).toBe("deployer");
		});

		it("detects GPAI via foundation-model productType", () => {
			const ctx = makeContext({ productType: "foundation-model" });
			expect(isGpaiApplicable(ctx)).toBe(true);
			const gpai = classifyGpai(ctx);
			expect(gpai).toBeDefined();
			expect(gpai?.role).toBe("provider");
		});

		it("detects GPAI via description keywords (large language model)", () => {
			const ctx = makeContext({
				description: "A large language model for text generation",
			});
			expect(isGpaiApplicable(ctx)).toBe(true);
			const gpai = classifyGpai(ctx);
			expect(gpai).toBeDefined();
			expect(gpai?.role).toBe("deployer");
		});

		it("does NOT detect GPAI for non-GPAI system", () => {
			const ctx = makeContext({
				description: "A spam filter for emails",
				productType: "classifier",
			});
			expect(isGpaiApplicable(ctx)).toBe(false);
			expect(classifyGpai(ctx)).toBeUndefined();
		});
	});

	describe("Systemic risk classification", () => {
		it("classifies systemic risk via compute threshold", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, exceedsSystemicRiskThreshold: true },
			});
			const gpai = classifyGpai(ctx);
			expect(gpai?.hasSystemicRisk).toBe(true);
			expect(gpai?.provisions).toContain("Article 55(1)(a)");
		});

		it("classifies systemic risk via Commission designation", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, commissionDesignated: true },
			});
			const gpai = classifyGpai(ctx);
			expect(gpai?.hasSystemicRisk).toBe(true);
			expect(gpai?.justification).toContain("Commission");
		});

		it("no systemic risk when both flags are false", () => {
			const ctx = makeContext({ gpaiInfo: gpaiProviderInfo });
			const gpai = classifyGpai(ctx);
			expect(gpai?.hasSystemicRisk).toBe(false);
		});
	});

	describe("Open-source exemption", () => {
		it("applies open-source exemption for non-systemic-risk provider", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, isOpenSource: true },
			});
			const gpai = classifyGpai(ctx);
			expect(gpai?.isOpenSource).toBe(true);
			expect(gpai?.provisions).toContain("Article 53(2)");
			// Should still have copyright and training data summary
			expect(gpai?.provisions).toContain("Article 53(1)(c)");
			expect(gpai?.provisions).toContain("Article 53(1)(d)");
			// Should NOT have tech docs or downstream docs
			expect(gpai?.provisions).not.toContain("Article 53(1)(a)");
			expect(gpai?.provisions).not.toContain("Article 53(1)(b)");
		});

		it("does NOT apply open-source exemption for systemic-risk model", () => {
			const ctx = makeContext({
				gpaiInfo: {
					...gpaiProviderInfo,
					isOpenSource: true,
					exceedsSystemicRiskThreshold: true,
				},
			});
			const gpai = classifyGpai(ctx);
			expect(gpai?.isOpenSource).toBe(true);
			expect(gpai?.hasSystemicRisk).toBe(true);
			// Must have ALL provider obligations despite open-source
			expect(gpai?.provisions).toContain("Article 53(1)(a)");
			expect(gpai?.provisions).toContain("Article 55(1)(a)");
			expect(gpai?.provisions).not.toContain("Article 53(2)");
		});
	});

	describe("Backward compatibility", () => {
		it("non-GPAI system produces unchanged output", () => {
			const ctx = makeContext({
				description: "AI-powered product recommendation engine",
				productType: "recommender",
				decisionImpact: "advisory",
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("minimal");

			const provisions = euAiActModule.getApplicableProvisions(ctx);
			expect(provisions.length).toBe(0);

			const artifacts = euAiActModule.getRequiredArtifacts(ctx);
			expect(artifacts.length).toBe(0);

			const actions = euAiActModule.getRequiredActions(ctx);
			expect(actions.length).toBe(0);
		});
	});

	describe("Dual classification (high-risk + GPAI)", () => {
		it("produces both high-risk and GPAI provisions for Annex III deployer", () => {
			const ctx = makeContext({
				description: "AI hiring tool using a large language model to screen job applicants",
				productType: "ranker",
				userPopulations: ["job-applicants"],
				decisionImpact: "material",
				gpaiInfo: gpaiDeployerInfo,
			});

			const risk = classifyRisk(ctx);
			expect(risk.level).toBe("high");

			const provisions = euAiActModule.getApplicableProvisions(ctx);
			const provisionIds = provisions.map((p) => p.id);
			// High-risk provisions
			expect(provisionIds).toContain("eu-ai-act-art6");
			// GPAI provisions
			expect(provisionIds).toContain("eu-ai-act-art51");
		});
	});

	describe("GPAI artifacts", () => {
		it("requires tech docs, model card, and training summary for provider", () => {
			const ctx = makeContext({ gpaiInfo: gpaiProviderInfo });
			const artifacts = euAiActModule.getRequiredArtifacts(ctx);
			const types = artifacts.map((a) => a.type);
			expect(types).toContain("gpai-technical-documentation");
			expect(types).toContain("model-card");
			expect(types).toContain("gpai-training-data-summary");
		});

		it("requires systemic risk assessment for systemic risk provider", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, exceedsSystemicRiskThreshold: true },
			});
			const artifacts = euAiActModule.getRequiredArtifacts(ctx);
			const types = artifacts.map((a) => a.type);
			expect(types).toContain("gpai-systemic-risk-assessment");
			expect(types).toContain("gpai-technical-documentation");
		});

		it("skips tech docs for open-source non-systemic provider", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, isOpenSource: true },
			});
			const artifacts = euAiActModule.getRequiredArtifacts(ctx);
			const types = artifacts.map((a) => a.type);
			// Training summary always required
			expect(types).toContain("gpai-training-data-summary");
			// Tech docs exempt for open-source
			expect(types).not.toContain("gpai-technical-documentation");
		});
	});

	describe("GPAI actions", () => {
		it("requires copyright and training summary actions for provider", () => {
			const ctx = makeContext({ gpaiInfo: gpaiProviderInfo });
			const actions = euAiActModule.getRequiredActions(ctx);
			const titles = actions.map((a) => a.title);
			expect(titles).toContain("Implement copyright compliance policy");
			expect(titles).toContain("Publish training data summary");
		});

		it("requires systemic risk actions for systemic risk provider", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, exceedsSystemicRiskThreshold: true },
			});
			const actions = euAiActModule.getRequiredActions(ctx);
			const titles = actions.map((a) => a.title);
			expect(titles).toContain("Perform model evaluation with standardised protocols");
			expect(titles).toContain("Assess and mitigate systemic risks");
			expect(titles).toContain("Establish incident tracking and reporting");
			expect(titles).toContain("Ensure adequate cybersecurity for GPAI model");
		});

		it("requires provider verification for deployer", () => {
			const ctx = makeContext({ gpaiInfo: gpaiDeployerInfo });
			const actions = euAiActModule.getRequiredActions(ctx);
			const titles = actions.map((a) => a.title);
			expect(titles).toContain("Verify GPAI provider compliance");
		});
	});

	describe("GPAI timeline", () => {
		it("flags GPAI urgency in timeline notes", () => {
			const ctx = makeContext({ gpaiInfo: gpaiProviderInfo });
			const timeline = euAiActModule.getTimeline(ctx);
			expect(timeline.notes.some((n) => n.includes("URGENT"))).toBe(true);
			expect(timeline.notes.some((n) => n.includes("2 August 2025"))).toBe(true);
		});

		it("adds systemic risk note for systemic risk models", () => {
			const ctx = makeContext({
				gpaiInfo: { ...gpaiProviderInfo, exceedsSystemicRiskThreshold: true },
			});
			const timeline = euAiActModule.getTimeline(ctx);
			expect(timeline.notes.some((n) => n.includes("Systemic risk"))).toBe(true);
		});
	});

	describe("Requirement mapper GPAI passthrough", () => {
		beforeEach(() => {
			clearRegistry();
			registerJurisdiction({
				id: "eu-ai-act",
				name: "EU Artificial Intelligence Act",
				region: "EU",
				description: "EU AI Act",
				module: euAiActModule,
			});
		});

		it("includes gpaiClassification in mapped result for GPAI system", () => {
			const ctx = makeContext({ gpaiInfo: gpaiProviderInfo });
			const result = mapJurisdiction(ctx, "eu-ai-act");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.gpaiClassification).toBeDefined();
				expect(result.value.gpaiClassification?.isGpai).toBe(true);
				expect(result.value.gpaiClassification?.role).toBe("provider");
			}
		});

		it("has undefined gpaiClassification for non-GPAI system", () => {
			const ctx = makeContext({
				description: "Spam filter",
				productType: "classifier",
			});
			const result = mapJurisdiction(ctx, "eu-ai-act");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.gpaiClassification).toBeUndefined();
			}
		});
	});
});

// ─── Agentic AI in High-Risk Domain Tests ────────────────────────────────

describe("Agentic AI in High-Risk Domains", () => {
	beforeEach(() => {
		clearRegistry();
		registerJurisdiction({
			id: "eu-ai-act",
			name: "EU Artificial Intelligence Act",
			region: "EU",
			description: "EU AI Act",
			module: euAiActModule,
		});
	});

	it("classifies agentic AI in employment domain as high-risk with human oversight", () => {
		const ctx = makeContext({
			description:
				"Agentic AI system that autonomously screens job applicants, ranks candidates, and sends rejection emails",
			productType: "agent",
			dataProcessed: ["personal", "employment"],
			userPopulations: ["job-applicants"],
			decisionImpact: "determinative",
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "bounded",
				toolAccess: ["email-api", "applicant-database"],
				actionScope: ["send-email", "update-application-status"],
				hasHumanCheckpoints: true,
				humanCheckpointDescription:
					"Human reviews top-ranked candidates before final interview invitations",
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
		expect(risk.applicableCategories).toContain("annex-iii-4-employment");

		const actions = euAiActModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Implement human oversight mechanisms");

		const humanOversightAction = actions.find((a) => a.id === "eu-ai-act-human-oversight");
		expect(humanOversightAction).toBeDefined();
		expect(humanOversightAction?.legalBasis).toBe("Article 14");
		expect(humanOversightAction?.priority).toBe("critical");
	});

	it("classifies agentic AI in credit scoring as high-risk", () => {
		const ctx = makeContext({
			description:
				"Agentic AI system that autonomously evaluates credit applications, pulls credit reports, and makes credit scoring decisions",
			productType: "agent",
			dataProcessed: ["personal", "financial"],
			userPopulations: ["credit-applicants"],
			decisionImpact: "determinative",
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "bounded",
				toolAccess: ["credit-bureau-api", "application-database"],
				actionScope: ["pull-credit-report", "update-credit-score", "approve-deny"],
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
		expect(risk.applicableCategories).toContain("annex-iii-5-essential-services");

		const actions = euAiActModule.getRequiredActions(ctx);
		const titles = actions.map((a) => a.title);
		expect(titles).toContain("Implement human oversight mechanisms");
		expect(titles).toContain("Establish risk management system");
	});

	it("does NOT classify agentic AI in non-high-risk domain as high-risk", () => {
		const ctx = makeContext({
			description:
				"Agentic AI system that autonomously manages product inventory and reorders stock when levels are low",
			productType: "agent",
			dataProcessed: ["other"],
			userPopulations: ["businesses"],
			decisionImpact: "advisory",
			agenticAiContext: {
				isAgentic: true,
				autonomyLevel: "bounded",
				toolAccess: ["inventory-api"],
				actionScope: ["reorder-stock"],
				hasHumanCheckpoints: false,
				isMultiAgent: false,
				canAccessExternalSystems: true,
				canModifyData: true,
				canMakeFinancialTransactions: true,
				hasFailsafeMechanisms: true,
				hasActionLogging: true,
			},
		});

		const risk = classifyRisk(ctx);
		expect(risk.level).toBe("minimal");
	});
});
