import type { ActionItem, ActionPlan, ActionPriority } from "../core/types.js";

// ─── Priority Weights ────────────────────────────────────────────────────

const PRIORITY_ORDER: Readonly<Record<ActionPriority, number>> = {
	critical: 3,
	important: 2,
	recommended: 1,
};

// ─── Deadline Parsing ────────────────────────────────────────────────────

function parseDeadline(deadline: string | null): number {
	if (!deadline) return Number.MAX_SAFE_INTEGER;
	const date = new Date(deadline);
	if (Number.isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER;
	return date.getTime();
}

// ─── Effort Parsing ──────────────────────────────────────────────────────

const EFFORT_ORDER: Readonly<Record<string, number>> = {
	"1-2 weeks": 1,
	"2-4 weeks": 2,
	"3-6 weeks": 3,
	"4-8 weeks": 4,
	"4-12 weeks": 5,
	"6-12 weeks": 6,
};

function parseEffort(effort: string): number {
	return EFFORT_ORDER[effort] ?? 3;
}

// ─── Sort Comparator ─────────────────────────────────────────────────────

/**
 * Sorts action items by:
 * 1. Priority (critical > important > recommended)
 * 2. Deadline (earliest first, null deadlines last)
 * 3. Effort (shorter first — quick wins surface higher)
 * 4. Alphabetical by title (stable tie-breaker)
 */
export function compareActionItems(a: ActionItem, b: ActionItem): number {
	// 1. Priority (descending — higher priority first)
	// Use basePriority (from jurisdiction module) if available, falling back to classifyPriority
	const aPriority = PRIORITY_ORDER[a.basePriority ?? classifyPriority(a)] ?? 0;
	const bPriority = PRIORITY_ORDER[b.basePriority ?? classifyPriority(b)] ?? 0;
	if (bPriority !== aPriority) return bPriority - aPriority;

	// 2. Deadline (ascending — nearest deadline first)
	const aDeadline = parseDeadline(a.deadline);
	const bDeadline = parseDeadline(b.deadline);
	if (aDeadline !== bDeadline) return aDeadline - bDeadline;

	// 3. Effort (ascending — shorter effort first)
	const aEffort = parseEffort(a.estimatedEffort);
	const bEffort = parseEffort(b.estimatedEffort);
	if (aEffort !== bEffort) return aEffort - bEffort;

	// 4. Alphabetical (stable tie-breaker)
	return a.title.localeCompare(b.title);
}

// ─── Priority Classification ─────────────────────────────────────────────

/**
 * Determines the effective priority of an action item.
 *
 * Rules:
 * - "critical": Legal requirement with a hard deadline or a prohibition
 *   (deadline is set, or description indicates prohibition/mandatory).
 * - "important": Legal requirement without an imminent deadline.
 * - "recommended": Best practice, not legally required.
 *
 * The action's legalBasis and deadline are the primary signals.
 */
export function classifyPriority(action: ActionItem): ActionPriority {
	const descLower = action.description.toLowerCase();
	const titleLower = action.title.toLowerCase();

	// Prohibition or "do not deploy" actions are always critical
	if (
		descLower.includes("prohibited") ||
		descLower.includes("cannot be placed on") ||
		descLower.includes("do not deploy") ||
		titleLower.includes("do not deploy")
	) {
		return "critical";
	}

	// Actions with hard deadlines in the near future are critical
	if (action.deadline) {
		const deadlineTime = parseDeadline(action.deadline);
		if (deadlineTime !== Number.MAX_SAFE_INTEGER) {
			const now = Date.now();
			const sixMonths = 180 * 24 * 60 * 60 * 1000;
			if (deadlineTime <= now + sixMonths) {
				return "critical";
			}
			// Deadline exists but >6 months away — at least important
			return "important";
		}
	}

	// Legal requirements (has a specific legal basis reference) are at least important
	if (
		action.legalBasis.includes("Article") ||
		action.legalBasis.includes("Section") ||
		action.legalBasis.includes("Regulation") ||
		action.legalBasis.includes("Act") ||
		action.legalBasis.includes("SR 11-7") ||
		action.legalBasis.includes("ECOA")
	) {
		// Check if description indicates mandatory vs voluntary
		if (
			descLower.includes("voluntary") ||
			descLower.includes("recommended") ||
			descLower.includes("best practice") ||
			descLower.includes("while voluntary")
		) {
			return "recommended";
		}
		return "important";
	}

	return "recommended";
}

// ─── Bucket Actions Into Priority Tiers ──────────────────────────────────

/**
 * Splits action items into priority buckets (critical, important, recommended),
 * respecting each action's original priority from the jurisdiction module.
 * Within each bucket, actions are sorted by deadline → effort → title.
 */
export function bucketByPriority(actions: readonly ActionItem[]): {
	critical: ActionItem[];
	important: ActionItem[];
	recommended: ActionItem[];
} {
	const critical: ActionItem[] = [];
	const important: ActionItem[] = [];
	const recommended: ActionItem[] = [];

	for (const action of actions) {
		// Use basePriority from jurisdiction module as primary signal.
		// Fall back to classifyPriority() inference, but never downgrade
		// from what the jurisdiction module assigned.
		const baseScore = action.basePriority ? (PRIORITY_ORDER[action.basePriority] ?? 0) : 0;
		const inferredPriority = classifyPriority(action);
		const inferredScore = PRIORITY_ORDER[inferredPriority] ?? 0;
		const effectiveScore = action.basePriority ? baseScore : Math.max(baseScore, inferredScore);

		if (effectiveScore >= PRIORITY_ORDER.critical) {
			critical.push(action);
		} else if (effectiveScore >= PRIORITY_ORDER.important) {
			important.push(action);
		} else {
			recommended.push(action);
		}
	}

	const sortWithinBucket = (items: ActionItem[]): ActionItem[] =>
		[...items].sort((a, b) => {
			// Within a bucket, sort by deadline, then effort, then title
			const aDeadline = parseDeadline(a.deadline);
			const bDeadline = parseDeadline(b.deadline);
			if (aDeadline !== bDeadline) return aDeadline - bDeadline;

			const aEffort = parseEffort(a.estimatedEffort);
			const bEffort = parseEffort(b.estimatedEffort);
			if (aEffort !== bEffort) return aEffort - bEffort;

			return a.title.localeCompare(b.title);
		});

	return {
		critical: sortWithinBucket(critical),
		important: sortWithinBucket(important),
		recommended: sortWithinBucket(recommended),
	};
}

// ─── Dependency Issue Detection ─────────────────────────────────────────

/**
 * Checks the action plan for dependency ordering issues:
 * - An action that dependsOn another action in a lower-priority bucket
 *   (e.g., a critical action depends on a recommended action).
 *
 * Returns a list of human-readable warning strings.
 */
export function detectDependencyIssues(plan: ActionPlan): readonly string[] {
	const warnings: string[] = [];
	const allItems = [...plan.critical, ...plan.important, ...plan.recommended];
	const idToBucket = new Map<string, string>();
	for (const item of plan.critical) idToBucket.set(item.id, "critical");
	for (const item of plan.important) idToBucket.set(item.id, "important");
	for (const item of plan.recommended) idToBucket.set(item.id, "recommended");

	const bucketOrder: Record<string, number> = { critical: 0, important: 1, recommended: 2 };

	for (const item of allItems) {
		if (!item.dependsOn) continue;
		const itemBucket = idToBucket.get(item.id);
		if (!itemBucket) continue;
		for (const depId of item.dependsOn) {
			const depBucket = idToBucket.get(depId);
			if (!depBucket) continue;
			if ((bucketOrder[depBucket] ?? 0) > (bucketOrder[itemBucket] ?? 0)) {
				warnings.push(
					`Action "${item.title}" (${itemBucket}) depends on "${depId}" (${depBucket}) — consider elevating the dependency's priority`,
				);
			}
		}
	}

	return warnings;
}

// ─── Overdue Detection ──────────────────────────────────────────────────

/**
 * Detects actions with deadlines in the past and annotates them as overdue.
 * Overdue actions are escalated to critical priority.
 */
export function annotateOverdueActions(
	actions: readonly ActionItem[],
	now?: Date,
): readonly ActionItem[] {
	const currentTime = (now ?? new Date()).getTime();

	return actions.map((action) => {
		if (!action.deadline) return action;
		const deadlineTime = parseDeadline(action.deadline);
		if (deadlineTime === Number.MAX_SAFE_INTEGER) return action;
		if (deadlineTime >= currentTime) return action;

		return {
			...action,
			description: `[OVERDUE — compliance required immediately] ${action.description}`,
			basePriority: "critical" as ActionPriority,
		};
	});
}

// ─── Main Prioritization Function ────────────────────────────────────────

/**
 * Takes a flat list of ActionItems and returns a prioritized ActionPlan
 * with actions bucketed into critical, important, and recommended tiers.
 */
export function prioritizeActions(actions: readonly ActionItem[]): ActionPlan {
	const annotated = annotateOverdueActions(actions);
	const { critical, important, recommended } = bucketByPriority(annotated);
	return { critical, important, recommended };
}

// ─── Launch Date Annotation ─────────────────────────────────────────────

/**
 * Annotates action items with days-until-deadline relative to a launch date.
 * Returns a new array with an additional note in the description.
 */
export function annotateWithLaunchDate(
	actions: readonly ActionItem[],
	launchDate: string,
): readonly ActionItem[] {
	const launchTime = new Date(launchDate).getTime();
	if (Number.isNaN(launchTime)) return actions;

	return actions.map((action) => {
		if (!action.deadline) return action;
		const deadlineTime = parseDeadline(action.deadline);
		if (deadlineTime === Number.MAX_SAFE_INTEGER) return action;

		const daysUntilDeadline = Math.ceil((deadlineTime - launchTime) / (24 * 60 * 60 * 1000));
		const note =
			daysUntilDeadline <= 0
				? " [DEADLINE PASSED relative to launch date]"
				: ` [${daysUntilDeadline} days before launch deadline]`;

		return {
			...action,
			description: action.description + note,
		};
	});
}
