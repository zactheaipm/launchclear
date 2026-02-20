import { describe, expect, it } from "vitest";
import type { Answer, IntakeQuestion, Jurisdiction } from "../../src/core/types.js";
import {
	getApplicableQuestions,
	getNextQuestions,
	getUnansweredQuestions,
	isQuestionApplicable,
} from "../../src/intake/question-router.js";

// ─── Test Helpers ─────────────────────────────────────────────────────────

function makeAnswer(
	questionId: string,
	value: string | readonly string[] | boolean,
	freeText?: string,
): Answer {
	return { questionId, value, freeText, timestamp: "2026-01-01T00:00:00.000Z" };
}

function makeCoreQuestion(overrides: Partial<IntakeQuestion> = {}): IntakeQuestion {
	return {
		id: "test-core",
		text: "Test core question?",
		type: "free-text",
		category: "core",
		regulatoryRelevance: "Test relevance",
		...overrides,
	};
}

function makeConditionalQuestion(overrides: Partial<IntakeQuestion> = {}): IntakeQuestion {
	return {
		id: "test-conditional",
		text: "Test conditional question?",
		type: "yes-no",
		category: "employment",
		regulatoryRelevance: "Test relevance",
		requiredWhen: {
			field: "user-populations",
			operator: "includes",
			value: ["employees", "job-applicants"],
		},
		...overrides,
	};
}

// ─── isQuestionApplicable ─────────────────────────────────────────────────

describe("isQuestionApplicable", () => {
	it("returns true for core questions with no requiredWhen", () => {
		const question = makeCoreQuestion();
		expect(isQuestionApplicable(question, {})).toBe(true);
	});

	it("returns true for core questions even with no answers", () => {
		const question = makeCoreQuestion({ id: "product-description" });
		expect(isQuestionApplicable(question, {})).toBe(true);
	});

	it("returns false when trigger condition is not met", () => {
		const question = makeConditionalQuestion();
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	it("returns false when referenced question has not been answered", () => {
		const question = makeConditionalQuestion();
		expect(isQuestionApplicable(question, {})).toBe(false);
	});

	// ── Employment triggers ──────────────────────────────────────────────

	it("triggers employment questions when user-populations includes job-applicants", () => {
		const question = makeConditionalQuestion({
			id: "employment-use-case",
			category: "employment",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: ["employees", "job-applicants"],
			},
		});
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers", "job-applicants"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("triggers employment questions when user-populations includes employees", () => {
		const question = makeConditionalQuestion({
			id: "employment-use-case",
			category: "employment",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: ["employees", "job-applicants"],
			},
		});
		const answers = {
			"user-populations": makeAnswer("user-populations", ["employees"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("does not trigger employment questions for consumer-only populations", () => {
		const question = makeConditionalQuestion({
			id: "employment-use-case",
			category: "employment",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: ["employees", "job-applicants"],
			},
		});
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers", "businesses"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── Minors triggers ──────────────────────────────────────────────────

	it("triggers minors questions when user-populations includes minors", () => {
		const question = makeConditionalQuestion({
			id: "age-verification-method",
			category: "minors",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: "minors",
			},
		});
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers", "minors"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("does not trigger minors questions when minors are not in populations", () => {
		const question = makeConditionalQuestion({
			id: "age-verification-method",
			category: "minors",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: "minors",
			},
		});
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers", "businesses"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── Data practices triggers ──────────────────────────────────────────

	it("triggers data practices questions when personal data is selected", () => {
		const question = makeConditionalQuestion({
			id: "data-collection-method",
			category: "data-practices",
			requiredWhen: {
				field: "data-categories",
				operator: "includes",
				value: ["personal", "sensitive", "biometric", "health", "financial"],
			},
		});
		const answers = {
			"data-categories": makeAnswer("data-categories", ["personal", "behavioral"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("does not trigger data practices when only anonymized data", () => {
		const question = makeConditionalQuestion({
			id: "data-collection-method",
			category: "data-practices",
			requiredWhen: {
				field: "data-categories",
				operator: "includes",
				value: ["personal", "sensitive", "biometric", "health", "financial"],
			},
		});
		const answers = {
			"data-categories": makeAnswer("data-categories", ["anonymized", "public"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── Automated decisions triggers ─────────────────────────────────────

	it("triggers ADM questions when decision-impact is material", () => {
		const question = makeConditionalQuestion({
			id: "decision-domains",
			category: "automated-decisions",
			requiredWhen: {
				field: "decision-impact",
				operator: "not-equals",
				value: "advisory",
			},
		});
		const answers = {
			"decision-impact": makeAnswer("decision-impact", "material"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("triggers ADM questions when decision-impact is determinative", () => {
		const question = makeConditionalQuestion({
			id: "decision-domains",
			category: "automated-decisions",
			requiredWhen: {
				field: "decision-impact",
				operator: "not-equals",
				value: "advisory",
			},
		});
		const answers = {
			"decision-impact": makeAnswer("decision-impact", "determinative"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("does not trigger ADM questions when decision-impact is advisory", () => {
		const question = makeConditionalQuestion({
			id: "decision-domains",
			category: "automated-decisions",
			requiredWhen: {
				field: "decision-impact",
				operator: "not-equals",
				value: "advisory",
			},
		});
		const answers = {
			"decision-impact": makeAnswer("decision-impact", "advisory"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── Operator: equals ─────────────────────────────────────────────────

	it("handles equals operator correctly", () => {
		const question = makeConditionalQuestion({
			id: "test-equals",
			requiredWhen: {
				field: "product-type",
				operator: "equals",
				value: "classifier",
			},
		});

		const matchingAnswers = {
			"product-type": makeAnswer("product-type", "classifier"),
		};
		expect(isQuestionApplicable(question, matchingAnswers)).toBe(true);

		const nonMatchingAnswers = {
			"product-type": makeAnswer("product-type", "generator"),
		};
		expect(isQuestionApplicable(question, nonMatchingAnswers)).toBe(false);
	});

	// ── Operator: exists ─────────────────────────────────────────────────

	it("handles exists operator correctly", () => {
		const question = makeConditionalQuestion({
			id: "test-exists",
			requiredWhen: {
				field: "product-description",
				operator: "exists",
				value: true,
			},
		});

		expect(isQuestionApplicable(question, {})).toBe(false);

		const answers = {
			"product-description": makeAnswer("product-description", "An AI hiring tool"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	// ── GenAI triggers ──────────────────────────────────────────────────

	it("triggers GenAI questions when product-type is generator", () => {
		const question = makeConditionalQuestion({
			id: "genai-foundation-model-source",
			category: "generative-ai",
			requiredWhen: {
				field: "product-type",
				operator: "includes",
				value: ["generator", "foundation-model", "agent"],
			},
		});
		const answers = {
			"product-type": makeAnswer("product-type", "generator"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("triggers GenAI questions when product-type is foundation-model", () => {
		const question = makeConditionalQuestion({
			id: "genai-foundation-model-source",
			category: "generative-ai",
			requiredWhen: {
				field: "product-type",
				operator: "includes",
				value: ["generator", "foundation-model", "agent"],
			},
		});
		const answers = {
			"product-type": makeAnswer("product-type", "foundation-model"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("triggers GenAI questions when product-type is agent", () => {
		const question = makeConditionalQuestion({
			id: "genai-foundation-model-source",
			category: "generative-ai",
			requiredWhen: {
				field: "product-type",
				operator: "includes",
				value: ["generator", "foundation-model", "agent"],
			},
		});
		const answers = {
			"product-type": makeAnswer("product-type", "agent"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("does not trigger GenAI questions for classifier product type", () => {
		const question = makeConditionalQuestion({
			id: "genai-foundation-model-source",
			category: "generative-ai",
			requiredWhen: {
				field: "product-type",
				operator: "includes",
				value: ["generator", "foundation-model", "agent"],
			},
		});
		const answers = {
			"product-type": makeAnswer("product-type", "classifier"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── GPAI triggers (EU-specific) ─────────────────────────────────────

	it("triggers GPAI questions when EU is selected", () => {
		const question = makeConditionalQuestion({
			id: "gpai-role",
			category: "gpai",
			jurisdictionRelevance: ["eu-ai-act"],
			requiredWhen: {
				field: "target-markets",
				operator: "includes",
				value: "eu-ai-act",
			},
		});
		const answers = {
			"target-markets": makeAnswer("target-markets", ["eu-ai-act", "uk"]),
		};
		expect(isQuestionApplicable(question, answers, ["eu-ai-act", "uk"])).toBe(true);
	});

	it("does not trigger GPAI questions when EU is not selected", () => {
		const question = makeConditionalQuestion({
			id: "gpai-role",
			category: "gpai",
			jurisdictionRelevance: ["eu-ai-act"],
			requiredWhen: {
				field: "target-markets",
				operator: "includes",
				value: "eu-ai-act",
			},
		});
		const answers = {
			"target-markets": makeAnswer("target-markets", ["uk", "singapore"]),
		};
		expect(isQuestionApplicable(question, answers, ["uk", "singapore"])).toBe(false);
	});

	// ── China-specific GenAI triggers ───────────────────────────────────

	it("triggers China algorithm filing question when China is selected", () => {
		const question = makeConditionalQuestion({
			id: "genai-china-algorithm-filing",
			category: "generative-ai",
			jurisdictionRelevance: ["china"],
			requiredWhen: {
				field: "target-markets",
				operator: "includes",
				value: "china",
			},
		});
		const answers = {
			"target-markets": makeAnswer("target-markets", ["china", "singapore"]),
		};
		expect(isQuestionApplicable(question, answers, ["china", "singapore"])).toBe(true);
	});

	it("does not trigger China questions when China is not selected", () => {
		const question = makeConditionalQuestion({
			id: "genai-china-algorithm-filing",
			category: "generative-ai",
			jurisdictionRelevance: ["china"],
			requiredWhen: {
				field: "target-markets",
				operator: "includes",
				value: "china",
			},
		});
		const answers = {
			"target-markets": makeAnswer("target-markets", ["eu-ai-act", "uk"]),
		};
		expect(isQuestionApplicable(question, answers, ["eu-ai-act", "uk"])).toBe(false);
	});

	// ── Agentic AI triggers ─────────────────────────────────────────────

	it("triggers agentic AI questions when agentic capabilities are present", () => {
		const question = makeConditionalQuestion({
			id: "agentic-autonomy-level",
			category: "agentic-ai",
			requiredWhen: {
				field: "genai-agentic-capabilities",
				operator: "equals",
				value: true,
			},
		});
		const answers = {
			"genai-agentic-capabilities": makeAnswer("genai-agentic-capabilities", true),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("triggers agentic AI questions regardless of jurisdiction", () => {
		const question = makeConditionalQuestion({
			id: "agentic-autonomy-level",
			category: "agentic-ai",
			jurisdictionRelevance: ["singapore", "eu-ai-act", "uk", "us-federal", "china"],
			requiredWhen: {
				field: "genai-agentic-capabilities",
				operator: "equals",
				value: true,
			},
		});
		const answers = {
			"genai-agentic-capabilities": makeAnswer("genai-agentic-capabilities", true),
		};
		// Should trigger for US-only jurisdictions since question covers us-federal
		const usJurisdictions: Jurisdiction[] = ["us-federal", "us-ca"];
		expect(isQuestionApplicable(question, answers, usJurisdictions)).toBe(true);
	});

	it("does not trigger agentic AI questions when agentic capabilities are false", () => {
		const question = makeConditionalQuestion({
			id: "agentic-autonomy-level",
			category: "agentic-ai",
			requiredWhen: {
				field: "genai-agentic-capabilities",
				operator: "equals",
				value: true,
			},
		});
		const answers = {
			"genai-agentic-capabilities": makeAnswer("genai-agentic-capabilities", false),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── Singapore IMDA agentic questions ────────────────────────────────

	it("triggers Singapore-specific agentic questions for SG + agentic products", () => {
		// The agentic questions have jurisdictionRelevance including singapore.
		// When SG is selected and agentic capabilities are true, they should trigger.
		const question = makeConditionalQuestion({
			id: "agentic-failsafe-mechanisms",
			category: "agentic-ai",
			jurisdictionRelevance: ["singapore", "eu-ai-act", "uk", "us-federal"],
			requiredWhen: {
				field: "genai-agentic-capabilities",
				operator: "equals",
				value: true,
			},
		});
		const answers = {
			"genai-agentic-capabilities": makeAnswer("genai-agentic-capabilities", true),
		};
		const sgJurisdictions: Jurisdiction[] = ["singapore"];
		expect(isQuestionApplicable(question, answers, sgJurisdictions)).toBe(true);
	});

	// ── Financial services triggers ─────────────────────────────────────

	it("triggers financial services questions when decision domains include credit", () => {
		const question = makeConditionalQuestion({
			id: "financial-involves-credit",
			category: "financial-services",
			requiredWhen: {
				field: "decision-domains",
				operator: "includes",
				value: ["credit", "insurance"],
			},
		});
		const answers = {
			"decision-domains": makeAnswer("decision-domains", ["credit"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("triggers financial services questions when decision domains include insurance", () => {
		const question = makeConditionalQuestion({
			id: "financial-involves-insurance-pricing",
			category: "financial-services",
			requiredWhen: {
				field: "decision-domains",
				operator: "includes",
				value: ["credit", "insurance"],
			},
		});
		const answers = {
			"decision-domains": makeAnswer("decision-domains", ["insurance"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
	});

	it("does not trigger financial services questions for non-financial decision domains", () => {
		const question = makeConditionalQuestion({
			id: "financial-involves-credit",
			category: "financial-services",
			requiredWhen: {
				field: "decision-domains",
				operator: "includes",
				value: ["credit", "insurance"],
			},
		});
		const answers = {
			"decision-domains": makeAnswer("decision-domains", ["employment", "education"]),
		};
		expect(isQuestionApplicable(question, answers)).toBe(false);
	});

	// ── MAS guidelines trigger (Singapore + financial services) ─────────

	it("triggers MAS materiality assessment question for Singapore + financial services", () => {
		const question = makeConditionalQuestion({
			id: "financial-materiality-assessment",
			category: "financial-services",
			jurisdictionRelevance: ["singapore"],
			requiredWhen: {
				field: "target-markets",
				operator: "includes",
				value: "singapore",
			},
		});
		const answers = {
			"target-markets": makeAnswer("target-markets", ["singapore", "eu-ai-act"]),
		};
		const jurisdictions: Jurisdiction[] = ["singapore", "eu-ai-act"];
		expect(isQuestionApplicable(question, answers, jurisdictions)).toBe(true);
	});

	it("does not trigger MAS materiality assessment when Singapore is not selected", () => {
		const question = makeConditionalQuestion({
			id: "financial-materiality-assessment",
			category: "financial-services",
			jurisdictionRelevance: ["singapore"],
			requiredWhen: {
				field: "target-markets",
				operator: "includes",
				value: "singapore",
			},
		});
		const answers = {
			"target-markets": makeAnswer("target-markets", ["eu-ai-act", "uk"]),
		};
		const jurisdictions: Jurisdiction[] = ["eu-ai-act", "uk"];
		expect(isQuestionApplicable(question, answers, jurisdictions)).toBe(false);
	});

	// ── EU Annex III §5 high-risk triggers ──────────────────────────────

	it("triggers EU credit scoring high-risk question for EU + credit", () => {
		const question = makeConditionalQuestion({
			id: "financial-involves-credit",
			category: "financial-services",
			jurisdictionRelevance: [
				"eu-ai-act",
				"us-federal",
				"us-ca",
				"us-co",
				"uk",
				"singapore",
				"brazil",
			],
			requiredWhen: {
				field: "decision-domains",
				operator: "includes",
				value: ["credit", "insurance"],
			},
		});
		const answers = {
			"decision-domains": makeAnswer("decision-domains", ["credit"]),
		};
		const jurisdictions: Jurisdiction[] = ["eu-ai-act", "eu-gdpr"];
		expect(isQuestionApplicable(question, answers, jurisdictions)).toBe(true);
	});

	it("triggers EU insurance pricing high-risk question for EU + insurance", () => {
		const question = makeConditionalQuestion({
			id: "financial-involves-insurance-pricing",
			category: "financial-services",
			jurisdictionRelevance: ["eu-ai-act", "uk", "singapore", "us-federal"],
			requiredWhen: {
				field: "decision-domains",
				operator: "includes",
				value: ["credit", "insurance"],
			},
		});
		const answers = {
			"decision-domains": makeAnswer("decision-domains", ["insurance"]),
		};
		const jurisdictions: Jurisdiction[] = ["eu-ai-act"];
		expect(isQuestionApplicable(question, answers, jurisdictions)).toBe(true);
	});

	// ── Jurisdiction filtering ────────────────────────────────────────────

	it("filters by jurisdiction when both question and selection have jurisdictions", () => {
		const question = makeConditionalQuestion({
			id: "test-jurisdiction",
			jurisdictionRelevance: ["eu-ai-act", "eu-gdpr"],
			requiredWhen: {
				field: "decision-impact",
				operator: "not-equals",
				value: "advisory",
			},
		});
		const answers = {
			"decision-impact": makeAnswer("decision-impact", "material"),
		};

		const euJurisdictions: Jurisdiction[] = ["eu-ai-act"];
		expect(isQuestionApplicable(question, answers, euJurisdictions)).toBe(true);

		const usOnlyJurisdictions: Jurisdiction[] = ["us-ca", "us-ny"];
		expect(isQuestionApplicable(question, answers, usOnlyJurisdictions)).toBe(false);
	});

	it("does not filter by jurisdiction when no jurisdictions are selected", () => {
		const question = makeConditionalQuestion({
			id: "test-no-jurisdiction-filter",
			jurisdictionRelevance: ["eu-ai-act"],
			requiredWhen: {
				field: "decision-impact",
				operator: "not-equals",
				value: "advisory",
			},
		});
		const answers = {
			"decision-impact": makeAnswer("decision-impact", "material"),
		};
		expect(isQuestionApplicable(question, answers)).toBe(true);
		expect(isQuestionApplicable(question, answers, [])).toBe(true);
	});
});

// ─── getApplicableQuestions ───────────────────────────────────────────────

describe("getApplicableQuestions", () => {
	const coreQuestion = makeCoreQuestion({ id: "core-1" });
	const employmentQuestion = makeConditionalQuestion({
		id: "emp-1",
		category: "employment",
		requiredWhen: {
			field: "user-populations",
			operator: "includes",
			value: ["employees", "job-applicants"],
		},
	});
	const minorsQuestion = makeConditionalQuestion({
		id: "minors-1",
		category: "minors",
		requiredWhen: {
			field: "user-populations",
			operator: "includes",
			value: "minors",
		},
	});
	const admQuestion = makeConditionalQuestion({
		id: "adm-1",
		category: "automated-decisions",
		requiredWhen: {
			field: "decision-impact",
			operator: "not-equals",
			value: "advisory",
		},
	});

	const allQuestions = [coreQuestion, employmentQuestion, minorsQuestion, admQuestion];

	it("returns only core questions when no answers are provided", () => {
		const result = getApplicableQuestions(allQuestions, {});
		expect(result).toEqual([coreQuestion]);
	});

	it("returns core + employment questions for hiring scenario", () => {
		const answers = {
			"user-populations": makeAnswer("user-populations", ["job-applicants"]),
			"decision-impact": makeAnswer("decision-impact", "advisory"),
		};
		const result = getApplicableQuestions(allQuestions, answers);
		expect(result).toContainEqual(coreQuestion);
		expect(result).toContainEqual(employmentQuestion);
		expect(result).not.toContainEqual(minorsQuestion);
		expect(result).not.toContainEqual(admQuestion);
	});

	it("returns core + minors questions when minors are users", () => {
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers", "minors"]),
			"decision-impact": makeAnswer("decision-impact", "advisory"),
		};
		const result = getApplicableQuestions(allQuestions, answers);
		expect(result).toContainEqual(coreQuestion);
		expect(result).toContainEqual(minorsQuestion);
		expect(result).not.toContainEqual(employmentQuestion);
	});

	it("returns core + ADM questions for material decision impact", () => {
		const answers = {
			"user-populations": makeAnswer("user-populations", ["consumers"]),
			"decision-impact": makeAnswer("decision-impact", "determinative"),
		};
		const result = getApplicableQuestions(allQuestions, answers);
		expect(result).toContainEqual(coreQuestion);
		expect(result).toContainEqual(admQuestion);
		expect(result).not.toContainEqual(employmentQuestion);
		expect(result).not.toContainEqual(minorsQuestion);
	});

	it("returns all questions for a hiring AI targeting minors with determinative impact", () => {
		const answers = {
			"user-populations": makeAnswer("user-populations", ["job-applicants", "minors"]),
			"decision-impact": makeAnswer("decision-impact", "determinative"),
		};
		const result = getApplicableQuestions(allQuestions, answers);
		expect(result).toHaveLength(4);
	});
});

// ─── getUnansweredQuestions ───────────────────────────────────────────────

describe("getUnansweredQuestions", () => {
	it("excludes already-answered questions", () => {
		const q1 = makeCoreQuestion({ id: "q1" });
		const q2 = makeCoreQuestion({ id: "q2" });
		const q3 = makeCoreQuestion({ id: "q3" });

		const answers = {
			q1: makeAnswer("q1", "answered"),
		};

		const result = getUnansweredQuestions([q1, q2, q3], answers);
		expect(result).toHaveLength(2);
		expect(result.map((q) => q.id)).toEqual(["q2", "q3"]);
	});

	it("returns empty array when all questions are answered", () => {
		const q1 = makeCoreQuestion({ id: "q1" });
		const answers = {
			q1: makeAnswer("q1", "answered"),
		};
		const result = getUnansweredQuestions([q1], answers);
		expect(result).toHaveLength(0);
	});
});

// ─── getNextQuestions ─────────────────────────────────────────────────────

describe("getNextQuestions", () => {
	it("returns core questions first even when conditional questions are available", () => {
		const coreQ = makeCoreQuestion({ id: "unanswered-core" });
		const empQ = makeConditionalQuestion({
			id: "emp-triggered",
			category: "employment",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: ["employees"],
			},
		});

		const answers = {
			"user-populations": makeAnswer("user-populations", ["employees"]),
		};

		const result = getNextQuestions([coreQ, empQ], answers);
		expect(result).toEqual([coreQ]);
	});

	it("returns conditional questions when all core questions are answered", () => {
		const coreQ = makeCoreQuestion({ id: "answered-core" });
		const empQ = makeConditionalQuestion({
			id: "emp-triggered",
			category: "employment",
			requiredWhen: {
				field: "user-populations",
				operator: "includes",
				value: ["employees"],
			},
		});

		const answers = {
			"answered-core": makeAnswer("answered-core", "done"),
			"user-populations": makeAnswer("user-populations", ["employees"]),
		};

		const result = getNextQuestions([coreQ, empQ], answers);
		expect(result).toEqual([empQ]);
	});

	it("returns empty array when all questions are answered", () => {
		const coreQ = makeCoreQuestion({ id: "q1" });
		const answers = {
			q1: makeAnswer("q1", "done"),
		};
		const result = getNextQuestions([coreQ], answers);
		expect(result).toHaveLength(0);
	});
});
