import type { CodebaseSignal } from "../../core/types.js";
import { automatedDecisionPatterns } from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * Detects automated decision-making: model.predict()/infer() calls,
 * threshold comparisons that trigger actions, scoring/ranking endpoints,
 * accept/reject response patterns, classification logic.
 */
export function extractModelInference(
	filePath: string,
	content: string,
): readonly CodebaseSignal[] {
	return scanLines(filePath, content, automatedDecisionPatterns);
}
