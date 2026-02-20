import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProvisionManifest, Result } from "../core/types.js";

// ─── Constants ────────────────────────────────────────────────────────────

const KNOWLEDGE_DIR = resolve(
	fileURLToPath(import.meta.url),
	"..",
	"..",
	"..",
	"knowledge",
	"provisions",
);

// ─── Manifest Loading ─────────────────────────────────────────────────────

export async function loadManifest(jurisdictionPath: string): Promise<Result<ProvisionManifest>> {
	const manifestPath = join(KNOWLEDGE_DIR, jurisdictionPath, "manifest.json");
	try {
		const raw = await readFile(manifestPath, "utf-8");
		const parsed: unknown = JSON.parse(raw);
		return { ok: true, value: parsed as ProvisionManifest };
	} catch (err) {
		return {
			ok: false,
			error: new Error(
				`Failed to load manifest at ${manifestPath}: ${err instanceof Error ? err.message : String(err)}`,
			),
		};
	}
}

// ─── Provision Content Loading ────────────────────────────────────────────

export async function loadProvision(
	jurisdictionPath: string,
	filename: string,
): Promise<Result<string>> {
	const filePath = join(KNOWLEDGE_DIR, jurisdictionPath, filename);
	try {
		const content = await readFile(filePath, "utf-8");
		return { ok: true, value: content };
	} catch (err) {
		return {
			ok: false,
			error: new Error(
				`Failed to load provision at ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
			),
		};
	}
}

// ─── Load All Provisions for a Jurisdiction ───────────────────────────────

export interface LoadedProvision {
	readonly id: string;
	readonly title: string;
	readonly article: string;
	readonly topics: readonly string[];
	readonly content: string;
}

export async function loadAllProvisions(
	jurisdictionPath: string,
): Promise<Result<readonly LoadedProvision[]>> {
	const manifestResult = await loadManifest(jurisdictionPath);
	if (!manifestResult.ok) {
		return manifestResult;
	}

	const provisions: LoadedProvision[] = [];

	for (const section of manifestResult.value.sections) {
		const contentResult = await loadProvision(jurisdictionPath, section.file);
		if (!contentResult.ok) {
			return contentResult;
		}
		provisions.push({
			id: section.id,
			title: section.title,
			article: section.article,
			topics: section.topics,
			content: contentResult.value,
		});
	}

	return { ok: true, value: provisions };
}

// ─── Filter Provisions by Topic ───────────────────────────────────────────

export function filterProvisionsByTopic(
	provisions: readonly LoadedProvision[],
	topics: readonly string[],
): readonly LoadedProvision[] {
	return provisions.filter((p) => p.topics.some((t) => topics.includes(t)));
}

// ─── Get Knowledge Base Directory ─────────────────────────────────────────

export function getKnowledgeDir(): string {
	return KNOWLEDGE_DIR;
}
