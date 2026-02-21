import type { CodebaseSignal } from "../../core/types.js";
import type { SignalPatternDef } from "../patterns.js";

/**
 * Shared line-scanning utility used by all extractors.
 * Scans each line of a file against a set of patterns, producing
 * CodebaseSignal entries for each match.
 */
export function scanLines(
	filePath: string,
	content: string,
	patterns: readonly SignalPatternDef[],
): readonly CodebaseSignal[] {
	const signals: CodebaseSignal[] = [];
	const lines = content.split("\n");

	for (const pattern of patterns) {
		// If pattern is file-extension-restricted, check extension
		if (pattern.fileExtensions && pattern.fileExtensions.length > 0) {
			const ext = getExtension(filePath);
			if (!pattern.fileExtensions.includes(ext)) continue;
		}

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i] ?? "";
			if (pattern.pattern.test(line)) {
				const match = line.match(pattern.pattern);
				signals.push({
					category: pattern.category,
					type: pattern.id,
					description: pattern.description,
					filePath,
					lineNumber: i + 1,
					confidence: pattern.confidence,
					evidence: match ? match[0] : line.trim().slice(0, 200),
				});
			}
		}
	}

	return signals;
}

function getExtension(filePath: string): string {
	const lastDot = filePath.lastIndexOf(".");
	if (lastDot === -1) return "";
	return filePath.slice(lastDot);
}
