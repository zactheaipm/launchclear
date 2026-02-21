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
		id: "china",
		name: "China AI Regulations",
		region: "APAC",
		description: "CAC GenAI, Deep Synthesis, Recommendation Algorithms",
		module: chinaModule,
	});
}

// ─── Build Scenario Context ───────────────────────────────────────────────

function buildFoundationModelContext(): ProductContext {
	return {
		description: "Large language model provider offering API access to enterprise customers",
		productType: "foundation-model",
		dataProcessed: ["personal", "behavioral"],
		userPopulations: ["businesses"],
		decisionImpact: "advisory",
		automationLevel: "human-on-the-loop",
		trainingData: {
			usesTrainingData: true,
			sources: ["public-web-scrape", "licensed-datasets", "open-source-datasets"],
			containsPersonalData: true,
			consentObtained: false,
			optOutMechanism: true,
			syntheticData: true,
		},
		targetMarkets: ["eu-ai-act", "eu-gdpr", "china"],
		existingMeasures: [],
		answers: {},
		sourceMode: "cli-interview",
		gpaiInfo: {
			isGpaiModel: true,
			gpaiRole: "provider",
			modelName: "InternalLLM-70B",
			isOpenSource: false,
			computeFlops: 1e26,
			exceedsSystemicRiskThreshold: true,
			commissionDesignated: false,
			providesDownstreamDocumentation: true,
			hasAcceptableUsePolicy: true,
			copyrightComplianceMechanism: "opt-out-system",
		},
		generativeAiContext: {
			usesFoundationModel: true,
			foundationModelSource: "self-trained",
			modelIdentifier: "InternalLLM-70B",
			generatesContent: true,
			outputModalities: ["text", "code"],
			canGenerateDeepfakes: false,
			canGenerateSyntheticVoice: false,
			hasOutputWatermarking: true,
			hasOutputFiltering: true,
			trainingDataIncludes: ["public-web-scrape", "licensed-datasets", "open-source-datasets"],
			finetuningPerformed: false,
			usesRAG: false,
			usesAgenticCapabilities: false,
			algorithmFilingStatus: "not-filed",
		},
	};
}

// ─── E2E Tests ────────────────────────────────────────────────────────────

describe("E2E: Foundation Model Provider → EU + China", () => {
	let ctx: ProductContext;
	let mapResult: ReturnType<typeof mapAllJurisdictions>;
	let actionPlan: ActionPlan;
	let report: LaunchClearReport;

	beforeAll(() => {
		initRegistry();
		ctx = buildFoundationModelContext();
		mapResult = mapAllJurisdictions(ctx);

		actionPlan = generateActionPlanWithoutLLM(mapResult.results);

		const marketReadiness = buildMarketReadiness(mapResult.results);
		const aggregated = aggregateRequirements(mapResult.results);

		report = {
			id: "test-foundation-model",
			generatedAt: new Date().toISOString(),
			productContext: ctx,
			jurisdictionResults: mapResult.results,
			summary: {
				canLaunch: marketReadiness,
				highestRiskMarket: "eu-gdpr",
				lowestFrictionMarket: "china",
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
		expect(jurisdictions).toContain("eu-ai-act");
		expect(jurisdictions).toContain("eu-gdpr");
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

		it("has GPAI classification", () => {
			expect(euResult.gpaiClassification).toBeDefined();
			expect(euResult.gpaiClassification?.isGpai).toBe(true);
		});

		it("classifies GPAI role as provider", () => {
			expect(euResult.gpaiClassification?.role).toBe("provider");
		});

		it("identifies systemic risk (exceeds 10^25 FLOPs)", () => {
			expect(euResult.gpaiClassification?.hasSystemicRisk).toBe(true);
		});

		it("is NOT open-source", () => {
			expect(euResult.gpaiClassification?.isOpenSource).toBe(false);
		});

		it("has GPAI provisions (Article 51, 53, 55)", () => {
			const provisions = euResult.applicableLaws.flatMap((l) => l.provisions);
			const hasArt51 = provisions.some((p) => p.id === "eu-ai-act-art51");
			const hasArt53 = provisions.some((p) => p.id === "eu-ai-act-art53");
			const hasArt55 = provisions.some((p) => p.id === "eu-ai-act-art55");
			expect(hasArt51).toBe(true);
			expect(hasArt53).toBe(true);
			expect(hasArt55).toBe(true);
		});

		it("requires GPAI technical documentation artifact", () => {
			const gpaiTechDoc = euResult.requiredArtifacts.find(
				(a) => a.type === "gpai-technical-documentation",
			);
			expect(gpaiTechDoc).toBeDefined();
		});

		it("requires GPAI training data summary artifact", () => {
			const trainingSummary = euResult.requiredArtifacts.find(
				(a) => a.type === "gpai-training-data-summary",
			);
			expect(trainingSummary).toBeDefined();
		});

		it("requires GPAI systemic risk assessment artifact", () => {
			const systemic = euResult.requiredArtifacts.find(
				(a) => a.type === "gpai-systemic-risk-assessment",
			);
			expect(systemic).toBeDefined();
		});

		it("requires GPAI downstream documentation / model card", () => {
			const modelCard = euResult.requiredArtifacts.find(
				(a) => a.type === "model-card" && a.name.includes("GPAI"),
			);
			expect(modelCard).toBeDefined();
		});

		it("has copyright compliance action", () => {
			const allActions = [...euResult.requiredActions, ...euResult.recommendedActions];
			const copyrightAction = allActions.find((a) => a.id === "eu-ai-act-gpai-copyright");
			expect(copyrightAction).toBeDefined();
		});

		it("has training data summary action", () => {
			const allActions = [...euResult.requiredActions, ...euResult.recommendedActions];
			const summaryAction = allActions.find((a) => a.id === "eu-ai-act-gpai-training-summary");
			expect(summaryAction).toBeDefined();
		});

		it("has systemic risk-specific actions (model evaluation, risk assessment, incident reporting, cybersecurity)", () => {
			const allActions = [...euResult.requiredActions, ...euResult.recommendedActions];
			const modelEval = allActions.find((a) => a.id === "eu-ai-act-gpai-model-evaluation");
			const riskAssessment = allActions.find(
				(a) => a.id === "eu-ai-act-gpai-systemic-risk-assessment",
			);
			const incidentReporting = allActions.find(
				(a) => a.id === "eu-ai-act-gpai-incident-reporting",
			);
			const cybersecurity = allActions.find((a) => a.id === "eu-ai-act-gpai-cybersecurity");
			expect(modelEval).toBeDefined();
			expect(riskAssessment).toBeDefined();
			expect(incidentReporting).toBeDefined();
			expect(cybersecurity).toBeDefined();
		});

		it("has GPAI tech docs and downstream docs actions", () => {
			const allActions = [...euResult.requiredActions, ...euResult.recommendedActions];
			const techDocs = allActions.find((a) => a.id === "eu-ai-act-gpai-tech-docs");
			const downstreamDocs = allActions.find((a) => a.id === "eu-ai-act-gpai-downstream-docs");
			expect(techDocs).toBeDefined();
			expect(downstreamDocs).toBeDefined();
		});

		it("risk classification is minimal (no Annex III match, not chatbot/deepfake)", () => {
			// The base risk classification is minimal, but GPAI obligations still apply
			expect(euResult.riskClassification.level).toBe("minimal");
		});

		it("timeline mentions GPAI obligations in force since 2025-08-02", () => {
			const hasGpaiNote = euResult.complianceTimeline.notes.some(
				(n) => n.includes("GPAI") && n.includes("2025"),
			);
			expect(hasGpaiNote).toBe(true);
		});

		it("timeline mentions systemic risk obligations", () => {
			const hasSystemicNote = euResult.complianceTimeline.notes.some((n) =>
				n.includes("Systemic risk"),
			);
			expect(hasSystemicNote).toBe(true);
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

		it("classifies as high risk (DPIA required — training data contains personal data)", () => {
			expect(gdprResult.riskClassification.level).toBe("high");
		});

		it("triggers DPIA for personal data in training", () => {
			const dpiaTriggers = gdprResult.riskClassification.applicableCategories;
			const hasTrainingDataTrigger = dpiaTriggers.includes("dpia-training-data-personal");
			expect(hasTrainingDataTrigger).toBe(true);
		});

		it("requires DPIA artifact", () => {
			const dpia = gdprResult.requiredArtifacts.find((a) => a.type === "dpia");
			expect(dpia).toBeDefined();
			expect(dpia?.required).toBe(true);
		});

		it("has GenAI training data processing provisions", () => {
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			const hasGenAiTraining = provisions.some((p) => p.id === "gdpr-genai-training-data");
			expect(hasGenAiTraining).toBe(true);
		});

		it("has right of erasure provision for trained models", () => {
			const provisions = gdprResult.applicableLaws.flatMap((l) => l.provisions);
			const hasErasure = provisions.some((p) => p.id === "gdpr-genai-erasure");
			expect(hasErasure).toBe(true);
		});

		it("requires model card for AI training data processing record", () => {
			const modelCard = gdprResult.requiredArtifacts.find((a) => a.type === "model-card");
			expect(modelCard).toBeDefined();
		});

		it("has GenAI training legal basis action", () => {
			const allActions = [...gdprResult.requiredActions, ...gdprResult.recommendedActions];
			const trainingBasis = allActions.find((a) => a.id === "gdpr-genai-training-legal-basis");
			expect(trainingBasis).toBeDefined();
		});

		it("has GenAI erasure policy action", () => {
			const allActions = [...gdprResult.requiredActions, ...gdprResult.recommendedActions];
			const erasurePolicy = allActions.find((a) => a.id === "gdpr-genai-erasure-policy");
			expect(erasurePolicy).toBeDefined();
		});
	});

	// ─── China ────────────────────────────────────────────────────────────

	describe("China", () => {
		let cnResult: JurisdictionResult;

		beforeAll(() => {
			cnResult = mapResult.results.find((r) => r.jurisdiction === "china") as JurisdictionResult;
		});

		it("classifies as high risk (text generation triggers deep synthesis)", () => {
			// generatesContent=true AND outputModalities includes "text" triggers
			// cn-deep-synthesis-text, making isDeepSynthesisProduct true → high risk
			expect(cnResult.riskClassification.level).toBe("high");
		});

		it("has deep synthesis provisions", () => {
			const provisions = cnResult.applicableLaws.flatMap((l) => l.provisions);
			const hasDeepSynthesis = provisions.some(
				(p) => p.id === "cn-deep-synthesis-labeling" || p.id === "cn-deep-synthesis-provider",
			);
			expect(hasDeepSynthesis).toBe(true);
		});

		it("requires algorithm filing (deep synthesis triggers filing requirement)", () => {
			const allActions = [...cnResult.requiredActions, ...cnResult.recommendedActions];
			const algorithmFiling = allActions.find((a) => a.id === "cn-algorithm-filing");
			expect(algorithmFiling).toBeDefined();
		});

		it("requires deep synthesis content labeling action", () => {
			const allActions = [...cnResult.requiredActions, ...cnResult.recommendedActions];
			const labelingAction = allActions.find((a) => a.id === "cn-deep-synthesis-labeling");
			expect(labelingAction).toBeDefined();
		});

		it("does NOT have public-facing GenAI content review actions (B2B, not public-facing)", () => {
			const allActions = [...cnResult.requiredActions, ...cnResult.recommendedActions];
			const contentReview = allActions.find((a) => a.id === "cn-cac-content-review-mechanism");
			expect(contentReview).toBeUndefined();
		});

		it("has applicable laws with deep synthesis provisions", () => {
			expect(cnResult.applicableLaws.length).toBeGreaterThan(0);
			const provisions = cnResult.applicableLaws.flatMap((l) => l.provisions);
			expect(provisions.length).toBeGreaterThan(0);
		});
	});

	// ─── Action Plan ──────────────────────────────────────────────────────

	describe("Action Plan", () => {
		it("has critical actions", () => {
			expect(actionPlan.critical.length).toBeGreaterThan(0);
		});

		it("includes GPAI provider-specific actions in critical bucket", () => {
			const gpaiActions = actionPlan.critical.filter((a) => a.id.includes("gpai"));
			expect(gpaiActions.length).toBeGreaterThan(0);
		});

		it("includes systemic risk actions", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const systemicActions = allActions.filter(
				(a) =>
					a.id.includes("systemic") ||
					a.id.includes("model-evaluation") ||
					a.id.includes("incident-reporting") ||
					a.id.includes("cybersecurity"),
			);
			expect(systemicActions.length).toBeGreaterThan(0);
		});

		it("includes GDPR training data actions", () => {
			const allActions = [
				...actionPlan.critical,
				...actionPlan.important,
				...actionPlan.recommended,
			];
			const gdprTrainingActions = allActions.filter((a) => a.id.includes("gdpr-genai-training"));
			expect(gdprTrainingActions.length).toBeGreaterThan(0);
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
			expect(jurisdictions.size).toBeGreaterThanOrEqual(2);
		});
	});

	// ─── Output Generation ────────────────────────────────────────────────

	describe("Output Generation", () => {
		it("generates a valid markdown report", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("# LaunchClear Compliance Report");
			expect(markdown).toContain("eu-ai-act");
			expect(markdown).toContain("eu-gdpr");
			expect(markdown).toContain("china");
		});

		it("markdown report includes GPAI classification section", () => {
			const markdown = generateMarkdownReport(report);
			expect(markdown).toContain("GPAI Classification");
			expect(markdown).toContain("provider");
			expect(markdown).toContain("Systemic Risk");
		});

		it("generates valid JSON report", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			expect(parsed.id).toBe("test-foundation-model");
			expect(parsed.productContext.productType).toBe("foundation-model");
			expect(parsed.jurisdictionResults).toHaveLength(3);
		});

		it("JSON report preserves GPAI classification", () => {
			const json = generateJsonReport(report);
			const parsed = JSON.parse(json);
			const euResult = parsed.jurisdictionResults.find(
				(r: JurisdictionResult) => r.jurisdiction === "eu-ai-act",
			);
			expect(euResult.gpaiClassification).toBeDefined();
			expect(euResult.gpaiClassification.isGpai).toBe(true);
			expect(euResult.gpaiClassification.hasSystemicRisk).toBe(true);
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
		it("EU markets require action (GPAI + GDPR obligations)", () => {
			const euAiActMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "eu-ai-act");
			const euGdprMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "eu-gdpr");
			expect(euAiActMarket).toBeDefined();
			expect(euGdprMarket).toBeDefined();
			expect(["action-required", "blocked"]).toContain(euAiActMarket?.status);
			expect(["action-required", "blocked"]).toContain(euGdprMarket?.status);
		});

		it("China market requires action (deep synthesis obligations)", () => {
			const cnMarket = report.summary.canLaunch.find((m) => m.jurisdiction === "china");
			expect(cnMarket).toBeDefined();
			// Deep synthesis triggers critical actions (algorithm filing, labeling)
			expect(["action-required", "blocked"]).toContain(cnMarket?.status);
		});
	});
});
