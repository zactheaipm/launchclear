import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	RegulationChangelog,
	RegulationDiff,
	RegulationPipelineResult,
	Result,
} from "../core/types.js";
import { diffAgainstLive, renderChangelogMarkdown } from "./differ.js";
import { cacheRawContent, currentSnapshotDate, delay, fetchSource } from "./fetcher.js";
import {
	processRegulation,
	validateProcessedRegulation,
	writeProcessedOutput,
} from "./processor.js";
import { SOURCE_TO_KNOWLEDGE_PATH, getAllSourceIds, getSource } from "./sources.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const SNAPSHOTS_DIR = resolve(
	fileURLToPath(import.meta.url),
	"..",
	"..",
	"..",
	"knowledge",
	"snapshots",
);

// ─── Run Pipeline for a Single Source ────────────────────────────────────────

export async function runPipeline(
	sourceId: string,
	options?: {
		readonly snapshotDate?: string;
		readonly skipDiff?: boolean;
	},
): Promise<Result<RegulationPipelineResult>> {
	const source = getSource(sourceId);
	if (!source) {
		return {
			ok: false,
			error: new Error(`Unknown regulation source: ${sourceId}`),
		};
	}

	const snapshotDate = options?.snapshotDate ?? currentSnapshotDate();

	// Step 1: Fetch
	const fetchResult = await fetchSource(source, {
		snapshotDate,
	});
	if (!fetchResult.ok) {
		return fetchResult;
	}

	// Step 1b: Cache raw content
	const cacheResult = await cacheRawContent(fetchResult.value, snapshotDate);
	if (!cacheResult.ok) {
		// Non-fatal: log warning but continue
		console.warn(`  Warning: Failed to cache raw content: ${cacheResult.error.message}`);
	}

	// Step 2: Process
	const processResult = processRegulation(fetchResult.value, source);
	if (!processResult.ok) {
		return processResult;
	}

	// Step 3: Validate
	const validation = validateProcessedRegulation(processResult.value);

	// Step 4: Write processed output
	const writeResult = await writeProcessedOutput(processResult.value, source, snapshotDate);
	if (!writeResult.ok) {
		return writeResult;
	}

	// Step 5: Diff against live
	let diff: RegulationDiff | null = null;
	let changelog: RegulationChangelog | null = null;

	if (!options?.skipDiff) {
		const knowledgePath = SOURCE_TO_KNOWLEDGE_PATH[sourceId];
		if (knowledgePath) {
			const diffResult = await diffAgainstLive(processResult.value, knowledgePath);
			if (diffResult.ok && diffResult.value) {
				diff = diffResult.value.diff;
				changelog = diffResult.value.changelog;

				// Write changelog and diff to snapshots
				const diffDir = join(SNAPSHOTS_DIR, snapshotDate, "diffs");
				await mkdir(diffDir, { recursive: true });
				await writeFile(
					join(diffDir, `${sourceId}-changelog.md`),
					renderChangelogMarkdown(changelog),
					"utf-8",
				);
				await writeFile(
					join(diffDir, `${sourceId}-diff.json`),
					JSON.stringify(diff, null, "\t"),
					"utf-8",
				);
			}
		}
	}

	return {
		ok: true,
		value: {
			sourceId,
			fetched: fetchResult.value,
			processed: processResult.value,
			diff,
			changelog,
			validation,
			snapshotPath: writeResult.value,
		},
	};
}

// ─── Pipeline Batch Result ───────────────────────────────────────────────────

export interface PipelineBatchResult {
	readonly successes: readonly RegulationPipelineResult[];
	readonly failures: readonly {
		readonly sourceId: string;
		readonly error: string;
	}[];
	readonly snapshotDate: string;
}

// ─── Run Pipeline for All Sources ────────────────────────────────────────────

export async function runPipelineForAll(options?: {
	readonly sourceIds?: readonly string[];
	readonly snapshotDate?: string;
	readonly skipDiff?: boolean;
	readonly onProgress?: (sourceId: string, index: number, total: number) => void;
}): Promise<PipelineBatchResult> {
	const ids = options?.sourceIds ?? getAllSourceIds();
	const snapshotDate = options?.snapshotDate ?? currentSnapshotDate();
	const successes: RegulationPipelineResult[] = [];
	const failures: { sourceId: string; error: string }[] = [];

	for (let i = 0; i < ids.length; i++) {
		const sourceId = ids[i];
		if (!sourceId) continue;

		options?.onProgress?.(sourceId, i, ids.length);

		const source = getSource(sourceId);
		if (!source) {
			failures.push({
				sourceId,
				error: `Unknown source: ${sourceId}`,
			});
			continue;
		}

		const result = await runPipeline(sourceId, {
			snapshotDate,
			skipDiff: options?.skipDiff,
		});

		if (result.ok) {
			successes.push(result.value);
		} else {
			failures.push({
				sourceId,
				error: result.error.message,
			});
		}

		// Rate limit between sources
		if (i < ids.length - 1 && source.rateLimitMs > 0) {
			await delay(source.rateLimitMs);
		}
	}

	return { successes, failures, snapshotDate };
}
