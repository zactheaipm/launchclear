import type {
	ArtifactSection,
	Citation,
	LLMProvider,
	ProductContext,
	Result,
} from "../core/types.js";
import { flagUnverifiedCitations } from "./citation-validator.js";
import type { LoadedTemplate } from "./generator.js";

// ─── Fill Result ─────────────────────────────────────────────────────────────

export interface FillResult {
	readonly filledContent: string;
	readonly sections: readonly ArtifactSection[];
	readonly reviewNotes: readonly string[];
	readonly citations: readonly Citation[];
}

// ─── Fill Options ────────────────────────────────────────────────────────────

export interface FillTemplateOptions {
	readonly template: LoadedTemplate;
	readonly ctx: ProductContext;
	readonly jurisdictions: readonly string[];
	readonly provider: LLMProvider;
	readonly temperature?: number;
	readonly maxTokens?: number;
}

// ─── Placeholder Extraction ──────────────────────────────────────────────────

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

export function extractPlaceholders(templateContent: string): readonly string[] {
	const matches = new Set<string>();
	const regex = new RegExp(PLACEHOLDER_REGEX.source, "g");
	for (
		let match = regex.exec(templateContent);
		match !== null;
		match = regex.exec(templateContent)
	) {
		matches.add(match[1] as string);
	}
	return [...matches];
}

// ─── Section Extraction ──────────────────────────────────────────────────────

export function extractSections(filledContent: string): readonly ArtifactSection[] {
	const sections: ArtifactSection[] = [];
	// Match both numbered "## 1. Title" and unnumbered "## Title" headings
	const sectionRegex = /^##\s+(?:(\d+\.)\s+)?(.+)$/gm;
	const matches: { title: string; start: number }[] = [];

	for (
		let match = sectionRegex.exec(filledContent);
		match !== null;
		match = sectionRegex.exec(filledContent)
	) {
		matches.push({ title: (match[2] as string).trim(), start: match.index });
	}

	for (let i = 0; i < matches.length; i++) {
		const current = matches[i] as { title: string; start: number };
		const start = current.start;
		const next = matches[i + 1] as { title: string; start: number } | undefined;
		const end = next ? next.start : filledContent.length;
		const content = filledContent.slice(start, end).trim();

		sections.push({
			title: current.title,
			content,
			required: true,
		});
	}

	return sections;
}

// ─── Review Notes Detection ──────────────────────────────────────────────────

const DEFAULT_REVIEW_NOTES: readonly string[] = [
	"All legal basis determinations should be verified by qualified counsel",
	"Risk assessments and severity ratings require professional legal judgement",
	"Technical claims and performance metrics should be verified by the engineering team",
	"Jurisdiction-specific requirements may have changed since this document was generated",
];

function buildReviewNotesForContext(ctx: ProductContext, templateId: string): readonly string[] {
	const notes: string[] = [...DEFAULT_REVIEW_NOTES];

	if (ctx.automationLevel === "fully-automated") {
		notes.push(
			"System uses fully automated decision-making — verify Article 22 GDPR compliance and human oversight provisions",
		);
	}

	if (ctx.dataProcessed.includes("biometric")) {
		notes.push(
			"Biometric data processing detected — verify special category data legal basis (Article 9 GDPR) and biometric-specific obligations",
		);
	}

	if (ctx.dataProcessed.includes("minor")) {
		notes.push(
			"Minor data processing detected — verify age verification mechanisms and parental consent requirements",
		);
	}

	if (ctx.generativeAiContext?.canGenerateDeepfakes) {
		notes.push(
			"Deepfake generation capability detected — verify compliance with synthetic media disclosure requirements in all target markets",
		);
	}

	if (ctx.gpaiInfo?.exceedsSystemicRiskThreshold) {
		notes.push(
			"GPAI model exceeds systemic risk threshold (10^25 FLOPs) — verify Article 55 obligations including model evaluation and incident reporting",
		);
	}

	if (ctx.sectorContext?.sector === "financial-services") {
		notes.push(
			"Financial services sector — verify compliance with sector-specific requirements (MAS, FCA, SR 11-7 as applicable)",
		);
	}

	if (templateId === "dpia-gdpr") {
		notes.push(
			"DPIA must be completed before processing begins (Article 35(1) GDPR)",
			"Consider whether prior consultation with supervisory authority is required (Article 36 GDPR)",
		);
	}

	if (templateId === "gpai-technical-doc") {
		notes.push(
			"GPAI obligations effective from 2 August 2025 — the AI Office may issue additional guidance and templates",
			"Verify compute FLOPs calculation methodology and systemic risk threshold assessment",
		);
	}

	return notes;
}

// ─── Build LLM Prompt ────────────────────────────────────────────────────────

function buildProductContextSummary(ctx: ProductContext): string {
	const parts: string[] = [
		`Product description: ${ctx.description}`,
		`Product type: ${ctx.productType}`,
		`Data processed: ${ctx.dataProcessed.join(", ")}`,
		`User populations: ${ctx.userPopulations.join(", ")}`,
		`Decision impact: ${ctx.decisionImpact}`,
		`Automation level: ${ctx.automationLevel}`,
		`Target markets: ${ctx.targetMarkets.join(", ")}`,
	];

	if (ctx.trainingData.usesTrainingData) {
		parts.push(`Training data sources: ${ctx.trainingData.sources.join(", ")}`);
		parts.push(`Training data contains personal data: ${ctx.trainingData.containsPersonalData}`);
		parts.push(`Consent obtained: ${ctx.trainingData.consentObtained}`);
		parts.push(`Opt-out mechanism: ${ctx.trainingData.optOutMechanism}`);
	}

	if (ctx.gpaiInfo) {
		parts.push(`GPAI model: ${ctx.gpaiInfo.isGpaiModel}`);
		parts.push(`GPAI role: ${ctx.gpaiInfo.gpaiRole}`);
		if (ctx.gpaiInfo.modelName) parts.push(`Model name: ${ctx.gpaiInfo.modelName}`);
		parts.push(`Open source: ${ctx.gpaiInfo.isOpenSource}`);
		parts.push(`Exceeds systemic risk threshold: ${ctx.gpaiInfo.exceedsSystemicRiskThreshold}`);
		if (ctx.gpaiInfo.copyrightComplianceMechanism) {
			parts.push(`Copyright compliance mechanism: ${ctx.gpaiInfo.copyrightComplianceMechanism}`);
		}
	}

	if (ctx.generativeAiContext) {
		const genai = ctx.generativeAiContext;
		parts.push(`Uses foundation model: ${genai.usesFoundationModel}`);
		parts.push(`Model source: ${genai.foundationModelSource}`);
		if (genai.modelIdentifier) parts.push(`Model identifier: ${genai.modelIdentifier}`);
		parts.push(`Output modalities: ${genai.outputModalities.join(", ")}`);
		parts.push(`Can generate deepfakes: ${genai.canGenerateDeepfakes}`);
		parts.push(`Has output watermarking: ${genai.hasOutputWatermarking}`);
		parts.push(`Has output filtering: ${genai.hasOutputFiltering}`);
		parts.push(`Training data includes: ${genai.trainingDataIncludes.join(", ")}`);
		parts.push(`Uses RAG: ${genai.usesRAG}`);
		parts.push(`Uses agentic capabilities: ${genai.usesAgenticCapabilities}`);
	}

	if (ctx.agenticAiContext) {
		const agentic = ctx.agenticAiContext;
		parts.push(`Agentic AI: ${agentic.isAgentic}`);
		parts.push(`Autonomy level: ${agentic.autonomyLevel}`);
		parts.push(`Tool access: ${agentic.toolAccess.join(", ")}`);
		parts.push(`Has human checkpoints: ${agentic.hasHumanCheckpoints}`);
		parts.push(`Has failsafe mechanisms: ${agentic.hasFailsafeMechanisms}`);
		parts.push(`Has action logging: ${agentic.hasActionLogging}`);
	}

	if (ctx.sectorContext) {
		parts.push(`Sector: ${ctx.sectorContext.sector}`);
		if (ctx.sectorContext.financialServices) {
			const fin = ctx.sectorContext.financialServices;
			parts.push(`Financial sub-sector: ${fin.subSector}`);
			parts.push(`Involves credit: ${fin.involvesCredit}`);
			parts.push(`Involves insurance pricing: ${fin.involvesInsurancePricing}`);
			parts.push(`Has model risk governance: ${fin.hasModelRiskGovernance}`);
		}
	}

	if (ctx.existingMeasures.length > 0) {
		parts.push(
			`Existing measures: ${ctx.existingMeasures.map((m) => `${m.type}: ${m.description} (${m.implemented ? "implemented" : "planned"})`).join("; ")}`,
		);
	}

	return parts.join("\n");
}

function buildFillPrompt(
	template: LoadedTemplate,
	ctx: ProductContext,
	jurisdictions: readonly string[],
	placeholders: readonly string[],
): string {
	const contextSummary = buildProductContextSummary(ctx);

	return `You are a compliance document specialist. Fill in a compliance document template by replacing placeholders with specific, accurate content based on the product context provided.

## Product Context

${contextSummary}

## Applicable Jurisdictions

${jurisdictions.join(", ")}

## Template Information

Template: ${template.metadata.name}
Legal basis: ${template.metadata.legalBasis}
Required sections: ${template.metadata.requiredSections.join(", ")}

## Instructions

1. Replace every {{placeholder}} in the template with substantive, specific content based on the product context.
2. Be specific to THIS product — do not use generic boilerplate.
3. For risk assessments, provide concrete risk descriptions tied to the product's data types, user populations, and decision impact.
4. For legal basis references, cite specific articles and provisions from the applicable regulations.
5. For tables, fill in complete rows with realistic assessments.
6. If information is not available from the product context, write "[TO BE COMPLETED — requires input from: legal team / engineering team / DPO]" and explain what information is needed.
7. Use professional legal/compliance language suitable for regulatory review.
8. For jurisdiction-conditional sections (marked with {{#if_jurisdiction ...}} / {{/if_jurisdiction}}):
   - Include and fill the section if that jurisdiction is in the applicable jurisdictions list.
   - Remove the section entirely (including the conditional markers) if the jurisdiction is not applicable.
9. Every claim about a regulation must be accurate — cite the correct article numbers.
10. Do NOT add any text outside the template structure. Return ONLY the filled template content (without the YAML frontmatter).

## Placeholders to Fill

${placeholders.join(", ")}

## Template

${template.content}`;
}

// ─── Citation Extraction ─────────────────────────────────────────────────────

export function extractCitations(filledContent: string): readonly Citation[] {
	const citations: Citation[] = [];
	const seen = new Set<string>();

	// Match patterns like "Article 35", "Articles 13-14", "Article 53(1)(a)"
	const articleRegex =
		/(?:Articles?\s+\d+(?:\(\d+\))?(?:\([a-z]\))?(?:\s*[-–]\s*\d+(?:\(\d+\))?(?:\([a-z]\))?)?)/g;

	// Match patterns like "Section 5", "Annex III"
	const sectionRegex = /(?:(?:Section|Annex)\s+[IVXLCDM]+(?:\s*§\s*\d+)?)/g;

	const addCitation = (match: string, law: string) => {
		const key = `${law}:${match}`;
		if (!seen.has(key)) {
			seen.add(key);
			citations.push({
				law,
				article: match,
				text: match,
			});
		}
	};

	// Detect which law is being referenced based on surrounding context
	const lines = filledContent.split("\n");
	for (const line of lines) {
		const lowerLine = line.toLowerCase();

		let law = "Unknown";
		if (
			lowerLine.includes("uk gdpr") ||
			lowerLine.includes("dpa 2018") ||
			lowerLine.includes("data protection act 2018")
		) {
			law = "UK GDPR / DPA 2018";
		} else if (lowerLine.includes("gdpr") || lowerLine.includes("2016/679")) {
			law = "GDPR (EU) 2016/679";
		} else if (
			lowerLine.includes("ai act") ||
			lowerLine.includes("2024/1689") ||
			lowerLine.includes("annex iii") ||
			lowerLine.includes("annex xi")
		) {
			law = "EU AI Act (EU) 2024/1689";
		} else if (lowerLine.includes("ftc")) {
			law = "FTC Act";
		} else if (lowerLine.includes("ccpa") || lowerLine.includes("cpra")) {
			law = "CCPA/CPRA";
		} else if (lowerLine.includes("sb 942")) {
			law = "California SB 942";
		} else if (lowerLine.includes("cac") || lowerLine.includes("genai measures")) {
			law = "China CAC GenAI Measures";
		} else if (lowerLine.includes("lgpd")) {
			law = "LGPD";
		} else if (lowerLine.includes("pdpa") || lowerLine.includes("pdpc")) {
			law = "PDPA (Singapore)";
		} else if (lowerLine.includes("consumer duty") || lowerLine.includes("fca")) {
			law = "FCA";
		} else if (lowerLine.includes("online safety act")) {
			law = "Online Safety Act 2023";
		} else if (lowerLine.includes("equality act")) {
			law = "Equality Act 2010";
		} else if (lowerLine.includes("ll144") || lowerLine.includes("local law 144")) {
			law = "NYC Local Law 144";
		} else if (lowerLine.includes("colorado ai act") || lowerLine.includes("sb 205")) {
			law = "Colorado AI Act";
		} else if (lowerLine.includes("bipa") || lowerLine.includes("biometric information privacy")) {
			law = "Illinois BIPA";
		} else if (lowerLine.includes("mas ") || lowerLine.includes("monetary authority")) {
			law = "MAS Guidelines";
		} else if (lowerLine.includes("imda") || lowerLine.includes("agentic ai framework")) {
			law = "IMDA Framework";
		}

		const artRegex = new RegExp(articleRegex.source, "g");
		for (let match = artRegex.exec(line); match !== null; match = artRegex.exec(line)) {
			addCitation(match[0], law);
		}

		const secRegex = new RegExp(sectionRegex.source, "g");
		for (let match = secRegex.exec(line); match !== null; match = secRegex.exec(line)) {
			addCitation(match[0], law);
		}
	}

	return citations;
}

// ─── Post-Processing ─────────────────────────────────────────────────────────

function processJurisdictionConditionals(
	content: string,
	jurisdictions: readonly string[],
): string {
	// Handle {{#if_jurisdiction xxx}} ... {{/if_jurisdiction}} blocks
	const conditionalRegex =
		/###?\s*\{\{\s*#if_jurisdiction\s+(\S+)\s*\}\}\s*\n([\s\S]*?)###?\s*\{\{\s*\/if_jurisdiction\s*\}\}\s*\n?/g;

	return content.replace(conditionalRegex, (_match, jurisdiction: string, block: string) => {
		if (jurisdictions.includes(jurisdiction)) {
			return block;
		}
		return "";
	});
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationResult {
	readonly valid: boolean;
	readonly unfilledPlaceholders: readonly string[];
	readonly missingSections: readonly string[];
}

export function validateFilledTemplate(
	filledContent: string,
	requiredSections: readonly string[],
): ValidationResult {
	const unfilledPlaceholders: string[] = [];
	const regex = new RegExp(PLACEHOLDER_REGEX.source, "g");
	for (let match = regex.exec(filledContent); match !== null; match = regex.exec(filledContent)) {
		unfilledPlaceholders.push(match[1] as string);
	}

	const missingSections: string[] = [];
	for (const sectionId of requiredSections) {
		// Convert section ID to heading text (e.g., "risk-assessment" → "risk assessment")
		const sectionText = sectionId.replace(/-/g, " ");
		const headingRegex = new RegExp(`^##\\s+\\d+\\.\\s+.*${sectionText}`, "im");
		if (!headingRegex.test(filledContent)) {
			missingSections.push(sectionId);
		}
	}

	return {
		valid: unfilledPlaceholders.length === 0 && missingSections.length === 0,
		unfilledPlaceholders,
		missingSections,
	};
}

// ─── Fill Template (Main Entry Point) ────────────────────────────────────────

export async function fillTemplate(options: FillTemplateOptions): Promise<Result<FillResult>> {
	const { template, ctx, jurisdictions, provider } = options;

	const placeholders = extractPlaceholders(template.content);

	const prompt = buildFillPrompt(template, ctx, jurisdictions, placeholders);

	const llmResult = await provider.complete({
		systemPrompt:
			"You are a regulatory compliance document specialist. You fill in compliance document templates with precise, jurisdiction-specific content. You never invent legal requirements — you only reference real provisions from real regulations. When you don't have enough information to fill a section, you clearly mark it as requiring human input.",
		messages: [{ role: "user", content: prompt }],
		temperature: options.temperature ?? 0.2,
		maxTokens: options.maxTokens ?? 8000,
	});

	if (!llmResult.ok) {
		return {
			ok: false,
			error: new Error(
				`LLM completion failed for template "${template.metadata.id}": ${llmResult.error.message}`,
			),
		};
	}

	let filledContent = llmResult.value.content;

	// Process jurisdiction conditionals
	filledContent = processJurisdictionConditionals(filledContent, jurisdictions);

	// Extract structured data from the filled content
	const sections = extractSections(filledContent);
	const citations = extractCitations(filledContent);
	const reviewNotes = buildReviewNotesForContext(ctx, template.metadata.id);

	// Validate — add warnings to review notes if needed
	const validation = validateFilledTemplate(filledContent, template.metadata.requiredSections);

	const allReviewNotes = [
		"DRAFT — This document was auto-generated and has not been reviewed by qualified legal counsel",
		...reviewNotes,
	];
	if (validation.unfilledPlaceholders.length > 0) {
		allReviewNotes.push(
			`WARNING: ${validation.unfilledPlaceholders.length} placeholder(s) were not filled by the LLM: ${validation.unfilledPlaceholders.join(", ")}`,
		);
	}
	if (validation.missingSections.length > 0) {
		allReviewNotes.push(
			`WARNING: ${validation.missingSections.length} required section(s) may be missing: ${validation.missingSections.join(", ")}`,
		);
	}

	// Validate citations against known article registry
	const finalReviewNotes = flagUnverifiedCitations(citations, allReviewNotes);

	return {
		ok: true,
		value: {
			filledContent,
			sections: [...sections],
			reviewNotes: finalReviewNotes,
			citations: [...citations],
		},
	};
}
