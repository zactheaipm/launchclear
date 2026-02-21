import type { Citation } from "../core/types.js";

// ─── Article Range Definition ─────────────────────────────────────────────────

interface ArticleRange {
	readonly min: number;
	readonly max: number;
	readonly allowSubArticles: boolean;
}

interface LawValidationEntry {
	readonly articleRanges: readonly ArticleRange[];
	readonly allowAnnexes?: readonly string[];
	readonly wholeActOnly?: boolean;
}

// ─── Known Articles Registry ──────────────────────────────────────────────────
//
// Maps law identifiers (as used by extractCitations in filler.ts) to their
// valid article/section ranges. This enables deterministic post-generation
// validation: if an LLM cites "Article 120 GDPR", we can flag it because
// GDPR only has Articles 1–99.

export const KNOWN_ARTICLES: Readonly<Record<string, LawValidationEntry>> = {
	"GDPR (EU) 2016/679": {
		articleRanges: [{ min: 1, max: 99, allowSubArticles: true }],
	},
	"EU AI Act (EU) 2024/1689": {
		articleRanges: [{ min: 1, max: 113, allowSubArticles: true }],
		allowAnnexes: [
			"I",
			"II",
			"III",
			"IV",
			"V",
			"VI",
			"VII",
			"VIII",
			"IX",
			"X",
			"XI",
			"XII",
			"XIII",
		],
	},
	"FTC Act": {
		articleRanges: [{ min: 1, max: 5, allowSubArticles: true }],
	},
	"CCPA/CPRA": {
		articleRanges: [{ min: 1798100, max: 1798199, allowSubArticles: true }],
	},
	"California SB 942": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"China CAC GenAI Measures": {
		articleRanges: [{ min: 1, max: 24, allowSubArticles: true }],
	},
	"NYC Local Law 144": {
		wholeActOnly: true,
		articleRanges: [],
	},
	LGPD: {
		articleRanges: [{ min: 1, max: 65, allowSubArticles: true }],
	},
	PDPA: {
		wholeActOnly: true,
		articleRanges: [],
	},
	"UK DPA 2018": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"China Deep Synthesis Provisions": {
		articleRanges: [{ min: 1, max: 25, allowSubArticles: true }],
	},
	"China Recommendation Algorithm Provisions": {
		articleRanges: [{ min: 1, max: 40, allowSubArticles: true }],
	},
	"IMDA GenAI Governance Framework": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"IMDA Agentic AI Framework": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"MAS AI Risk Management Guidelines": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"UK AISI Frontier Model Framework": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"Colorado AI Act": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"NIST AI RMF": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"NIST AI 600-1": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"Illinois BIPA": {
		articleRanges: [{ min: 1, max: 25, allowSubArticles: true }],
	},
	"Illinois AI Video Interview Act": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"Texas TRAIGA": {
		wholeActOnly: true,
		articleRanges: [],
	},
	"UK GDPR": {
		articleRanges: [{ min: 1, max: 99, allowSubArticles: true }],
	},
	"Brazil AI Bill": {
		wholeActOnly: true,
		articleRanges: [],
	},
	PIPL: {
		articleRanges: [{ min: 1, max: 74, allowSubArticles: true }],
	},
};

// ─── Article Number Parsing ───────────────────────────────────────────────────

interface ParsedArticle {
	readonly kind: "article" | "section" | "annex" | "unparsed";
	readonly number?: number;
	readonly annexNumeral?: string;
}

function parseArticle(articleField: string): ParsedArticle {
	// Match "Article 35", "Article 35(1)", "Article 35(3)(a)", "Articles 13-14"
	const articleMatch = /Articles?\s+(\d+)/i.exec(articleField);
	if (articleMatch) {
		return { kind: "article", number: Number(articleMatch[1]) };
	}

	// Match "Section 1798.140", "Section 5"
	const sectionMatch = /Section\s+([\d.]+)/i.exec(articleField);
	if (sectionMatch) {
		// Handle dotted sections like 1798.140 — normalize to integer by removing dots
		const raw = sectionMatch[1] as string;
		const normalized = Number(raw.replace(/\./g, ""));
		return { kind: "section", number: normalized };
	}

	// Match "Annex III", "Annex III §5"
	const annexMatch = /Annex\s+([IVXLCDM]+)/i.exec(articleField);
	if (annexMatch) {
		return { kind: "annex", annexNumeral: annexMatch[1] as string };
	}

	return { kind: "unparsed" };
}

// ─── Validation Result ────────────────────────────────────────────────────────

export interface CitationValidationResult {
	readonly valid: boolean;
	readonly note?: string;
}

// ─── Single Citation Validation ───────────────────────────────────────────────

export function validateCitation(citation: Citation): CitationValidationResult {
	const entry = KNOWN_ARTICLES[citation.law];

	if (!entry) {
		return {
			valid: false,
			note: "UNVERIFIED — law not in validation registry",
		};
	}

	// Whole-act laws accept any article reference — we can't range-check
	if (entry.wholeActOnly) {
		return { valid: true };
	}

	const parsed = parseArticle(citation.article);

	// If we couldn't parse the article reference at all, flag it
	if (parsed.kind === "unparsed") {
		return {
			valid: false,
			note: "UNVERIFIED — article number out of known range",
		};
	}

	// Annex references
	if (parsed.kind === "annex") {
		if (entry.allowAnnexes && parsed.annexNumeral) {
			const isKnownAnnex = entry.allowAnnexes.includes(parsed.annexNumeral);
			if (isKnownAnnex) {
				return { valid: true };
			}
			return {
				valid: false,
				note: "UNVERIFIED — article number out of known range",
			};
		}
		return {
			valid: false,
			note: "UNVERIFIED — article number out of known range",
		};
	}

	// Article / Section number range check
	if (parsed.number === undefined) {
		return {
			valid: false,
			note: "UNVERIFIED — article number out of known range",
		};
	}

	const inRange = entry.articleRanges.some(
		(range) =>
			parsed.number !== undefined && parsed.number >= range.min && parsed.number <= range.max,
	);

	if (!inRange) {
		return {
			valid: false,
			note: "UNVERIFIED — article number out of known range",
		};
	}

	return { valid: true };
}

// ─── Bulk Citation Validation ─────────────────────────────────────────────────

export interface BulkValidationResult {
	readonly validatedCitations: readonly Citation[];
	readonly unverifiedNotes: readonly string[];
}

export function validateCitations(citations: readonly Citation[]): BulkValidationResult {
	const unverifiedNotes: string[] = [];

	for (const citation of citations) {
		const result = validateCitation(citation);
		if (!result.valid && result.note) {
			unverifiedNotes.push(`${citation.law} ${citation.article}: ${result.note}`);
		}
	}

	return {
		validatedCitations: citations,
		unverifiedNotes,
	};
}

// ─── Flag Unverified Citations in Review Notes ────────────────────────────────

export function flagUnverifiedCitations(
	citations: readonly Citation[],
	reviewNotes: readonly string[],
): readonly string[] {
	const { unverifiedNotes } = validateCitations(citations);

	if (unverifiedNotes.length === 0) {
		return reviewNotes;
	}

	const warnings: string[] = [
		`WARNING: ${unverifiedNotes.length} citation(s) could not be verified against the known articles registry:`,
		...unverifiedNotes.map((note) => `  - ${note}`),
	];

	return [...reviewNotes, ...warnings];
}
