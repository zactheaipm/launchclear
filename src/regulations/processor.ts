import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";
import type {
	FetchedRegulation,
	ProcessedRegulation,
	ProcessedSection,
	ProvisionManifest,
	RegulationSourceConfig,
	Result,
	ValidationError,
	ValidationResult,
	ValidationWarning,
} from "../core/types.js";
import { currentSnapshotDate, getSnapshotsDir } from "./fetcher.js";
import { SOURCE_TO_KNOWLEDGE_PATH, TOPIC_TAXONOMY } from "./sources.js";

// ─── Raw Section (intermediate representation) ──────────────────────────────

interface RawSection {
	readonly rawTitle: string;
	readonly rawArticle: string;
	readonly rawContent: string;
}

// ─── Parsing Strategy Interface ──────────────────────────────────────────────

interface ParsingStrategy {
	readonly id: string;
	splitIntoSections(rawContent: string, format: string): Result<readonly RawSection[]>;
}

// ─── EU Legislation Parser ───────────────────────────────────────────────────
// Parses EUR-Lex HTML format. Splits on "Article N" patterns.

function createEuParser(): ParsingStrategy {
	return {
		id: "eu",
		splitIntoSections(rawContent: string, _format: string): Result<readonly RawSection[]> {
			try {
				const $ = cheerio.load(rawContent);
				const sections: RawSection[] = [];

				// EUR-Lex uses .ti-art for article headings
				// Try to find article boundaries in the HTML
				const articlePattern = /Article\s+(\d+[a-z]?)\b/gi;
				const bodyText = $.root().text();
				const matches = [...bodyText.matchAll(articlePattern)];

				if (matches.length === 0) {
					// Fallback: treat the whole content as one section
					const text = extractTextFromHtml($);
					if (text.trim().length > 0) {
						sections.push({
							rawTitle: "Full Text",
							rawArticle: "Full Text",
							rawContent: text,
						});
					}
					return { ok: true, value: sections };
				}

				// Split body text by article boundaries
				const fullText = extractTextFromHtml($);
				const articleRegex = /(Article\s+\d+[a-z]?)\b(.*?)(?=Article\s+\d+[a-z]?\b|$)/gis;
				const articleMatches = [...fullText.matchAll(articleRegex)];

				for (const match of articleMatches) {
					const articleRef = match[1]?.trim() ?? "Unknown";
					const rest = match[2]?.trim() ?? "";

					// Extract title: first line after "Article N" is typically the title
					const lines = rest.split("\n").filter((l) => l.trim().length > 0);
					const title = lines[0]?.trim() ?? articleRef;
					const content = lines.slice(1).join("\n").trim();

					if (content.length > 0) {
						sections.push({
							rawTitle: `${articleRef} — ${title}`,
							rawArticle: articleRef,
							rawContent: content,
						});
					}
				}

				return { ok: true, value: sections };
			} catch (error: unknown) {
				return {
					ok: false,
					error: new Error(
						`EU parser failed: ${error instanceof Error ? error.message : String(error)}`,
					),
				};
			}
		},
	};
}

// ─── UK Legislation Parser ───────────────────────────────────────────────────
// Parses legislation.gov.uk XML/HTML format.

function createUkParser(): ParsingStrategy {
	return {
		id: "uk",
		splitIntoSections(rawContent: string, format: string): Result<readonly RawSection[]> {
			try {
				if (format === "xml") {
					return parseUkXml(rawContent);
				}
				// Fallback to HTML parsing for UK legislation
				return parseGenericHtml(rawContent);
			} catch (error: unknown) {
				return {
					ok: false,
					error: new Error(
						`UK parser failed: ${error instanceof Error ? error.message : String(error)}`,
					),
				};
			}
		},
	};
}

function parseUkXml(rawContent: string): Result<readonly RawSection[]> {
	// legislation.gov.uk XML uses <Section> and <Part> elements
	const $ = cheerio.load(rawContent, { xml: true });
	const sections: RawSection[] = [];

	$("Section, P1").each((_i, el) => {
		const $el = $(el);
		const title = $el.find("Title, Pnumber").first().text().trim() || "Untitled";
		const number = $el.find("Number, Pnumber").first().text().trim() || `section-${_i}`;
		const content = $el
			.find("P1para, P2, P3, Text")
			.map((_j, p) => $(p).text().trim())
			.get()
			.join("\n\n");

		if (content.length > 0) {
			sections.push({
				rawTitle: title,
				rawArticle: `Section ${number}`,
				rawContent: content,
			});
		}
	});

	if (sections.length === 0) {
		// Fallback: try Part-level splitting
		$("Part").each((_i, el) => {
			const $el = $(el);
			const title = $el.find("Title").first().text().trim() || "Untitled";
			const number = $el.find("Number").first().text().trim() || `part-${_i}`;
			const content = $el.text().trim();

			if (content.length > 0) {
				sections.push({
					rawTitle: title,
					rawArticle: `Part ${number}`,
					rawContent: content,
				});
			}
		});
	}

	return { ok: true, value: sections };
}

// ─── US Legislation Parser ───────────────────────────────────────────────────
// Handles congress.gov JSON API responses and state legislature HTML.

function createUsParser(): ParsingStrategy {
	return {
		id: "us",
		splitIntoSections(rawContent: string, format: string): Result<readonly RawSection[]> {
			try {
				if (format === "json") {
					return parseUsJson(rawContent);
				}
				// HTML format for state legislatures
				return parseUsHtml(rawContent);
			} catch (error: unknown) {
				return {
					ok: false,
					error: new Error(
						`US parser failed: ${error instanceof Error ? error.message : String(error)}`,
					),
				};
			}
		},
	};
}

function parseUsJson(rawContent: string): Result<readonly RawSection[]> {
	try {
		const parsed: unknown = JSON.parse(rawContent);
		const sections: RawSection[] = [];

		if (isRecord(parsed) && Array.isArray(parsed.sections)) {
			for (const section of parsed.sections as unknown[]) {
				if (isRecord(section)) {
					const title = typeof section.title === "string" ? section.title : "Untitled";
					const number = typeof section.number === "string" ? section.number : "unknown";
					const content = typeof section.text === "string" ? section.text : "";

					if (content.length > 0) {
						sections.push({
							rawTitle: title,
							rawArticle: `Section ${number}`,
							rawContent: content,
						});
					}
				}
			}
		}

		// If structured parsing didn't work, try to extract text
		if (sections.length === 0 && isRecord(parsed)) {
			const text = typeof parsed.text === "string" ? parsed.text : "";
			if (text.length > 0) {
				return splitBySectionPattern(text);
			}
		}

		return { ok: true, value: sections };
	} catch {
		// Not valid JSON — try as plain text
		return splitBySectionPattern(rawContent);
	}
}

function parseUsHtml(rawContent: string): Result<readonly RawSection[]> {
	const $ = cheerio.load(rawContent);
	const sections: RawSection[] = [];

	// Try common state legislature selectors
	$("section, .bill-section, .legis-section").each((_i, el) => {
		const $el = $(el);
		const title = $el.find("h2, h3, .section-title").first().text().trim();
		const content = $el.text().trim();

		if (content.length > 0) {
			sections.push({
				rawTitle: title || `Section ${_i + 1}`,
				rawArticle: `Section ${_i + 1}`,
				rawContent: content,
			});
		}
	});

	if (sections.length === 0) {
		// Fallback to generic splitting
		return parseGenericHtml(rawContent);
	}

	return { ok: true, value: sections };
}

// ─── Generic HTML Parser ─────────────────────────────────────────────────────
// Fallback: regex-based splitting on heading patterns.

function createGenericHtmlParser(): ParsingStrategy {
	return {
		id: "generic",
		splitIntoSections(rawContent: string, _format: string): Result<readonly RawSection[]> {
			try {
				return parseGenericHtml(rawContent);
			} catch (error: unknown) {
				return {
					ok: false,
					error: new Error(
						`Generic parser failed: ${error instanceof Error ? error.message : String(error)}`,
					),
				};
			}
		},
	};
}

function parseGenericHtml(rawContent: string): Result<readonly RawSection[]> {
	const $ = cheerio.load(rawContent);
	const text = extractTextFromHtml($);
	return splitBySectionPattern(text);
}

// ─── Shared Parsing Utilities ────────────────────────────────────────────────

function extractTextFromHtml($: cheerio.CheerioAPI): string {
	// Remove scripts, styles, nav, footer
	$("script, style, nav, footer, header").remove();

	// Get text content, preserving paragraph structure
	const paragraphs: string[] = [];
	$("p, li, h1, h2, h3, h4, h5, h6, div.content, td").each((_i, el) => {
		const text = $(el).text().trim();
		if (text.length > 0) {
			paragraphs.push(text);
		}
	});

	if (paragraphs.length === 0) {
		// Fallback: get all text
		return $.root().text().trim();
	}

	return paragraphs.join("\n\n");
}

function splitBySectionPattern(text: string): Result<readonly RawSection[]> {
	const sections: RawSection[] = [];

	// Try splitting on common legislative patterns
	const patterns = [
		// "Article 1", "Article 5(1)(a)"
		/(Article\s+\d+[a-z]?(?:\(\d+\)(?:\([a-z]\))?)?)\s*[.—–\-:]\s*(.*?)(?=Article\s+\d+[a-z]?\b|$)/gis,
		// "Section 1", "Section 102"
		/(Section\s+\d+[a-z]?)\s*[.—–\-:]\s*(.*?)(?=Section\s+\d+[a-z]?\b|$)/gis,
		// "Part I", "Part 2"
		/(Part\s+[IVX\d]+)\s*[.—–\-:]\s*(.*?)(?=Part\s+[IVX\d]+\b|$)/gis,
	];

	for (const pattern of patterns) {
		const matches = [...text.matchAll(pattern)];
		if (matches.length >= 2) {
			for (const match of matches) {
				const articleRef = match[1]?.trim() ?? "Unknown";
				const content = match[2]?.trim() ?? "";
				const lines = content.split("\n").filter((l) => l.trim().length > 0);
				const title = lines[0]?.trim() ?? articleRef;
				const body = lines.slice(1).join("\n").trim() || content;

				if (body.length > 0) {
					sections.push({
						rawTitle: title,
						rawArticle: articleRef,
						rawContent: body,
					});
				}
			}
			return { ok: true, value: sections };
		}
	}

	// No pattern matched — return whole text as one section
	if (text.trim().length > 0) {
		sections.push({
			rawTitle: "Full Text",
			rawArticle: "Full Text",
			rawContent: text.trim(),
		});
	}

	return { ok: true, value: sections };
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ─── Parser Registry ─────────────────────────────────────────────────────────

const PARSER_MAP: Readonly<Record<string, ParsingStrategy>> = {
	"eurlex-eu-ai-act": createEuParser(),
	"eurlex-gdpr": createEuParser(),
	"uk-legislation": createUkParser(),
	"us-congress": createUsParser(),
	"us-ca-legislature": createUsParser(),
	"sg-statutes": createGenericHtmlParser(),
	"cn-cac-genai": createGenericHtmlParser(),
	"br-legislation": createGenericHtmlParser(),
};

function getParser(sourceId: string): ParsingStrategy {
	return PARSER_MAP[sourceId] ?? createGenericHtmlParser();
}

// ─── Topic Auto-Tagger ──────────────────────────────────────────────────────
// Assigns topic tags to a section based on keyword matching.
// Deterministic — no LLM.

const TOPIC_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
	"prohibited-practices": ["prohibit", "ban", "forbidden", "unacceptable risk"],
	"high-risk": ["high-risk", "high risk", "annex iii"],
	"risk-classification": ["risk classification", "risk category", "risk level", "risk tier"],
	"risk-management": ["risk management system", "risk management framework"],
	transparency: ["transparency", "transparent", "disclose", "disclosure", "inform the user"],
	gpai: ["general-purpose ai", "general purpose ai", "gpai"],
	"foundation-model": ["foundation model", "frontier model"],
	"systemic-risk": ["systemic risk", "systemic impact"],
	"automated-decision-making": [
		"automated decision",
		"automated individual",
		"solely on automated processing",
	],
	profiling: ["profiling", "profile"],
	"data-subject-rights": [
		"right of access",
		"right to erasure",
		"data portability",
		"rectification",
		"right to object",
	],
	consent: ["consent", "opt-in", "opt-out"],
	dpia: ["impact assessment", "dpia", "data protection impact"],
	enforcement: [
		"penalty",
		"fine",
		"enforcement",
		"infringement",
		"sanction",
		"administrative fine",
	],
	"human-oversight": ["human oversight", "human-in-the-loop", "human intervention", "human review"],
	"credit-scoring": ["credit scor", "creditworthiness", "credit assessment"],
	"financial-services": ["financial institution", "banking", "insurance", "investment"],
	"insurance-risk": ["insurance risk", "insurance pricing"],
	"generative-ai": [
		"generative ai",
		"generative artificial intelligence",
		"genai",
		"gen ai",
		"large language model",
	],
	"algorithm-filing": ["algorithm filing", "algorithm registration", "algorithm record"],
	"content-labeling": ["content label", "watermark", "ai-generated content", "synthetic content"],
	"training-data": ["training data", "training dataset", "fine-tun", "training corpus"],
	"copyright-compliance": ["copyright", "intellectual property", "copyright policy"],
	biometric: ["biometric", "facial recognition", "fingerprint", "voice recognition"],
	"social-scoring": ["social scoring", "social credit"],
	"subliminal-manipulation": ["subliminal", "manipulative technique", "deceptive technique"],
	"emotion-recognition": ["emotion recognition", "emotion detection"],
	"deep-synthesis": ["deep synthesis", "deepfake", "deep fake", "synthetic media"],
	"technical-documentation": ["technical documentation", "system documentation"],
	"conformity-assessment": ["conformity assessment", "conformity evaluation"],
	"data-governance": ["data governance", "data quality", "data management"],
	"record-keeping": ["record-keeping", "record keeping", "logging"],
	"ai-generated-content": ["ai-generated", "artificially generated", "machine-generated"],
	"deepfake-labeling": ["deepfake", "deep fake", "synthetic media"],
	employment: ["employment", "worker", "recruitment", "hiring", "employee"],
	education: ["education", "student", "academic", "school"],
	"law-enforcement": ["law enforcement", "police", "criminal justice"],
	"essential-services": ["essential services", "public services", "social protection"],
	"data-transfers": ["data transfer", "cross-border", "adequacy decision", "standard contractual"],
	"personal-data": ["personal data", "personal information", "pii"],
	"agentic-ai": ["agentic", "autonomous agent", "agent system", "tool use"],
	"model-risk-management": ["model risk", "model validation", "model governance"],
};

export function assignTopics(title: string, content: string): readonly string[] {
	const combined = `${title.toLowerCase()} ${content.toLowerCase()}`;
	const matched: string[] = [];

	for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
		if (keywords.some((kw) => combined.includes(kw))) {
			matched.push(topic);
		}
	}

	// Only return topics that exist in the canonical taxonomy
	return matched.filter((t) => TOPIC_TAXONOMY.includes(t));
}

// ─── Section ID Generator ────────────────────────────────────────────────────

export function generateSectionId(sourceId: string, article: string): string {
	const slug = article
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return `${sourceId}-${slug}`;
}

// ─── Markdown Formatter ──────────────────────────────────────────────────────
// Produces markdown matching existing provision format.

export function formatProvisionMarkdown(
	section: ProcessedSection,
	lawName: string,
	effectiveDate?: string,
): string {
	const lines: string[] = [];
	lines.push(`# ${section.title}`);
	lines.push("");
	lines.push(`**Law**: ${lawName}`);
	lines.push(`**Article**: ${section.article}`);
	if (effectiveDate) {
		lines.push(`**Effective**: ${effectiveDate}`);
	}
	lines.push("");
	lines.push("## Overview");
	lines.push("");
	lines.push(section.content);
	lines.push("");
	return lines.join("\n");
}

// ─── Build Manifest ──────────────────────────────────────────────────────────

export function buildManifest(
	sourceId: string,
	lawName: string,
	jurisdiction: string,
	sections: readonly ProcessedSection[],
): ProvisionManifest {
	return {
		id: sourceId,
		law: lawName,
		jurisdiction,
		lastUpdated: new Date().toISOString().split("T")[0] ?? "",
		sections: sections.map((s) => ({
			id: s.id,
			title: s.title,
			article: s.article,
			file: `${s.id.replace(`${sourceId}-`, "")}.md`,
			topics: [...s.topics],
		})),
	};
}

// ─── Process a Fetched Regulation ────────────────────────────────────────────

export function processRegulation(
	fetched: FetchedRegulation,
	source: RegulationSourceConfig,
): Result<ProcessedRegulation> {
	const parser = getParser(fetched.sourceId);

	const splitResult = parser.splitIntoSections(fetched.rawContent, fetched.format);
	if (!splitResult.ok) {
		return splitResult;
	}

	const sections: ProcessedSection[] = splitResult.value.map((raw) => {
		const id = generateSectionId(source.id, raw.rawArticle);
		const topics = assignTopics(raw.rawTitle, raw.rawContent);
		return {
			id,
			title: raw.rawTitle,
			article: raw.rawArticle,
			content: raw.rawContent,
			topics,
		};
	});

	const manifest = buildManifest(source.id, source.name, source.jurisdiction, sections);

	return {
		ok: true,
		value: {
			sourceId: source.id,
			processedAt: new Date().toISOString(),
			manifest,
			sections,
		},
	};
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateProcessedRegulation(processed: ProcessedRegulation): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	// Check: at least one section
	if (processed.sections.length === 0) {
		errors.push({
			sectionId: "manifest",
			message: "No sections were extracted from the regulation",
			severity: "error",
		});
	}

	for (const section of processed.sections) {
		// Check: section has content
		if (section.content.trim().length === 0) {
			errors.push({
				sectionId: section.id,
				message: `Section "${section.title}" has empty content`,
				severity: "error",
			});
		}

		// Check: section has at least one topic tag
		if (section.topics.length === 0) {
			warnings.push({
				sectionId: section.id,
				message: `Section "${section.title}" has no topic tags`,
				suggestion: "Manual topic assignment needed during review",
			});
		}

		// Check: section title is not empty
		if (section.title.trim().length === 0) {
			errors.push({
				sectionId: section.id,
				message: "Section has empty title",
				severity: "error",
			});
		}

		// Check: content length sanity (warn if suspiciously short)
		if (section.content.trim().length > 0 && section.content.trim().length < 50) {
			warnings.push({
				sectionId: section.id,
				message: `Section "${section.title}" content is very short (${section.content.trim().length} chars)`,
				suggestion: "May indicate parsing failure — verify content is complete",
			});
		}

		// Check: no HTML artifacts remain in markdown
		if (/<[a-z][\s\S]*?>/i.test(section.content)) {
			warnings.push({
				sectionId: section.id,
				message: `Section "${section.title}" may contain residual HTML tags`,
				suggestion: "Review and clean HTML artifacts from markdown output",
			});
		}
	}

	// Check: manifest sections match processed sections
	const manifestIds = new Set(processed.manifest.sections.map((s) => s.id));
	const sectionIds = new Set(processed.sections.map((s) => s.id));

	for (const id of sectionIds) {
		if (!manifestIds.has(id)) {
			errors.push({
				sectionId: id,
				message: `Section "${id}" exists in processed output but not in manifest`,
				severity: "error",
			});
		}
	}

	return {
		isValid: errors.filter((e) => e.severity === "error").length === 0,
		errors,
		warnings,
	};
}

// ─── Write Processed Output ─────────────────────────────────────────────────

export async function writeProcessedOutput(
	processed: ProcessedRegulation,
	source: RegulationSourceConfig,
	snapshotDate?: string,
): Promise<Result<string>> {
	const date = snapshotDate ?? currentSnapshotDate();
	const knowledgePath = SOURCE_TO_KNOWLEDGE_PATH[source.id];
	if (!knowledgePath) {
		return {
			ok: false,
			error: new Error(`No knowledge path mapping for source ${source.id}`),
		};
	}

	const processedDir = join(getSnapshotsDir(), date, "processed", knowledgePath);

	try {
		await mkdir(processedDir, { recursive: true });

		// Write manifest
		await writeFile(
			join(processedDir, "manifest.json"),
			JSON.stringify(processed.manifest, null, "\t"),
			"utf-8",
		);

		// Write section files
		for (const section of processed.sections) {
			const filename = `${section.id.replace(`${source.id}-`, "")}.md`;
			const markdown = formatProvisionMarkdown(section, source.name);
			await writeFile(join(processedDir, filename), markdown, "utf-8");
		}

		return { ok: true, value: processedDir };
	} catch (error: unknown) {
		return {
			ok: false,
			error: new Error(
				`Failed to write processed output: ${error instanceof Error ? error.message : String(error)}`,
			),
		};
	}
}
