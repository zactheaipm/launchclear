/**
 * generate-audit-report.ts
 *
 * Generates a comprehensive audit report for the LaunchClear knowledge base.
 * Reads outputs from verify-urls.ts and extract-claims.ts, scans provision
 * files and enforcement cases, and produces both markdown and JSON reports.
 *
 * Run with: npx tsx scripts/generate-audit-report.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerificationStatus = "unverified" | "in-review" | "verified" | "disputed";

interface UrlEntry {
	url: string;
	status: number | null;
	ok: boolean;
	redirected?: boolean;
	finalUrl?: string;
	error?: string;
	file?: string;
	line?: number;
}

interface UrlReport {
	total: number;
	ok: number;
	failed: number;
	urls: UrlEntry[];
}

interface ExtractedClaim {
	file: string;
	line?: number;
	text: string;
	citationKey: string | null;
	jurisdiction?: string;
}

/**
 * Raw claim format as produced by extract-claims.ts.
 * The file may be either:
 *   - A flat array of claim objects (actual current format)
 *   - A wrapper object with { total, claims } fields (anticipated format)
 */
interface RawClaimEntry {
	file: string;
	line?: number;
	claimText?: string;
	text?: string;
	citationKey?: string | null;
	jurisdiction?: string;
	claimType?: string;
	context?: string;
	verified?: boolean;
}

interface EnforcementCase {
	id?: string;
	title?: string;
	jurisdiction?: string;
	url?: string;
	urls?: string[];
	verification?: {
		status: VerificationStatus;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

interface ProvisionFileInfo {
	path: string;
	relativePath: string;
	jurisdiction: string;
	id: string | null;
	verificationStatus: VerificationStatus;
	claimCount: number;
	urlIssues: string[];
}

interface JurisdictionSummary {
	jurisdiction: string;
	fileCount: number;
	claimCount: number;
	byStatus: Record<VerificationStatus, number>;
}

interface CriticalFlag {
	category: string;
	description: string;
	file?: string;
	url?: string;
}

interface WarningFlag {
	category: string;
	description: string;
	file?: string;
	url?: string;
}

interface AuditSummary {
	totalProvisionFiles: number;
	totalEnforcementCases: number;
	totalUrls: number;
	totalClaims: number;
	byVerificationStatus: Record<VerificationStatus, number>;
}

interface AuditReport {
	generatedAt: string;
	summary: AuditSummary;
	criticalFlags: CriticalFlag[];
	warningFlags: WarningFlag[];
	jurisdictionSummaries: JurisdictionSummary[];
	fileDetails: ProvisionFileInfo[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dirname, "..");
const AUDIT_DIR = join(ROOT, "audit");
const PROVISIONS_DIR = join(ROOT, "knowledge", "provisions");
const ENFORCEMENT_PATH = join(ROOT, "knowledge", "enforcement", "cases.json");

function ensureDir(dir: string): void {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

function readJsonSafe<T>(path: string): T | null {
	if (!existsSync(path)) {
		return null;
	}
	try {
		const raw = readFileSync(path, "utf-8");
		return JSON.parse(raw) as T;
	} catch {
		console.warn(`  Warning: could not parse ${relative(ROOT, path)}`);
		return null;
	}
}

/**
 * Load claims from extracted-claims.json, handling both formats:
 *   - Flat array of claim objects (current format from extract-claims.ts)
 *   - Wrapper object with { total, claims } (anticipated future format)
 * Normalizes to a consistent ExtractedClaim[] array.
 */
function loadClaims(path: string): ExtractedClaim[] | null {
	if (!existsSync(path)) {
		return null;
	}
	try {
		const raw = readFileSync(path, "utf-8");
		const parsed: unknown = JSON.parse(raw);

		let entries: RawClaimEntry[];
		if (Array.isArray(parsed)) {
			// Flat array format (current)
			entries = parsed as RawClaimEntry[];
		} else if (
			parsed !== null &&
			typeof parsed === "object" &&
			"claims" in parsed &&
			Array.isArray((parsed as Record<string, unknown>).claims)
		) {
			// Wrapper object format (future)
			entries = (parsed as Record<string, unknown>).claims as RawClaimEntry[];
		} else {
			console.warn(`  Warning: unexpected format in ${relative(ROOT, path)}`);
			return null;
		}

		return entries.map((entry) => ({
			file: entry.file,
			line: entry.line,
			text: entry.claimText ?? entry.text ?? "",
			citationKey: entry.citationKey ?? null,
			jurisdiction: entry.jurisdiction,
		}));
	} catch {
		console.warn(`  Warning: could not parse ${relative(ROOT, path)}`);
		return null;
	}
}

/**
 * Recursively collect all .md files under a directory.
 */
function collectMarkdownFiles(dir: string): string[] {
	const results: string[] = [];
	if (!existsSync(dir)) {
		return results;
	}
	const entries = readdirSync(dir);
	for (const entry of entries) {
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) {
			results.push(...collectMarkdownFiles(full));
		} else if (entry.endsWith(".md")) {
			results.push(full);
		}
	}
	return results;
}

/**
 * Extract id and verification.status from YAML frontmatter using regex.
 * Frontmatter is the content between the first two `---` markers.
 */
function parseFrontmatter(content: string): {
	id: string | null;
	verificationStatus: VerificationStatus;
} {
	const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!fmMatch) {
		return { id: null, verificationStatus: "unverified" };
	}
	const fm = fmMatch[1];

	const idMatch = fm.match(/^id:\s*["']?([^"'\n]+)["']?\s*$/m);
	const id = idMatch ? idMatch[1].trim() : null;

	const statusMatch = fm.match(/status:\s*["']?(unverified|in-review|verified|disputed)["']?/);
	const verificationStatus: VerificationStatus = statusMatch
		? (statusMatch[1] as VerificationStatus)
		: "unverified";

	return { id, verificationStatus };
}

/**
 * Derive the jurisdiction name from a provision file path.
 * e.g. knowledge/provisions/eu/ai-act/foo.md -> "eu"
 *      knowledge/provisions/us/states/california/bar.md -> "us/states/california"
 *      knowledge/provisions/singapore/baz.md -> "singapore"
 */
function deriveJurisdiction(filePath: string): string {
	const rel = relative(PROVISIONS_DIR, filePath);
	const parts = rel.split("/");
	// For us/states/<state>, keep three levels. For us/federal, keep two.
	// For everything else, keep the first level.
	if (parts[0] === "us" && parts[1] === "states" && parts.length >= 3) {
		return `${parts[0]}/${parts[1]}/${parts[2]}`;
	}
	if (parts[0] === "us" && parts[1] === "federal") {
		return `${parts[0]}/${parts[1]}`;
	}
	if (parts.length >= 2 && statSync(join(PROVISIONS_DIR, parts[0], parts[1])).isDirectory?.()) {
		// e.g. eu/ai-act, eu/gdpr — keep two levels
		return `${parts[0]}/${parts[1]}`;
	}
	return parts[0];
}

function safeJurisdiction(filePath: string): string {
	try {
		return deriveJurisdiction(filePath);
	} catch {
		const rel = relative(PROVISIONS_DIR, filePath);
		return rel.split("/")[0];
	}
}

/**
 * Check if a URL looks like a generic homepage (no path beyond /).
 */
function isGenericHomepageUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.pathname === "/" || parsed.pathname === "";
	} catch {
		return false;
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
	console.log("LaunchClear Knowledge Base Audit Report Generator");
	console.log("=".repeat(52));
	console.log();

	ensureDir(AUDIT_DIR);

	// 1. Read inputs
	console.log("Reading inputs...");

	const urlReport = readJsonSafe<UrlReport>(join(AUDIT_DIR, "url-report.json"));
	if (urlReport) {
		console.log(`  url-report.json: ${urlReport.total} URLs`);
	} else {
		console.log("  url-report.json: not found, skipping URL analysis");
	}

	const claims = loadClaims(join(AUDIT_DIR, "extracted-claims.json"));
	if (claims) {
		console.log(`  extracted-claims.json: ${claims.length} claims`);
	} else {
		console.log("  extracted-claims.json: not found, skipping claims analysis");
	}

	const enforcementCases = readJsonSafe<EnforcementCase[]>(ENFORCEMENT_PATH);
	if (enforcementCases) {
		console.log(`  cases.json: ${enforcementCases.length} enforcement cases`);
	} else {
		console.log("  cases.json: not found, skipping enforcement analysis");
	}

	const provisionFiles = collectMarkdownFiles(PROVISIONS_DIR);
	console.log(`  Provision .md files: ${provisionFiles.length}`);
	console.log();

	// 2. Build per-file details
	console.log("Analyzing provision files...");

	// Index URL issues by file for quick lookup
	const urlIssuesByFile = new Map<string, string[]>();
	if (urlReport) {
		for (const entry of urlReport.urls) {
			if (!entry.ok && entry.file) {
				const issues = urlIssuesByFile.get(entry.file) ?? [];
				issues.push(
					`Dead URL: ${entry.url} (status: ${entry.status ?? "error"}, ${entry.error ?? "failed"})`,
				);
				urlIssuesByFile.set(entry.file, issues);
			}
		}
	}

	// Index claims by file
	const claimsByFile = new Map<string, ExtractedClaim[]>();
	if (claims) {
		for (const claim of claims) {
			const list = claimsByFile.get(claim.file) ?? [];
			list.push(claim);
			claimsByFile.set(claim.file, list);
		}
	}

	const fileDetails: ProvisionFileInfo[] = [];
	for (const filePath of provisionFiles) {
		const content = readFileSync(filePath, "utf-8");
		const { id, verificationStatus } = parseFrontmatter(content);
		const relPath = relative(ROOT, filePath);
		const relFromProvisions = relative(PROVISIONS_DIR, filePath);
		const jurisdiction = safeJurisdiction(filePath);

		// Claims files may reference paths relative to ROOT, relative to
		// provisions dir, or as absolute paths. Check all variants.
		const fileClaims =
			claimsByFile.get(relPath) ??
			claimsByFile.get(relFromProvisions) ??
			claimsByFile.get(filePath) ??
			[];

		const fileUrlIssues =
			urlIssuesByFile.get(relPath) ??
			urlIssuesByFile.get(relFromProvisions) ??
			urlIssuesByFile.get(filePath) ??
			[];

		fileDetails.push({
			path: filePath,
			relativePath: relPath,
			jurisdiction,
			id,
			verificationStatus,
			claimCount: fileClaims.length,
			urlIssues: fileUrlIssues,
		});
	}

	// 3. Build jurisdiction summaries
	console.log("Building jurisdiction summaries...");

	const jurisdictionMap = new Map<string, JurisdictionSummary>();
	for (const fd of fileDetails) {
		let js = jurisdictionMap.get(fd.jurisdiction);
		if (!js) {
			js = {
				jurisdiction: fd.jurisdiction,
				fileCount: 0,
				claimCount: 0,
				byStatus: {
					unverified: 0,
					"in-review": 0,
					verified: 0,
					disputed: 0,
				},
			};
			jurisdictionMap.set(fd.jurisdiction, js);
		}
		js.fileCount++;
		js.claimCount += fd.claimCount;
		js.byStatus[fd.verificationStatus]++;
	}
	const jurisdictionSummaries = Array.from(jurisdictionMap.values()).sort((a, b) =>
		a.jurisdiction.localeCompare(b.jurisdiction),
	);

	// 4. Build critical flags
	console.log("Identifying critical flags...");

	const criticalFlags: CriticalFlag[] = [];

	// Dead/failed URLs
	if (urlReport) {
		for (const entry of urlReport.urls) {
			if (!entry.ok) {
				criticalFlags.push({
					category: "dead-url",
					description: `URL failed (status: ${entry.status ?? "error"}): ${entry.url}`,
					file: entry.file,
					url: entry.url,
				});
			}
		}
	}

	// Enforcement cases with generic homepage URLs
	if (enforcementCases) {
		for (const ec of enforcementCases) {
			const caseUrls: string[] = [];
			if (ec.url) {
				caseUrls.push(ec.url);
			}
			if (ec.urls) {
				caseUrls.push(...ec.urls);
			}
			for (const u of caseUrls) {
				if (isGenericHomepageUrl(u)) {
					criticalFlags.push({
						category: "generic-enforcement-url",
						description: `Enforcement case "${ec.title ?? ec.id ?? "unknown"}" has generic homepage URL: ${u}`,
						url: u,
					});
				}
			}
		}
	}

	// Duplicate section detection: check for duplicate heading IDs within a file
	for (const fd of fileDetails) {
		const content = readFileSync(fd.path, "utf-8");
		const headings = content.match(/^#{1,6}\s+.+$/gm);
		if (headings) {
			const seen = new Set<string>();
			for (const h of headings) {
				const normalized = h.trim().toLowerCase();
				if (seen.has(normalized)) {
					criticalFlags.push({
						category: "duplicate-section",
						description: `Duplicate heading "${h.trim()}" in file`,
						file: fd.relativePath,
					});
				}
				seen.add(normalized);
			}
		}
	}

	// 5. Build warning flags
	console.log("Identifying warning flags...");

	const warningFlags: WarningFlag[] = [];

	// Generic URLs that resolved OK but point to homepages
	if (urlReport) {
		for (const entry of urlReport.urls) {
			if (entry.ok && isGenericHomepageUrl(entry.url)) {
				warningFlags.push({
					category: "generic-url",
					description: `URL resolved but points to homepage: ${entry.url}`,
					file: entry.file,
					url: entry.url,
				});
			}
		}
	}

	// Claims without citation keys
	if (claims) {
		for (const claim of claims) {
			if (!claim.citationKey) {
				const truncated = claim.text.length > 80 ? `${claim.text.substring(0, 80)}...` : claim.text;
				warningFlags.push({
					category: "uncited-claim",
					description: `Claim without citation key: "${truncated}"`,
					file: claim.file,
				});
			}
		}
	}

	// Files still unverified
	for (const fd of fileDetails) {
		if (fd.verificationStatus === "unverified") {
			warningFlags.push({
				category: "unverified-file",
				description: `Provision file is unverified: ${fd.relativePath}`,
				file: fd.relativePath,
			});
		}
	}

	// 6. Build overall summary
	const byVerificationStatus: Record<VerificationStatus, number> = {
		unverified: 0,
		"in-review": 0,
		verified: 0,
		disputed: 0,
	};
	for (const fd of fileDetails) {
		byVerificationStatus[fd.verificationStatus]++;
	}

	// Also count enforcement cases by status
	let enforcementUnverified = 0;
	let enforcementInReview = 0;
	let enforcementVerified = 0;
	let enforcementDisputed = 0;
	if (enforcementCases) {
		for (const ec of enforcementCases) {
			const status: VerificationStatus = ec.verification?.status ?? "unverified";
			switch (status) {
				case "unverified":
					enforcementUnverified++;
					break;
				case "in-review":
					enforcementInReview++;
					break;
				case "verified":
					enforcementVerified++;
					break;
				case "disputed":
					enforcementDisputed++;
					break;
			}
		}
	}

	const summary: AuditSummary = {
		totalProvisionFiles: provisionFiles.length,
		totalEnforcementCases: enforcementCases?.length ?? 0,
		totalUrls: urlReport?.total ?? 0,
		totalClaims: claims?.length ?? 0,
		byVerificationStatus: {
			unverified: byVerificationStatus.unverified + enforcementUnverified,
			"in-review": byVerificationStatus["in-review"] + enforcementInReview,
			verified: byVerificationStatus.verified + enforcementVerified,
			disputed: byVerificationStatus.disputed + enforcementDisputed,
		},
	};

	const report: AuditReport = {
		generatedAt: new Date().toISOString(),
		summary,
		criticalFlags,
		warningFlags,
		jurisdictionSummaries,
		fileDetails,
	};

	// 7. Write JSON report
	const jsonPath = join(AUDIT_DIR, "audit-report.json");
	writeFileSync(jsonPath, JSON.stringify(report, null, "\t"), "utf-8");
	console.log(`\nWrote ${relative(ROOT, jsonPath)}`);

	// 8. Write Markdown report
	const mdPath = join(AUDIT_DIR, "audit-report.md");
	writeFileSync(mdPath, renderMarkdown(report, enforcementCases), "utf-8");
	console.log(`Wrote ${relative(ROOT, mdPath)}`);

	// 9. Print summary to stdout
	console.log();
	console.log("=".repeat(52));
	console.log("AUDIT SUMMARY");
	console.log("=".repeat(52));
	console.log(`Provision files:    ${summary.totalProvisionFiles}`);
	console.log(`Enforcement cases:  ${summary.totalEnforcementCases}`);
	console.log(`URLs checked:       ${summary.totalUrls}`);
	console.log(`Claims extracted:   ${summary.totalClaims}`);
	console.log();
	console.log("Verification status (provisions + enforcement combined):");
	console.log(`  Verified:    ${summary.byVerificationStatus.verified}`);
	console.log(`  In review:   ${summary.byVerificationStatus["in-review"]}`);
	console.log(`  Unverified:  ${summary.byVerificationStatus.unverified}`);
	console.log(`  Disputed:    ${summary.byVerificationStatus.disputed}`);
	console.log();
	console.log(`Critical flags: ${criticalFlags.length}`);
	console.log(`Warning flags:  ${warningFlags.length}`);

	if (criticalFlags.length > 0) {
		console.log();
		console.log("CRITICAL FLAGS (must fix before production use):");
		for (const cf of criticalFlags.slice(0, 10)) {
			console.log(`  [${cf.category}] ${cf.description}`);
		}
		if (criticalFlags.length > 10) {
			console.log(`  ... and ${criticalFlags.length - 10} more (see full report)`);
		}
	}

	console.log();
	console.log("Done.");
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(report: AuditReport, enforcementCases: EnforcementCase[] | null): string {
	const lines: string[] = [];

	lines.push("# LaunchClear Knowledge Base Audit Report");
	lines.push("");
	lines.push(`Generated: ${report.generatedAt}`);
	lines.push("");

	// Summary
	lines.push("## Summary");
	lines.push("");
	lines.push("| Metric | Count |");
	lines.push("|--------|------:|");
	lines.push(`| Provision files | ${report.summary.totalProvisionFiles} |`);
	lines.push(`| Enforcement cases | ${report.summary.totalEnforcementCases} |`);
	lines.push(`| URLs checked | ${report.summary.totalUrls} |`);
	lines.push(`| Claims extracted | ${report.summary.totalClaims} |`);
	lines.push("");
	lines.push("**Verification Status** (provisions + enforcement combined):");
	lines.push("");
	lines.push("| Status | Count |");
	lines.push("|--------|------:|");
	lines.push(`| Verified | ${report.summary.byVerificationStatus.verified} |`);
	lines.push(`| In review | ${report.summary.byVerificationStatus["in-review"]} |`);
	lines.push(`| Unverified | ${report.summary.byVerificationStatus.unverified} |`);
	lines.push(`| Disputed | ${report.summary.byVerificationStatus.disputed} |`);
	lines.push("");

	// Critical Flags
	lines.push("## Critical Flags");
	lines.push("");
	if (report.criticalFlags.length === 0) {
		lines.push("No critical flags found.");
	} else {
		lines.push(
			`**${report.criticalFlags.length} critical issue(s) found.** These must be fixed before production use.`,
		);
		lines.push("");

		const grouped = groupBy(report.criticalFlags, (f) => f.category);
		for (const [category, flags] of Object.entries(grouped)) {
			lines.push(`### ${formatCategoryName(category)} (${flags.length})`);
			lines.push("");
			for (const flag of flags) {
				const filePart = flag.file ? ` — \`${flag.file}\`` : "";
				lines.push(`- ${flag.description}${filePart}`);
			}
			lines.push("");
		}
	}

	// Warning Flags
	lines.push("## Warning Flags");
	lines.push("");
	if (report.warningFlags.length === 0) {
		lines.push("No warning flags found.");
	} else {
		lines.push(`**${report.warningFlags.length} warning(s) found.**`);
		lines.push("");

		const grouped = groupBy(report.warningFlags, (f) => f.category);
		for (const [category, flags] of Object.entries(grouped)) {
			lines.push(`### ${formatCategoryName(category)} (${flags.length})`);
			lines.push("");
			for (const flag of flags) {
				const filePart = flag.file ? ` — \`${flag.file}\`` : "";
				lines.push(`- ${flag.description}${filePart}`);
			}
			lines.push("");
		}
	}

	// Per-Jurisdiction Summary
	lines.push("## Per-Jurisdiction Summary");
	lines.push("");
	if (report.jurisdictionSummaries.length === 0) {
		lines.push("No provision files found.");
	} else {
		lines.push("| Jurisdiction | Files | Claims | Verified | In Review | Unverified | Disputed |");
		lines.push("|--------------|------:|-------:|---------:|----------:|-----------:|---------:|");
		for (const js of report.jurisdictionSummaries) {
			lines.push(
				`| ${js.jurisdiction} | ${js.fileCount} | ${js.claimCount} | ${js.byStatus.verified} | ${js.byStatus["in-review"]} | ${js.byStatus.unverified} | ${js.byStatus.disputed} |`,
			);
		}
	}
	lines.push("");

	// Enforcement Cases Summary
	if (enforcementCases && enforcementCases.length > 0) {
		lines.push("## Enforcement Cases Summary");
		lines.push("");
		lines.push("| Case | Jurisdiction | Status | URL Issues |");
		lines.push("|------|-------------|--------|------------|");
		for (const ec of enforcementCases) {
			const title = ec.title ?? ec.id ?? "unknown";
			const jurisdiction = ec.jurisdiction ?? "unknown";
			const status = ec.verification?.status ?? "unverified";
			const caseUrls: string[] = [];
			if (ec.url) caseUrls.push(ec.url);
			if (ec.urls) caseUrls.push(...ec.urls);
			const genericCount = caseUrls.filter(isGenericHomepageUrl).length;
			const urlIssue = genericCount > 0 ? `${genericCount} generic URL(s)` : "none";
			lines.push(`| ${title} | ${jurisdiction} | ${status} | ${urlIssue} |`);
		}
		lines.push("");
	}

	// Per-File Detail
	lines.push("## Per-File Detail");
	lines.push("");
	if (report.fileDetails.length === 0) {
		lines.push("No provision files found.");
	} else {
		lines.push("| File | ID | Status | Claims | URL Issues |");
		lines.push("|------|----|--------|-------:|------------|");
		for (const fd of report.fileDetails) {
			const id = fd.id ?? "(none)";
			const urlIssueCount = fd.urlIssues.length;
			const urlIssueText = urlIssueCount > 0 ? `${urlIssueCount} issue(s)` : "none";
			lines.push(
				`| \`${fd.relativePath}\` | ${id} | ${fd.verificationStatus} | ${fd.claimCount} | ${urlIssueText} |`,
			);
		}
	}
	lines.push("");

	// Files with URL issues — expanded detail
	const filesWithUrlIssues = report.fileDetails.filter((fd) => fd.urlIssues.length > 0);
	if (filesWithUrlIssues.length > 0) {
		lines.push("### Files With URL Issues (Detail)");
		lines.push("");
		for (const fd of filesWithUrlIssues) {
			lines.push(`**\`${fd.relativePath}\`**`);
			lines.push("");
			for (const issue of fd.urlIssues) {
				lines.push(`- ${issue}`);
			}
			lines.push("");
		}
	}

	lines.push("---");
	lines.push("");
	lines.push("*Report generated by `scripts/generate-audit-report.ts`*");
	lines.push("");

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
	const result: Record<string, T[]> = {};
	for (const item of items) {
		const key = keyFn(item);
		if (!result[key]) {
			result[key] = [];
		}
		result[key].push(item);
	}
	return result;
}

function formatCategoryName(category: string): string {
	const names: Record<string, string> = {
		"dead-url": "Dead/Failed URLs",
		"generic-enforcement-url": "Enforcement Cases with Generic Homepage URLs",
		"duplicate-section": "Duplicate Sections",
		"generic-url": "Generic Homepage URLs (Resolved OK)",
		"uncited-claim": "Claims Without Citation Keys",
		"unverified-file": "Unverified Provision Files",
	};
	return names[category] ?? category;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main();
