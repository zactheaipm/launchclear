import type { LaunchClearReport, Result } from "../core/types.js";
import { LaunchClearReportSchema } from "../core/schema.js";

// ─── JSON Output ──────────────────────────────────────────────────────────

export function generateJsonReport(report: LaunchClearReport): string {
	return JSON.stringify(report, null, "\t");
}

// ─── Validated JSON Output ────────────────────────────────────────────────

export function generateValidatedJsonReport(
	report: LaunchClearReport,
): Result<string> {
	const result = LaunchClearReportSchema.safeParse(report);
	if (!result.success) {
		return {
			ok: false,
			error: new Error(
				`Report validation failed: ${result.error.message}`,
			),
		};
	}
	return { ok: true, value: JSON.stringify(result.data, null, "\t") };
}

// ─── Parse Report from JSON ───────────────────────────────────────────────

export function parseJsonReport(json: string): Result<LaunchClearReport> {
	try {
		const parsed: unknown = JSON.parse(json);
		const result = LaunchClearReportSchema.safeParse(parsed);
		if (!result.success) {
			return {
				ok: false,
				error: new Error(
					`Invalid report JSON: ${result.error.message}`,
				),
			};
		}
		return { ok: true, value: result.data as LaunchClearReport };
	} catch (err) {
		return {
			ok: false,
			error: new Error(
				`Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`,
			),
		};
	}
}
