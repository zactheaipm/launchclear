import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { FetchedRegulation, RegulationSourceConfig, Result } from "../core/types.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const SNAPSHOTS_DIR = resolve(
	fileURLToPath(import.meta.url),
	"..",
	"..",
	"..",
	"knowledge",
	"snapshots",
);

const DEFAULT_TIMEOUT_MS = 30_000;

// ─── Content Hash ────────────────────────────────────────────────────────────

export function computeContentHash(content: string): string {
	return createHash("sha256").update(content).digest("hex");
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

export function currentSnapshotDate(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Rate Limiter ────────────────────────────────────────────────────────────

export function delay(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

// ─── Fetch a Single Source ───────────────────────────────────────────────────

export async function fetchSource(
	source: RegulationSourceConfig,
	options?: {
		readonly timeoutMs?: number;
		readonly snapshotDate?: string;
	},
): Promise<Result<FetchedRegulation>> {
	const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	try {
		// Build request headers
		const headers: Record<string, string> = {
			"User-Agent": "LaunchClear/0.1.0 (regulation-pipeline)",
		};

		if (source.apiConfig?.headers) {
			for (const [key, value] of Object.entries(source.apiConfig.headers)) {
				headers[key] = value;
			}
		}

		// Add API key if configured
		if (source.apiConfig?.apiKeyEnvVar) {
			const apiKey = process.env[source.apiConfig.apiKeyEnvVar];
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}
		}

		// Build URL with query params
		const url = new URL(source.baseUrl);
		if (source.apiConfig?.queryParams) {
			for (const [key, value] of Object.entries(source.apiConfig.queryParams)) {
				url.searchParams.set(key, value);
			}
		}

		// Fetch with timeout
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);

		const response = await fetch(url.toString(), {
			headers,
			signal: controller.signal,
		});

		clearTimeout(timer);

		if (!response.ok) {
			const body = await response.text().catch(() => "unknown");
			return {
				ok: false,
				error: new Error(
					`Failed to fetch ${source.id}: HTTP ${response.status} — ${body.slice(0, 200)}`,
				),
			};
		}

		const rawContent = await response.text();
		const contentHash = computeContentHash(rawContent);
		const etag = response.headers.get("etag") ?? undefined;

		const result: FetchedRegulation = {
			sourceId: source.id,
			fetchedAt: new Date().toISOString(),
			rawContent,
			format: source.format,
			url: url.toString(),
			etag,
			contentHash,
		};

		return { ok: true, value: result };
	} catch (error: unknown) {
		if (error instanceof DOMException && error.name === "AbortError") {
			return {
				ok: false,
				error: new Error(`Fetch timed out for ${source.id} after ${timeoutMs}ms`),
			};
		}
		return {
			ok: false,
			error: new Error(
				`Fetch failed for ${source.id}: ${error instanceof Error ? error.message : String(error)}`,
			),
		};
	}
}

// ─── Cache Raw Content ───────────────────────────────────────────────────────

export async function cacheRawContent(
	fetched: FetchedRegulation,
	snapshotDate?: string,
): Promise<Result<string>> {
	const date = snapshotDate ?? currentSnapshotDate();
	const rawDir = join(SNAPSHOTS_DIR, date, "raw");

	try {
		await mkdir(rawDir, { recursive: true });
		const filePath = join(rawDir, `${fetched.sourceId}.${fetched.format}`);
		await writeFile(filePath, fetched.rawContent, "utf-8");

		// Write metadata sidecar
		const metaPath = join(rawDir, `${fetched.sourceId}.meta.json`);
		await writeFile(
			metaPath,
			JSON.stringify(
				{
					sourceId: fetched.sourceId,
					fetchedAt: fetched.fetchedAt,
					url: fetched.url,
					format: fetched.format,
					contentHash: fetched.contentHash,
					etag: fetched.etag,
				},
				null,
				"\t",
			),
			"utf-8",
		);

		return { ok: true, value: filePath };
	} catch (error: unknown) {
		return {
			ok: false,
			error: new Error(
				`Failed to cache ${fetched.sourceId}: ${error instanceof Error ? error.message : String(error)}`,
			),
		};
	}
}

// ─── Load Cached Content ─────────────────────────────────────────────────────

export async function loadCachedContent(
	sourceId: string,
	snapshotDate: string,
	format: string,
): Promise<Result<string>> {
	const filePath = join(SNAPSHOTS_DIR, snapshotDate, "raw", `${sourceId}.${format}`);
	try {
		const content = await readFile(filePath, "utf-8");
		return { ok: true, value: content };
	} catch {
		return {
			ok: false,
			error: new Error(`No cached content for ${sourceId} at ${snapshotDate}`),
		};
	}
}

// ─── Fetch Multiple Sources Sequentially ─────────────────────────────────────

export async function fetchAllSources(
	sources: readonly RegulationSourceConfig[],
	options?: {
		readonly timeoutMs?: number;
		readonly snapshotDate?: string;
		readonly onProgress?: (sourceId: string, index: number, total: number) => void;
	},
): Promise<{
	readonly successes: readonly FetchedRegulation[];
	readonly failures: readonly {
		readonly sourceId: string;
		readonly error: string;
	}[];
}> {
	const successes: FetchedRegulation[] = [];
	const failures: { sourceId: string; error: string }[] = [];

	for (let i = 0; i < sources.length; i++) {
		const source = sources[i];
		if (!source) continue;

		options?.onProgress?.(source.id, i, sources.length);

		const result = await fetchSource(source, {
			timeoutMs: options?.timeoutMs,
			snapshotDate: options?.snapshotDate,
		});

		if (result.ok) {
			successes.push(result.value);
			await cacheRawContent(result.value, options?.snapshotDate);
		} else {
			failures.push({
				sourceId: source.id,
				error: result.error.message,
			});
		}

		// Rate limit: wait before next request
		if (i < sources.length - 1) {
			await delay(source.rateLimitMs);
		}
	}

	return { successes, failures };
}

// ─── Get Snapshots Directory ─────────────────────────────────────────────────

export function getSnapshotsDir(): string {
	return SNAPSHOTS_DIR;
}
