#!/usr/bin/env npx tsx
/**
 * verify-urls.ts — URL validation script for the LaunchClear knowledge base.
 *
 * Parses URLs from enforcement cases, citations, and provision frontmatter,
 * then validates each URL via HTTP HEAD/GET requests.
 *
 * Run with: npx tsx scripts/verify-urls.ts
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UrlEntry {
	url: string;
	source: string;
}

interface ReportEntry {
	url: string;
	source: string;
	status: "passed" | "redirected" | "failed" | "unreachable" | "generic";
	httpStatus?: number;
	redirectUrl?: string;
	error?: string;
}

interface Report {
	checkedAt: string;
	total: number;
	passed: ReportEntry[];
	redirected: ReportEntry[];
	failed: ReportEntry[];
	unreachable: ReportEntry[];
	generic: ReportEntry[];
}

interface EnforcementCase {
	url?: string;
	[key: string]: unknown;
}

interface CitationSource {
	urls?: string[];
	id?: string;
	[key: string]: unknown;
}

interface CitationsFile {
	[key: string]: CitationSource;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROOT_DIR = join(import.meta.dirname, "..");
const KNOWLEDGE_DIR = join(ROOT_DIR, "knowledge");
const AUDIT_DIR = join(ROOT_DIR, "audit");
const CASES_PATH = join(KNOWLEDGE_DIR, "enforcement", "cases.json");
const CITATIONS_PATH = join(KNOWLEDGE_DIR, "citations.json");
const PROVISIONS_DIR = join(KNOWLEDGE_DIR, "provisions");

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const EUR_LEX_DELAY_MS = 2_000;

const HOMEPAGE_PATTERNS = /^\/(?:en|fr|de|es|it|pt|nl|pl|index\.html?|en\.html?|home\.html?)?$/i;

// ---------------------------------------------------------------------------
// URL collection helpers
// ---------------------------------------------------------------------------

function collectUrlsFromCases(): UrlEntry[] {
	const entries: UrlEntry[] = [];
	if (!existsSync(CASES_PATH)) {
		console.warn(`[warn] ${relative(ROOT_DIR, CASES_PATH)} not found — skipping`);
		return entries;
	}
	try {
		const raw = readFileSync(CASES_PATH, "utf-8");
		const cases: unknown = JSON.parse(raw);
		if (!Array.isArray(cases)) {
			console.warn("[warn] cases.json is not an array — skipping");
			return entries;
		}
		for (const c of cases as EnforcementCase[]) {
			if (typeof c.url === "string" && c.url.length > 0) {
				entries.push({ url: c.url, source: "enforcement/cases.json" });
			}
		}
	} catch (err) {
		console.warn(`[warn] Failed to parse cases.json: ${String(err)}`);
	}
	return entries;
}

function loadCitationsMap(): CitationsFile {
	if (!existsSync(CITATIONS_PATH)) {
		console.warn(`[warn] ${relative(ROOT_DIR, CITATIONS_PATH)} not found`);
		return {};
	}
	try {
		const raw = readFileSync(CITATIONS_PATH, "utf-8");
		return JSON.parse(raw) as CitationsFile;
	} catch (err) {
		console.warn(`[warn] Failed to parse citations.json: ${String(err)}`);
		return {};
	}
}

function collectUrlsFromCitations(citations: CitationsFile): UrlEntry[] {
	const entries: UrlEntry[] = [];
	for (const [key, source] of Object.entries(citations)) {
		if (Array.isArray(source.urls)) {
			for (const u of source.urls) {
				if (typeof u === "string" && u.length > 0) {
					entries.push({ url: u, source: `citations.json#${key}` });
				}
			}
		}
	}
	return entries;
}

function walkDir(dir: string): string[] {
	const results: string[] = [];
	if (!existsSync(dir)) return results;
	const items = readdirSync(dir);
	for (const item of items) {
		const full = join(dir, item);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			results.push(...walkDir(full));
		} else if (item.endsWith(".md")) {
			results.push(full);
		}
	}
	return results;
}

function extractFrontmatterSourceIds(filePath: string): string[] {
	const ids: string[] = [];
	try {
		const content = readFileSync(filePath, "utf-8");
		// Check for YAML frontmatter delimited by ---
		const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (!fmMatch) return ids;
		const frontmatter = fmMatch[1];

		// Simple YAML parsing: look for lines under `sources:` that have `id:`
		let inSources = false;
		for (const line of frontmatter.split("\n")) {
			if (/^sources\s*:/.test(line)) {
				inSources = true;
				continue;
			}
			// Exit sources block if we hit a top-level key
			if (inSources && /^\S/.test(line) && !/^\s*-/.test(line)) {
				inSources = false;
				continue;
			}
			if (inSources) {
				const idMatch = line.match(/id\s*:\s*["']?([^"'\s]+)["']?/);
				if (idMatch) {
					ids.push(idMatch[1]);
				}
			}
		}
	} catch {
		// Ignore unreadable files
	}
	return ids;
}

function collectUrlsFromProvisions(citations: CitationsFile): UrlEntry[] {
	const entries: UrlEntry[] = [];
	const mdFiles = walkDir(PROVISIONS_DIR);
	for (const filePath of mdFiles) {
		const relPath = relative(KNOWLEDGE_DIR, filePath);
		const sourceIds = extractFrontmatterSourceIds(filePath);
		for (const id of sourceIds) {
			const citation = citations[id];
			if (citation && Array.isArray(citation.urls)) {
				for (const u of citation.urls) {
					if (typeof u === "string" && u.length > 0) {
						entries.push({ url: u, source: `provisions/${relPath} (source: ${id})` });
					}
				}
			}
		}
	}
	return entries;
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

interface DeduplicatedUrl {
	url: string;
	sources: string[];
}

function deduplicateUrls(entries: UrlEntry[]): DeduplicatedUrl[] {
	const map = new Map<string, string[]>();
	for (const entry of entries) {
		const existing = map.get(entry.url);
		if (existing) {
			if (!existing.includes(entry.source)) {
				existing.push(entry.source);
			}
		} else {
			map.set(entry.url, [entry.source]);
		}
	}
	return Array.from(map.entries()).map(([url, sources]) => ({ url, sources }));
}

// ---------------------------------------------------------------------------
// URL checking
// ---------------------------------------------------------------------------

let lastEurLexRequest = 0;

function isEurLexUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.hostname.includes("eur-lex.europa.eu");
	} catch {
		return false;
	}
}

function isGenericPath(url: string): boolean {
	try {
		const parsed = new URL(url);
		return HOMEPAGE_PATTERNS.test(parsed.pathname);
	} catch {
		return false;
	}
}

async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUrl(url: string): Promise<{
	status: ReportEntry["status"];
	httpStatus?: number;
	redirectUrl?: string;
	error?: string;
}> {
	// Rate-limit EUR-Lex requests
	if (isEurLexUrl(url)) {
		const elapsed = Date.now() - lastEurLexRequest;
		if (elapsed < EUR_LEX_DELAY_MS) {
			await delay(EUR_LEX_DELAY_MS - elapsed);
		}
		lastEurLexRequest = Date.now();
	}

	// Try HEAD first, fallback to GET on 405
	for (const method of ["HEAD", "GET"] as const) {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

			const response = await fetch(url, {
				method,
				signal: controller.signal,
				redirect: "manual",
				headers: {
					"User-Agent": "LaunchClear-URL-Verifier/1.0",
				},
			});
			clearTimeout(timeout);

			const httpStatus = response.status;

			// Handle redirects manually to count hops
			if (
				httpStatus === 301 ||
				httpStatus === 302 ||
				httpStatus === 303 ||
				httpStatus === 307 ||
				httpStatus === 308
			) {
				const redirectUrl = await followRedirects(url, MAX_REDIRECTS);
				return {
					status: "redirected",
					httpStatus,
					redirectUrl: redirectUrl.finalUrl,
				};
			}

			// 405 Method Not Allowed — retry with GET
			if (method === "HEAD" && httpStatus === 405) {
				continue;
			}

			if (httpStatus === 200) {
				if (isGenericPath(url)) {
					return { status: "generic", httpStatus };
				}
				return { status: "passed", httpStatus };
			}

			if (httpStatus === 403 || httpStatus === 404 || httpStatus >= 500) {
				return { status: "failed", httpStatus };
			}

			// Other status codes — treat as failed
			return { status: "failed", httpStatus };
		} catch (err) {
			if (method === "HEAD") {
				// Try GET as fallback for network errors too
				continue;
			}
			const errorMessage = err instanceof Error ? err.message : String(err);
			if (errorMessage.includes("abort") || errorMessage.includes("timeout")) {
				return { status: "unreachable", error: "Timeout after 10s" };
			}
			return { status: "unreachable", error: errorMessage };
		}
	}

	// Should not reach here, but just in case
	return { status: "unreachable", error: "All methods failed" };
}

async function followRedirects(
	url: string,
	maxHops: number,
): Promise<{ finalUrl: string; status: number }> {
	let currentUrl = url;
	let hops = 0;

	while (hops < maxHops) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const response = await fetch(currentUrl, {
				method: "HEAD",
				signal: controller.signal,
				redirect: "manual",
				headers: {
					"User-Agent": "LaunchClear-URL-Verifier/1.0",
				},
			});
			clearTimeout(timeout);

			const status = response.status;
			if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
				const location = response.headers.get("location");
				if (!location) {
					return { finalUrl: currentUrl, status };
				}
				// Resolve relative redirects
				currentUrl = new URL(location, currentUrl).href;
				hops++;
				continue;
			}

			return { finalUrl: currentUrl, status };
		} catch {
			clearTimeout(timeout);
			return { finalUrl: currentUrl, status: 0 };
		}
	}

	return { finalUrl: currentUrl, status: 0 };
}

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

function printSummaryTable(report: Report): void {
	const divider = "─".repeat(60);

	console.log("");
	console.log(divider);
	console.log("  LaunchClear URL Verification Report");
	console.log(divider);
	console.log(`  Checked at:   ${report.checkedAt}`);
	console.log(`  Total URLs:   ${report.total}`);
	console.log(divider);
	console.log(`  Passed:       ${report.passed.length}`);
	console.log(`  Redirected:   ${report.redirected.length}`);
	console.log(`  Generic:      ${report.generic.length}`);
	console.log(`  Failed:       ${report.failed.length}`);
	console.log(`  Unreachable:  ${report.unreachable.length}`);
	console.log(divider);

	if (report.failed.length > 0) {
		console.log("");
		console.log("  FAILED URLs:");
		for (const entry of report.failed) {
			console.log(`    [${entry.httpStatus ?? "???"}] ${entry.url}`);
			console.log(`          Source: ${entry.source}`);
		}
	}

	if (report.unreachable.length > 0) {
		console.log("");
		console.log("  UNREACHABLE URLs:");
		for (const entry of report.unreachable) {
			console.log(`    ${entry.url}`);
			console.log(`          Error: ${entry.error ?? "Unknown"}`);
			console.log(`          Source: ${entry.source}`);
		}
	}

	if (report.redirected.length > 0) {
		console.log("");
		console.log("  REDIRECTED URLs:");
		for (const entry of report.redirected) {
			console.log(`    [${entry.httpStatus ?? "???"}] ${entry.url}`);
			console.log(`          -> ${entry.redirectUrl ?? "Unknown"}`);
			console.log(`          Source: ${entry.source}`);
		}
	}

	if (report.generic.length > 0) {
		console.log("");
		console.log("  GENERIC (homepage) URLs:");
		for (const entry of report.generic) {
			console.log(`    ${entry.url}`);
			console.log(`          Source: ${entry.source}`);
		}
	}

	console.log("");
	console.log(divider);
	if (report.failed.length > 0) {
		console.log("  Result: FAIL — broken URLs detected");
	} else {
		console.log("  Result: PASS — no broken URLs");
	}
	console.log(divider);
	console.log("");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	console.log("LaunchClear URL Verifier");
	console.log("Collecting URLs from knowledge base...\n");

	// 1. Collect all URLs
	const citations = loadCitationsMap();

	const allEntries: UrlEntry[] = [
		...collectUrlsFromCases(),
		...collectUrlsFromCitations(citations),
		...collectUrlsFromProvisions(citations),
	];

	if (allEntries.length === 0) {
		console.log("No URLs found to check.");
		return;
	}

	const deduplicated = deduplicateUrls(allEntries);
	console.log(`Found ${allEntries.length} URL references (${deduplicated.length} unique URLs)\n`);

	// 2. Check each URL
	const report: Report = {
		checkedAt: new Date().toISOString(),
		total: deduplicated.length,
		passed: [],
		redirected: [],
		failed: [],
		unreachable: [],
		generic: [],
	};

	let checked = 0;
	for (const { url, sources } of deduplicated) {
		checked++;
		const sourceLabel = sources.join("; ");
		process.stdout.write(`  [${checked}/${deduplicated.length}] ${url} ... `);

		const result = await checkUrl(url);

		const entry: ReportEntry = {
			url,
			source: sourceLabel,
			status: result.status,
			...(result.httpStatus !== undefined ? { httpStatus: result.httpStatus } : {}),
			...(result.redirectUrl !== undefined ? { redirectUrl: result.redirectUrl } : {}),
			...(result.error !== undefined ? { error: result.error } : {}),
		};

		report[result.status].push(entry);
		console.log(result.status.toUpperCase());
	}

	// 3. Write report
	if (!existsSync(AUDIT_DIR)) {
		mkdirSync(AUDIT_DIR, { recursive: true });
	}
	const reportPath = join(AUDIT_DIR, "url-report.json");
	writeFileSync(reportPath, JSON.stringify(report, null, "\t"), "utf-8");
	console.log(`\nReport written to ${relative(ROOT_DIR, reportPath)}`);

	// 4. Print summary
	printSummaryTable(report);

	// 5. Exit code
	if (report.failed.length > 0) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(2);
});
