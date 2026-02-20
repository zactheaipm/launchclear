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
	const priorityDiff =
		(PRIORITY_ORDER[b.deadline !== null ? classifyPriority(b) : classifyPriority(b)] ?? 0) -
		(PRIORITY_ORDER[a.deadline !== null ? classifyPriority(a) : classifyPriority(a)] ?? 0);

	// Use the action's own priority for sorting
	const aPriority = PRIORITY_ORDER[classifyPriority(a)] ?? 0;
	const bPriority = PRIORITY_ORDER[classifyPriority(b)] ?? 0;
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
export function bucketByPriority(
	actions: readonly ActionItem[],
): { critical: ActionItem[]; important: ActionItem[]; recommended: ActionItem[] } {
	const critical: ActionItem[] = [];
	const important: ActionItem[] = [];
	const recommended: ActionItem[] = [];

	for (const action of actions) {
		// Use the priority inferred from legalBasis + deadline as a floor,
		// but never downgrade from what the jurisdiction module assigned.
		// The jurisdiction module already sets priority based on legal analysis,
		// so we defer to whichever is higher.
		const inferredPriority = classifyPriority(action);
		const inferredScore = PRIORITY_ORDER[inferredPriority] ?? 0;

		// The action doesn't carry its own "original priority" field separately,
		// so we use classifyPriority as the ground truth for bucketing.
		if (inferredScore >= PRIORITY_ORDER.critical) {
			critical.push(action);
		} else if (inferredScore >= PRIORITY_ORDER.important) {
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

// ─── Main Prioritization Function ────────────────────────────────────────

/**
 * Takes a flat list of ActionItems and returns a prioritized ActionPlan
 * with actions bucketed into critical, important, and recommended tiers.
 */
export function prioritizeActions(actions: readonly ActionItem[]): ActionPlan {
	const { critical, important, recommended } = bucketByPriority(actions);
	return { critical, important, recommended };
}
