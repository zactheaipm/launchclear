import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IntakeQuestionSchema } from "../core/schema.js";
import type { IntakeQuestion, QuestionCategory, Result } from "../core/types.js";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const QUESTIONS_DIR = join(CURRENT_DIR, "../../knowledge/questions");

const QUESTION_FILES: Readonly<Record<string, string>> = {
	core: "core.json",
	"data-practices": "data-practices.json",
	"automated-decisions": "automated-decisions.json",
	minors: "minors.json",
	biometric: "biometric.json",
	employment: "employment.json",
	health: "health.json",
	"training-data": "training-data.json",
	"jurisdiction-specific": "jurisdiction-specific.json",
	gpai: "gpai.json",
	"generative-ai": "generative-ai.json",
	"agentic-ai": "agentic-ai.json",
	"financial-services": "financial-services.json",
};

function loadQuestionFile(filename: string): Result<readonly IntakeQuestion[]> {
	const filePath = join(QUESTIONS_DIR, filename);
	try {
		const raw = readFileSync(filePath, "utf-8");
		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) {
			return { ok: false, error: new Error(`Expected array in ${filename}`) };
		}

		const questions: IntakeQuestion[] = [];
		for (const [index, item] of parsed.entries()) {
			const result = IntakeQuestionSchema.safeParse(item);
			if (!result.success) {
				return {
					ok: false,
					error: new Error(
						`Invalid question at index ${index} in ${filename}: ${result.error.message}`,
					),
				};
			}
			questions.push(result.data);
		}

		return { ok: true, value: questions };
	} catch (err) {
		if (err instanceof Error && "code" in err && err.code === "ENOENT") {
			return { ok: true, value: [] };
		}
		return {
			ok: false,
			error: err instanceof Error ? err : new Error(String(err)),
		};
	}
}

export function loadQuestionsByCategory(
	category: QuestionCategory,
): Result<readonly IntakeQuestion[]> {
	const filename = QUESTION_FILES[category];
	if (!filename) {
		return { ok: false, error: new Error(`Unknown question category: ${category}`) };
	}
	return loadQuestionFile(filename);
}

export function loadAllQuestions(): Result<readonly IntakeQuestion[]> {
	const allQuestions: IntakeQuestion[] = [];
	const categories = Object.keys(QUESTION_FILES) as QuestionCategory[];

	for (const category of categories) {
		const result = loadQuestionsByCategory(category);
		if (!result.ok) {
			return result;
		}
		allQuestions.push(...result.value);
	}

	const ids = new Set<string>();
	for (const question of allQuestions) {
		if (ids.has(question.id)) {
			return { ok: false, error: new Error(`Duplicate question ID: ${question.id}`) };
		}
		ids.add(question.id);
	}

	return { ok: true, value: allQuestions };
}

export function getQuestionById(
	questions: readonly IntakeQuestion[],
	id: string,
): IntakeQuestion | undefined {
	return questions.find((q) => q.id === id);
}
