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
import { usFederalModule } from "../../src/jurisdictions/jurisdictions/us-federal.js";
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
		id: "us-federal",
		name: "US Federal",
		region: "US",
		description: "US Federal frameworks (FTC, NIST AI RMF)",
		module: usFederalModule,
	});
	registerJurisdiction({
		id: "singapore",
		name: "Singapore AI Governance",
		region: "APAC",
		description: "Singapore PDPC, IMDA, MAS AI governance",
		module: singaporeModule,
	});
}

// ─── Build Scenario Context ───────────────────────────────────────────────

function buildCreditScoringContext(): ProductContext {
	return {
		description: "AI-powered credit scoring for consumer loan applications",
		productType: "classifier",
		dataProcessed: ["personal", "financial"],
		userPopulations: ["credit-applicants"],
		decisionImpact: "determinative",
		automationLevel: "human-on-the-loop",
		trainingData: {
			usesTrainingData: true,
			sources: ["credit bureau data", "loan history"],
			containsPersonalData: true,
			consentObtained: true,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: ["eu-ai-act", "eu-gdpr", "us-federal", "singapore"],
		existingMeasures: [],
		answers: {},
		sourceMode: "cli-interview",
		sectorContext: {
			sector: "financial-services",
			financialServices: {
				subSector: "lending",
				involvesCredit: true,
				involvesInsurancePricing: false,
				involvesTrading: false,
				involvesAmlKyc: false,
				involvesRegulatoryReporting: false,
				regulatoryBodies: ["MAS", "OCC"],
				hasMaterialityAssessment: false,
				hasModelRiskGovernance: false,
			},
		},
	};
}

// ─── E2E Tests ────────────────────────────────────────────────────────────

describe("E2E: AI Credit Scoring → EU + Singapore + US Federal", () => {
	let ctx: ProductContext;
	let mapResult: ReturnType<typeof mapAllJurisdictions>;
	let actionPlan: ActionPlan;
	let report: LaunchClearReport;

	beforeAll(() => {
		initRegistry();
		ctx = buildCreditScoringContext();
		mapResult = mapAllJurisdictions(ctx);

		actionPlan = generateActionPlanWithoutLLM(mapResult.results);

		const marketReadiness = buildMarketReadiness(mapResult.results);
		const aggregated = aggregateRequirements(mapResult.results);

		report = {
			id: "test-credit-scoring",
			generatedAt: new Date().toISOString(),
			productContext: ctx,
			jurisdictionResults: mapResult.results,
			summary: {
				canLaunch: marketReadiness,
				highestRiskMarket: "eu-ai-act",
				lowestFrictionMarket: "us-federal",
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

	it("maps all four jurisdictions without errors", () => {
		expect(mapResult.errors).toHaveLength(0);
		expect(mapResult.results).toHaveLength(4);
	});

	// ─── EU AI Act ────────────────────────────────────────────────────────

	describe("EU AI Act", () => {
		let euResult: JurisdictionResult;

		beforeAll(() => {
			euResult = mapResult.results.find(
				(r) => r.jurisdiction === "eu-ai-act",
			) as JurisdictionResult;
		});

		it("classifies as HIGH risk (Annex III §5 credit scoring)", () => {
			expect(euResult.riskClassification.level).toBe("high");
		});

		it("identifies essential services / credit scoring category", () => {
			expect(euResult.riskClassification.applicableCategories).toContain(
				"annex-iii-5-essential-services",
			);
		});

		it("requires risk classification artifact", () => {
			const riskClassification = euResult.requiredArtifacts.find(
				(a) => a.type === "risk-classification",
			);
			expect(riskClassification).toBeDefined();
			expect(riskClassification?.required).toBe(true);
		});

		it("requires conformity assessment", () => {
			const conformity = euResult.requiredArtifacts.find((a) => a.type === "conformity-assessment");
			expect(conformity).toBeDefined();
		});

		it("requires human oversight action", () => {
			const oversight = euResult.requiredActions.find((a) => a.id === "eu-ai-act-human-oversight");
			expect(oversight).toBeDefined();
			expect(oversight?.priority).toBe("critical");
		});

		it("requires risk management system action", () => {
			const riskMgmt = euResult.requiredActions.find((a) => a.id === "eu-ai-act-risk-management");
			expect(riskMgmt).toBeDefined();
			expect(riskMgmt?.priority).toBe("critical");
		});

		it("has compliance timeline with 2026 deadline", () => {
			const deadline2026 = euResult.complianceTimeline.deadlines.find((d) =>
				d.date.startsWith("2026"),
			);
			expect(deadline2026).toBeDefined();
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

		it("classifies as high risk (DPIA required)", () => {
			expect(gdprResult.riskClassification.level).toBe("high");
		});

		it("requires DPIA (Article 35 — personal data in automated financial decisions)", () => {
			const dpia = gdprResult.requiredArtifacts.find((a) => a.type === "dpia");
			expect(dpia).toBeDefined();
			expect(dpia?.required).toBe(true);
		});

		it("has applicable provisions", () => {
			expect(gdprResult.applicableLaws.length).toBeGreaterThan(0);
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			expect(provisions.length).toBeGreaterThan(0);
		});
	});

	// ─── US Federal ───────────────────────────────────────────────────────

	describe("US Federal", () => {
		let usResult: JurisdictionResult;

		beforeAll(() => {
			usResult = mapResult.results.find(
				(r) => r.jurisdiction === "us-federal",
			) as JurisdictionResult;
		});

		it("classifies as high risk (credit scoring triggers SR 11-7, ECOA)", () => {
			expect(usResult.riskClassification.level).toBe("high");
		});

		it("has SR 11-7 model risk management provisions", () => {
			const provisions = usResult.applicableLaws.flatMap((l) => l.provisions);
			const hasSR117 = provisions.some((p) => p.id === "us-sr-11-7" || p.law.includes("SR 11-7"));
			expect(hasSR117).toBe(true);
		});

		it("has CFPB fair lending provisions", () => {
			const provisions = usResult.applicableLaws.flatMap((l) => l.provisions);
			const hasCFPB = provisions.some(
				(p) =>
					p.id === "us-cfpb-fair-lending" ||
					p.law.includes("ECOA") ||
					p.title.includes("Fair Lending"),
			);
			expect(hasCFPB).toBe(true);
		});

		it("triggers adverse action reason code action", () => {
			const allActions = [...usResult.requiredActions, ...usResult.recommendedActions];
			const adverseAction = allActions.find((a) => a.id === "us-cfpb-adverse-action");
			expect(adverseAction).toBeDefined();
		});

		it("triggers fair lending testing action", () => {
			const allActions = [...usResult.requiredActions, ...usResult.recommendedActions];
			const fairLending = allActions.find((a) => a.id === "us-cfpb-fair-lending-testing");
			expect(fairLending).toBeDefined();
		});

		it("requires bias audit / fair lending analysis artifact", () => {
			const biasAudit = usResult.requiredArtifacts.find((a) => a.type === "bias-audit");
			expect(biasAudit).toBeDefined();
		});

		it("requires model documentation (SR 11-7 aligned)", () => {
			const modelCard = usResult.requiredArtifacts.find((a) => a.type === "model-card");
			expect(modelCard).toBeDefined();
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

		it("classifies as high risk (MAS financial services AI)", () => {
			expect(sgResult.riskClassification.level).toBe("high");
		});

		it("triggers MAS AI risk management actions", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const hasMasAction = allActions.some((a) => a.id.startsWith("sg-mas-"));
			expect(hasMasAction).toBe(true);
		});

		it("triggers materiality assessment action", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const materialityAction = allActions.find((a) => a.id === "sg-mas-materiality-assessment");
			expect(materialityAction).toBeDefined();
		});

		it("triggers credit fairness testing action", () => {
			const allActions = [...sgResult.requiredActions, ...sgResult.recommendedActions];
			const creditFairness = allActions.find((a) => a.id === "sg-mas-credit-fairness-testing");
			expect(creditFairness).toBeDefined();
		});

		it("requires MAS risk materiality assessment artifact", () => {
			const materialityArtifact = sgResult.requiredArtifacts.find((a) =>
				a.name.includes("Materiality"),
			);
			expect(materialityArtifact).toBeDefined();
		});

		it("requires MAS model documentation artifact", () => {
			const modelDoc = sgResult.requiredArtifacts.find(
				(a) => a.type === "model-card" && a.name.includes("MAS"),
			);
			expect(modelDoc).toBeDefined();
		});
	});

	// ─── Action Plan ──────────────────────────────────────────────────────

	describe("Action Plan", () => {
		it("has critical actions", () => {
			expect(actionPlan.critical.length).toBeGreaterThan(0);
		});

		it("critical bucket has financial-specific actions", () => {
			const financialActions = actionPlan.critical.filter(
				(a) =>
					a.title.toLowerCase().includes("credit") ||
					a.title.toLowerCase().includes("fair lending") ||
					a.title.toLowerCase().includes("model risk") ||
					a.title.toLowerCase().includes("adverse action") ||
					a.title.toLowerCase().includes("materiality"),
			);
			expect(financialActions.length).toBeGreaterThan(0);
		});

		it("total actions across all jurisdictions is substantial (>10)", () => {
			const totalActions =
				actionPlan.critical.length + actionPlan.important.length + actionPlan.recommended.length;
			expect(totalActions).toBeGreaterThan(10);
		});

		it("actions have verification criteria", () => {
			for (const action of actionPlan.critical) {
				expect(action.verificationCriteria.length).toBeGreaterThan(0);
			}
		});

		it("includes actions from multiple jurisdictions", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const jurisdictions = new Set(allActions.flatMap((a) => a.jurisdiction));
			expect(jurisdictions.size).toBeGreaterThanOrEqual(3);
		});
	});

	// ─── Output Generation ────────────────────────────────────────────────

	describe("Output Generation", () => {
		it("generates a valid markdown report", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("# LaunchClear Compliance Report");
			expect(markdown).toContain("HIGH");
			expect(markdown).toContain("Critical");
		});

		it("markdown report includes all jurisdictions", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("eu-ai-act");
			expect(markdown).toContain("eu-gdpr");
			expect(markdown).toContain("us-federal");
			expect(markdown).toContain("singapore");
		});

		it("generates valid JSON report", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			expect(parsed.id).toBe("test-credit-scoring");
			expect(parsed.productContext.productType).toBe("classifier");
			expect(parsed.jurisdictionResults).toHaveLength(4);
		});

		it("JSON report preserves all jurisdiction results", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			const jurisdictions = parsed.jurisdictionResults.map(
				(r: JurisdictionResult) => r.jurisdiction,
			);
			expect(jurisdictions).toContain("eu-ai-act");
			expect(jurisdictions).toContain("eu-gdpr");
			expect(jurisdictions).toContain("us-federal");
			expect(jurisdictions).toContain("singapore");
		});
	});

	// ─── Market Readiness ─────────────────────────────────────────────────

	describe("Market Readiness", () => {
		it("all markets require action (high-risk product)", () => {
			for (const market of report.summary.canLaunch) {
				expect(["action-required", "blocked"]).toContain(market.status);
			}
		});

		it("EU AI Act market has blockers", () => {
			const euMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "eu-ai-act");
			expect(euMarket).toBeDefined();
			expect(euMarket?.blockers.length).toBeGreaterThan(0);
		});
	});
});
