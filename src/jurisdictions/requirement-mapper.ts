import type {
	ActionRequirement,
	ApplicableProvision,
	ArtifactRequirement,
	ComplianceTimeline,
	Jurisdiction,
	JurisdictionResult,
	ProductContext,
	Result,
	RiskClassification,
} from "../core/types.js";
import { getJurisdictionModule } from "./registry.js";

// ─── Map a Single Jurisdiction ────────────────────────────────────────────

export function mapJurisdiction(
	ctx: ProductContext,
	jurisdictionId: Jurisdiction,
): Result<JurisdictionResult> {
	const moduleResult = getJurisdictionModule(jurisdictionId);
	if (!moduleResult.ok) {
		return moduleResult;
	}

	const mod = moduleResult.value;
	const risk = mod.getRiskLevel(ctx);
	const provisions = mod.getApplicableProvisions(ctx);
	const requiredArtifacts = mod.getRequiredArtifacts(ctx);
	const allActions = mod.getRequiredActions(ctx);
	const timeline = mod.getTimeline(ctx);
	const gpaiClassification = mod.getGpaiClassification?.(ctx);

	const requiredActions = allActions.filter(
		(a) => a.priority === "critical" || a.priority === "important",
	);
	const recommendedActions = allActions.filter((a) => a.priority === "recommended");

	return {
		ok: true,
		value: {
			jurisdiction: jurisdictionId,
			applicableLaws: [
				{
					id: mod.id,
					name: mod.name,
					jurisdiction: jurisdictionId,
					provisions: [...provisions],
				},
			],
			riskClassification: risk,
			requiredArtifacts: [...requiredArtifacts],
			requiredActions: [...requiredActions],
			recommendedActions: [...recommendedActions],
			complianceTimeline: timeline,
			enforcementPrecedent: [],
			gpaiClassification: gpaiClassification ?? undefined,
		},
	};
}

// ─── Map All Target Markets ───────────────────────────────────────────────

export interface RequirementMapResult {
	readonly results: readonly JurisdictionResult[];
	readonly errors: readonly JurisdictionMappingError[];
}

export interface JurisdictionMappingError {
	readonly jurisdiction: Jurisdiction;
	readonly error: string;
}

export function mapAllJurisdictions(ctx: ProductContext): RequirementMapResult {
	const results: JurisdictionResult[] = [];
	const errors: JurisdictionMappingError[] = [];

	for (const jurisdictionId of ctx.targetMarkets) {
		const result = mapJurisdiction(ctx, jurisdictionId);
		if (result.ok) {
			results.push(result.value);
		} else {
			errors.push({
				jurisdiction: jurisdictionId,
				error: result.error.message,
			});
		}
	}

	return { results, errors };
}

// ─── Aggregate Results ────────────────────────────────────────────────────

export interface AggregatedRequirements {
	readonly allArtifacts: readonly ArtifactRequirement[];
	readonly allActions: readonly ActionRequirement[];
	readonly highestRiskLevel: RiskClassification | null;
	readonly totalArtifacts: number;
	readonly totalActions: number;
}

export function aggregateRequirements(
	results: readonly JurisdictionResult[],
): AggregatedRequirements {
	const allArtifacts = results.flatMap((r) => [...r.requiredArtifacts]);
	const allActions = results.flatMap((r) => [...r.requiredActions, ...r.recommendedActions]);

	const riskOrder: Record<string, number> = {
		unacceptable: 4,
		high: 3,
		limited: 2,
		minimal: 1,
		undetermined: 0,
	};

	let highestRiskLevel: RiskClassification | null = null;
	for (const result of results) {
		const currentScore = riskOrder[result.riskClassification.level] ?? 0;
		const highestScore = highestRiskLevel ? (riskOrder[highestRiskLevel.level] ?? 0) : -1;
		if (currentScore > highestScore) {
			highestRiskLevel = result.riskClassification;
		}
	}

	return {
		allArtifacts,
		allActions,
		highestRiskLevel,
		totalArtifacts: allArtifacts.length,
		totalActions: allActions.length,
	};
}
