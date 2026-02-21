import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function getKnowledgeDir(): string {
	const currentDir = dirname(fileURLToPath(import.meta.url));
	return join(currentDir, "..", "..", "knowledge");
}

/**
 * Gets the git commit hash and date for the knowledge/ directory.
 * Falls back to current date if git is not available.
 */
export function getKnowledgeBaseVersion(): {
	readonly version: string;
	readonly date: string;
	readonly isStale: boolean;
} {
	const knowledgeDir = getKnowledgeDir();
	try {
		const hash = execSync(`git log -1 --format=%H -- "${knowledgeDir}"`, {
			encoding: "utf-8",
			timeout: 5000,
		}).trim();

		const dateStr = execSync(`git log -1 --format=%aI -- "${knowledgeDir}"`, {
			encoding: "utf-8",
			timeout: 5000,
		}).trim();

		const commitDate = new Date(dateStr);
		const now = new Date();
		const daysSinceUpdate = Math.floor(
			(now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24),
		);
		const isStale = daysSinceUpdate > 60;

		return {
			version: hash.slice(0, 12),
			date: dateStr.split("T")[0] ?? dateStr,
			isStale,
		};
	} catch {
		const now = new Date().toISOString().split("T")[0] ?? "unknown";
		return {
			version: "unknown",
			date: now,
			isStale: false,
		};
	}
}
