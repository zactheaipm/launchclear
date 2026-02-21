import { beforeAll, describe, expect, it } from "vitest";
import { generateActionPlanWithoutLLM } from "../../src/actions/generator.js";
import type {
	ActionPlan,
	JurisdictionResult,
	LaunchClearReport,
	ProductContext,
} from "../../src/core/types.js";
import { euAiActModule } from "../../src/jurisdictions/jurisdictions/eu-ai-act.js";
import { euGdprModule } from "../../src/jurisdictions/jurisdictions/eu-gdpr.js";
import { singaporeModule } from "../../src/jurisdictions/jurisdictions/singapore.js";
import { clearRegistry, registerJurisdiction } from "../../src/jurisdictions/registry.js";
import {
	aggregateRequirements,
	mapAllJurisdictions,
} from "../../src/jurisdictions/requirement-mapper.js";
import { generateJsonReport } from "../../src/output/json.js";
import { buildMarketReadiness, generateMarkdownReport } from "../../src/output/markdown.js";

// ─── Test Setup ───────────────────────────────────────────────────────────

function initRegistry(): void {
	clearRegistry();
	registerJurisdiction({
		id: "singapore",
		name: "Singapore AI Governance",
		region: "APAC",
		description: "Singapore PDPC, IMDA, MAS AI governance",
		module: singaporeModule,
	});
	registerJurisdiction({
		id: "eu-ai-act",
		name: "EU AI Act",
		region: "EU",
		description: "EU Artificial Intelligence Act",
		module: euAiActModule,
	});
	registerJurisdiction({
		id: "eu-gdpr",
		name: "EU GDPR",
		region: "EU",
		description: "EU General Data Protection Regulation",
		module: euGdprModule,
	});
}

// ─── Build Scenario Context ───────────────────────────────────────────────

function buildAgenticServiceContext(): ProductContext {
	return {
		description: "AI agent that handles customer service, can issue refunds and update accounts",
		productType: "agent",
		dataProcessed: ["personal", "financial"],
		userPopulations: ["consumers"],
		decisionImpact: "material",
		automationLevel: "human-on-the-loop",
		trainingData: {
			usesTrainingData: false,
			sources: [],
			containsPersonalData: false,
			consentObtained: null,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: ["singapore", "eu-ai-act", "eu-gdpr"],
		existingMeasures: [],
		answers: {},
		sourceMode: "cli-interview",
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
			usesAgenticCapabilities: true,
			followsIMDAGuidelines: true,
		},
		agenticAiContext: {
			isAgentic: true,
			autonomyLevel: "bounded",
			toolAccess: ["refund-api", "account-api", "crm-api"],
			actionScope: ["issue refunds", "update account details", "send emails"],
			hasHumanCheckpoints: true,
			humanCheckpointDescription: "Refunds over $500 require manager approval",
			isMultiAgent: false,
			canAccessExternalSystems: true,
			canModifyData: true,
			canMakeFinancialTransactions: true,
			hasFailsafeMechanisms: true,
			hasActionLogging: true,
		},
	};
}

// ─── E2E Tests ────────────────────────────────────────────────────────────

describe("E2E: Agentic Customer Service Bot → Singapore + EU", () => {
	let ctx: ProductContext;
	let mapResult: ReturnType<typeof mapAllJurisdictions>;
	let actionPlan: ActionPlan;
	let report: LaunchClearReport;

	beforeAll(() => {
		initRegistry();
		ctx = buildAgenticServiceContext();
		mapResult = mapAllJurisdictions(ctx);

		actionPlan = generateActionPlanWithoutLLM(mapResult.results);

		const marketReadiness = buildMarketReadiness(mapResult.results);
		const aggregated = aggregateRequirements(mapResult.results);

		report = {
			id: "test-agentic-service",
			generatedAt: new Date().toISOString(),
			productContext: ctx,
			jurisdictionResults: mapResult.results,
			summary: {
				canLaunch: marketReadiness,
				highestRiskMarket: "singapore",
				lowestFrictionMarket: "eu-ai-act",
				criticalBlockers: [],
				totalArtifactsNeeded: aggregated.totalArtifacts,
				totalActionsNeeded: aggregated.totalActions,
				estimatedComplianceTimeline: "See per-jurisdiction timelines",
			},
			artifacts: [],
			actionPlan,
			metadata: {
				provider: "none",
				model: "none",
				knowledgeBaseVersion: "2026-02",
				intakeTranscript: [],
			},
		};
	});

	// ─── Jurisdiction Mapping ─────────────────────────────────────────────

	it("maps all three jurisdictions without errors", () => {
		expect(mapResult.errors).toHaveLength(0);
		expect(mapResult.results).toHaveLength(3);
	});

	it("identifies all jurisdiction results", () => {
		const jurisdictions = mapResult.results.map((r) => r.jurisdiction);
		expect(jurisdictions).toContain("singapore");
		expect(jurisdictions).toContain("eu-ai-act");
		expect(jurisdictions).toContain("eu-gdpr");
	});

	// ─── Singapore ────────────────────────────────────────────────────────

	describe("Singapore", () => {
		let sgResult: JurisdictionResult;

		beforeAll(() => {
			sgResult = mapResult.results.find(
				(r) => r.jurisdiction === "singapore",
			) as JurisdictionResult;
		});

		it("triggers IMDA Agentic AI framework provisions", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasAgenticProvision = provisions.some(
				(p) => p.id.includes("imda-agentic") || p.law.includes("IMDA Agentic"),
			);
			expect(hasAgenticProvision).toBe(true);
		});

		it("has PDPC provisions for personal data", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasPdpcProvision = provisions.some(
				(p) => p.id.includes("pdpa") || p.id.includes("pdpc"),
			);
			expect(hasPdpcProvision).toBe(true);
		});

		it("has agentic AI risk bounding provision (Dimension 1)", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasRiskBounding = provisions.some((p) => p.id === "sg-imda-agentic-risk-bounding");
			expect(hasRiskBounding).toBe(true);
		});

		it("has agentic AI human accountability provision (Dimension 2)", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasHumanAccountability = provisions.some(
				(p) => p.id === "sg-imda-agentic-human-accountability",
			);
			expect(hasHumanAccountability).toBe(true);
		});

		it("has agentic AI technical controls provision (Dimension 3)", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasTechnicalControls = provisions.some(
				(p) => p.id === "sg-imda-agentic-technical-controls",
			);
			expect(hasTechnicalControls).toBe(true);
		});

		it("has agentic AI end-user responsibility provision (Dimension 4)", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasEndUser = provisions.some((p) => p.id === "sg-imda-agentic-end-user");
			expect(hasEndUser).toBe(true);
		});

		it("triggers agentic risk bounding action (Dimension 1)", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const riskBoundAction = allActions.find((a) => a.id === "sg-imda-agentic-risk-bound");
			expect(riskBoundAction).toBeDefined();
		});

		it("triggers human accountability action (Dimension 2)", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const humanAction = allActions.find((a) => a.id === "sg-imda-agentic-human-accountability");
			expect(humanAction).toBeDefined();
		});

		it("triggers technical controls action (Dimension 3)", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const techAction = allActions.find((a) => a.id === "sg-imda-agentic-technical-controls");
			expect(techAction).toBeDefined();
		});

		it("triggers end-user responsibility action (Dimension 4)", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const endUserAction = allActions.find((a) => a.id === "sg-imda-agentic-end-user");
			expect(endUserAction).toBeDefined();
		});

		it("requires agentic AI governance assessment artifact", () => {
			const agenticArtifact = sgResult.requiredArtifacts.find((a) =>
				a.name.includes("Agentic AI Governance"),
			);
			expect(agenticArtifact).toBeDefined();
		});

		it("classifies as high risk (agentic + financial transactions)", () => {
			expect(sgResult.riskClassification.level).toBe("high");
		});
	});

	// ─── EU AI Act ────────────────────────────────────────────────────────

	describe("EU AI Act", () => {
		let euResult: JurisdictionResult;

		beforeAll(() => {
			euResult = mapResult.results.find(
				(r) => r.jurisdiction === "eu-ai-act",
			) as JurisdictionResult;
		});

		it("has applicable provisions", () => {
			expect(euResult.applicableLaws.length).toBeGreaterThan(0);
		});

		it("classifies as minimal risk (description does not match chatbot/deepfake/emotion triggers)", () => {
			// "AI agent that handles customer service" does NOT contain "chatbot",
			// "conversational ai", "virtual assistant", "ai assistant", or "customer service ai"
			// so isChatbotOrConversationalAI returns false → minimal risk
			expect(euResult.riskClassification.level).toBe("minimal");
		});

		it("has no EU AI Act-specific actions (minimal risk, no GPAI)", () => {
			// productType is "agent", not "foundation-model", and description
			// doesn't match GPAI keywords, so no GPAI obligations apply either
			const totalActions = euResult.requiredActions.length + euResult.recommendedActions.length;
			expect(totalActions).toBe(0);
		});
	});

	// ─── EU GDPR ──────────────────────────────────────────────────────────

	describe("EU GDPR", () => {
		let gdprResult: JurisdictionResult;

		beforeAll(() => {
			gdprResult = mapResult.results.find(
				(r) => r.jurisdiction === "eu-gdpr",
			) as JurisdictionResult;
		});

		it("has applicable provisions for personal and financial data", () => {
			expect(gdprResult.applicableLaws.length).toBeGreaterThan(0);
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			expect(provisions.length).toBeGreaterThan(0);
		});

		it("processes personal data", () => {
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			const hasPersonalDataProvision = provisions.some(
				(p) => p.id.includes("gdpr-art5") || p.id.includes("gdpr-art6"),
			);
			expect(hasPersonalDataProvision).toBe(true);
		});
	});

	// ─── Action Plan ──────────────────────────────────────────────────────

	describe("Action Plan", () => {
		it("has critical actions", () => {
			expect(actionPlan.critical.length).toBeGreaterThan(0);
		});

		it("includes agentic-specific actions (action logging, failsafe, risk bounding)", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const hasAgenticAction = allActions.some(
				(a) =>
					a.title.toLowerCase().includes("agentic") ||
					a.title.toLowerCase().includes("agent") ||
					a.id.includes("agentic"),
			);
			expect(hasAgenticAction).toBe(true);
		});

		it("Singapore actions reference IMDA four dimensions", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const sgAgenticActions = allActions.filter(
				(a) =>
					a.jurisdiction.includes("singapore") &&
					(a.id.includes("agentic") || a.title.toLowerCase().includes("agentic")),
			);
			expect(sgAgenticActions.length).toBeGreaterThanOrEqual(3);
		});

		it("actions have verification criteria", () => {
			for (const action of actionPlan.critical) {
				expect(action.verificationCriteria.length).toBeGreaterThan(0);
			}
		});
	});

	// ─── Output Generation ────────────────────────────────────────────────

	describe("Output Generation", () => {
		it("generates a valid markdown report", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("# LaunchClear Compliance Report");
			expect(markdown).toContain("singapore");
			expect(markdown).toContain("eu-ai-act");
			expect(markdown).toContain("eu-gdpr");
		});

		it("generates valid JSON report", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			expect(parsed.id).toBe("test-agentic-service");
			expect(parsed.productContext.productType).toBe("agent");
			expect(parsed.jurisdictionResults).toHaveLength(3);
		});

		it("JSON report is valid and parseable", () => {
			const json = generateJsonReport(report);
			expect(() => JSON.parse(json)).not.toThrow();
			const parsed = JSON.parse(json);
			expect(parsed.jurisdictionResults).toBeDefined();
			expect(parsed.actionPlan).toBeDefined();
		});
	});

	// ─── Market Readiness ─────────────────────────────────────────────────

	describe("Market Readiness", () => {
		it("Singapore and GDPR markets require action", () => {
			const sgMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "singapore");
			const gdprMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "eu-gdpr");
			expect(sgMarket).toBeDefined();
			expect(gdprMarket).toBeDefined();
			expect(["action-required", "blocked"]).toContain(sgMarket?.status);
			expect(["action-required", "blocked"]).toContain(gdprMarket?.status);
		});

		it("EU AI Act market is ready (minimal risk, no obligations)", () => {
			const euMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "eu-ai-act");
			expect(euMarket).toBeDefined();
			expect(euMarket?.status).toBe("ready");
		});
	});
});
