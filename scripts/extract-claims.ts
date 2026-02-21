import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

// ── Types ──────────────────────────────────────────────────────────────────

type ClaimType =
	| "article-number"
	| "effective-date"
	| "threshold"
	| "fine-amount"
	| "document-number"
	| "case-citation"
	| "organization";

interface ExtractedClaim {
	file: string;
	line: number;
	claimType: ClaimType;
	claimText: string;
	context: string;
	citationKey: null;
	verified: false;
}

interface ClaimPattern {
	type: ClaimType;
	regex: RegExp;
}

// ── Patterns ───────────────────────────────────────────────────────────────

const CLAIM_PATTERNS: ClaimPattern[] = [
	// article-number
	{
		type: "article-number",
		regex: /Articles?\s+\d+[-–]\d+/g,
	},
	{
		type: "article-number",
		regex: /Article\s+\d+(\(\d+\)(\([a-z]\))?)?/g,
	},
	{
		type: "article-number",
		regex: /Section\s+\d+(\(\w+\))?/g,
	},
	{
		type: "article-number",
		regex: /§+\s*\d+/g,
	},

	// effective-date (day month year)
	{
		type: "effective-date",
		regex:
			/\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/g,
	},
	// effective-date (month day, year)
	{
		type: "effective-date",
		regex:
			/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/g,
	},
	// effective-date (ISO)
	{
		type: "effective-date",
		regex: /\d{4}-\d{2}-\d{2}/g,
	},

	// threshold — FLOPs with caret notation
	{
		type: "threshold",
		regex: /\d+[\^]\d+\s+FLOPs?/g,
	},
	// threshold — EUR amounts with magnitude
	{
		type: "threshold",
		regex: /EUR\s+[\d,.]+\s*(?:million|billion)?/g,
	},
	// threshold — percentage of turnover
	{
		type: "threshold",
		regex: /\d+%\s+of\s+[^\n.;]{1,60}turnover/g,
	},

	// fine-amount — currency code + amount
	{
		type: "fine-amount",
		regex: /(?:EUR|USD|GBP|SGD|RMB|BRL)\s+[\d,.]+(?:\s*(?:million|billion))?/g,
	},
	// fine-amount — dollar sign + amount
	{
		type: "fine-amount",
		regex: /\$[\d,.]+\s*(?:million|billion)?/g,
	},

	// document-number
	{
		type: "document-number",
		regex: /Regulation\s*\(EU\)\s*\d+\/\d+/g,
	},
	{
		type: "document-number",
		regex: /SB\s+\d+/g,
	},
	{
		type: "document-number",
		regex: /PL\s+\d+\/\d+/g,
	},
	{
		type: "document-number",
		regex: /LL\s*\d+/g,
	},
	{
		type: "document-number",
		regex: /HB\s*\d+/g,
	},

	// case-citation
	{
		type: "case-citation",
		regex: /SAN-\d+-\d+/g,
	},

	// organization — bold authorities or parenthetical acronyms in header
	// metadata lines (lines starting with **Key Authority** or similar)
	{
		type: "organization",
		regex:
			/\*\*(?:Key\s+)?(?:Authority|Regulator|Enforc(?:er|ement\s+Body)|Agency|Supervisory\s+Authority|Commission)\*\*[:\s]+([^\n]+)/g,
	},
];

// ── Helpers ────────────────────────────────────────────────────────────────

function collectMdFiles(dir: string): string[] {
	const results: string[] = [];
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return results;
	}
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		let stat: ReturnType<typeof statSync> | undefined;
		try {
			stat = statSync(fullPath);
		} catch {
			continue;
		}
		if (!stat) continue;
		if (stat.isDirectory()) {
			results.push(...collectMdFiles(fullPath));
		} else if (entry.endsWith(".md")) {
			results.push(fullPath);
		}
	}
	return results;
}

function stripFrontmatter(content: string): { body: string; skippedLines: number } {
	const lines = content.split("\n");
	if (lines.length === 0 || lines[0].trim() !== "---") {
		return { body: content, skippedLines: 0 };
	}
	// Find the closing --- (second occurrence)
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === "---") {
			const bodyLines = lines.slice(i + 1);
			return {
				body: bodyLines.join("\n"),
				skippedLines: i + 1,
			};
		}
	}
	// No closing --- found — treat entire content as body (malformed frontmatter)
	return { body: content, skippedLines: 0 };
}

function buildContext(lineText: string, matchIndex: number, matchLength: number): string {
	const start = Math.max(0, matchIndex - 30);
	const end = Math.min(lineText.length, matchIndex + matchLength + 30);
	const prefix = start > 0 ? "..." : "";
	const suffix = end < lineText.length ? "..." : "";
	return prefix + lineText.slice(start, end) + suffix;
}

function getJurisdictionFolder(filePath: string): string {
	// Extract the first directory component under provisions/
	// e.g., "eu/ai-act/foo.md" → "eu"
	const parts = filePath.split(sep);
	return parts[0] ?? "unknown";
}

// ── Main ───────────────────────────────────────────────────────────────────

function main(): void {
	const projectRoot = join(import.meta.dirname, "..");
	const provisionsDir = join(projectRoot, "knowledge", "provisions");
	const auditDir = join(projectRoot, "audit");
	const outputPath = join(auditDir, "extracted-claims.json");

	const mdFiles = collectMdFiles(provisionsDir);

	if (mdFiles.length === 0) {
		console.log("No .md files found under knowledge/provisions/");
		return;
	}

	const allClaims: ExtractedClaim[] = [];
	const typeCounts: Record<ClaimType, number> = {
		"article-number": 0,
		"effective-date": 0,
		threshold: 0,
		"fine-amount": 0,
		"document-number": 0,
		"case-citation": 0,
		organization: 0,
	};
	const jurisdictionCounts: Record<string, number> = {};

	for (const filePath of mdFiles) {
		const rawContent = readFileSync(filePath, "utf-8");
		const relPath = relative(provisionsDir, filePath);
		const jurisdictionFolder = getJurisdictionFolder(relPath);

		const { body, skippedLines } = stripFrontmatter(rawContent);
		const bodyLines = body.split("\n");

		for (let lineIdx = 0; lineIdx < bodyLines.length; lineIdx++) {
			const lineText = bodyLines[lineIdx];
			const absoluteLineNumber = skippedLines + lineIdx + 1; // 1-indexed

			for (const pattern of CLAIM_PATTERNS) {
				// Reset regex lastIndex for global regexes
				const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
				let match: RegExpExecArray | null = regex.exec(lineText);

				while (match !== null) {
					// For the organization pattern, extract the captured group
					let claimText: string;
					if (pattern.type === "organization" && match[1]) {
						claimText = match[1].trim();
					} else {
						claimText = match[0];
					}

					const context = buildContext(lineText, match.index, match[0].length);

					const claim: ExtractedClaim = {
						file: relPath,
						line: absoluteLineNumber,
						claimType: pattern.type,
						claimText,
						context,
						citationKey: null,
						verified: false,
					};

					allClaims.push(claim);
					typeCounts[pattern.type]++;
					jurisdictionCounts[jurisdictionFolder] =
						(jurisdictionCounts[jurisdictionFolder] ?? 0) + 1;
					match = regex.exec(lineText);
				}
			}
		}
	}

	// Deduplicate claims that appear at the same file+line+claimText
	// (possible when multiple patterns match overlapping text)
	const seen = new Set<string>();
	const deduped: ExtractedClaim[] = [];
	for (const claim of allClaims) {
		const key = `${claim.file}:${claim.line}:${claim.claimType}:${claim.claimText}`;
		if (!seen.has(key)) {
			seen.add(key);
			deduped.push(claim);
		}
	}

	// Recalculate counts after dedup
	const finalTypeCounts: Record<ClaimType, number> = {
		"article-number": 0,
		"effective-date": 0,
		threshold: 0,
		"fine-amount": 0,
		"document-number": 0,
		"case-citation": 0,
		organization: 0,
	};
	const finalJurisdictionCounts: Record<string, number> = {};
	for (const claim of deduped) {
		finalTypeCounts[claim.claimType]++;
		const jur = getJurisdictionFolder(claim.file);
		finalJurisdictionCounts[jur] = (finalJurisdictionCounts[jur] ?? 0) + 1;
	}

	// Write output
	mkdirSync(auditDir, { recursive: true });
	writeFileSync(outputPath, JSON.stringify(deduped, null, "\t"), "utf-8");

	// Print summary
	console.log("\n=== LaunchClear Claim Extraction ===\n");
	console.log(`Files scanned:  ${mdFiles.length}`);
	console.log(`Total claims:   ${deduped.length}`);
	if (deduped.length < allClaims.length) {
		console.log(`Duplicates removed: ${allClaims.length - deduped.length}`);
	}
	console.log("\n--- By Claim Type ---");
	for (const [type, count] of Object.entries(finalTypeCounts).sort((a, b) => b[1] - a[1])) {
		if (count > 0) {
			console.log(`  ${type.padEnd(20)} ${count}`);
		}
	}
	console.log("\n--- By Jurisdiction ---");
	for (const [jur, count] of Object.entries(finalJurisdictionCounts).sort((a, b) => b[1] - a[1])) {
		console.log(`  ${jur.padEnd(20)} ${count}`);
	}
	console.log(`\nOutput written to: ${relative(projectRoot, outputPath)}`);
}

main();
