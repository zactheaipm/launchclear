import { beforeAll, describe, expect, it } from "vitest";
import { generateActionPlanWithoutLLM } from "../../src/actions/generator.js";
import type {
	ActionPlan,
	JurisdictionResult,
	LaunchClearReport,
	ProductContext,
} from "../../src/core/types.js";
import { chinaModule } from "../../src/jurisdictions/jurisdictions/china.js";
import { euAiActModule } from "../../src/jurisdictions/jurisdictions/eu-ai-act.js";
import { euGdprModule } from "../../src/jurisdictions/jurisdictions/eu-gdpr.js";
import { singaporeModule } from "../../src/jurisdictions/jurisdictions/singapore.js";
import { ukModule } from "../../src/jurisdictions/jurisdictions/uk.js";
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
	registerJurisdiction({
		id: "uk",
		name: "UK AI Regulatory Framework",
		region: "UK",
		description: "UK AI regulatory frameworks (AISI, DSIT, ICO, FCA)",
		module: ukModule,
	});
	registerJurisdiction({
		id: "singapore",
		name: "Singapore AI Governance",
		region: "APAC",
		description: "Singapore PDPC, IMDA, MAS AI governance",
		module: singaporeModule,
	});
	registerJurisdiction({
		id: "china",
		name: "China AI Regulations",
		region: "APAC",
		description: "China CAC GenAI, Deep Synthesis, Recommendation Algorithms",
		module: chinaModule,
	});
}

// ─── Build Scenario Context ───────────────────────────────────────────────

function buildGenAiChatbotContext(): ProductContext {
	return {
		description: "Customer-facing GenAI chatbot for product support across global markets",
		productType: "generator",
		dataProcessed: ["personal", "behavioral"],
		userPopulations: ["consumers"],
		decisionImpact: "advisory",
		automationLevel: "fully-automated",
		trainingData: {
			usesTrainingData: true,
			sources: ["product docs", "support tickets"],
			containsPersonalData: false,
			consentObtained: null,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: ["eu-ai-act", "eu-gdpr", "uk", "singapore", "china"],
		existingMeasures: [],
		answers: {},
		sourceMode: "cli-interview",
		generativeAiContext: {
			usesFoundationModel: true,
			foundationModelSource: "third-party-api",
			modelIdentifier: "gpt-4",
			generatesContent: true,
			outputModalities: ["text"],
			canGenerateDeepfakes: false,
			canGenerateSyntheticVoice: false,
			hasOutputWatermarking: false,
			hasOutputFiltering: true,
			trainingDataIncludes: ["proprietary-data"],
			finetuningPerformed: false,
			usesRAG: true,
			usesAgenticCapabilities: false,
			algorithmFilingStatus: "not-filed",
			providesContentModeration: true,
			isFrontierModel: false,
			followsIMDAGuidelines: false,
		},
	};
}

// ─── E2E Tests ────────────────────────────────────────────────────────────

describe("E2E: GenAI Chatbot → EU + China + UK + Singapore", () => {
	let ctx: ProductContext;
	let mapResult: ReturnType<typeof mapAllJurisdictions>;
	let actionPlan: ActionPlan;
	let report: LaunchClearReport;

	beforeAll(() => {
		initRegistry();
		ctx = buildGenAiChatbotContext();
		mapResult = mapAllJurisdictions(ctx);

		actionPlan = generateActionPlanWithoutLLM(mapResult.results);

		const marketReadiness = buildMarketReadiness(mapResult.results);
		const aggregated = aggregateRequirements(mapResult.results);

		report = {
			id: "test-genai-chatbot",
			generatedAt: new Date().toISOString(),
			productContext: ctx,
			jurisdictionResults: mapResult.results,
			summary: {
				canLaunch: marketReadiness,
				highestRiskMarket: "china",
				lowestFrictionMarket: "singapore",
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

	it("maps all five jurisdictions without errors", () => {
		expect(mapResult.errors).toHaveLength(0);
		expect(mapResult.results).toHaveLength(5);
	});

	it("identifies all jurisdiction results", () => {
		const jurisdictions = mapResult.results.map((r) => r.jurisdiction);
		expect(jurisdictions).toContain("eu-ai-act");
		expect(jurisdictions).toContain("eu-gdpr");
		expect(jurisdictions).toContain("uk");
		expect(jurisdictions).toContain("singapore");
		expect(jurisdictions).toContain("china");
	});

	// ─── EU AI Act ────────────────────────────────────────────────────────

	describe("EU AI Act", () => {
		let euResult: JurisdictionResult;

		beforeAll(() => {
			euResult = mapResult.results.find(
				(r) => r.jurisdiction === "eu-ai-act",
			) as JurisdictionResult;
		});

		it("classifies as limited risk for advisory chatbot (NOT high)", () => {
			expect(["limited", "minimal"]).toContain(euResult.riskClassification.level);
			expect(euResult.riskClassification.level).not.toBe("high");
		});

		it("has transparency obligations (Articles 50-52)", () => {
			const hasTransparency = euResult.applicableLaws.some((law) =>
				law.provisions.some((p) => p.article.includes("50")),
			);
			expect(hasTransparency).toBe(true);
		});

		it("requires transparency notice artifact", () => {
			const notice = euResult.requiredArtifacts.find((a) => a.type === "transparency-notice");
			expect(notice).toBeDefined();
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

		it("has applicable provisions for personal data processing", () => {
			expect(gdprResult.applicableLaws.length).toBeGreaterThan(0);
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			expect(provisions.length).toBeGreaterThan(0);
		});

		it("requires transparency notice", () => {
			const notice = gdprResult.requiredArtifacts.find((a) => a.type === "transparency-notice");
			expect(notice).toBeDefined();
		});

		it("has data transfer provisions (third-party API)", () => {
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			const hasTransferProvision = provisions.some(
				(p) =>
					p.article.includes("44") ||
					p.article.includes("49") ||
					p.id === "gdpr-art44-49-transfers",
			);
			expect(hasTransferProvision).toBe(true);
		});
	});

	// ─── China ────────────────────────────────────────────────────────────

	describe("China", () => {
		let chinaResult: JurisdictionResult;

		beforeAll(() => {
			chinaResult = mapResult.results.find((r) => r.jurisdiction === "china") as JurisdictionResult;
		});

		it("classifies as high risk (public-facing GenAI)", () => {
			expect(chinaResult.riskClassification.level).toBe("high");
		});

		it("triggers CAC GenAI algorithm filing action", () => {
			const allActions = [...chinaResult.requiredActions, ...chinaResult.recommendedActions];
			const filingAction = allActions.find((a) => a.id === "cn-algorithm-filing");
			expect(filingAction).toBeDefined();
		});

		it("triggers content moderation action", () => {
			const allActions = [...chinaResult.requiredActions, ...chinaResult.recommendedActions];
			const contentReviewAction = allActions.find(
				(a) => a.id === "cn-cac-content-review-mechanism",
			);
			expect(contentReviewAction).toBeDefined();
		});

		it("triggers mandatory content labeling action", () => {
			const allActions = [...chinaResult.requiredActions, ...chinaResult.recommendedActions];
			const labelingAction = allActions.find((a) => a.id === "cn-cac-content-labeling");
			expect(labelingAction).toBeDefined();
		});

		it("requires algorithm filing artifact", () => {
			const filingArtifact = chinaResult.requiredArtifacts.find(
				(a) => a.templateId === "china-algorithm-filing",
			);
			expect(filingArtifact).toBeDefined();
		});

		it("requires GenAI safety assessment artifact", () => {
			const safetyArtifact = chinaResult.requiredArtifacts.find(
				(a) => a.templateId === "china-genai-assessment",
			);
			expect(safetyArtifact).toBeDefined();
		});

		it("has more required actions than other jurisdictions (most prescriptive)", () => {
			const chinaActionCount = chinaResult.requiredActions.length;
			const ukResult = mapResult.results.find((r) => r.jurisdiction === "uk") as JurisdictionResult;
			const sgResult = mapResult.results.find(
				(r) => r.jurisdiction === "singapore",
			) as JurisdictionResult;
			expect(chinaActionCount).toBeGreaterThan(ukResult.requiredActions.length);
			expect(chinaActionCount).toBeGreaterThan(sgResult.requiredActions.length);
		});
	});

	// ─── UK ───────────────────────────────────────────────────────────────

	describe("UK", () => {
		let ukResult: JurisdictionResult;

		beforeAll(() => {
			ukResult = mapResult.results.find((r) => r.jurisdiction === "uk") as JurisdictionResult;
		});

		it("has applicable provisions (DSIT/ICO)", () => {
			expect(ukResult.applicableLaws.length).toBeGreaterThan(0);
			const provisions = ukResult.applicableLaws.flatMap((l) => l.provisions);
			expect(provisions.length).toBeGreaterThan(0);
		});

		it("classifies as limited risk (foundation model deployer, not frontier)", () => {
			expect(ukResult.riskClassification.level).toBe("limited");
		});

		it("has required or recommended actions", () => {
			const totalActions = ukResult.requiredActions.length + ukResult.recommendedActions.length;
			expect(totalActions).toBeGreaterThan(0);
		});
	});

	// ─── Singapore ────────────────────────────────────────────────────────

	describe("Singapore", () => {
		let sgResult: JurisdictionResult;

		beforeAll(() => {
			sgResult = mapResult.results.find(
				(r) => r.jurisdiction === "singapore",
			) as JurisdictionResult;
		});

		it("has applicable provisions (PDPC/IMDA)", () => {
			expect(sgResult.applicableLaws.length).toBeGreaterThan(0);
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			expect(provisions.length).toBeGreaterThan(0);
		});

		it("has GenAI-specific provisions", () => {
			const provisions = sgResult.applicableLaws.flatMap((l) => l.provisions);
			const hasGenAi = provisions.some(
				(p) => p.id.includes("imda-genai") || p.law.includes("IMDA GenAI"),
			);
			expect(hasGenAi).toBe(true);
		});

		it("has required or recommended actions", () => {
			const totalActions = sgResult.requiredActions.length + sgResult.recommendedActions.length;
			expect(totalActions).toBeGreaterThan(0);
		});
	});

	// ─── Action Plan ──────────────────────────────────────────────────────

	describe("Action Plan", () => {
		it("has critical actions", () => {
			expect(actionPlan.critical.length).toBeGreaterThan(0);
		});

		it("has GenAI-specific actions (content labeling, transparency)", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const hasGenAiAction = allActions.some(
				(a) =>
					a.title.toLowerCase().includes("content") ||
					a.title.toLowerCase().includes("transparency") ||
					a.title.toLowerCase().includes("labeling") ||
					a.title.toLowerCase().includes("labelling") ||
					a.title.toLowerCase().includes("disclosure"),
			);
			expect(hasGenAiAction).toBe(true);
		});

		it("includes China-specific critical actions", () => {
			const chinaActions = actionPlan.critical.filter((a) => a.jurisdiction.includes("china"));
			expect(chinaActions.length).toBeGreaterThan(0);
		});

		it("actions have verification criteria", () => {
			for (const action of actionPlan.critical) {
				expect(action.verificationCriteria.length).toBeGreaterThan(0);
			}
		});

		it("cross-jurisdictional: different requirements per jurisdiction", () => {
			// China should have algorithm filing actions, EU should not
			const chinaActions = [...actionPlan.critical, ...actionPlan.important].filter((a) =>
				a.jurisdiction.includes("china"),
			);
			const euAiActActions = [...actionPlan.critical, ...actionPlan.important].filter((a) =>
				a.jurisdiction.includes("eu-ai-act"),
			);

			const chinaAlgoFiling = chinaActions.some(
				(a) => a.title.toLowerCase().includes("algorithm") || a.title.toLowerCase().includes("cac"),
			);
			const euAlgoFiling = euAiActActions.some((a) =>
				a.title.toLowerCase().includes("algorithm filing"),
			);

			expect(chinaAlgoFiling).toBe(true);
			expect(euAlgoFiling).toBe(false);
		});
	});

	// ─── Output Generation ────────────────────────────────────────────────

	describe("Output Generation", () => {
		it("generates a valid markdown report", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("# LaunchClear Compliance Report");
			expect(markdown).toContain("Executive Summary");
			expect(markdown).toContain("Market Readiness");
			expect(markdown).toContain("Jurisdiction Analysis");
			expect(markdown).toContain("Action Plan");
		});

		it("markdown report mentions all jurisdictions", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("eu-ai-act");
			expect(markdown).toContain("eu-gdpr");
			expect(markdown).toContain("uk");
			expect(markdown).toContain("singapore");
			expect(markdown).toContain("china");
		});

		it("generates valid JSON report", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			expect(parsed.id).toBe("test-genai-chatbot");
			expect(parsed.productContext.productType).toBe("generator");
			expect(parsed.jurisdictionResults).toHaveLength(5);
		});

		it("JSON report preserves all jurisdiction results", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			const jurisdictions = parsed.jurisdictionResults.map(
				(r: JurisdictionResult) => r.jurisdiction,
			);
			expect(jurisdictions).toContain("eu-ai-act");
			expect(jurisdictions).toContain("eu-gdpr");
			expect(jurisdictions).toContain("uk");
			expect(jurisdictions).toContain("singapore");
			expect(jurisdictions).toContain("china");
		});

		it("JSON report is valid and parseable", () => {
			const json = generateJsonReport(report);
			expect(() => JSON.parse(json)).not.toThrow();
			const parsed = JSON.parse(json);
			expect(parsed.jurisdictionResults).toBeDefined();
			expect(parsed.actionPlan).toBeDefined();
			expect(parsed.summary).toBeDefined();
		});
	});

	// ─── Market Readiness ─────────────────────────────────────────────────

	describe("Market Readiness", () => {
		it("all markets require action", () => {
			for (const market of report.summary.canLaunch) {
				expect(["action-required", "blocked"]).toContain(market.status);
			}
		});

		it("China market has blockers (most prescriptive)", () => {
			const chinaMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "china");
			expect(chinaMarket).toBeDefined();
			expect(chinaMarket?.blockers.length).toBeGreaterThan(0);
		});
	});
});
