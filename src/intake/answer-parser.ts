import type { Answer, IntakeQuestion, Result } from "../core/types.js";

export interface AnswerValidationError {
	readonly questionId: string;
	readonly message: string;
}

export function validateAnswer(
	question: IntakeQuestion,
	value: string | readonly string[] | boolean,
	freeText?: string,
): Result<Answer, AnswerValidationError> {
	const fail = (message: string): Result<Answer, AnswerValidationError> => ({
		ok: false,
		error: { questionId: question.id, message },
	});

	switch (question.type) {
		case "free-text": {
			if (typeof value !== "string") {
				return fail("Free-text answer must be a string");
			}
			if (value.trim().length === 0) {
				return fail("Free-text answer cannot be empty");
			}
			break;
		}

		case "single-select": {
			if (typeof value !== "string") {
				return fail("Single-select answer must be a string");
			}
			if (question.options && question.options.length > 0) {
				const validValues = question.options.map((o) => o.value);
				if (!validValues.includes(value)) {
					return fail(`Invalid option "${value}". Valid options: ${validValues.join(", ")}`);
				}
			}
			break;
		}

		case "multi-select": {
			if (!Array.isArray(value)) {
				return fail("Multi-select answer must be an array");
			}
			if (value.length === 0) {
				return fail("Multi-select answer must include at least one option");
			}
			if (question.options && question.options.length > 0) {
				const validValues = question.options.map((o) => o.value);
				for (const v of value) {
					if (!validValues.includes(v)) {
						return fail(`Invalid option "${v}". Valid options: ${validValues.join(", ")}`);
					}
				}
			}
			break;
		}

		case "yes-no": {
			if (typeof value !== "boolean") {
				return fail("Yes/no answer must be a boolean");
			}
			break;
		}

		case "yes-no-elaborate": {
			if (typeof value !== "boolean") {
				return fail("Yes/no answer must be a boolean");
			}
			break;
		}

		case "scale": {
			if (typeof value !== "string") {
				return fail("Scale answer must be a string");
			}
			const num = Number(value);
			if (Number.isNaN(num)) {
				return fail("Scale answer must be a numeric value");
			}
			break;
		}

		default:
			return fail(`Unknown question type: ${question.type}`);
	}

	return {
		ok: true,
		value: {
			questionId: question.id,
			value,
			freeText,
			timestamp: new Date().toISOString(),
		},
	};
}

export function validateAnswers(
	questions: readonly IntakeQuestion[],
	rawAnswers: Readonly<
		Record<string, { value: string | readonly string[] | boolean; freeText?: string }>
	>,
): Result<Readonly<Record<string, Answer>>, readonly AnswerValidationError[]> {
	const validated: Record<string, Answer> = {};
	const errors: AnswerValidationError[] = [];

	for (const question of questions) {
		const raw = rawAnswers[question.id];
		if (!raw) {
			continue;
		}

		const result = validateAnswer(question, raw.value, raw.freeText);
		if (result.ok) {
			validated[question.id] = result.value;
		} else {
			errors.push(result.error);
		}
	}

	if (errors.length > 0) {
		return { ok: false, error: errors };
	}

	return { ok: true, value: validated };
}
