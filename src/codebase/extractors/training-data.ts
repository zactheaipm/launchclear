import type { CodebaseSignal } from "../../core/types.js";
import { trainingDataPatterns } from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * Detects training data usage: dataset loading scripts, HuggingFace
 * references, fine-tuning code, training loops, and data pipelines.
 */
export function extractTrainingData(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, trainingDataPatterns);
}
