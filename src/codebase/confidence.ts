import type { CodebaseSignal, ConfidenceLevel } from "../core/types.js";

/**
 * Confidence scoring rules:
 *
 * - High: field name exactly matches known PII pattern, or SDK import
 *   is unambiguous (e.g., @segment/analytics, from "openai")
 * - Medium: pattern match suggests a category but could be something else
 *   (e.g., a "score" variable that might or might not be an automated decision)
 * - Low: weak signal, flag for user confirmation
 *
 * The confidence level for each finding is primarily set by the pattern definition.
 * This module provides utilities for aggregating and adjusting confidence scores
 * based on additional context (e.g., multiple corroborating signals).
 */

/** Numeric weight for each confidence level (used in aggregation) */
const confidenceWeights: Readonly<Record<ConfidenceLevel, number>> = {
	high: 3,
	medium: 2,
	low: 1,
};

/** Convert a numeric weight back to a confidence level */
function weightToConfidence(weight: number): ConfidenceLevel {
	if (weight >= 2.5) return "high";
	if (weight >= 1.5) return "medium";
	return "low";
}

/**
 * Compute an aggregate confidence level from multiple signals.
 * Signals pointing to the same conclusion reinforce each other.
 */
export function aggregateConfidence(signals: readonly CodebaseSignal[]): ConfidenceLevel {
	if (signals.length === 0) return "low";
	if (signals.length === 1) return (signals[0] as CodebaseSignal).confidence;

	const totalWeight = signals.reduce((sum, s) => sum + confidenceWeights[s.confidence], 0);
	const averageWeight = totalWeight / signals.length;

	// Multiple corroborating signals boost confidence
	const corroborationBonus = Math.min(signals.length - 1, 2) * 0.25;

	return weightToConfidence(averageWeight + corroborationBonus);
}

/**
 * Boost confidence when the same signal category appears in multiple files.
 * A single mention could be incidental; the same pattern across files is strong evidence.
 */
export function boostByFileCount(
	baseConfidence: ConfidenceLevel,
	fileCount: number,
): ConfidenceLevel {
	if (fileCount >= 3) return "high";
	if (fileCount >= 2 && baseConfidence === "low") return "medium";
	if (fileCount >= 2 && baseConfidence === "medium") return "high";
	return baseConfidence;
}

/**
 * Determine whether a signal is strong enough to auto-fill a ProductContext
 * field without user confirmation.
 */
export function isAutoFillable(confidence: ConfidenceLevel): boolean {
	return confidence === "high";
}

/**
 * Determine whether a signal should be flagged for user confirmation.
 */
export function requiresConfirmation(confidence: ConfidenceLevel): boolean {
	return confidence !== "high";
}

/**
 * Group signals by a key function and compute aggregate confidence per group.
 */
export function groupAndScore<K extends string>(
	signals: readonly CodebaseSignal[],
	keyFn: (signal: CodebaseSignal) => K,
): ReadonlyMap<
	K,
	{ readonly signals: readonly CodebaseSignal[]; readonly confidence: ConfidenceLevel }
> {
	const groups = new Map<K, CodebaseSignal[]>();

	for (const signal of signals) {
		const key = keyFn(signal);
		const existing = groups.get(key);
		if (existing) {
			existing.push(signal);
		} else {
			groups.set(key, [signal]);
		}
	}

	const result = new Map<
		K,
		{ readonly signals: readonly CodebaseSignal[]; readonly confidence: ConfidenceLevel }
	>();
	for (const [key, sigs] of groups) {
		result.set(key, {
			signals: sigs,
			confidence: aggregateConfidence(sigs),
		});
	}

	return result;
}
