import type { Answer, IntakeQuestion, Jurisdiction, QuestionCondition } from "../core/types.js";

function evaluateCondition(
	condition: QuestionCondition,
	answers: Readonly<Record<string, Answer>>,
): boolean {
	const answer = answers[condition.field];

	if (!answer) {
		return false;
	}

	const answerValue = answer.value;

	switch (condition.operator) {
		case "exists":
			return true;

		case "equals":
			return answerValue === condition.value;

		case "not-equals":
			return answerValue !== condition.value;

		case "includes": {
			if (Array.isArray(answerValue)) {
				if (typeof condition.value === "string") {
					return answerValue.includes(condition.value);
				}
				if (Array.isArray(condition.value)) {
					return answerValue.some((v) => (condition.value as readonly string[]).includes(v));
				}
				return false;
			}

			if (typeof answerValue === "string") {
				if (typeof condition.value === "string") {
					return answerValue === condition.value;
				}
				if (Array.isArray(condition.value)) {
					return (condition.value as readonly string[]).includes(answerValue);
				}
				return false;
			}

			return false;
		}

		default:
			return false;
	}
}

export function isQuestionApplicable(
	question: IntakeQuestion,
	answers: Readonly<Record<string, Answer>>,
	selectedJurisdictions?: readonly Jurisdiction[],
): boolean {
	if (!question.requiredWhen) {
		return true;
	}

	if (!evaluateCondition(question.requiredWhen, answers)) {
		return false;
	}

	if (
		selectedJurisdictions &&
		selectedJurisdictions.length > 0 &&
		question.jurisdictionRelevance &&
		question.jurisdictionRelevance.length > 0
	) {
		const hasRelevantJurisdiction = question.jurisdictionRelevance.some((j) =>
			selectedJurisdictions.includes(j),
		);
		if (!hasRelevantJurisdiction) {
			return false;
		}
	}

	return true;
}

export function getApplicableQuestions(
	allQuestions: readonly IntakeQuestion[],
	answers: Readonly<Record<string, Answer>>,
	selectedJurisdictions?: readonly Jurisdiction[],
): readonly IntakeQuestion[] {
	return allQuestions.filter((q) => isQuestionApplicable(q, answers, selectedJurisdictions));
}

export function getUnansweredQuestions(
	allQuestions: readonly IntakeQuestion[],
	answers: Readonly<Record<string, Answer>>,
	selectedJurisdictions?: readonly Jurisdiction[],
): readonly IntakeQuestion[] {
	const applicable = getApplicableQuestions(allQuestions, answers, selectedJurisdictions);
	return applicable.filter((q) => !answers[q.id]);
}

export function getNextQuestions(
	allQuestions: readonly IntakeQuestion[],
	answers: Readonly<Record<string, Answer>>,
	selectedJurisdictions?: readonly Jurisdiction[],
): readonly IntakeQuestion[] {
	const unanswered = getUnansweredQuestions(allQuestions, answers, selectedJurisdictions);

	const core = unanswered.filter((q) => q.category === "core");
	if (core.length > 0) {
		return core;
	}

	return unanswered;
}
