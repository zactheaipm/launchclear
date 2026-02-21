import type { CodebaseSignal } from "../../core/types.js";
import { dataCollectionPatterns } from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * Detects data collection endpoints: API request schemas, form fields,
 * GraphQL inputs, REST write endpoints, validation schemas.
 */
export function extractDataCollection(
	filePath: string,
	content: string,
): readonly CodebaseSignal[] {
	return scanLines(filePath, content, dataCollectionPatterns);
}
