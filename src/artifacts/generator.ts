import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	ArtifactRequirement,
	ArtifactType,
	GeneratedArtifact,
	JurisdictionResult,
	LLMProvider,
	ProductContext,
	Result,
} from "../core/types.js";
import { fillTemplate } from "./filler.js";
import type { FillResult } from "./filler.js";

// ─── Template Metadata (parsed from frontmatter) ────────────────────────────

export interface TemplateMetadata {
	readonly id: string;
	readonly name: string;
	readonly jurisdiction: string;
	readonly legalBasis: string;
	readonly requiredSections: readonly string[];
}

export interface LoadedTemplate {
	readonly metadata: TemplateMetadata;
	readonly content: string;
}

// ─── Template ID → ArtifactType mapping ──────────────────────────────────────

const TEMPLATE_ID_TO_ARTIFACT_TYPE: Readonly<Record<string, ArtifactType>> = {
	"dpia-gdpr": "dpia",
	"ai-act-risk-assessment": "risk-classification",
	"transparency-notice": "transparency-notice",
	"model-card": "model-card",
	"gpai-technical-doc": "gpai-technical-documentation",
	"genai-content-policy": "genai-content-policy",
	"bias-audit-nyc": "bias-audit",
	"china-algorithm-filing": "risk-assessment",
	"china-genai-assessment": "risk-assessment",
	"sg-pdpc-risk-assessment": "risk-assessment",
	"agentic-ai-governance": "risk-assessment",
	"post-market-monitoring": "risk-assessment",
	"gpai-systemic-risk": "gpai-systemic-risk-assessment",
	"ai-act-conformity": "conformity-assessment",
	"genai-training-disclosure": "gpai-training-data-summary",
};

// ─── Default template IDs for artifact types without explicit templateId ─────

const ARTIFACT_TYPE_TO_DEFAULT_TEMPLATE: Readonly<Partial<Record<ArtifactType, string>>> = {
	dpia: "dpia-gdpr",
	"risk-classification": "ai-act-risk-assessment",
	"conformity-assessment": "ai-act-conformity",
	"transparency-notice": "transparency-notice",
	"model-card": "model-card",
	"risk-assessment": "ai-act-risk-assessment",
	"gpai-technical-documentation": "gpai-technical-doc",
	"genai-content-policy": "genai-content-policy",
	"bias-audit": "bias-audit-nyc",
	"gpai-systemic-risk-assessment": "gpai-systemic-risk",
	"gpai-training-data-summary": "genai-training-disclosure",
	"algorithmic-impact": "ai-act-risk-assessment",
};

// ─── Template Loading ────────────────────────────────────────────────────────

function getTemplatesDir(): string {
	const currentDir = dirname(fileURLToPath(import.meta.url));
	return join(currentDir, "..", "..", "knowledge", "templates");
}

export function parseFrontmatter(raw: string): Result<{
	metadata: TemplateMetadata;
	content: string;
}> {
	const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!frontmatterMatch) {
		return {
			ok: false,
			error: new Error("Template missing YAML frontmatter delimiters (---)"),
		};
	}

	const yamlBlock = frontmatterMatch[1] as string;
	const content = frontmatterMatch[2] as string;

	const parseYamlValue = (key: string): string | undefined => {
		const match = yamlBlock.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?`, "m"));
		return match ? (match[1] as string).trim() : undefined;
	};

	const parseYamlArray = (key: string): readonly string[] => {
		const arrayMatch = yamlBlock.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)*)`, "m"));
		if (!arrayMatch) return [];
		return (arrayMatch[1] as string)
			.split("\n")
			.map((line) => line.replace(/^\s*-\s*/, "").trim())
			.filter((line) => line.length > 0);
	};

	const id = parseYamlValue("id");
	const name = parseYamlValue("name");
	const jurisdiction = parseYamlValue("jurisdiction");
	const legalBasis = parseYamlValue("legalBasis");
	const requiredSections = parseYamlArray("requiredSections");

	if (!id || !name || !jurisdiction || !legalBasis) {
		return {
			ok: false,
			error: new Error(
				`Template frontmatter missing required fields. Found: id=${id}, name=${name}, jurisdiction=${jurisdiction}, legalBasis=${legalBasis}`,
			),
		};
	}

	return {
		ok: true,
		value: {
			metadata: { id, name, jurisdiction, legalBasis, requiredSections },
			content,
		},
	};
}

export async function loadTemplate(templateId: string): Promise<Result<LoadedTemplate>> {
	const templatesDir = getTemplatesDir();
	const filePath = join(templatesDir, `${templateId}.md`);

	try {
		const raw = await readFile(filePath, "utf-8");
		const parsed = parseFrontmatter(raw);
		if (!parsed.ok) return parsed;

		return {
			ok: true,
			value: {
				metadata: parsed.value.metadata,
				content: parsed.value.content,
			},
		};
	} catch (err) {
		return {
			ok: false,
			error: new Error(`Failed to load template "${templateId}": ${String(err)}`),
		};
	}
}

export async function listAvailableTemplates(): Promise<Result<readonly string[]>> {
	const templatesDir = getTemplatesDir();
	try {
		const files = await readdir(templatesDir);
		const templateIds = files
			.filter((f) => f.endsWith(".md") && f !== "README.md")
			.map((f) => f.replace(/\.md$/, ""));
		return { ok: true, value: templateIds };
	} catch (err) {
		return {
			ok: false,
			error: new Error(`Failed to list templates: ${String(err)}`),
		};
	}
}

// ─── Template Resolution ─────────────────────────────────────────────────────

function resolveTemplateId(requirement: ArtifactRequirement): string | undefined {
	if (requirement.templateId) {
		return requirement.templateId;
	}
	return ARTIFACT_TYPE_TO_DEFAULT_TEMPLATE[requirement.type];
}

// ─── Deduplication ───────────────────────────────────────────────────────────

interface DeduplicatedRequirement {
	readonly requirement: ArtifactRequirement;
	readonly jurisdictions: readonly string[];
	readonly templateId: string;
}

function deduplicateRequirements(
	jurisdictionResults: readonly JurisdictionResult[],
): readonly DeduplicatedRequirement[] {
	const seen = new Map<string, { requirement: ArtifactRequirement; jurisdictions: string[] }>();

	for (const result of jurisdictionResults) {
		for (const req of result.requiredArtifacts) {
			const templateId = resolveTemplateId(req);
			if (!templateId) {
				console.warn(
					`Warning: No template found for artifact type "${req.type}" (jurisdiction: ${result.jurisdiction}). The artifact will not be generated.`,
				);
				continue;
			}

			// Keep jurisdiction-specific templates separate (e.g., UK DPIA vs EU DPIA)
			const isJurisdictionSpecific =
				templateId.includes("-uk") ||
				templateId.includes("-gdpr") ||
				templateId.includes("-nyc") ||
				templateId.includes("china-") ||
				templateId.includes("sg-");
			const key = isJurisdictionSpecific
				? `${templateId}:${req.type}:${result.jurisdiction}`
				: `${templateId}:${req.type}`;
			const existing = seen.get(key);
			if (existing) {
				if (!existing.jurisdictions.includes(result.jurisdiction)) {
					existing.jurisdictions.push(result.jurisdiction);
				}
			} else {
				seen.set(key, {
					requirement: req,
					jurisdictions: [result.jurisdiction],
				});
			}
		}
	}

	return [...seen.entries()].map(([key, entry]) => ({
		requirement: entry.requirement,
		jurisdictions: entry.jurisdictions,
		templateId: key.split(":")[0] as string,
	}));
}

// ─── Filename Generation ─────────────────────────────────────────────────────

function generateFilename(templateId: string, jurisdictions: readonly string[]): string {
	const jurisdictionSuffix = jurisdictions.length === 1 ? jurisdictions[0] : "multi-jurisdiction";
	return `${templateId}-${jurisdictionSuffix}.md`;
}

// ─── Artifact Generation Orchestrator ────────────────────────────────────────

export interface GenerateArtifactsOptions {
	readonly ctx: ProductContext;
	readonly jurisdictionResults: readonly JurisdictionResult[];
	readonly provider: LLMProvider;
}

export interface GenerateArtifactsResult {
	readonly artifacts: readonly GeneratedArtifact[];
	readonly errors: readonly ArtifactGenerationError[];
}

export interface ArtifactGenerationError {
	readonly templateId: string;
	readonly artifactType: ArtifactType;
	readonly error: string;
}

export async function generateArtifacts(
	options: GenerateArtifactsOptions,
): Promise<GenerateArtifactsResult> {
	const { ctx, jurisdictionResults, provider } = options;

	const deduplicated = deduplicateRequirements(jurisdictionResults);

	const artifacts: GeneratedArtifact[] = [];
	const errors: ArtifactGenerationError[] = [];

	// Process in batches to avoid overwhelming LLM provider with concurrent requests
	const BATCH_SIZE = 5;
	const allResults: Array<
		| {
				ok: true;
				entry: DeduplicatedRequirement;
				value: FillResult;
		  }
		| {
				ok: false;
				entry: DeduplicatedRequirement;
				error: string;
		  }
	> = [];

	for (let i = 0; i < deduplicated.length; i += BATCH_SIZE) {
		const batch = deduplicated.slice(i, i + BATCH_SIZE);
		const batchResults = await Promise.all(
			batch.map(async (entry) => {
				const templateResult = await loadTemplate(entry.templateId);
				if (!templateResult.ok) {
					return {
						ok: false as const,
						entry,
						error: templateResult.error.message,
					};
				}

				const template = templateResult.value;
				const fillResult = await fillTemplate({
					template,
					ctx,
					jurisdictions: entry.jurisdictions,
					provider,
				});

				if (!fillResult.ok) {
					return {
						ok: false as const,
						entry,
						error: fillResult.error.message,
					};
				}

				return {
					ok: true as const,
					entry,
					value: fillResult.value,
				};
			}),
		);
		allResults.push(...batchResults);
	}

	const results = allResults;

	for (const result of results) {
		if (!result.ok) {
			errors.push({
				templateId: result.entry.templateId,
				artifactType: result.entry.requirement.type,
				error: result.error,
			});
			continue;
		}

		const artifactType =
			TEMPLATE_ID_TO_ARTIFACT_TYPE[result.entry.templateId] ?? result.entry.requirement.type;

		artifacts.push({
			type: artifactType,
			jurisdiction: result.entry.jurisdictions.join(", "),
			filename: generateFilename(result.entry.templateId, result.entry.jurisdictions),
			content: result.value.filledContent,
			sections: result.value.sections,
			reviewNotes: result.value.reviewNotes,
			citations: result.value.citations,
		});
	}

	return { artifacts, errors };
}
