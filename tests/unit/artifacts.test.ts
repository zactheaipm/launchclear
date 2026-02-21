import { describe, expect, it, vi } from "vitest";
import {
	extractCitations,
	extractPlaceholders,
	extractSections,
	fillTemplate,
	validateFilledTemplate,
} from "../../src/artifacts/filler.js";
import {
	generateArtifacts,
	listAvailableTemplates,
	loadTemplate,
	parseFrontmatter,
} from "../../src/artifacts/generator.js";
import type {
	ArtifactRequirement,
	GeneratedArtifact,
	JurisdictionResult,
	LLMProvider,
	LLMRequest,
	ProductContext,
} from "../../src/core/types.js";

// ─── Test Helpers ────────────────────────────────────────────────────────────

function makeContext(overrides: Partial<ProductContext> = {}): ProductContext {
	return {
		description: overrides.description ?? "An AI-powered resume screening tool",
		productType: overrides.productType ?? "classifier",
		dataProcessed: overrides.dataProcessed ?? ["personal", "employment"],
		userPopulations: overrides.userPopulations ?? ["job-applicants", "employees"],
		decisionImpact: overrides.decisionImpact ?? "material",
		automationLevel: overrides.automationLevel ?? "human-in-the-loop",
		trainingData: overrides.trainingData ?? {
			usesTrainingData: true,
			sources: ["historical hiring data"],
			containsPersonalData: true,
			consentObtained: true,
			optOutMechanism: false,
			syntheticData: false,
		},
		targetMarkets: overrides.targetMarkets ?? ["eu-ai-act", "eu-gdpr"],
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

function makeMockProvider(responseContent: string): LLMProvider {
	return {
		id: "mock",
		name: "Mock Provider",
		complete: vi.fn().mockResolvedValue({
			ok: true,
			value: {
				content: responseContent,
				usage: { inputTokens: 100, outputTokens: 200 },
			},
		}),
	};
}

function makeFailingProvider(errorMessage: string): LLMProvider {
	return {
		id: "mock-fail",
		name: "Mock Failing Provider",
		complete: vi.fn().mockResolvedValue({
			ok: false,
			error: new Error(errorMessage),
		}),
	};
}

function makeJurisdictionResult(overrides: Partial<JurisdictionResult> = {}): JurisdictionResult {
	return {
		jurisdiction: overrides.jurisdiction ?? "eu-gdpr",
		applicableLaws: overrides.applicableLaws ?? [],
		riskClassification: overrides.riskClassification ?? {
			level: "high",
			justification: "Test",
			applicableCategories: [],
			provisions: [],
		},
		requiredArtifacts: overrides.requiredArtifacts ?? [
			{
				type: "dpia",
				name: "GDPR DPIA",
				required: true,
				legalBasis: "Articles 35-36",
				description: "Data Protection Impact Assessment",
				templateId: "dpia-gdpr",
			},
		],
		requiredActions: overrides.requiredActions ?? [],
		recommendedActions: overrides.recommendedActions ?? [],
		complianceTimeline: overrides.complianceTimeline ?? {
			effectiveDate: null,
			deadlines: [],
			notes: [],
		},
		enforcementPrecedent: overrides.enforcementPrecedent ?? [],
	};
}

// ─── Template Frontmatter Parsing ────────────────────────────────────────────

describe("parseFrontmatter", () => {
	it("parses valid frontmatter correctly", () => {
		const raw = `---
id: test-template
name: Test Template
jurisdiction: eu-gdpr
legalBasis: "Articles 35-36, GDPR"
requiredSections:
  - section-one
  - section-two
---

# Test Template

{{placeholder_one}}

## 1. Section One

{{section_content}}`;

		const result = parseFrontmatter(raw);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("test-template");
		expect(result.value.metadata.name).toBe("Test Template");
		expect(result.value.metadata.jurisdiction).toBe("eu-gdpr");
		expect(result.value.metadata.requiredSections).toEqual(["section-one", "section-two"]);
		expect(result.value.content).toContain("# Test Template");
		expect(result.value.content).toContain("{{placeholder_one}}");
	});

	it("returns error for content without frontmatter", () => {
		const raw = "# No Frontmatter Here\n\nJust plain content.";
		const result = parseFrontmatter(raw);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.message).toContain("frontmatter");
	});

	it("returns error for missing required fields", () => {
		const raw = `---
id: partial
---

# Partial Template`;

		const result = parseFrontmatter(raw);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.message).toContain("missing required fields");
	});
});

// ─── Template Loading ────────────────────────────────────────────────────────

describe("loadTemplate", () => {
	it("loads the DPIA GDPR template", async () => {
		const result = await loadTemplate("dpia-gdpr");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("dpia-gdpr");
		expect(result.value.metadata.jurisdiction).toBe("eu-gdpr");
		expect(result.value.content).toContain("Data Protection Impact Assessment");
		expect(result.value.content).toContain("{{system_overview}}");
	});

	it("loads the AI Act risk assessment template", async () => {
		const result = await loadTemplate("ai-act-risk-assessment");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("ai-act-risk-assessment");
		expect(result.value.content).toContain("Risk Classification");
		expect(result.value.content).toContain("Annex III");
	});

	it("loads the transparency notice template", async () => {
		const result = await loadTemplate("transparency-notice");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("transparency-notice");
		expect(result.value.content).toContain("AI System Disclosure");
	});

	it("loads the model card template", async () => {
		const result = await loadTemplate("model-card");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("model-card");
		expect(result.value.content).toContain("Model Overview");
		expect(result.value.content).toContain("Downstream Providers");
	});

	it("loads the GPAI technical documentation template", async () => {
		const result = await loadTemplate("gpai-technical-doc");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("gpai-technical-doc");
		expect(result.value.content).toContain("Article 53");
		expect(result.value.content).toContain("Copyright Compliance");
		expect(result.value.content).toContain("Systemic Risk");
	});

	it("loads the GenAI content policy template", async () => {
		const result = await loadTemplate("genai-content-policy");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.metadata.id).toBe("genai-content-policy");
		expect(result.value.content).toContain("Watermarking");
		expect(result.value.content).toContain("if_jurisdiction");
	});

	it("returns error for non-existent template", async () => {
		const result = await loadTemplate("non-existent-template");
		expect(result.ok).toBe(false);
	});
});

describe("listAvailableTemplates", () => {
	it("lists all available templates", async () => {
		const result = await listAvailableTemplates();
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value).toContain("dpia-gdpr");
		expect(result.value).toContain("ai-act-risk-assessment");
		expect(result.value).toContain("transparency-notice");
		expect(result.value).toContain("model-card");
		expect(result.value).toContain("gpai-technical-doc");
		expect(result.value).toContain("genai-content-policy");
		expect(result.value.length).toBeGreaterThanOrEqual(6);
	});
});

// ─── Placeholder Extraction ──────────────────────────────────────────────────

describe("extractPlaceholders", () => {
	it("extracts all unique placeholders from template content", () => {
		const content = `
# Title

{{system_overview}}

## Section

{{risk_table}}

Some text with {{system_overview}} again.

{{legal_basis}}
`;
		const placeholders = extractPlaceholders(content);
		expect(placeholders).toContain("system_overview");
		expect(placeholders).toContain("risk_table");
		expect(placeholders).toContain("legal_basis");
		// Should deduplicate
		expect(placeholders.filter((p) => p === "system_overview").length).toBe(1);
	});

	it("returns empty array for content without placeholders", () => {
		const content = "# Just a heading\n\nNo placeholders here.";
		const placeholders = extractPlaceholders(content);
		expect(placeholders).toEqual([]);
	});
});

// ─── Section Extraction ──────────────────────────────────────────────────────

describe("extractSections", () => {
	it("extracts numbered sections from filled content", () => {
		const content = `# Title

## 1. Description of Processing Operations

Some content about processing.

### 1.1 Overview

Details here.

## 2. Assessment of Necessity and Proportionality

Content about necessity.

## 3. Assessment of Risks

Risk content.
`;
		const sections = extractSections(content);
		expect(sections.length).toBe(3);
		expect(sections[0].title).toBe("Description of Processing Operations");
		expect(sections[1].title).toBe("Assessment of Necessity and Proportionality");
		expect(sections[2].title).toBe("Assessment of Risks");
		expect(sections[0].content).toContain("Some content about processing");
		expect(sections[0].required).toBe(true);
	});

	it("handles content with no sections", () => {
		const content = "Just plain text without any sections.";
		const sections = extractSections(content);
		expect(sections.length).toBe(0);
	});
});

// ─── Citation Extraction ─────────────────────────────────────────────────────

describe("extractCitations", () => {
	it("extracts GDPR article citations", () => {
		const content = `
Per GDPR Article 35, a DPIA is required.
Articles 13-14 of the GDPR require transparency.
Article 22 GDPR governs automated decisions.
`;
		const citations = extractCitations(content);
		expect(citations.length).toBeGreaterThanOrEqual(3);
		expect(citations.some((c) => c.article === "Article 35")).toBe(true);
		expect(citations.some((c) => c.article === "Articles 13-14")).toBe(true);
		expect(citations.some((c) => c.law.includes("GDPR"))).toBe(true);
	});

	it("extracts EU AI Act article citations", () => {
		const content = `
Under the AI Act, Article 6 defines high-risk classification.
Annex III lists high-risk categories.
Article 53(1)(a) requires GPAI technical documentation.
`;
		const citations = extractCitations(content);
		expect(citations.some((c) => c.article === "Article 6")).toBe(true);
		expect(citations.some((c) => c.article === "Article 53(1)(a)")).toBe(true);
	});

	it("deduplicates identical citations", () => {
		const content = `
Per GDPR, Article 35 requires a DPIA.
As stated in GDPR Article 35, the assessment must be conducted.
`;
		const citations = extractCitations(content);
		const article35Citations = citations.filter((c) => c.article === "Article 35");
		expect(article35Citations.length).toBe(1);
	});
});

// ─── Validation ──────────────────────────────────────────────────────────────

describe("validateFilledTemplate", () => {
	it("reports valid when all placeholders are filled and sections present", () => {
		const content = `
## 1. Processing Description

Content here.

## 2. Risk Assessment

Risk content.
`;
		const result = validateFilledTemplate(content, ["processing-description", "risk-assessment"]);
		expect(result.valid).toBe(true);
		expect(result.unfilledPlaceholders).toEqual([]);
		expect(result.missingSections).toEqual([]);
	});

	it("reports unfilled placeholders", () => {
		const content = `
## 1. Processing Description

{{still_a_placeholder}}

## 2. Risk Assessment

Filled content.
`;
		const result = validateFilledTemplate(content, []);
		expect(result.valid).toBe(false);
		expect(result.unfilledPlaceholders).toContain("still_a_placeholder");
	});

	it("reports missing required sections", () => {
		const content = `
## 1. Processing Description

Content here.
`;
		const result = validateFilledTemplate(content, [
			"processing-description",
			"compliance-demonstration",
		]);
		expect(result.missingSections).toContain("compliance-demonstration");
	});
});

// ─── Template Filling (with mock LLM) ───────────────────────────────────────

describe("fillTemplate", () => {
	it("calls LLM provider and returns filled result", async () => {
		const mockResponse = `# Data Protection Impact Assessment (DPIA)

## 1. Description of Processing Operations

The AI-powered resume screening tool processes personal data and employment data of job applicants.

## 2. Assessment of Necessity and Proportionality

Processing is necessary for the legitimate purpose of evaluating job applications. Per GDPR Article 6(1)(f).

## 3. Assessment of Risks to Rights and Freedoms

Key risks include potential discrimination in automated screening under Article 22 GDPR.

## 4. Measures to Address Risks

Human-in-the-loop review is implemented for all screening decisions.
`;

		const provider = makeMockProvider(mockResponse);
		const template = await loadTemplate("dpia-gdpr");
		if (!template.ok) throw new Error("Failed to load template");

		const result = await fillTemplate({
			template: template.value,
			ctx: makeContext(),
			jurisdictions: ["eu-gdpr"],
			provider,
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.filledContent).toContain("resume screening");
		expect(result.value.sections.length).toBeGreaterThanOrEqual(3);
		expect(result.value.reviewNotes.length).toBeGreaterThan(0);
		expect(result.value.citations.length).toBeGreaterThan(0);

		// Verify LLM was called
		expect(provider.complete).toHaveBeenCalledTimes(1);
		const call = vi.mocked(provider.complete).mock.calls[0][0];
		expect(call.systemPrompt).toContain("regulatory compliance");
		expect(call.messages[0].content).toContain("resume screening");
	});

	it("returns error when LLM fails", async () => {
		const provider = makeFailingProvider("API rate limit exceeded");
		const template = await loadTemplate("dpia-gdpr");
		if (!template.ok) throw new Error("Failed to load template");

		const result = await fillTemplate({
			template: template.value,
			ctx: makeContext(),
			jurisdictions: ["eu-gdpr"],
			provider,
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.message).toContain("rate limit");
	});

	it("adds context-specific review notes for fully automated systems", async () => {
		const provider = makeMockProvider("## 1. Assessment\n\nContent.");
		const template = await loadTemplate("dpia-gdpr");
		if (!template.ok) throw new Error("Failed to load template");

		const ctx = makeContext({ automationLevel: "fully-automated" });
		const result = await fillTemplate({
			template: template.value,
			ctx,
			jurisdictions: ["eu-gdpr"],
			provider,
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.reviewNotes.some((n) => n.includes("Article 22"))).toBe(true);
	});

	it("adds context-specific review notes for biometric data", async () => {
		const provider = makeMockProvider("## 1. Assessment\n\nContent.");
		const template = await loadTemplate("dpia-gdpr");
		if (!template.ok) throw new Error("Failed to load template");

		const ctx = makeContext({ dataProcessed: ["personal", "biometric"] });
		const result = await fillTemplate({
			template: template.value,
			ctx,
			jurisdictions: ["eu-gdpr"],
			provider,
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.reviewNotes.some((n) => n.includes("Biometric"))).toBe(true);
	});
});

// ─── Artifact Generation Orchestrator ────────────────────────────────────────

describe("generateArtifacts", () => {
	it("generates artifacts for jurisdiction results", async () => {
		const mockResponse = `## 1. Description of Processing

Resume screening tool processing employment data.

## 2. Necessity Assessment

Processing is necessary under GDPR Article 6(1)(f).

## 3. Risk Assessment

Potential risks to job applicants' rights.

## 4. Measures

Human review of all automated decisions.
`;

		const provider = makeMockProvider(mockResponse);
		const ctx = makeContext();
		const jurisdictionResults = [
			makeJurisdictionResult({
				requiredArtifacts: [
					{
						type: "dpia",
						name: "GDPR DPIA",
						required: true,
						legalBasis: "Articles 35-36",
						description: "Data Protection Impact Assessment",
						templateId: "dpia-gdpr",
					},
				],
			}),
		];

		const result = await generateArtifacts({
			ctx,
			jurisdictionResults,
			provider,
		});

		expect(result.artifacts.length).toBe(1);
		expect(result.errors.length).toBe(0);
		expect(result.artifacts[0].type).toBe("dpia");
		expect(result.artifacts[0].filename).toContain("dpia-gdpr");
		expect(result.artifacts[0].content).toContain("Resume screening");
		expect(result.artifacts[0].sections.length).toBeGreaterThan(0);
		expect(result.artifacts[0].reviewNotes.length).toBeGreaterThan(0);
	});

	it("deduplicates artifacts required by multiple jurisdictions", async () => {
		const mockResponse = `## 1. AI System Disclosure

This system uses AI.

## 2. What This AI System Does

Resume screening tool.

## 3. Data Processing

Processes personal data.

## 4. Decision Making

AI assists in screening decisions.

## 5. Your Rights

Right to human review.
`;

		const provider = makeMockProvider(mockResponse);
		const ctx = makeContext();

		// Both EU AI Act and GDPR require a transparency notice
		const jurisdictionResults = [
			makeJurisdictionResult({
				jurisdiction: "eu-ai-act",
				requiredArtifacts: [
					{
						type: "transparency-notice",
						name: "AI Act Transparency Notice",
						required: true,
						legalBasis: "Articles 50-52",
						description: "Transparency notice",
						templateId: "transparency-notice",
					},
				],
			}),
			makeJurisdictionResult({
				jurisdiction: "eu-gdpr",
				requiredArtifacts: [
					{
						type: "transparency-notice",
						name: "GDPR Privacy Notice",
						required: true,
						legalBasis: "Articles 13-14",
						description: "Privacy notice",
						templateId: "transparency-notice",
					},
				],
			}),
		];

		const result = await generateArtifacts({
			ctx,
			jurisdictionResults,
			provider,
		});

		// Should produce only 1 artifact (deduplicated), not 2
		expect(result.artifacts.length).toBe(1);
		expect(result.artifacts[0].jurisdiction).toContain("eu-ai-act");
		expect(result.artifacts[0].jurisdiction).toContain("eu-gdpr");
		expect(result.artifacts[0].filename).toContain("multi-jurisdiction");
	});

	it("handles template loading errors gracefully", async () => {
		const provider = makeMockProvider("content");
		const ctx = makeContext();

		const jurisdictionResults = [
			makeJurisdictionResult({
				requiredArtifacts: [
					{
						type: "bias-audit",
						name: "Bias Audit",
						required: true,
						legalBasis: "NYC LL144",
						description: "Bias audit",
						templateId: "non-existent-template-id",
					},
				],
			}),
		];

		const result = await generateArtifacts({
			ctx,
			jurisdictionResults,
			provider,
		});

		expect(result.artifacts.length).toBe(0);
		expect(result.errors.length).toBe(1);
		expect(result.errors[0].templateId).toBe("non-existent-template-id");
		expect(result.errors[0].error).toContain("Failed to load template");
	});

	it("handles LLM errors gracefully", async () => {
		const provider = makeFailingProvider("Service unavailable");
		const ctx = makeContext();

		const jurisdictionResults = [
			makeJurisdictionResult({
				requiredArtifacts: [
					{
						type: "dpia",
						name: "GDPR DPIA",
						required: true,
						legalBasis: "Articles 35-36",
						description: "DPIA",
						templateId: "dpia-gdpr",
					},
				],
			}),
		];

		const result = await generateArtifacts({
			ctx,
			jurisdictionResults,
			provider,
		});

		expect(result.artifacts.length).toBe(0);
		expect(result.errors.length).toBe(1);
		expect(result.errors[0].error).toContain("Service unavailable");
	});

	it("generates multiple artifacts for different types", async () => {
		const mockResponse = `## 1. Section One

Content.

## 2. Section Two

More content.
`;

		const provider = makeMockProvider(mockResponse);
		const ctx = makeContext();

		const jurisdictionResults = [
			makeJurisdictionResult({
				jurisdiction: "eu-gdpr",
				requiredArtifacts: [
					{
						type: "dpia",
						name: "GDPR DPIA",
						required: true,
						legalBasis: "Articles 35-36",
						description: "DPIA",
						templateId: "dpia-gdpr",
					},
					{
						type: "transparency-notice",
						name: "Privacy Notice",
						required: true,
						legalBasis: "Articles 13-14",
						description: "Privacy notice",
						templateId: "transparency-notice",
					},
				],
			}),
		];

		const result = await generateArtifacts({
			ctx,
			jurisdictionResults,
			provider,
		});

		expect(result.artifacts.length).toBe(2);
		expect(result.errors.length).toBe(0);
		const types = result.artifacts.map((a) => a.type);
		expect(types).toContain("dpia");
		expect(types).toContain("transparency-notice");
	});

	it("skips artifacts without a resolvable template", async () => {
		const provider = makeMockProvider("content");
		const ctx = makeContext();

		const jurisdictionResults = [
			makeJurisdictionResult({
				requiredArtifacts: [
					{
						// Use a fabricated type that has no template mapping
						type: "unknown-future-artifact" as ArtifactType,
						name: "Unknown Future Artifact",
						required: true,
						legalBasis: "Future Regulation",
						description: "An artifact type with no template mapping",
						// No templateId and no default mapping for this type
					},
				],
			}),
		];

		const result = await generateArtifacts({
			ctx,
			jurisdictionResults,
			provider,
		});

		// Should be skipped entirely (no error, no artifact)
		expect(result.artifacts.length).toBe(0);
		expect(result.errors.length).toBe(0);
	});
});

// ─── DPIA Template Content Validation ────────────────────────────────────────

describe("DPIA GDPR template", () => {
	it("contains all Article 35 required sections", async () => {
		const result = await loadTemplate("dpia-gdpr");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		// Article 35(7)(a): Description of processing operations
		expect(content).toContain("Description of Processing Operations");
		// Article 35(7)(b): Necessity and proportionality
		expect(content).toContain("Necessity and Proportionality");
		// Article 35(7)(c): Risks to rights and freedoms
		expect(content).toContain("Risks to Rights and Freedoms");
		// Article 35(7)(d): Measures to address risks
		expect(content).toContain("Measures to Address Risks");
		// DPO consultation
		expect(content).toContain("Data Protection Officer");
		// Data subject views
		expect(content).toContain("Data Subject Views");
	});

	it("includes GDPR principles compliance table", async () => {
		const result = await loadTemplate("dpia-gdpr");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Art. 5(1)(a)");
		expect(content).toContain("Art. 5(1)(b)");
		expect(content).toContain("Art. 5(1)(c)");
		expect(content).toContain("Art. 5(1)(d)");
		expect(content).toContain("Art. 5(1)(e)");
		expect(content).toContain("Art. 5(1)(f)");
		expect(content).toContain("Art. 5(2)");
	});

	it("includes data subject rights table", async () => {
		const result = await loadTemplate("dpia-gdpr");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Right of access (Art. 15)");
		expect(content).toContain("Right to rectification (Art. 16)");
		expect(content).toContain("Right to erasure (Art. 17)");
		expect(content).toContain("Right to data portability (Art. 20)");
		expect(content).toContain("Right re automated decisions (Art. 22)");
	});
});

// ─── AI Act Risk Assessment Template Validation ──────────────────────────────

describe("AI Act risk assessment template", () => {
	it("contains all Annex III categories", async () => {
		const result = await loadTemplate("ai-act-risk-assessment");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Biometrics");
		expect(content).toContain("Critical infrastructure");
		expect(content).toContain("Education");
		expect(content).toContain("Employment");
		expect(content).toContain("Essential services");
		expect(content).toContain("Law enforcement");
		expect(content).toContain("Migration");
		expect(content).toContain("Justice and democratic");
	});

	it("contains prohibited practice assessment", async () => {
		const result = await loadTemplate("ai-act-risk-assessment");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Art. 5(1)(a)");
		expect(content).toContain("Art. 5(1)(c)");
		expect(content).toContain("Social scoring");
	});

	it("contains Article 6(3) exception assessment", async () => {
		const result = await loadTemplate("ai-act-risk-assessment");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Article 6(3)");
		expect(content).toContain("narrow procedural task");
	});

	it("contains conformity assessment sections", async () => {
		const result = await loadTemplate("ai-act-risk-assessment");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Risk Management System (Article 9)");
		expect(content).toContain("Data and Data Governance (Article 10)");
		expect(content).toContain("Technical Documentation (Article 11)");
		expect(content).toContain("Human Oversight (Article 14)");
	});
});

// ─── GPAI Technical Doc Template Validation ──────────────────────────────────

describe("GPAI technical documentation template", () => {
	it("contains all Annex XI required sections", async () => {
		const result = await loadTemplate("gpai-technical-doc");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		// Section 1: General description
		expect(content).toContain("General Description");
		// Section 2: Training and testing
		expect(content).toContain("Training and Testing");
		expect(content).toContain("Evaluation Results");
		// Section 3: Compute
		expect(content).toContain("Computational Resources");
		expect(content).toContain("FLOPs");
		// Section 4: Limitations and risks
		expect(content).toContain("Limitations and Risks");
		// Section 5: Downstream providers
		expect(content).toContain("Downstream Providers");
		// Section 6: Copyright compliance
		expect(content).toContain("Copyright Compliance");
		expect(content).toContain("Training Data Summary");
	});

	it("contains systemic risk threshold assessment", async () => {
		const result = await loadTemplate("gpai-technical-doc");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("10^25");
		expect(content).toContain("systemic risk");
	});
});

// ─── GenAI Content Policy Template Validation ────────────────────────────────

describe("GenAI content policy template", () => {
	it("contains EU AI Act Article 50 requirements", async () => {
		const result = await loadTemplate("genai-content-policy");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("Article 50");
		expect(content).toContain("machine-readable");
	});

	it("contains China CAC requirements", async () => {
		const result = await loadTemplate("genai-content-policy");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("CAC");
		expect(content).toContain("Deep Synthesis");
	});

	it("contains California SB 942 requirements", async () => {
		const result = await loadTemplate("genai-content-policy");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("SB 942");
	});

	it("contains C2PA watermarking references", async () => {
		const result = await loadTemplate("genai-content-policy");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("C2PA");
	});

	it("uses jurisdiction conditional blocks", async () => {
		const result = await loadTemplate("genai-content-policy");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const content = result.value.content;
		expect(content).toContain("{{#if_jurisdiction eu-ai-act}}");
		expect(content).toContain("{{#if_jurisdiction china}}");
		expect(content).toContain("{{#if_jurisdiction us-ca}}");
		expect(content).toContain("{{/if_jurisdiction}}");
	});
});
