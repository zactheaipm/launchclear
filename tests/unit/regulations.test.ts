import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	ProcessedRegulation,
	ProcessedSection,
	RegulationDiff,
	SectionDiff,
} from "../../src/core/types.js";
import {
	buildChangelog,
	buildRegulationDiff,
	diffSections,
	renderChangelogMarkdown,
} from "../../src/regulations/differ.js";
import { computeContentHash, currentSnapshotDate } from "../../src/regulations/fetcher.js";
import {
	assignTopics,
	buildManifest,
	formatProvisionMarkdown,
	generateSectionId,
	processRegulation,
	validateProcessedRegulation,
} from "../../src/regulations/processor.js";
import {
	REGULATION_SOURCES,
	SOURCE_TO_KNOWLEDGE_PATH,
	TOPIC_TAXONOMY,
	getAllSourceIds,
	getSource,
	getSourcesForJurisdiction,
} from "../../src/regulations/sources.js";

// ─── Sources Tests ───────────────────────────────────────────────────────────

describe("regulation sources", () => {
	it("all sources have unique IDs", () => {
		const ids = REGULATION_SOURCES.map((s) => s.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it("all sources have a knowledge path mapping", () => {
		for (const source of REGULATION_SOURCES) {
			expect(SOURCE_TO_KNOWLEDGE_PATH[source.id]).toBeDefined();
		}
	});

	it("getSource returns correct source by ID", () => {
		const source = getSource("eurlex-eu-ai-act");
		expect(source).toBeDefined();
		expect(source?.name).toBe("EU AI Act (Regulation 2024/1689)");
		expect(source?.jurisdiction).toBe("EU");
	});

	it("getSource returns undefined for unknown ID", () => {
		const source = getSource("nonexistent-source");
		expect(source).toBeUndefined();
	});

	it("getSourcesForJurisdiction filters correctly", () => {
		const euSources = getSourcesForJurisdiction("EU");
		expect(euSources.length).toBeGreaterThanOrEqual(2);
		for (const source of euSources) {
			expect(source.jurisdiction).toBe("EU");
		}
	});

	it("getSourcesForJurisdiction returns empty for unknown jurisdiction", () => {
		const sources = getSourcesForJurisdiction("UNKNOWN");
		expect(sources).toHaveLength(0);
	});

	it("getAllSourceIds returns all source IDs", () => {
		const ids = getAllSourceIds();
		expect(ids.length).toBe(REGULATION_SOURCES.length);
		for (const source of REGULATION_SOURCES) {
			expect(ids).toContain(source.id);
		}
	});

	it("all sources have valid type", () => {
		for (const source of REGULATION_SOURCES) {
			expect(["api", "scrape"]).toContain(source.type);
		}
	});

	it("all sources have non-negative rate limit", () => {
		for (const source of REGULATION_SOURCES) {
			expect(source.rateLimitMs).toBeGreaterThanOrEqual(0);
		}
	});

	it("scrape sources have scrapeConfig", () => {
		const scrapeSources = REGULATION_SOURCES.filter((s) => s.type === "scrape");
		for (const source of scrapeSources) {
			expect(source.scrapeConfig).toBeDefined();
			expect(source.scrapeConfig?.articleSelector).toBeTruthy();
		}
	});
});

describe("topic taxonomy", () => {
	it("has no duplicate entries", () => {
		const unique = new Set(TOPIC_TAXONOMY);
		expect(unique.size).toBe(TOPIC_TAXONOMY.length);
	});

	it("all entries are lowercase", () => {
		for (const topic of TOPIC_TAXONOMY) {
			expect(topic).toBe(topic.toLowerCase());
		}
	});

	it("includes critical topics from existing manifests", () => {
		// Topics from knowledge/provisions/eu/ai-act/manifest.json
		const criticalTopics = [
			"prohibited-practices",
			"high-risk",
			"risk-classification",
			"transparency",
			"gpai",
			"financial-services",
			"credit-scoring",
			"human-oversight",
			"data-governance",
		];
		for (const topic of criticalTopics) {
			expect(TOPIC_TAXONOMY).toContain(topic);
		}
	});
});

// ─── Processor Tests ─────────────────────────────────────────────────────────

describe("assignTopics", () => {
	it("assigns prohibited-practices for prohibition keywords", () => {
		const topics = assignTopics(
			"Prohibited Uses",
			"This section prohibits certain AI practices that pose unacceptable risk.",
		);
		expect(topics).toContain("prohibited-practices");
	});

	it("assigns transparency for transparency keywords", () => {
		const topics = assignTopics(
			"Transparency Requirements",
			"Users must be informed when interacting with AI. Disclosure is mandatory.",
		);
		expect(topics).toContain("transparency");
	});

	it("assigns gpai for foundation model keywords", () => {
		const topics = assignTopics(
			"GPAI Obligations",
			"General-purpose AI models must comply with Article 53 GPAI provisions.",
		);
		expect(topics).toContain("gpai");
	});

	it("assigns credit-scoring for financial keywords", () => {
		const topics = assignTopics(
			"Credit Assessment",
			"AI systems used for credit scoring and creditworthiness evaluation.",
		);
		expect(topics).toContain("credit-scoring");
	});

	it("returns empty array for unrelated content", () => {
		const topics = assignTopics(
			"Weather Report",
			"Today the weather will be sunny with temperatures around 25 degrees.",
		);
		expect(topics).toHaveLength(0);
	});

	it("assigns multiple topics when content matches many keywords", () => {
		const topics = assignTopics(
			"High-Risk AI Transparency",
			"High-risk AI systems require transparency and human oversight. Data governance and technical documentation are mandatory.",
		);
		expect(topics).toContain("high-risk");
		expect(topics).toContain("transparency");
		expect(topics).toContain("human-oversight");
		expect(topics).toContain("data-governance");
		expect(topics).toContain("technical-documentation");
	});

	it("only returns topics from the canonical taxonomy", () => {
		const topics = assignTopics(
			"Test",
			"biometric facial recognition consent transparency enforcement",
		);
		for (const topic of topics) {
			expect(TOPIC_TAXONOMY).toContain(topic);
		}
	});
});

describe("generateSectionId", () => {
	it("generates stable ID from source and article", () => {
		const id = generateSectionId("eurlex-eu-ai-act", "Article 5");
		expect(id).toBe("eurlex-eu-ai-act-article-5");
	});

	it("handles complex article references", () => {
		const id = generateSectionId("eurlex-gdpr", "Articles 6-7");
		expect(id).toBe("eurlex-gdpr-articles-6-7");
	});

	it("produces URL-safe slugs", () => {
		const id = generateSectionId("us-congress", "Section 102(a)(1)");
		expect(id).toMatch(/^[a-z0-9-]+$/);
	});

	it("strips leading and trailing hyphens", () => {
		const id = generateSectionId("test", "  Article 5  ");
		expect(id).not.toMatch(/^-|-$/);
	});
});

describe("formatProvisionMarkdown", () => {
	it("produces markdown matching existing provision format", () => {
		const section: ProcessedSection = {
			id: "test-article-5",
			title: "Prohibited AI Practices",
			article: "Article 5",
			content: "AI systems that deploy subliminal techniques are prohibited.",
			topics: ["prohibited-practices"],
		};

		const markdown = formatProvisionMarkdown(
			section,
			"EU Artificial Intelligence Act",
			"2 February 2025",
		);

		expect(markdown).toContain("# Prohibited AI Practices");
		expect(markdown).toContain("**Law**: EU Artificial Intelligence Act");
		expect(markdown).toContain("**Article**: Article 5");
		expect(markdown).toContain("**Effective**: 2 February 2025");
		expect(markdown).toContain("## Overview");
		expect(markdown).toContain("AI systems that deploy subliminal techniques are prohibited.");
	});

	it("omits effective date when not provided", () => {
		const section: ProcessedSection = {
			id: "test-section-1",
			title: "Test Section",
			article: "Section 1",
			content: "Test content.",
			topics: [],
		};

		const markdown = formatProvisionMarkdown(section, "Test Law");

		expect(markdown).not.toContain("**Effective**:");
	});
});

describe("buildManifest", () => {
	it("produces valid manifest structure", () => {
		const sections: ProcessedSection[] = [
			{
				id: "test-article-1",
				title: "First Section",
				article: "Article 1",
				content: "Content.",
				topics: ["transparency"],
			},
			{
				id: "test-article-2",
				title: "Second Section",
				article: "Article 2",
				content: "More content.",
				topics: ["enforcement"],
			},
		];

		const manifest = buildManifest("test", "Test Law", "EU", sections);

		expect(manifest.id).toBe("test");
		expect(manifest.law).toBe("Test Law");
		expect(manifest.jurisdiction).toBe("EU");
		expect(manifest.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(manifest.sections).toHaveLength(2);

		const firstSection = manifest.sections[0];
		expect(firstSection).toBeDefined();
		expect(firstSection?.id).toBe("test-article-1");
		expect(firstSection?.file).toBe("article-1.md");
		expect(firstSection?.topics).toContain("transparency");
	});
});

describe("processRegulation", () => {
	it("processes HTML content with article pattern into sections", () => {
		const fetched = {
			sourceId: "eurlex-eu-ai-act",
			fetchedAt: "2026-02-21T00:00:00.000Z",
			rawContent: `<html><body>
				<p>Article 5 Prohibited Practices</p>
				<p>AI systems that deploy subliminal techniques beyond a person's consciousness are prohibited.</p>
				<p>Article 6 Classification</p>
				<p>An AI system shall be classified as high-risk if it falls under Annex III categories.</p>
			</body></html>`,
			format: "html" as const,
			url: "https://eur-lex.europa.eu/test",
			contentHash: "abc123",
		};

		const source = getSource("eurlex-eu-ai-act");
		if (!source) throw new Error("Source not found");

		const result = processRegulation(fetched, source);
		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.value.sections.length).toBeGreaterThanOrEqual(1);
			expect(result.value.manifest.id).toBe("eurlex-eu-ai-act");
			expect(result.value.manifest.jurisdiction).toBe("EU");
		}
	});

	it("handles empty content gracefully", () => {
		const fetched = {
			sourceId: "eurlex-eu-ai-act",
			fetchedAt: "2026-02-21T00:00:00.000Z",
			rawContent: "<html><body></body></html>",
			format: "html" as const,
			url: "https://eur-lex.europa.eu/test",
			contentHash: "empty",
		};

		const source = getSource("eurlex-eu-ai-act");
		if (!source) throw new Error("Source not found");
		const result = processRegulation(fetched, source);
		expect(result.ok).toBe(true);
	});
});

describe("validateProcessedRegulation", () => {
	it("returns valid for well-formed input", () => {
		const processed: ProcessedRegulation = {
			sourceId: "test",
			processedAt: "2026-02-21T00:00:00.000Z",
			manifest: {
				id: "test",
				law: "Test Law",
				jurisdiction: "EU",
				lastUpdated: "2026-02-21",
				sections: [
					{
						id: "test-article-1",
						title: "Test Section",
						article: "Article 1",
						file: "article-1.md",
						topics: ["transparency"],
					},
				],
			},
			sections: [
				{
					id: "test-article-1",
					title: "Test Section",
					article: "Article 1",
					content: "This is a test section with enough content to pass validation.",
					topics: ["transparency"],
				},
			],
		};

		const result = validateProcessedRegulation(processed);
		expect(result.isValid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("flags empty sections as errors", () => {
		const processed: ProcessedRegulation = {
			sourceId: "test",
			processedAt: "2026-02-21T00:00:00.000Z",
			manifest: {
				id: "test",
				law: "Test Law",
				jurisdiction: "EU",
				lastUpdated: "2026-02-21",
				sections: [
					{
						id: "test-empty",
						title: "Empty Section",
						article: "Article 1",
						file: "empty.md",
						topics: [],
					},
				],
			},
			sections: [
				{
					id: "test-empty",
					title: "Empty Section",
					article: "Article 1",
					content: "",
					topics: [],
				},
			],
		};

		const result = validateProcessedRegulation(processed);
		expect(result.isValid).toBe(false);
		expect(result.errors.some((e) => e.message.includes("empty content"))).toBe(true);
	});

	it("warns about sections with no topic tags", () => {
		const processed: ProcessedRegulation = {
			sourceId: "test",
			processedAt: "2026-02-21T00:00:00.000Z",
			manifest: {
				id: "test",
				law: "Test Law",
				jurisdiction: "EU",
				lastUpdated: "2026-02-21",
				sections: [
					{
						id: "test-no-topics",
						title: "No Topics",
						article: "Article 1",
						file: "no-topics.md",
						topics: [],
					},
				],
			},
			sections: [
				{
					id: "test-no-topics",
					title: "No Topics",
					article: "Article 1",
					content: "This section has enough content but no matching topic keywords for weather.",
					topics: [],
				},
			],
		};

		const result = validateProcessedRegulation(processed);
		expect(result.warnings.some((w) => w.message.includes("no topic tags"))).toBe(true);
	});

	it("warns about residual HTML in content", () => {
		const processed: ProcessedRegulation = {
			sourceId: "test",
			processedAt: "2026-02-21T00:00:00.000Z",
			manifest: {
				id: "test",
				law: "Test Law",
				jurisdiction: "EU",
				lastUpdated: "2026-02-21",
				sections: [
					{
						id: "test-html",
						title: "HTML Content",
						article: "Article 1",
						file: "html.md",
						topics: ["transparency"],
					},
				],
			},
			sections: [
				{
					id: "test-html",
					title: "HTML Content",
					article: "Article 1",
					content: "This section contains <span>residual HTML</span> tags that should be cleaned.",
					topics: ["transparency"],
				},
			],
		};

		const result = validateProcessedRegulation(processed);
		expect(result.warnings.some((w) => w.message.includes("residual HTML"))).toBe(true);
	});

	it("errors on no sections extracted", () => {
		const processed: ProcessedRegulation = {
			sourceId: "test",
			processedAt: "2026-02-21T00:00:00.000Z",
			manifest: {
				id: "test",
				law: "Test Law",
				jurisdiction: "EU",
				lastUpdated: "2026-02-21",
				sections: [],
			},
			sections: [],
		};

		const result = validateProcessedRegulation(processed);
		expect(result.isValid).toBe(false);
		expect(result.errors.some((e) => e.message.includes("No sections"))).toBe(true);
	});
});

// ─── Differ Tests ────────────────────────────────────────────────────────────

describe("diffSections", () => {
	it("detects added sections", () => {
		const previous: { id: string; content: string }[] = [];
		const current: ProcessedSection[] = [
			{
				id: "new-section",
				title: "New Section",
				article: "Article 99",
				content: "Brand new content.",
				topics: ["transparency"],
			},
		];

		const diffs = diffSections(previous, current);
		expect(diffs).toHaveLength(1);
		expect(diffs[0]?.type).toBe("added");
		expect(diffs[0]?.sectionId).toBe("new-section");
	});

	it("detects removed sections", () => {
		const previous = [
			{
				id: "old-section",
				content: "Old content that was removed.",
			},
		];
		const current: ProcessedSection[] = [];

		const diffs = diffSections(previous, current);
		expect(diffs).toHaveLength(1);
		expect(diffs[0]?.type).toBe("removed");
		expect(diffs[0]?.sectionId).toBe("old-section");
	});

	it("detects modified sections", () => {
		const previous = [
			{
				id: "modified-section",
				content: "Original content here.",
			},
		];
		const current: ProcessedSection[] = [
			{
				id: "modified-section",
				title: "Modified Section",
				article: "Article 1",
				content: "Updated content here with changes.",
				topics: [],
			},
		];

		const diffs = diffSections(previous, current);
		expect(diffs).toHaveLength(1);
		expect(diffs[0]?.type).toBe("modified");
		expect(diffs[0]?.previousText).toBe("Original content here.");
		expect(diffs[0]?.currentText).toBe("Updated content here with changes.");
	});

	it("returns empty array for identical sections", () => {
		const content = "Identical content in both versions.";
		const previous = [{ id: "same-section", content }];
		const current: ProcessedSection[] = [
			{
				id: "same-section",
				title: "Same Section",
				article: "Article 1",
				content,
				topics: [],
			},
		];

		const diffs = diffSections(previous, current);
		expect(diffs).toHaveLength(0);
	});

	it("handles mixed add/remove/modify", () => {
		const previous = [
			{ id: "kept", content: "Original." },
			{ id: "removed", content: "Going away." },
			{ id: "modified", content: "Before." },
		];
		const current: ProcessedSection[] = [
			{
				id: "kept",
				title: "Kept",
				article: "A1",
				content: "Original.",
				topics: [],
			},
			{
				id: "modified",
				title: "Modified",
				article: "A2",
				content: "After.",
				topics: [],
			},
			{
				id: "added",
				title: "Added",
				article: "A3",
				content: "New.",
				topics: [],
			},
		];

		const diffs = diffSections(previous, current);
		const types = diffs.map((d) => d.type).sort();
		expect(types).toContain("added");
		expect(types).toContain("removed");
		expect(types).toContain("modified");
	});
});

describe("buildRegulationDiff", () => {
	it("constructs RegulationDiff with correct fields", () => {
		const sectionDiffs: SectionDiff[] = [
			{
				sectionId: "test-1",
				type: "added",
				currentText: "New.",
				summary: "New section added: test-1",
			},
		];

		const diff = buildRegulationDiff("test-source", "2026-01-01", "2026-02-01", sectionDiffs);

		expect(diff.sourceId).toBe("test-source");
		expect(diff.previousVersion).toBe("2026-01-01");
		expect(diff.currentVersion).toBe("2026-02-01");
		expect(diff.changedSections).toHaveLength(1);
		expect(diff.timestamp).toBeTruthy();
	});
});

describe("buildChangelog", () => {
	it("produces correct entry counts", () => {
		const diff: RegulationDiff = {
			sourceId: "test",
			previousVersion: "2026-01",
			currentVersion: "2026-02",
			changedSections: [
				{
					sectionId: "s1",
					type: "added",
					currentText: "New.",
					summary: "Added s1",
				},
				{
					sectionId: "s2",
					type: "modified",
					previousText: "Old.",
					currentText: "New.",
					summary: "Modified s2",
				},
				{
					sectionId: "s3",
					type: "removed",
					previousText: "Gone.",
					summary: "Removed s3",
				},
			],
			timestamp: "2026-02-21T00:00:00.000Z",
		};

		const processed: ProcessedRegulation = {
			sourceId: "test",
			processedAt: "2026-02-21T00:00:00.000Z",
			manifest: {
				id: "test",
				law: "Test",
				jurisdiction: "EU",
				lastUpdated: "2026-02-21",
				sections: [],
			},
			sections: [
				{
					id: "s1",
					title: "Section 1",
					article: "A1",
					content: "New.",
					topics: [],
				},
				{
					id: "s2",
					title: "Section 2",
					article: "A2",
					content: "New.",
					topics: [],
				},
			],
		};

		const changelog = buildChangelog(diff, processed);
		expect(changelog.entries).toHaveLength(3);
		expect(changelog.summary).toContain("1 section(s) added");
		expect(changelog.summary).toContain("1 section(s) modified");
		expect(changelog.summary).toContain("1 section(s) removed");
		// affected mappings: modified + removed
		expect(changelog.affectedMappings).toContain("s2");
		expect(changelog.affectedMappings).toContain("s3");
		expect(changelog.affectedMappings).not.toContain("s1");
	});
});

describe("renderChangelogMarkdown", () => {
	it("produces valid markdown with all sections", () => {
		const changelog = {
			sourceId: "test",
			generatedAt: "2026-02-21T00:00:00.000Z",
			previousVersion: "2026-01",
			currentVersion: "2026-02",
			summary: "1 section(s) added.",
			entries: [
				{
					sectionId: "s1",
					type: "added" as const,
					title: "New Section",
					description: "New section added: s1",
				},
			],
			affectedMappings: [] as string[],
		};

		const markdown = renderChangelogMarkdown(changelog);
		expect(markdown).toContain("# Regulation Changelog — test");
		expect(markdown).toContain("**Generated:**");
		expect(markdown).toContain("## Summary");
		expect(markdown).toContain("1 section(s) added.");
		expect(markdown).toContain("## Changes");
		expect(markdown).toContain("[+] New Section");
	});

	it("includes affected mappings section when present", () => {
		const changelog = {
			sourceId: "test",
			generatedAt: "2026-02-21T00:00:00.000Z",
			previousVersion: "2026-01",
			currentVersion: "2026-02",
			summary: "1 section(s) modified.",
			entries: [
				{
					sectionId: "s1",
					type: "modified" as const,
					title: "Changed Section",
					description: "Modified s1",
				},
			],
			affectedMappings: ["s1"],
		};

		const markdown = renderChangelogMarkdown(changelog);
		expect(markdown).toContain("## Affected Requirement Mappings");
		expect(markdown).toContain("- s1");
	});
});

// ─── Fetcher Tests ───────────────────────────────────────────────────────────

describe("computeContentHash", () => {
	it("produces consistent SHA-256 hash", () => {
		const hash1 = computeContentHash("test content");
		const hash2 = computeContentHash("test content");
		expect(hash1).toBe(hash2);
	});

	it("produces different hashes for different content", () => {
		const hash1 = computeContentHash("content A");
		const hash2 = computeContentHash("content B");
		expect(hash1).not.toBe(hash2);
	});

	it("produces 64-character hex string", () => {
		const hash = computeContentHash("test");
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});
});

describe("currentSnapshotDate", () => {
	it("returns YYYY-MM format", () => {
		const date = currentSnapshotDate();
		expect(date).toMatch(/^\d{4}-\d{2}$/);
	});

	it("returns current year and month", () => {
		const now = new Date();
		const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
		expect(currentSnapshotDate()).toBe(expected);
	});
});

// ─── Fetcher HTTP Tests (mocked) ─────────────────────────────────────────────

describe("fetchSource", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns error for HTTP 404", async () => {
		const { fetchSource } = await import("../../src/regulations/fetcher.js");

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			text: () => Promise.resolve("Not Found"),
		});

		const source = getSource("eurlex-eu-ai-act");
		if (!source) throw new Error("Source not found");
		const result = await fetchSource(source);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("HTTP 404");
		}
	});

	it("returns error for HTTP 500", async () => {
		const { fetchSource } = await import("../../src/regulations/fetcher.js");

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: () => Promise.resolve("Server Error"),
		});

		const source = getSource("eurlex-eu-ai-act");
		if (!source) throw new Error("Source not found");
		const result = await fetchSource(source);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("HTTP 500");
		}
	});

	it("returns success with correct fields for valid response", async () => {
		const { fetchSource } = await import("../../src/regulations/fetcher.js");

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve("<html><body>Test content</body></html>"),
			headers: new Headers({ etag: '"abc123"' }),
		});

		const source = getSource("eurlex-eu-ai-act");
		if (!source) throw new Error("Source not found");
		const result = await fetchSource(source);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.sourceId).toBe("eurlex-eu-ai-act");
			expect(result.value.format).toBe("html");
			expect(result.value.contentHash).toMatch(/^[a-f0-9]{64}$/);
			expect(result.value.rawContent).toContain("Test content");
		}
	});
});
