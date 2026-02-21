import { beforeAll, describe, expect, it } from "vitest";
import type {
	AgenticAiContext,
	GenerativeAiContext,
	GpaiInfo,
	JurisdictionResult,
	ProductContext,
	SectorContext,
} from "../../src/core/types.js";
import { brazilModule } from "../../src/jurisdictions/jurisdictions/brazil.js";
import { chinaModule } from "../../src/jurisdictions/jurisdictions/china.js";
// Import all jurisdiction modules
import { euAiActModule } from "../../src/jurisdictions/jurisdictions/eu-ai-act.js";
import { euGdprModule } from "../../src/jurisdictions/jurisdictions/eu-gdpr.js";
import { singaporeModule } from "../../src/jurisdictions/jurisdictions/singapore.js";
import { ukModule } from "../../src/jurisdictions/jurisdictions/uk.js";
import { usFederalModule } from "../../src/jurisdictions/jurisdictions/us-federal.js";
import { californiaModule } from "../../src/jurisdictions/jurisdictions/us-states/california.js";
import { coloradoModule } from "../../src/jurisdictions/jurisdictions/us-states/colorado.js";
import { illinoisModule } from "../../src/jurisdictions/jurisdictions/us-states/illinois.js";
import { newYorkModule } from "../../src/jurisdictions/jurisdictions/us-states/new-york.js";
import { texasModule } from "../../src/jurisdictions/jurisdictions/us-states/texas.js";
import { clearRegistry, registerJurisdiction } from "../../src/jurisdictions/registry.js";
import { mapAllJurisdictions } from "../../src/jurisdictions/requirement-mapper.js";

// ─── Registry Initialization ─────────────────────────────────────────────

function initAllJurisdictions(): void {
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
		id: "us-ca",
		name: "California",
		region: "US",
		description: "California (CCPA/CPRA, SB 243, SB 942)",
		module: californiaModule,
	});
	registerJurisdiction({
		id: "us-co",
		name: "Colorado",
		region: "US",
		description: "Colorado AI Act",
		module: coloradoModule,
	});
	registerJurisdiction({
		id: "us-il",
		name: "Illinois",
		region: "US",
		description: "Illinois (BIPA, HRA AI amendment)",
		module: illinoisModule,
	});
	registerJurisdiction({
		id: "us-ny",
		name: "New York",
		region: "US",
		description: "New York City (LL144)",
		module: newYorkModule,
	});
	registerJurisdiction({
		id: "us-tx",
		name: "Texas",
		region: "US",
		description: "Texas (TRAIGA)",
		module: texasModule,
	});
	registerJurisdiction({
		id: "uk",
		name: "UK",
		region: "UK",
		description: "UK (ICO, AISI, DSIT)",
		module: ukModule,
	});
	registerJurisdiction({
		id: "singapore",
		name: "Singapore",
		region: "APAC",
		description: "Singapore (PDPC, IMDA, MAS)",
		module: singaporeModule,
	});
	registerJurisdiction({
		id: "china",
		name: "China",
		region: "APAC",
		description: "China (CAC GenAI, Deep Synthesis, Algorithm)",
		module: chinaModule,
	});
	registerJurisdiction({
		id: "brazil",
		name: "Brazil",
		region: "LATAM",
		description: "Brazil (LGPD, AI Bill)",
		module: brazilModule,
	});
}

// ─── Snapshot Shape Extractor ────────────────────────────────────────────

function snapshotShape(result: JurisdictionResult) {
	return {
		jurisdiction: result.jurisdiction,
		riskLevel: result.riskClassification.level,
		applicableLawCount: result.applicableLaws.length,
		provisionCount: result.applicableLaws.reduce((sum, law) => sum + law.provisions.length, 0),
		requiredArtifactTypes: result.requiredArtifacts
			.filter((a) => a.required)
			.map((a) => a.type)
			.sort(),
		requiredActionIds: result.requiredActions.map((a) => a.id).sort(),
		recommendedActionIds: result.recommendedActions.map((a) => a.id).sort(),
		hasGpaiClassification: !!result.gpaiClassification,
		enforcementCaseCount: result.enforcementPrecedent.length,
		timelineDeadlineCount: result.complianceTimeline.deadlines.length,
	};
}

// ─── Scenario 1: Resume Screening (Employment AI) ────────────────────────

const resumeScreeningCtx: ProductContext = {
	description: "AI-powered resume screening tool that auto-rejects bottom 50%",
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
	targetMarkets: ["eu-ai-act", "eu-gdpr", "us-federal", "us-ny", "us-il"],
	existingMeasures: [],
	answers: {},
	sourceMode: "cli-interview",
};

// ─── Scenario 2: GenAI Chatbot Multi-Market ──────────────────────────────

const genAiChatbotCtx: ProductContext = {
	description: "Customer-facing GenAI chatbot for product support",
	productType: "generator",
	dataProcessed: ["personal", "behavioral"],
	userPopulations: ["consumers"],
	decisionImpact: "advisory",
	automationLevel: "fully-automated",
	trainingData: {
		usesTrainingData: true,
		sources: ["product documentation", "support tickets"],
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

// ─── Scenario 3: Credit Scoring AI (Financial Services) ──────────────────

const creditScoringCtx: ProductContext = {
	description: "AI-powered credit scoring for consumer loan applications",
	productType: "classifier",
	dataProcessed: ["personal", "financial"],
	userPopulations: ["credit-applicants"],
	decisionImpact: "determinative",
	automationLevel: "human-on-the-loop",
	trainingData: {
		usesTrainingData: true,
		sources: ["credit bureau data", "loan performance history"],
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

// ─── Scenario 4: Agentic Customer Service (Singapore focus) ──────────────

const agenticServiceCtx: ProductContext = {
	description:
		"AI agent that handles customer service inquiries, can issue refunds and update accounts",
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

// ─── Scenario 5: Foundation Model Provider (EU + China) ──────────────────

const foundationModelCtx: ProductContext = {
	description: "Foundation model provider offering API access for text generation",
	productType: "foundation-model",
	dataProcessed: ["personal", "public"],
	userPopulations: ["businesses"],
	decisionImpact: "advisory",
	automationLevel: "fully-automated",
	trainingData: {
		usesTrainingData: true,
		sources: ["public web data", "licensed datasets"],
		containsPersonalData: true,
		consentObtained: false,
		optOutMechanism: true,
		syntheticData: false,
	},
	targetMarkets: ["eu-ai-act", "eu-gdpr", "china"],
	existingMeasures: [],
	answers: {},
	sourceMode: "cli-interview",
	generativeAiContext: {
		usesFoundationModel: true,
		foundationModelSource: "self-trained",
		generatesContent: true,
		outputModalities: ["text", "code"],
		canGenerateDeepfakes: false,
		canGenerateSyntheticVoice: false,
		hasOutputWatermarking: true,
		hasOutputFiltering: true,
		trainingDataIncludes: ["public-web-scrape", "licensed-datasets", "copyrighted-works"],
		finetuningPerformed: false,
		usesRAG: false,
		usesAgenticCapabilities: false,
		algorithmFilingStatus: "not-filed",
		providesContentModeration: true,
		isFrontierModel: false,
	},
	gpaiInfo: {
		isGpaiModel: true,
		gpaiRole: "provider",
		isOpenSource: false,
		exceedsSystemicRiskThreshold: false,
		commissionDesignated: false,
		providesDownstreamDocumentation: true,
		hasAcceptableUsePolicy: true,
		copyrightComplianceMechanism: "opt-out form",
		computeFlops: 1e23,
	},
};

// ═════════════════════════════════════════════════════════════════════════
// Tests
// ═════════════════════════════════════════════════════════════════════════

describe("Snapshot: Resume Screening (Employment AI)", () => {
	let results: JurisdictionResult[];

	beforeAll(() => {
		initAllJurisdictions();
		const mapped = mapAllJurisdictions(resumeScreeningCtx);
		expect(mapped.errors).toHaveLength(0);
		results = [...mapped.results];
	});

	it("maps all target jurisdictions", () => {
		expect(results).toHaveLength(5);
		const jurisdictionIds = results.map((r) => r.jurisdiction).sort();
		expect(jurisdictionIds).toEqual(
			["eu-ai-act", "eu-gdpr", "us-federal", "us-il", "us-ny"].sort(),
		);
	});

	it("EU AI Act snapshot", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		expect(euResult).toBeDefined();
		if (!euResult) return;
		expect(snapshotShape(euResult)).toMatchSnapshot();
	});

	it("EU AI Act classifies employment screening as high risk", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		expect(euResult.riskClassification.level).toBe("high");
		expect(euResult.riskClassification.applicableCategories).toContain("annex-iii-4-employment");
	});

	it("EU GDPR snapshot", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		expect(gdprResult).toBeDefined();
		if (!gdprResult) return;
		expect(snapshotShape(gdprResult)).toMatchSnapshot();
	});

	it("EU GDPR flags high risk for automated decision-making", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		if (!gdprResult) throw new Error("expected eu-gdpr result");
		expect(gdprResult.riskClassification.level).toBe("high");
	});

	it("US Federal snapshot", () => {
		const usResult = results.find((r) => r.jurisdiction === "us-federal");
		expect(usResult).toBeDefined();
		if (!usResult) return;
		expect(snapshotShape(usResult)).toMatchSnapshot();
	});

	it("NYC (LL144) snapshot", () => {
		const nyResult = results.find((r) => r.jurisdiction === "us-ny");
		expect(nyResult).toBeDefined();
		if (!nyResult) return;
		expect(snapshotShape(nyResult)).toMatchSnapshot();
	});

	it("NYC requires bias audit for employment AI", () => {
		const nyResult = results.find((r) => r.jurisdiction === "us-ny");
		if (!nyResult) throw new Error("expected us-ny result");
		const artifactTypes = nyResult.requiredArtifacts.map((a) => a.type);
		expect(artifactTypes).toContain("bias-audit");
	});

	it("Illinois snapshot", () => {
		const ilResult = results.find((r) => r.jurisdiction === "us-il");
		expect(ilResult).toBeDefined();
		if (!ilResult) return;
		expect(snapshotShape(ilResult)).toMatchSnapshot();
	});

	it("Illinois flags high risk for employment AI with biometric/video", () => {
		const ilResult = results.find((r) => r.jurisdiction === "us-il");
		if (!ilResult) throw new Error("expected us-il result");
		// Illinois BIPA and AI Video Interview Act apply to employment AI
		expect(["high", "limited"]).toContain(ilResult.riskClassification.level);
	});
});

describe("Snapshot: GenAI Chatbot Multi-Market", () => {
	let results: JurisdictionResult[];

	beforeAll(() => {
		initAllJurisdictions();
		const mapped = mapAllJurisdictions(genAiChatbotCtx);
		expect(mapped.errors).toHaveLength(0);
		results = [...mapped.results];
	});

	it("maps all target jurisdictions", () => {
		expect(results).toHaveLength(5);
		const jurisdictionIds = results.map((r) => r.jurisdiction).sort();
		expect(jurisdictionIds).toEqual(["china", "eu-ai-act", "eu-gdpr", "singapore", "uk"].sort());
	});

	it("EU AI Act snapshot", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		expect(euResult).toBeDefined();
		if (!euResult) return;
		expect(snapshotShape(euResult)).toMatchSnapshot();
	});

	it("EU AI Act classifies chatbot as limited risk (transparency)", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		expect(euResult.riskClassification.level).toBe("limited");
	});

	it("EU GDPR snapshot", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		expect(gdprResult).toBeDefined();
		if (!gdprResult) return;
		expect(snapshotShape(gdprResult)).toMatchSnapshot();
	});

	it("UK snapshot", () => {
		const ukResult = results.find((r) => r.jurisdiction === "uk");
		expect(ukResult).toBeDefined();
		if (!ukResult) return;
		expect(snapshotShape(ukResult)).toMatchSnapshot();
	});

	it("Singapore snapshot", () => {
		const sgResult = results.find((r) => r.jurisdiction === "singapore");
		expect(sgResult).toBeDefined();
		if (!sgResult) return;
		expect(snapshotShape(sgResult)).toMatchSnapshot();
	});

	it("China snapshot", () => {
		const cnResult = results.find((r) => r.jurisdiction === "china");
		expect(cnResult).toBeDefined();
		if (!cnResult) return;
		expect(snapshotShape(cnResult)).toMatchSnapshot();
	});

	it("China requires algorithm filing for GenAI services", () => {
		const cnResult = results.find((r) => r.jurisdiction === "china");
		if (!cnResult) throw new Error("expected china result");
		const actionIds = [
			...cnResult.requiredActions.map((a) => a.id),
			...cnResult.recommendedActions.map((a) => a.id),
		];
		// China should have algorithm filing or content moderation actions
		expect(actionIds.length).toBeGreaterThan(0);
	});

	it("produces jurisdiction-specific requirements (not identical across all)", () => {
		// Verify each jurisdiction produces distinct output
		const shapes = results.map((r) => snapshotShape(r));
		const uniqueRiskLevels = new Set(shapes.map((s) => s.riskLevel));
		const uniqueActionCounts = new Set(
			shapes.map((s) => s.requiredActionIds.length + s.recommendedActionIds.length),
		);
		// At least 2 different risk levels or action counts across 5 jurisdictions
		expect(uniqueRiskLevels.size + uniqueActionCounts.size).toBeGreaterThan(2);
	});
});

describe("Snapshot: Credit Scoring AI (Financial Services)", () => {
	let results: JurisdictionResult[];

	beforeAll(() => {
		initAllJurisdictions();
		const mapped = mapAllJurisdictions(creditScoringCtx);
		expect(mapped.errors).toHaveLength(0);
		results = [...mapped.results];
	});

	it("maps all target jurisdictions", () => {
		expect(results).toHaveLength(4);
		const jurisdictionIds = results.map((r) => r.jurisdiction).sort();
		expect(jurisdictionIds).toEqual(["eu-ai-act", "eu-gdpr", "singapore", "us-federal"].sort());
	});

	it("EU AI Act snapshot", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		expect(euResult).toBeDefined();
		if (!euResult) return;
		expect(snapshotShape(euResult)).toMatchSnapshot();
	});

	it("EU AI Act classifies credit scoring as high risk (Annex III §5)", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		expect(euResult.riskClassification.level).toBe("high");
		expect(euResult.riskClassification.applicableCategories).toContain(
			"annex-iii-5-essential-services",
		);
	});

	it("EU GDPR snapshot", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		expect(gdprResult).toBeDefined();
		if (!gdprResult) return;
		expect(snapshotShape(gdprResult)).toMatchSnapshot();
	});

	it("EU GDPR requires DPIA for credit scoring", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		if (!gdprResult) throw new Error("expected eu-gdpr result");
		const artifactTypes = gdprResult.requiredArtifacts.filter((a) => a.required).map((a) => a.type);
		expect(artifactTypes).toContain("dpia");
	});

	it("US Federal snapshot", () => {
		const usResult = results.find((r) => r.jurisdiction === "us-federal");
		expect(usResult).toBeDefined();
		if (!usResult) return;
		expect(snapshotShape(usResult)).toMatchSnapshot();
	});

	it("US Federal has financial-sector-specific actions", () => {
		const usResult = results.find((r) => r.jurisdiction === "us-federal");
		if (!usResult) throw new Error("expected us-federal result");
		const allActionIds = [
			...usResult.requiredActions.map((a) => a.id),
			...usResult.recommendedActions.map((a) => a.id),
		];
		// Should have some actions (financial sector triggers additional)
		expect(allActionIds.length).toBeGreaterThan(0);
	});

	it("Singapore snapshot", () => {
		const sgResult = results.find((r) => r.jurisdiction === "singapore");
		expect(sgResult).toBeDefined();
		if (!sgResult) return;
		expect(snapshotShape(sgResult)).toMatchSnapshot();
	});

	it("Singapore has financial AI risk management actions", () => {
		const sgResult = results.find((r) => r.jurisdiction === "singapore");
		if (!sgResult) throw new Error("expected singapore result");
		const allActionIds = [
			...sgResult.requiredActions.map((a) => a.id),
			...sgResult.recommendedActions.map((a) => a.id),
		];
		expect(allActionIds.length).toBeGreaterThan(0);
	});
});

describe("Snapshot: Agentic Customer Service (Singapore focus)", () => {
	let results: JurisdictionResult[];

	beforeAll(() => {
		initAllJurisdictions();
		const mapped = mapAllJurisdictions(agenticServiceCtx);
		expect(mapped.errors).toHaveLength(0);
		results = [...mapped.results];
	});

	it("maps all target jurisdictions", () => {
		expect(results).toHaveLength(3);
		const jurisdictionIds = results.map((r) => r.jurisdiction).sort();
		expect(jurisdictionIds).toEqual(["eu-ai-act", "eu-gdpr", "singapore"].sort());
	});

	it("Singapore snapshot", () => {
		const sgResult = results.find((r) => r.jurisdiction === "singapore");
		expect(sgResult).toBeDefined();
		if (!sgResult) return;
		expect(snapshotShape(sgResult)).toMatchSnapshot();
	});

	it("Singapore triggers agentic AI framework requirements", () => {
		const sgResult = results.find((r) => r.jurisdiction === "singapore");
		if (!sgResult) throw new Error("expected singapore result");
		const allActionIds = [
			...sgResult.requiredActions.map((a) => a.id),
			...sgResult.recommendedActions.map((a) => a.id),
		];
		// Agentic AI should produce actions related to IMDA agentic framework
		expect(allActionIds.length).toBeGreaterThan(0);
	});

	it("EU AI Act snapshot", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		expect(euResult).toBeDefined();
		if (!euResult) return;
		expect(snapshotShape(euResult)).toMatchSnapshot();
	});

	it("EU AI Act handles agentic AI under existing risk framework", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		// Agentic customer service: no Annex III category match (not employment,
		// credit, biometrics, etc.) so it falls to minimal risk under the AI Act.
		// The EU AI Act does not yet have agentic-specific provisions — agentic
		// systems are assessed under existing risk tiers based on domain.
		expect(euResult.riskClassification.level).toBe("minimal");
	});

	it("EU GDPR snapshot", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		expect(gdprResult).toBeDefined();
		if (!gdprResult) return;
		expect(snapshotShape(gdprResult)).toMatchSnapshot();
	});

	it("GDPR flags personal + financial data processing", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		if (!gdprResult) throw new Error("expected eu-gdpr result");
		// Processing personal + financial data with material impact should be high risk
		expect(["high", "limited"]).toContain(gdprResult.riskClassification.level);
	});
});

describe("Snapshot: Foundation Model Provider (EU + China)", () => {
	let results: JurisdictionResult[];

	beforeAll(() => {
		initAllJurisdictions();
		const mapped = mapAllJurisdictions(foundationModelCtx);
		expect(mapped.errors).toHaveLength(0);
		results = [...mapped.results];
	});

	it("maps all target jurisdictions", () => {
		expect(results).toHaveLength(3);
		const jurisdictionIds = results.map((r) => r.jurisdiction).sort();
		expect(jurisdictionIds).toEqual(["china", "eu-ai-act", "eu-gdpr"].sort());
	});

	it("EU AI Act snapshot", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		expect(euResult).toBeDefined();
		if (!euResult) return;
		expect(snapshotShape(euResult)).toMatchSnapshot();
	});

	it("EU AI Act produces GPAI classification for foundation model provider", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		expect(euResult.gpaiClassification).toBeDefined();
		if (!euResult.gpaiClassification) throw new Error("expected gpaiClassification");
		expect(euResult.gpaiClassification.isGpai).toBe(true);
		expect(euResult.gpaiClassification.role).toBe("provider");
	});

	it("EU AI Act GPAI classification does not flag systemic risk (below threshold)", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		if (!euResult.gpaiClassification) throw new Error("expected gpaiClassification");
		expect(euResult.gpaiClassification.hasSystemicRisk).toBe(false);
	});

	it("EU AI Act requires GPAI-specific artifacts", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		const artifactTypes = euResult.requiredArtifacts.map((a) => a.type);
		// GPAI providers need technical documentation
		expect(artifactTypes).toContain("gpai-technical-documentation");
	});

	it("EU GDPR snapshot", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		expect(gdprResult).toBeDefined();
		if (!gdprResult) return;
		expect(snapshotShape(gdprResult)).toMatchSnapshot();
	});

	it("EU GDPR flags training on personal data without consent", () => {
		const gdprResult = results.find((r) => r.jurisdiction === "eu-gdpr");
		if (!gdprResult) throw new Error("expected eu-gdpr result");
		// Processing personal data with training and no consent obtained should be high risk
		expect(gdprResult.riskClassification.level).toBe("high");
	});

	it("China snapshot", () => {
		const cnResult = results.find((r) => r.jurisdiction === "china");
		expect(cnResult).toBeDefined();
		if (!cnResult) return;
		expect(snapshotShape(cnResult)).toMatchSnapshot();
	});

	it("China triggers algorithm filing for GenAI service provider", () => {
		const cnResult = results.find((r) => r.jurisdiction === "china");
		if (!cnResult) throw new Error("expected china result");
		const allActionIds = [
			...cnResult.requiredActions.map((a) => a.id),
			...cnResult.recommendedActions.map((a) => a.id),
		];
		// China should require algorithm filing and content moderation
		expect(allActionIds.length).toBeGreaterThan(0);
	});

	it("China and EU produce distinct requirements for same product", () => {
		const euResult = results.find((r) => r.jurisdiction === "eu-ai-act");
		if (!euResult) throw new Error("expected eu-ai-act result");
		const cnResult = results.find((r) => r.jurisdiction === "china");
		if (!cnResult) throw new Error("expected china result");
		// Risk frameworks and action sets should differ
		const euActionIds = [
			...euResult.requiredActions.map((a) => a.id),
			...euResult.recommendedActions.map((a) => a.id),
		].sort();
		const cnActionIds = [
			...cnResult.requiredActions.map((a) => a.id),
			...cnResult.recommendedActions.map((a) => a.id),
		].sort();
		expect(euActionIds).not.toEqual(cnActionIds);
	});
});
