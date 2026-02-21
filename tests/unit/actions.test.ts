import { describe, expect, it } from "vitest";
import {
	type ActionCategory,
	type ActionLibraryEntry,
	getActionById,
	getActionCategories,
	getActionsByCategory,
	getActionsByJurisdiction,
	getAllActions,
} from "../../src/actions/action-library.js";
import { generateActionPlanWithoutLLM } from "../../src/actions/generator.js";
import {
	bucketByPriority,
	classifyPriority,
	compareActionItems,
	prioritizeActions,
} from "../../src/actions/prioritizer.js";
import type { ActionItem, ActionPlan, ActionPriority } from "../../src/core/types.js";

// ─── Test Helper: Build an ActionItem ────────────────────────────────────

function makeActionItem(overrides: Partial<ActionItem> = {}): ActionItem {
	return {
		id: overrides.id ?? "test-action",
		title: overrides.title ?? "Test action",
		description: overrides.description ?? "A test action for testing purposes.",
		jurisdiction: overrides.jurisdiction ?? ["eu-ai-act"],
		legalBasis: overrides.legalBasis ?? "Article 9",
		bestPractice: overrides.bestPractice ?? "Implement the action as described.",
		estimatedEffort: overrides.estimatedEffort ?? "2-4 weeks",
		deadline: overrides.deadline ?? null,
		verificationCriteria: overrides.verificationCriteria ?? ["Implementation completed"],
	};
}

// ─── Action Library Tests ────────────────────────────────────────────────

describe("Action Library", () => {
	it("contains actions for all major categories", () => {
		const categories = getActionCategories();
		expect(categories.length).toBeGreaterThanOrEqual(10);
		expect(categories).toContain("data-governance");
		expect(categories).toContain("transparency");
		expect(categories).toContain("human-oversight");
		expect(categories).toContain("bias-testing");
		expect(categories).toContain("consent");
		expect(categories).toContain("monitoring");
		expect(categories).toContain("documentation");
		expect(categories).toContain("genai-content-safety");
		expect(categories).toContain("genai-labeling");
		expect(categories).toContain("genai-training-data");
		expect(categories).toContain("algorithm-filing");
	});

	it("returns all actions", () => {
		const all = getAllActions();
		expect(all.length).toBeGreaterThanOrEqual(30);
	});

	it("looks up action by id", () => {
		const action = getActionById("data-governance-quality");
		expect(action).toBeDefined();
		expect(action?.title).toBe("Implement data governance and quality measures");
		expect(action?.category).toBe("data-governance");
	});

	it("returns undefined for non-existent id", () => {
		const action = getActionById("nonexistent-action-id");
		expect(action).toBeUndefined();
	});

	it("filters actions by category", () => {
		const transparency = getActionsByCategory("transparency");
		expect(transparency.length).toBeGreaterThanOrEqual(2);
		for (const action of transparency) {
			expect(action.category).toBe("transparency");
		}
	});

	it("filters actions by jurisdiction", () => {
		const chinaActions = getActionsByJurisdiction("china");
		expect(chinaActions.length).toBeGreaterThanOrEqual(3);
		for (const action of chinaActions) {
			expect(action.jurisdictions).toContain("china");
		}
	});

	it("all actions have required fields", () => {
		const all = getAllActions();
		for (const action of all) {
			expect(action.id).toBeTruthy();
			expect(action.title).toBeTruthy();
			expect(action.description).toBeTruthy();
			expect(action.category).toBeTruthy();
			expect(action.jurisdictions.length).toBeGreaterThan(0);
			expect(action.legalBasis).toBeTruthy();
			expect(action.defaultPriority).toBeTruthy();
			expect(action.estimatedEffort).toBeTruthy();
			expect(action.verificationCriteria.length).toBeGreaterThan(0);
		}
	});

	it("all action IDs are unique", () => {
		const all = getAllActions();
		const ids = all.map((a) => a.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it("China-specific actions include algorithm filing and content moderation", () => {
		const chinaActions = getActionsByJurisdiction("china");
		const ids = chinaActions.map((a) => a.id);
		expect(ids).toContain("algorithm-filing-china");
		expect(ids).toContain("genai-content-moderation-china");
		expect(ids).toContain("genai-training-data-legality-china");
	});

	it("EU actions include GPAI documentation", () => {
		const euActions = getActionsByJurisdiction("eu-ai-act");
		const ids = euActions.map((a) => a.id);
		expect(ids).toContain("gpai-technical-documentation");
		expect(ids).toContain("gpai-downstream-documentation");
		expect(ids).toContain("registration-eu-database");
	});

	it("financial compliance actions exist", () => {
		const financial = getActionsByCategory("financial-compliance");
		expect(financial.length).toBeGreaterThanOrEqual(3);
		const ids = financial.map((a) => a.id);
		expect(ids).toContain("financial-model-risk-governance");
		expect(ids).toContain("financial-model-validation");
	});
});

// ─── Prioritizer Tests ───────────────────────────────────────────────────

describe("Action Prioritizer", () => {
	describe("classifyPriority", () => {
		it("classifies prohibited actions as critical", () => {
			const action = makeActionItem({
				title: "Do not deploy this AI system in the EU",
				description:
					"This AI system falls under a prohibited practice. It cannot be placed on the EU market.",
				legalBasis: "Article 5",
				deadline: null,
			});
			expect(classifyPriority(action)).toBe("critical");
		});

		it("classifies actions with near-term deadlines as critical", () => {
			// Use a date within 6 months from now
			const nearDeadline = new Date();
			nearDeadline.setMonth(nearDeadline.getMonth() + 3);
			const action = makeActionItem({
				deadline: nearDeadline.toISOString().split("T")[0],
				legalBasis: "Article 9",
			});
			expect(classifyPriority(action)).toBe("critical");
		});

		it("classifies actions with distant deadlines as important", () => {
			const distantDeadline = new Date();
			distantDeadline.setFullYear(distantDeadline.getFullYear() + 2);
			const action = makeActionItem({
				deadline: distantDeadline.toISOString().split("T")[0],
				legalBasis: "Article 9",
			});
			expect(classifyPriority(action)).toBe("important");
		});

		it("classifies legal requirements without deadline as important", () => {
			const action = makeActionItem({
				legalBasis: "GDPR Article 35",
				deadline: null,
			});
			expect(classifyPriority(action)).toBe("important");
		});

		it("classifies voluntary frameworks as recommended", () => {
			const action = makeActionItem({
				description:
					"Align with NIST AI Risk Management Framework. While voluntary, increasingly referenced as expected practice.",
				legalBasis: "NIST AI RMF 1.0",
				deadline: null,
			});
			expect(classifyPriority(action)).toBe("recommended");
		});

		it("classifies best practice actions as recommended", () => {
			const action = makeActionItem({
				description: "This is a recommended best practice for AI governance.",
				legalBasis: "Industry best practice",
				deadline: null,
			});
			expect(classifyPriority(action)).toBe("recommended");
		});
	});

	describe("compareActionItems", () => {
		it("sorts critical before important", () => {
			const critical = makeActionItem({
				id: "a",
				title: "Critical action",
				description: "This cannot be placed on the EU market (prohibited).",
				legalBasis: "Article 5",
			});
			const important = makeActionItem({
				id: "b",
				title: "Important action",
				description: "Implement this legal requirement.",
				legalBasis: "Article 9",
			});
			expect(compareActionItems(critical, important)).toBeLessThan(0);
		});

		it("sorts by deadline within same priority", () => {
			const earlier = makeActionItem({
				id: "a",
				title: "Earlier deadline",
				legalBasis: "Article 10",
				deadline: "2025-06-01",
			});
			const later = makeActionItem({
				id: "b",
				title: "Later deadline",
				legalBasis: "Article 11",
				deadline: "2026-12-01",
			});
			expect(compareActionItems(earlier, later)).toBeLessThan(0);
		});

		it("sorts by effort within same priority and deadline", () => {
			const quick = makeActionItem({
				id: "a",
				title: "AAA Quick action",
				legalBasis: "Article 10",
				estimatedEffort: "1-2 weeks",
			});
			const slow = makeActionItem({
				id: "b",
				title: "AAA Slow action",
				legalBasis: "Article 11",
				estimatedEffort: "4-8 weeks",
			});
			expect(compareActionItems(quick, slow)).toBeLessThan(0);
		});

		it("sorts alphabetically as final tie-breaker", () => {
			const a = makeActionItem({
				id: "a",
				title: "Alpha action",
				legalBasis: "Article 10",
			});
			const b = makeActionItem({
				id: "b",
				title: "Beta action",
				legalBasis: "Article 10",
			});
			expect(compareActionItems(a, b)).toBeLessThan(0);
		});
	});

	describe("bucketByPriority", () => {
		it("buckets actions into correct tiers", () => {
			const actions = [
				makeActionItem({
					id: "prohibited",
					title: "Do not deploy",
					description: "This AI system falls under a prohibited practice.",
					legalBasis: "Article 5",
				}),
				makeActionItem({
					id: "legal-req",
					title: "Implement DPIA",
					description: "Conduct a Data Protection Impact Assessment.",
					legalBasis: "GDPR Article 35",
				}),
				makeActionItem({
					id: "best-practice",
					description: "This is a recommended best practice for documentation.",
					legalBasis: "Industry best practice",
				}),
			];

			const result = bucketByPriority(actions);
			expect(result.critical.some((a) => a.id === "prohibited")).toBe(true);
			expect(result.important.some((a) => a.id === "legal-req")).toBe(true);
			expect(result.recommended.some((a) => a.id === "best-practice")).toBe(true);
		});

		it("sorts within each bucket by deadline", () => {
			const actions = [
				makeActionItem({
					id: "late",
					description: "This cannot be placed on the EU market (prohibited).",
					legalBasis: "Article 5",
					deadline: "2027-01-01",
				}),
				makeActionItem({
					id: "early",
					description: "This cannot be placed on the EU market (prohibited).",
					legalBasis: "Article 5",
					deadline: "2025-06-01",
				}),
			];

			const result = bucketByPriority(actions);
			expect(result.critical[0].id).toBe("early");
			expect(result.critical[1].id).toBe("late");
		});

		it("handles empty input", () => {
			const result = bucketByPriority([]);
			expect(result.critical).toHaveLength(0);
			expect(result.important).toHaveLength(0);
			expect(result.recommended).toHaveLength(0);
		});
	});

	describe("prioritizeActions", () => {
		it("returns a valid ActionPlan structure", () => {
			const actions = [
				makeActionItem({
					id: "a",
					description: "This AI system falls under a prohibited practice.",
					legalBasis: "Article 5",
				}),
				makeActionItem({
					id: "b",
					legalBasis: "GDPR Article 35",
				}),
				makeActionItem({
					id: "c",
					description: "Recommended best practice.",
					legalBasis: "Industry best practice",
				}),
			];

			const plan = prioritizeActions(actions);
			expect(plan).toHaveProperty("critical");
			expect(plan).toHaveProperty("important");
			expect(plan).toHaveProperty("recommended");
			expect(plan.critical.length + plan.important.length + plan.recommended.length).toBe(3);
		});

		it("preserves all actions (no loss)", () => {
			const actions = Array.from({ length: 10 }, (_, i) =>
				makeActionItem({
					id: `action-${i}`,
					legalBasis: i < 3 ? "Article 5" : i < 7 ? "Article 9" : "Best practice",
					description: i < 3 ? "This is prohibited." : "Normal action.",
				}),
			);

			const plan = prioritizeActions(actions);
			const totalCount = plan.critical.length + plan.important.length + plan.recommended.length;
			expect(totalCount).toBe(10);
		});
	});
});

// ─── Generator Tests (deterministic, no LLM) ────────────────────────────

describe("Action Plan Generator (without LLM)", () => {
	it("generates action plan from jurisdiction results", () => {
		const jurisdictionResults = [
			{
				jurisdiction: "eu-ai-act",
				applicableLaws: [],
				riskClassification: {
					level: "high" as const,
					justification: "Employment AI",
					provisions: ["Article 6"],
					applicableCategories: ["annex-iii-employment"],
				},
				requiredArtifacts: [],
				requiredActions: [
					{
						id: "eu-ai-act-risk-management",
						title: "Establish risk management system",
						description: "Implement risk management per Article 9.",
						priority: "critical" as ActionPriority,
						legalBasis: "Article 9",
						jurisdictions: ["eu-ai-act"],
						estimatedEffort: "4-8 weeks",
						deadline: "2026-08-02",
					},
					{
						id: "eu-ai-act-human-oversight",
						title: "Implement human oversight mechanisms",
						description: "Design effective human oversight per Article 14.",
						priority: "critical" as ActionPriority,
						legalBasis: "Article 14",
						jurisdictions: ["eu-ai-act"],
						estimatedEffort: "3-6 weeks",
						deadline: "2026-08-02",
					},
				],
				recommendedActions: [
					{
						id: "eu-ai-act-accuracy-robustness",
						title: "Validate accuracy, robustness, and cybersecurity",
						description: "While voluntary, this is a best practice.",
						priority: "recommended" as ActionPriority,
						legalBasis: "Article 15",
						jurisdictions: ["eu-ai-act"],
						estimatedEffort: "3-6 weeks",
						deadline: "2026-08-02",
					},
				],
				complianceTimeline: {
					effectiveDate: "2024-08-01",
					deadlines: [],
					notes: [],
				},
				enforcementPrecedent: [],
			},
		];

		const plan = generateActionPlanWithoutLLM(jurisdictionResults);

		// All 3 actions should be present
		const totalActions = plan.critical.length + plan.important.length + plan.recommended.length;
		expect(totalActions).toBe(3);

		// Risk management and human oversight should be critical
		const criticalIds = plan.critical.map((a) => a.id);
		expect(criticalIds).toContain("eu-ai-act-risk-management");
		expect(criticalIds).toContain("eu-ai-act-human-oversight");
	});

	it("deduplicates actions across jurisdictions", () => {
		const sharedAction = {
			id: "transparency-notice-shared",
			title: "Prepare transparency notice",
			description: "Publish transparency notice per Article 13.",
			priority: "critical" as ActionPriority,
			legalBasis: "GDPR Articles 13-14",
			jurisdictions: ["eu-gdpr"],
			estimatedEffort: "1-2 weeks",
			deadline: null,
		};

		const jurisdictionResults = [
			{
				jurisdiction: "eu-gdpr",
				applicableLaws: [],
				riskClassification: {
					level: "limited" as const,
					justification: "Personal data processing",
					provisions: [],
					applicableCategories: [],
				},
				requiredArtifacts: [],
				requiredActions: [sharedAction],
				recommendedActions: [],
				complianceTimeline: { effectiveDate: "2018-05-25", deadlines: [], notes: [] },
				enforcementPrecedent: [],
			},
			{
				jurisdiction: "uk",
				applicableLaws: [],
				riskClassification: {
					level: "limited" as const,
					justification: "Personal data processing",
					provisions: [],
					applicableCategories: [],
				},
				requiredArtifacts: [],
				requiredActions: [{ ...sharedAction, jurisdictions: ["uk"] }],
				recommendedActions: [],
				complianceTimeline: { effectiveDate: "2018-05-25", deadlines: [], notes: [] },
				enforcementPrecedent: [],
			},
		];

		const plan = generateActionPlanWithoutLLM(jurisdictionResults);

		// Same action from two jurisdictions should be deduplicated
		const allActions = [...plan.critical, ...plan.important, ...plan.recommended];
		const matchingActions = allActions.filter((a) => a.id === "transparency-notice-shared");
		expect(matchingActions).toHaveLength(1);

		// The deduplicated action should reference both jurisdictions
		expect(matchingActions[0].jurisdiction).toContain("eu-gdpr");
		expect(matchingActions[0].jurisdiction).toContain("uk");
	});

	it("handles empty jurisdiction results", () => {
		const plan = generateActionPlanWithoutLLM([]);
		expect(plan.critical).toHaveLength(0);
		expect(plan.important).toHaveLength(0);
		expect(plan.recommended).toHaveLength(0);
	});

	it("keeps higher priority when same action appears in multiple jurisdictions", () => {
		const jurisdictionResults = [
			{
				jurisdiction: "eu-ai-act",
				applicableLaws: [],
				riskClassification: {
					level: "high" as const,
					justification: "Test",
					provisions: [],
					applicableCategories: [],
				},
				requiredArtifacts: [],
				requiredActions: [
					{
						id: "shared-action",
						title: "Shared action",
						description: "Action required by Article 9.",
						priority: "critical" as ActionPriority,
						legalBasis: "Article 9",
						jurisdictions: ["eu-ai-act"],
						estimatedEffort: "4-8 weeks",
						deadline: "2026-08-02",
					},
				],
				recommendedActions: [],
				complianceTimeline: { effectiveDate: "2024-08-01", deadlines: [], notes: [] },
				enforcementPrecedent: [],
			},
			{
				jurisdiction: "uk",
				applicableLaws: [],
				riskClassification: {
					level: "limited" as const,
					justification: "Test",
					provisions: [],
					applicableCategories: [],
				},
				requiredArtifacts: [],
				requiredActions: [],
				recommendedActions: [
					{
						id: "shared-action",
						title: "Shared action",
						description: "This is a recommended best practice.",
						priority: "recommended" as ActionPriority,
						legalBasis: "Best practice",
						jurisdictions: ["uk"],
						estimatedEffort: "2-4 weeks",
						deadline: null,
					},
				],
				complianceTimeline: { effectiveDate: "2024-08-01", deadlines: [], notes: [] },
				enforcementPrecedent: [],
			},
		];

		const plan = generateActionPlanWithoutLLM(jurisdictionResults);
		const allActions = [...plan.critical, ...plan.important, ...plan.recommended];
		const shared = allActions.find((a) => a.id === "shared-action");
		expect(shared).toBeDefined();
		// The critical version should win over recommended
		expect(shared?.legalBasis).toBe("Article 9");
	});
});
