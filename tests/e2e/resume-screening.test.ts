import { beforeAll, describe, expect, it } from "vitest";
import { generateActionPlanWithoutLLM } from "../../src/actions/generator.js";
import { buildQuickContext } from "../../src/cli/interactive.js";
import type {
	ActionPlan,
	JurisdictionResult,
	LaunchClearReport,
	ProductContext,
} from "../../src/core/types.js";
import { buildProductContext } from "../../src/intake/context-builder.js";
import { euAiActModule } from "../../src/jurisdictions/jurisdictions/eu-ai-act.js";
import { euGdprModule } from "../../src/jurisdictions/jurisdictions/eu-gdpr.js";
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
}

// ─── Build Scenario Context ───────────────────────────────────────────────

function buildResumeScreeningContext(): ProductContext {
	return {
		description:
			"AI-powered resume screening tool that auto-rejects the bottom 50% of applicants based on ML scoring of resumes against job requirements",
		productType: "classifier",
		dataProcessed: ["personal", "employment"],
		userPopulations: ["job-applicants"],
		decisionImpact: "determinative",
		automationLevel: "fully-automated",
		trainingData: {
			usesTrainingData: true,
			sources: ["historical hiring data"],
			containsPersonalData: true,
			consentObtained: null,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: ["eu-ai-act", "eu-gdpr", "us-federal"],
		existingMeasures: [],
		answers: {},
		sourceMode: "cli-interview",
	};
}

// ─── E2E Tests ────────────────────────────────────────────────────────────

describe("E2E: AI Resume Screening → EU + US Federal", () => {
	let ctx: ProductContext;
	let mapResult: ReturnType<typeof mapAllJurisdictions>;
	let actionPlan: ActionPlan;
	let report: LaunchClearReport;

	beforeAll(() => {
		initRegistry();
		ctx = buildResumeScreeningContext();
		mapResult = mapAllJurisdictions(ctx);

		actionPlan = generateActionPlanWithoutLLM(mapResult.results);

		const marketReadiness = buildMarketReadiness(mapResult.results);
		const aggregated = aggregateRequirements(mapResult.results);

		report = {
			id: "test-resume-screening",
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

	it("maps all three jurisdictions without errors", () => {
		expect(mapResult.errors).toHaveLength(0);
		expect(mapResult.results).toHaveLength(3);
	});

	it("identifies EU AI Act jurisdiction result", () => {
		const euAiAct = mapResult.results.find((r) => r.jurisdiction === "eu-ai-act");
		expect(euAiAct).toBeDefined();
	});

	it("identifies EU GDPR jurisdiction result", () => {
		const euGdpr = mapResult.results.find((r) => r.jurisdiction === "eu-gdpr");
		expect(euGdpr).toBeDefined();
	});

	it("identifies US Federal jurisdiction result", () => {
		const usFederal = mapResult.results.find((r) => r.jurisdiction === "us-federal");
		expect(usFederal).toBeDefined();
	});

	// ─── EU AI Act Risk Classification ────────────────────────────────────

	describe("EU AI Act", () => {
		let euResult: JurisdictionResult;

		beforeAll(() => {
			euResult = mapResult.results.find(
				(r) => r.jurisdiction === "eu-ai-act",
			) as JurisdictionResult;
		});

		it("classifies as HIGH risk (Annex III employment)", () => {
			expect(euResult.riskClassification.level).toBe("high");
		});

		it("identifies employment category in Annex III", () => {
			expect(euResult.riskClassification.applicableCategories).toContain("annex-iii-4-employment");
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

		it("requires risk management system action", () => {
			const riskMgmt = euResult.requiredActions.find((a) => a.id === "eu-ai-act-risk-management");
			expect(riskMgmt).toBeDefined();
			expect(riskMgmt?.priority).toBe("critical");
		});

		it("requires human oversight action", () => {
			const oversight = euResult.requiredActions.find((a) => a.id === "eu-ai-act-human-oversight");
			expect(oversight).toBeDefined();
			expect(oversight?.priority).toBe("critical");
		});

		it("requires data governance action", () => {
			const dataGov = euResult.requiredActions.find((a) => a.id === "eu-ai-act-data-governance");
			expect(dataGov).toBeDefined();
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

		it("identifies DPIA requirement for automated employment decisions", () => {
			const dpia = gdprResult.requiredArtifacts.find((a) => a.type === "dpia");
			expect(dpia).toBeDefined();
		});

		it("has applicable provisions", () => {
			expect(gdprResult.applicableLaws.length).toBeGreaterThan(0);
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

		it("has applicable provisions", () => {
			expect(usResult.applicableLaws.length).toBeGreaterThan(0);
		});

		it("has required or recommended actions", () => {
			const totalActions = usResult.requiredActions.length + usResult.recommendedActions.length;
			expect(totalActions).toBeGreaterThan(0);
		});
	});

	// ─── Action Plan ──────────────────────────────────────────────────────

	describe("Action Plan", () => {
		it("has critical actions", () => {
			expect(actionPlan.critical.length).toBeGreaterThan(0);
		});

		it("critical actions include EU AI Act requirements", () => {
			const euActions = actionPlan.critical.filter((a) => a.jurisdiction.includes("eu-ai-act"));
			expect(euActions.length).toBeGreaterThan(0);
		});

		it("includes bias testing or data governance action", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const hasBiasOrData = allActions.some(
				(a) =>
					a.title.toLowerCase().includes("bias") ||
					a.title.toLowerCase().includes("data governance") ||
					a.title.toLowerCase().includes("data quality"),
			);
			expect(hasBiasOrData).toBe(true);
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
			expect(markdown).toContain("Executive Summary");
			expect(markdown).toContain("Market Readiness");
			expect(markdown).toContain("Jurisdiction Analysis");
			expect(markdown).toContain("Action Plan");
			expect(markdown).toContain("eu-ai-act");
		});

		it("markdown report includes risk classification", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("HIGH");
		});

		it("markdown report includes critical actions section", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("Critical");
		});

		it("generates valid JSON report", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			expect(parsed.id).toBe("test-resume-screening");
			expect(parsed.productContext.productType).toBe("classifier");
			expect(parsed.jurisdictionResults).toHaveLength(3);
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
		});
	});

	// ─── Quick Context Builder ────────────────────────────────────────────

	describe("Quick Context Builder (CLI check mode)", () => {
		it("infers classifier type from resume screening description", () => {
			const result = buildQuickContext("AI-powered resume screening that auto-rejects bottom 50%", [
				"eu-ai-act",
				"us-federal",
			]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.value.productType).toBe("classifier");
		});

		it("infers employment data category", () => {
			const result = buildQuickContext("AI resume screening tool for hiring", ["eu-ai-act"]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.value.dataProcessed).toContain("employment");
		});

		it("infers job-applicants user population", () => {
			const result = buildQuickContext("AI tool to screen job applicants' resumes", ["eu-ai-act"]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.value.userPopulations).toContain("job-applicants");
		});

		it("infers determinative decision impact for auto-reject", () => {
			const result = buildQuickContext("AI tool that auto-rejects applications based on scoring", [
				"eu-ai-act",
			]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.value.decisionImpact).toBe("determinative");
		});

		it("infers fully-automated for auto-reject", () => {
			const result = buildQuickContext("AI tool that auto-rejects applications automatically", [
				"eu-ai-act",
			]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.value.automationLevel).toBe("fully-automated");
		});

		it("quick context feeds into jurisdiction mapping correctly", () => {
			const result = buildQuickContext("AI-powered resume screening that auto-rejects bottom 50%", [
				"eu-ai-act",
			]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;

			const mapping = mapAllJurisdictions(result.value);
			expect(mapping.errors).toHaveLength(0);
			expect(mapping.results).toHaveLength(1);

			const euResult = mapping.results[0];
			expect(euResult.riskClassification.level).toBe("high");
		});
	});

	// ─── Market Readiness ─────────────────────────────────────────────────

	describe("Market Readiness", () => {
		it("all markets require action (no market is ready)", () => {
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
