import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	ActionItem,
	ActionPlan,
	ActionRequirement,
	JurisdictionResult,
	LLMProvider,
	ProductContext,
	Result,
} from "../core/types.js";
import { getActionById, type ActionLibraryEntry } from "./action-library.js";
import { prioritizeActions } from "./prioritizer.js";

// ─── Types ───────────────────────────────────────────────────────────────

export interface GenerateActionPlanOptions {
	readonly ctx: ProductContext;
	readonly jurisdictionResults: readonly JurisdictionResult[];
	readonly provider: LLMProvider;
}

export interface GenerateActionPlanResult {
	readonly actionPlan: ActionPlan;
	readonly errors: readonly ActionPlanError[];
}

export interface ActionPlanError {
	readonly actionId: string;
	readonly error: string;
}

// ─── Best Practice Loading ───────────────────────────────────────────────

function getBestPracticesDir(): string {
	const currentDir = dirname(fileURLToPath(import.meta.url));
	return join(currentDir, "best-practices");
}

async function loadBestPractice(ref: string): Promise<Result<string>> {
	const filePath = join(getBestPracticesDir(), `${ref}.md`);
	try {
		const content = await readFile(filePath, "utf-8");
		return { ok: true, value: content };
	} catch {
		return {
			ok: false,
			error: new Error(`Best practice guide not found: ${ref}`),
		};
	}
}

// ─── Deduplication ───────────────────────────────────────────────────────

interface DeduplicatedAction {
	readonly requirement: ActionRequirement;
	readonly jurisdictions: readonly string[];
	readonly libraryEntry?: ActionLibraryEntry;
}

function deduplicateActions(
	jurisdictionResults: readonly JurisdictionResult[],
): readonly DeduplicatedAction[] {
	const seen = new Map<string, { requirement: ActionRequirement; jurisdictions: string[] }>();

	for (const result of jurisdictionResults) {
		const allActions = [...result.requiredActions, ...result.recommendedActions];
		for (const action of allActions) {
			const existing = seen.get(action.id);
			if (existing) {
				if (!existing.jurisdictions.includes(result.jurisdiction)) {
					existing.jurisdictions.push(result.jurisdiction);
				}
				// Keep the higher priority version
				if (comparePriority(action.priority, existing.requirement.priority) > 0) {
					seen.set(action.id, {
						requirement: action,
						jurisdictions: existing.jurisdictions,
					});
				}
			} else {
				seen.set(action.id, {
					requirement: action,
					jurisdictions: [result.jurisdiction],
				});
			}
		}
	}

	return [...seen.values()].map((entry) => ({
		requirement: entry.requirement,
		jurisdictions: entry.jurisdictions,
		libraryEntry: getActionById(entry.requirement.id),
	}));
}

function comparePriority(a: string, b: string): number {
	const order: Record<string, number> = { critical: 3, important: 2, recommended: 1 };
	return (order[a] ?? 0) - (order[b] ?? 0);
}

// ─── Product Context Summary (for LLM prompt) ───────────────────────────

function buildProductContextSummary(ctx: ProductContext): string {
	const parts: string[] = [];

	parts.push(`Product description: ${ctx.description}`);
	parts.push(`Product type: ${ctx.productType}`);
	parts.push(`Data processed: ${ctx.dataProcessed.join(", ")}`);
	parts.push(`User populations: ${ctx.userPopulations.join(", ")}`);
	parts.push(`Decision impact: ${ctx.decisionImpact}`);
	parts.push(`Automation level: ${ctx.automationLevel}`);
	parts.push(`Target markets: ${ctx.targetMarkets.join(", ")}`);

	if (ctx.generativeAiContext) {
		const genai = ctx.generativeAiContext;
		parts.push(`GenAI: generates ${genai.outputModalities.join(", ")} content`);
		parts.push(`Foundation model source: ${genai.foundationModelSource}`);
		if (genai.modelIdentifier) parts.push(`Model: ${genai.modelIdentifier}`);
		parts.push(`Has output watermarking: ${genai.hasOutputWatermarking}`);
		parts.push(`Has output filtering: ${genai.hasOutputFiltering}`);
		parts.push(`Uses RAG: ${genai.usesRAG}`);
	}

	if (ctx.agenticAiContext) {
		const agent = ctx.agenticAiContext;
		parts.push(`Agentic AI: autonomy level ${agent.autonomyLevel}`);
		parts.push(`Tool access: ${agent.toolAccess.join(", ")}`);
		parts.push(`Has human checkpoints: ${agent.hasHumanCheckpoints}`);
		parts.push(`Has failsafe mechanisms: ${agent.hasFailsafeMechanisms}`);
	}

	if (ctx.sectorContext) {
		parts.push(`Sector: ${ctx.sectorContext.sector}`);
		if (ctx.sectorContext.financialServices) {
			const fin = ctx.sectorContext.financialServices;
			parts.push(`Financial sub-sector: ${fin.subSector}`);
		}
	}

	if (ctx.existingMeasures.length > 0) {
		parts.push(
			`Existing measures: ${ctx.existingMeasures.map((m) => `${m.type}: ${m.description}`).join("; ")}`,
		);
	}

	return parts.join("\n");
}

// ─── LLM-Assisted Best Practice Customization ────────────────────────────

function buildBestPracticePrompt(
	action: DeduplicatedAction,
	ctx: ProductContext,
	bestPracticeContent: string | null,
): string {
	const contextSummary = buildProductContextSummary(ctx);

	return `You are an AI compliance advisor. Generate a customised best-practice guidance paragraph for a specific compliance action, tailored to the product described below.

## Product Context

${contextSummary}

## Action

Title: ${action.requirement.title}
Description: ${action.requirement.description}
Legal basis: ${action.requirement.legalBasis}
Applicable jurisdictions: ${action.jurisdictions.join(", ")}
Priority: ${action.requirement.priority}

${bestPracticeContent ? `## Reference Best Practice Guide\n\n${bestPracticeContent}` : ""}

## Instructions

1. Write 2-4 sentences of actionable, product-specific guidance for implementing this compliance action.
2. Reference the specific data types, user populations, and product characteristics from the context.
3. If a best practice guide is provided, draw from it but customise for this specific product.
4. Be concrete — mention specific tools, techniques, or approaches relevant to this product type.
5. Do NOT include generic boilerplate. Every sentence should be specific to THIS product.
6. Do NOT include citations or legal references — those are already in the action item.
7. Return ONLY the guidance paragraph, no headers or formatting.`;
}

async function generateBestPractice(
	action: DeduplicatedAction,
	ctx: ProductContext,
	provider: LLMProvider,
): Promise<Result<string>> {
	let bestPracticeContent: string | null = null;

	if (action.libraryEntry?.bestPracticeRef) {
		const loaded = await loadBestPractice(action.libraryEntry.bestPracticeRef);
		if (loaded.ok) {
			bestPracticeContent = loaded.value;
		}
	}

	const prompt = buildBestPracticePrompt(action, ctx, bestPracticeContent);

	const response = await provider.complete({
		messages: [{ role: "user", content: prompt }],
		systemPrompt:
			"You are a compliance advisor specialising in AI regulation. Provide concise, actionable guidance.",
		maxTokens: 500,
		temperature: 0.3,
	});

	if (!response.ok) {
		return response;
	}

	return { ok: true, value: response.value.content.trim() };
}

// ─── Action Item Builder ─────────────────────────────────────────────────

function buildActionItem(
	action: DeduplicatedAction,
	bestPractice: string,
): ActionItem {
	const verificationCriteria = action.libraryEntry?.verificationCriteria ?? [
		"Implementation completed and documented",
		"Reviewed by relevant stakeholders",
	];

	return {
		id: action.requirement.id,
		title: action.requirement.title,
		description: action.requirement.description,
		jurisdiction: [...action.jurisdictions],
		legalBasis: action.requirement.legalBasis,
		bestPractice,
		estimatedEffort: action.requirement.estimatedEffort ?? action.libraryEntry?.estimatedEffort ?? "2-4 weeks",
		deadline: action.requirement.deadline ?? null,
		verificationCriteria,
	};
}

// ─── Fallback Best Practice (no LLM) ────────────────────────────────────

function buildFallbackBestPractice(action: DeduplicatedAction): string {
	const parts: string[] = [];
	parts.push(action.requirement.description);

	if (action.libraryEntry) {
		parts.push(
			`Key verification steps: ${action.libraryEntry.verificationCriteria.slice(0, 3).join("; ")}.`,
		);
	}

	return parts.join(" ");
}

// ─── Main Generator ──────────────────────────────────────────────────────

export async function generateActionPlan(
	options: GenerateActionPlanOptions,
): Promise<GenerateActionPlanResult> {
	const { ctx, jurisdictionResults, provider } = options;

	const deduplicated = deduplicateActions(jurisdictionResults);
	const actionItems: ActionItem[] = [];
	const errors: ActionPlanError[] = [];

	// Generate best practices in parallel (batched to avoid rate limits)
	const BATCH_SIZE = 5;
	for (let i = 0; i < deduplicated.length; i += BATCH_SIZE) {
		const batch = deduplicated.slice(i, i + BATCH_SIZE);
		const results = await Promise.all(
			batch.map(async (action) => {
				const bestPracticeResult = await generateBestPractice(action, ctx, provider);

				if (!bestPracticeResult.ok) {
					errors.push({
						actionId: action.requirement.id,
						error: `Failed to generate best practice: ${bestPracticeResult.error.message}`,
					});
					const fallback = buildFallbackBestPractice(action);
					return buildActionItem(action, fallback);
				}

				return buildActionItem(action, bestPracticeResult.value);
			}),
		);
		actionItems.push(...results);
	}

	const actionPlan = prioritizeActions(actionItems);

	return { actionPlan, errors };
}

// ─── Generate Without LLM (deterministic fallback) ───────────────────────

export function generateActionPlanWithoutLLM(
	jurisdictionResults: readonly JurisdictionResult[],
): ActionPlan {
	const deduplicated = deduplicateActions(jurisdictionResults);

	const actionItems: ActionItem[] = deduplicated.map((action) => {
		const fallback = buildFallbackBestPractice(action);
		return buildActionItem(action, fallback);
	});

	return prioritizeActions(actionItems);
}
