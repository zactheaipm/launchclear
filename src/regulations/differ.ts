import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { diffWords } from "diff";
import type {
	ChangelogEntry,
	ProcessedRegulation,
	ProcessedSection,
	ProvisionManifest,
	RegulationChangelog,
	RegulationDiff,
	Result,
	SectionDiff,
} from "../core/types.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const KNOWLEDGE_DIR = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "knowledge");

const PROVISIONS_DIR = join(KNOWLEDGE_DIR, "provisions");
const SNAPSHOTS_DIR = join(KNOWLEDGE_DIR, "snapshots");

// ─── Load Previous Manifest ─────────────────────────────────────────────────
// Loads the manifest.json from the live knowledge/provisions/ directory.

async function loadPreviousManifest(knowledgePath: string): Promise<Result<ProvisionManifest>> {
	const manifestPath = join(PROVISIONS_DIR, knowledgePath, "manifest.json");
	try {
		const raw = await readFile(manifestPath, "utf-8");
		const parsed: unknown = JSON.parse(raw);
		return { ok: true, value: parsed as ProvisionManifest };
	} catch {
		return {
			ok: false,
			error: new Error(`No previous manifest found at ${manifestPath}`),
		};
	}
}

// ─── Load Previous Section Content ───────────────────────────────────────────

async function loadPreviousSectionContent(
	knowledgePath: string,
	filename: string,
): Promise<Result<string>> {
	const filePath = join(PROVISIONS_DIR, knowledgePath, filename);
	try {
		const content = await readFile(filePath, "utf-8");
		return { ok: true, value: content };
	} catch {
		return {
			ok: false,
			error: new Error(`No previous section content at ${filePath}`),
		};
	}
}

// ─── Diff Two Section Sets ───────────────────────────────────────────────────

export function diffSections(
	previousSections: readonly {
		readonly id: string;
		readonly content: string;
	}[],
	currentSections: readonly ProcessedSection[],
): readonly SectionDiff[] {
	const diffs: SectionDiff[] = [];
	const prevMap = new Map(previousSections.map((s) => [s.id, s.content]));
	const currMap = new Map(currentSections.map((s) => [s.id, s]));

	// Added sections
	for (const section of currentSections) {
		if (!prevMap.has(section.id)) {
			diffs.push({
				sectionId: section.id,
				type: "added",
				currentText: section.content,
				summary: `New section added: ${section.title}`,
			});
		}
	}

	// Removed sections
	for (const [id, content] of prevMap.entries()) {
		if (!currMap.has(id)) {
			diffs.push({
				sectionId: id,
				type: "removed",
				previousText: content,
				summary: `Section removed: ${id}`,
			});
		}
	}

	// Modified sections
	for (const section of currentSections) {
		const prevContent = prevMap.get(section.id);
		if (prevContent !== undefined && prevContent !== section.content) {
			const wordDiff = diffWords(prevContent, section.content);
			const addedCount = wordDiff.filter((d) => d.added).length;
			const removedCount = wordDiff.filter((d) => d.removed).length;
			diffs.push({
				sectionId: section.id,
				type: "modified",
				previousText: prevContent,
				currentText: section.content,
				summary: `Section modified: ${section.title} (${addedCount} additions, ${removedCount} removals)`,
			});
		}
	}

	return diffs;
}

// ─── Build Regulation Diff ───────────────────────────────────────────────────

export function buildRegulationDiff(
	sourceId: string,
	previousVersion: string,
	currentVersion: string,
	sectionDiffs: readonly SectionDiff[],
): RegulationDiff {
	return {
		sourceId,
		previousVersion,
		currentVersion,
		changedSections: sectionDiffs,
		timestamp: new Date().toISOString(),
	};
}

// ─── Build Human-Readable Changelog ──────────────────────────────────────────

export function buildChangelog(
	diff: RegulationDiff,
	processed: ProcessedRegulation,
): RegulationChangelog {
	const entries: ChangelogEntry[] = diff.changedSections.map((s) => {
		const section = processed.sections.find((ps) => ps.id === s.sectionId);
		return {
			sectionId: s.sectionId,
			type: s.type,
			title: section?.title ?? s.sectionId,
			description: s.summary,
		};
	});

	// Identify affected provision mappings
	const affectedMappings = diff.changedSections
		.filter((s) => s.type === "modified" || s.type === "removed")
		.map((s) => s.sectionId);

	const summary = buildChangelogSummary(diff);

	return {
		sourceId: diff.sourceId,
		generatedAt: new Date().toISOString(),
		previousVersion: diff.previousVersion,
		currentVersion: diff.currentVersion,
		summary,
		entries,
		affectedMappings,
	};
}

// ─── Changelog Summary Generator ─────────────────────────────────────────────

function buildChangelogSummary(diff: RegulationDiff): string {
	const added = diff.changedSections.filter((s) => s.type === "added").length;
	const removed = diff.changedSections.filter((s) => s.type === "removed").length;
	const modified = diff.changedSections.filter((s) => s.type === "modified").length;

	const parts: string[] = [];
	if (added > 0) parts.push(`${added} section(s) added`);
	if (removed > 0) parts.push(`${removed} section(s) removed`);
	if (modified > 0) parts.push(`${modified} section(s) modified`);

	if (parts.length === 0) return "No changes detected.";
	return `${parts.join(", ")}.`;
}

// ─── Render Changelog as Markdown ────────────────────────────────────────────

export function renderChangelogMarkdown(changelog: RegulationChangelog): string {
	const lines: string[] = [];
	lines.push(`# Regulation Changelog — ${changelog.sourceId}`);
	lines.push("");
	lines.push(`**Generated:** ${changelog.generatedAt}`);
	lines.push(`**Previous Version:** ${changelog.previousVersion}`);
	lines.push(`**Current Version:** ${changelog.currentVersion}`);
	lines.push("");
	lines.push("## Summary");
	lines.push("");
	lines.push(changelog.summary);
	lines.push("");

	if (changelog.entries.length > 0) {
		lines.push("## Changes");
		lines.push("");
		for (const entry of changelog.entries) {
			const icon = entry.type === "added" ? "+" : entry.type === "removed" ? "-" : "~";
			lines.push(`### [${icon}] ${entry.title}`);
			lines.push("");
			lines.push(entry.description);
			lines.push("");
		}
	}

	if (changelog.affectedMappings.length > 0) {
		lines.push("## Affected Requirement Mappings");
		lines.push("");
		lines.push("The following provisions may need their requirement mappings reviewed:");
		lines.push("");
		for (const id of changelog.affectedMappings) {
			lines.push(`- ${id}`);
		}
		lines.push("");
	}

	return lines.join("\n");
}

// ─── Diff Against Live Knowledge Base ────────────────────────────────────────

export async function diffAgainstLive(
	processed: ProcessedRegulation,
	knowledgePath: string,
): Promise<
	Result<{
		diff: RegulationDiff;
		changelog: RegulationChangelog;
	} | null>
> {
	const manifestResult = await loadPreviousManifest(knowledgePath);
	if (!manifestResult.ok) {
		// No previous version — first-time fetch
		return { ok: true, value: null };
	}

	const previousManifest = manifestResult.value;
	const previousSections: {
		id: string;
		content: string;
	}[] = [];

	for (const section of previousManifest.sections) {
		const contentResult = await loadPreviousSectionContent(knowledgePath, section.file);
		if (contentResult.ok) {
			previousSections.push({
				id: section.id,
				content: contentResult.value,
			});
		}
	}

	const sectionDiffs = diffSections(previousSections, processed.sections);

	if (sectionDiffs.length === 0) {
		return { ok: true, value: null }; // No changes
	}

	const regulationDiff = buildRegulationDiff(
		processed.sourceId,
		previousManifest.lastUpdated,
		new Date().toISOString().split("T")[0] ?? "",
		sectionDiffs,
	);

	const changelog = buildChangelog(regulationDiff, processed);

	return {
		ok: true,
		value: { diff: regulationDiff, changelog },
	};
}

// ─── Load Changelogs Since Date ──────────────────────────────────────────────
// Scans knowledge/snapshots/ for changelog files since a given date.

export async function loadChangelogsSince(
	sinceDate: string,
): Promise<Result<readonly RegulationChangelog[]>> {
	try {
		const entries = await readdir(SNAPSHOTS_DIR).catch(() => [] as string[]);

		// Filter directories by date (YYYY-MM format)
		const normalizedSince = sinceDate.slice(0, 7); // normalize to YYYY-MM
		const relevantDirs = entries.filter((d) => d >= normalizedSince).sort();

		const changelogs: RegulationChangelog[] = [];

		for (const dir of relevantDirs) {
			const diffsDir = join(SNAPSHOTS_DIR, dir, "diffs");
			const diffFiles = await readdir(diffsDir).catch(() => [] as string[]);

			for (const file of diffFiles) {
				if (!file.endsWith("-changelog.md")) continue;

				// Load the corresponding JSON diff to get structured data
				const jsonFile = file.replace("-changelog.md", "-diff.json");
				const jsonPath = join(diffsDir, jsonFile);

				try {
					const raw = await readFile(jsonPath, "utf-8");
					const diff: unknown = JSON.parse(raw);

					if (isRegulationDiff(diff)) {
						// Reconstruct changelog from diff
						const sourceId = file.replace("-changelog.md", "");
						const entries: ChangelogEntry[] = diff.changedSections.map((s) => ({
							sectionId: s.sectionId,
							type: s.type,
							title: s.sectionId,
							description: s.summary,
						}));

						changelogs.push({
							sourceId,
							generatedAt: diff.timestamp,
							previousVersion: diff.previousVersion,
							currentVersion: diff.currentVersion,
							summary: buildChangelogSummary(diff),
							entries,
							affectedMappings: diff.changedSections
								.filter((s) => s.type === "modified" || s.type === "removed")
								.map((s) => s.sectionId),
						});
					}
				} catch {
					// Skip malformed diff files
				}
			}
		}

		return { ok: true, value: changelogs };
	} catch (error: unknown) {
		return {
			ok: false,
			error: new Error(
				`Failed to load changelogs: ${error instanceof Error ? error.message : String(error)}`,
			),
		};
	}
}

// ─── Type Guard ──────────────────────────────────────────────────────────────

function isRegulationDiff(value: unknown): value is RegulationDiff {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	return (
		typeof obj.sourceId === "string" &&
		typeof obj.previousVersion === "string" &&
		typeof obj.currentVersion === "string" &&
		Array.isArray(obj.changedSections) &&
		typeof obj.timestamp === "string"
	);
}
