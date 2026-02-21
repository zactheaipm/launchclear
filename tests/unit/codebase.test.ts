import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeCodebase } from "../../src/codebase/analyzer.js";
import {
	aggregateConfidence,
	boostByFileCount,
	isAutoFillable,
	requiresConfirmation,
} from "../../src/codebase/confidence.js";
import { extractDataCollection } from "../../src/codebase/extractors/data-collection.js";
import { extractDataStorage } from "../../src/codebase/extractors/data-storage.js";
import {
	extractAgentic,
	extractContentSafety,
	extractFinancialServices,
	extractGenAi,
	extractRag,
	extractWatermarking,
} from "../../src/codebase/extractors/genai-detection.js";
import { extractModelInference } from "../../src/codebase/extractors/model-inference.js";
import { extractThirdParty } from "../../src/codebase/extractors/third-party.js";
import { extractTrainingData } from "../../src/codebase/extractors/training-data.js";
import { extractUserAuth } from "../../src/codebase/extractors/user-auth.js";
import { detectGaps } from "../../src/codebase/gap-detector.js";
import { allPatterns, getPatternsForCategory } from "../../src/codebase/patterns.js";
import type { CodebaseContext, CodebaseSignal } from "../../src/core/types.js";

// ─── Pattern Registry Tests ─────────────────────────────────────────────────

describe("patterns", () => {
	it("has patterns for all signal categories", () => {
		const categories = [
			"data-collection",
			"data-storage",
			"pii",
			"third-party",
			"automated-decision",
			"user-auth",
			"training-data",
			"genai",
			"rag",
			"content-safety",
			"watermarking",
			"agentic",
			"financial-services",
		] as const;

		for (const category of categories) {
			const patterns = getPatternsForCategory(category);
			expect(patterns.length).toBeGreaterThan(0);
		}
	});

	it("all patterns have unique IDs", () => {
		const ids = allPatterns.map((p) => p.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

// ─── Confidence Scoring Tests ───────────────────────────────────────────────

describe("confidence scoring", () => {
	const makeSignal = (confidence: "high" | "medium" | "low"): CodebaseSignal => ({
		category: "pii",
		type: "test",
		description: "test signal",
		filePath: "test.ts",
		lineNumber: 1,
		confidence,
		evidence: "test",
	});

	it("returns low for empty signals", () => {
		expect(aggregateConfidence([])).toBe("low");
	});

	it("returns the confidence of a single signal", () => {
		expect(aggregateConfidence([makeSignal("high")])).toBe("high");
		expect(aggregateConfidence([makeSignal("medium")])).toBe("medium");
		expect(aggregateConfidence([makeSignal("low")])).toBe("low");
	});

	it("corroborating signals boost confidence", () => {
		// Three medium signals should boost to high (avg 2.0 + bonus 0.5 = 2.5)
		expect(
			aggregateConfidence([makeSignal("medium"), makeSignal("medium"), makeSignal("medium")]),
		).toBe("high");
	});

	it("multiple low signals boost to medium", () => {
		expect(aggregateConfidence([makeSignal("low"), makeSignal("low"), makeSignal("low")])).toBe(
			"medium",
		);
	});

	it("boostByFileCount promotes with multiple files", () => {
		expect(boostByFileCount("low", 2)).toBe("medium");
		expect(boostByFileCount("medium", 2)).toBe("high");
		expect(boostByFileCount("low", 3)).toBe("high");
	});

	it("isAutoFillable only for high confidence", () => {
		expect(isAutoFillable("high")).toBe(true);
		expect(isAutoFillable("medium")).toBe(false);
		expect(isAutoFillable("low")).toBe(false);
	});

	it("requiresConfirmation for non-high confidence", () => {
		expect(requiresConfirmation("high")).toBe(false);
		expect(requiresConfirmation("medium")).toBe(true);
		expect(requiresConfirmation("low")).toBe(true);
	});
});

// ─── Data Collection Extractor Tests ────────────────────────────────────────

describe("extractDataCollection", () => {
	it("detects Express request body parsing", () => {
		const code = `app.post("/users", (req, res) => {\n  const data = req.body;\n});`;
		const signals = extractDataCollection("routes.ts", code);
		expect(signals.length).toBeGreaterThan(0);
		expect(signals.some((s) => s.type === "dc-express-body")).toBe(true);
	});

	it("detects REST API POST endpoint", () => {
		const code = `router.post('/api/users', handler);`;
		const signals = extractDataCollection("routes.ts", code);
		expect(signals.some((s) => s.type === "dc-rest-write")).toBe(true);
	});

	it("detects Zod validation schema", () => {
		const code = "const schema = z.object({ name: z.string(), email: z.string() });";
		const signals = extractDataCollection("schema.ts", code);
		expect(signals.some((s) => s.type === "dc-zod-schema")).toBe(true);
	});

	it("returns empty for unrelated code", () => {
		const code = "const x = 1 + 2;\nconsole.log(x);";
		const signals = extractDataCollection("math.ts", code);
		expect(signals).toHaveLength(0);
	});
});

// ─── Data Storage / PII Extractor Tests ─────────────────────────────────────

describe("extractDataStorage", () => {
	it("detects Prisma model definition", () => {
		const code = "model User {\n  id String @id\n  email String\n}";
		const signals = extractDataStorage("schema.prisma", code);
		expect(signals.some((s) => s.type === "ds-prisma-model")).toBe(true);
	});

	it("detects PII fields: email", () => {
		const code = `const user = { email: "test@example.com" };`;
		const signals = extractDataStorage("user.ts", code);
		expect(signals.some((s) => s.type === "pii-email")).toBe(true);
	});

	it("detects PII fields: dateOfBirth", () => {
		const code = `const dateOfBirth = new Date("1990-01-01");`;
		const signals = extractDataStorage("user.ts", code);
		expect(signals.some((s) => s.type === "pii-dob")).toBe(true);
	});

	it("detects PII fields: SSN", () => {
		const code = "const ssn = encrypt(user.socialSecurityNumber);";
		const signals = extractDataStorage("user.ts", code);
		expect(signals.some((s) => s.type === "pii-ssn")).toBe(true);
	});

	it("detects Mongoose schema", () => {
		const code = "const userSchema = new mongoose.Schema({\n  name: String,\n});";
		const signals = extractDataStorage("model.ts", code);
		expect(signals.some((s) => s.type === "ds-mongoose-schema")).toBe(true);
	});

	it("detects Drizzle table", () => {
		const code = `export const users = pgTable('users', {\n  id: serial('id'),\n});`;
		const signals = extractDataStorage("schema.ts", code);
		expect(signals.some((s) => s.type === "ds-drizzle-table")).toBe(true);
	});
});

// ─── Model Inference Extractor Tests ────────────────────────────────────────

describe("extractModelInference", () => {
	it("detects model.predict() calls", () => {
		const code = "const result = model.predict(input);";
		const signals = extractModelInference("inference.ts", code);
		expect(signals.some((s) => s.type === "ad-model-predict")).toBe(true);
	});

	it("detects threshold comparisons", () => {
		const code = "if (score >= threshold) {\n  approve();\n}";
		const signals = extractModelInference("decision.ts", code);
		expect(signals.some((s) => s.type === "ad-threshold")).toBe(true);
	});

	it("detects scoring functions", () => {
		const code = "function calculateScore(applicant) { return 0.85; }";
		const signals = extractModelInference("scoring.ts", code);
		expect(signals.some((s) => s.type === "ad-scoring")).toBe(true);
	});
});

// ─── User Auth Extractor Tests ──────────────────────────────────────────────

describe("extractUserAuth", () => {
	it("detects NextAuth", () => {
		const code = `import NextAuth from "next-auth";`;
		const signals = extractUserAuth("auth.ts", code);
		expect(signals.some((s) => s.type === "ua-nextauth")).toBe(true);
	});

	it("detects JWT authentication", () => {
		const code = "const token = jwt.sign({ userId }, JWT_SECRET);";
		const signals = extractUserAuth("auth.ts", code);
		expect(signals.some((s) => s.type === "ua-jwt")).toBe(true);
	});

	it("detects age verification", () => {
		const code = "if (isMinor(user.dateOfBirth)) {\n  return restrict();\n}";
		const signals = extractUserAuth("auth.ts", code);
		expect(signals.some((s) => s.type === "ua-age-verify")).toBe(true);
	});

	it("detects consent collection", () => {
		const code = "const gdprConsent = await getUserConsent(userId);";
		const signals = extractUserAuth("consent.ts", code);
		expect(signals.some((s) => s.type === "ua-consent")).toBe(true);
	});
});

// ─── Third-Party Extractor Tests ────────────────────────────────────────────

describe("extractThirdParty", () => {
	it("detects Segment analytics import", () => {
		const code = `import Analytics from "@segment/analytics-node";`;
		const signals = extractThirdParty("analytics.ts", code);
		expect(signals.some((s) => s.type === "tp-segment")).toBe(true);
		expect(signals[0]?.confidence).toBe("high");
	});

	it("detects OpenAI API as third party", () => {
		const code = `import OpenAI from "openai";`;
		const signals = extractThirdParty("ai.ts", code);
		expect(signals.some((s) => s.type === "tp-openai-api")).toBe(true);
	});

	it("detects Google Analytics", () => {
		const code = `gtag('event', 'purchase', { value: 100 });`;
		const signals = extractThirdParty("tracking.ts", code);
		expect(signals.some((s) => s.type === "tp-google-analytics")).toBe(true);
	});

	it("detects Mixpanel", () => {
		const code = `mixpanel.track("signup", { plan: "pro" });`;
		const signals = extractThirdParty("analytics.ts", code);
		expect(signals.some((s) => s.type === "tp-mixpanel")).toBe(true);
	});

	it("detects Sentry", () => {
		const code = `Sentry.init({ dsn: "https://..." });`;
		const signals = extractThirdParty("error.ts", code);
		expect(signals.some((s) => s.type === "tp-sentry")).toBe(true);
	});
});

// ─── Training Data Extractor Tests ──────────────────────────────────────────

describe("extractTrainingData", () => {
	it("detects HuggingFace reference", () => {
		const code = `import { pipeline } from "@huggingface/transformers";`;
		const signals = extractTrainingData("train.ts", code);
		expect(signals.some((s) => s.type === "td-huggingface")).toBe(true);
	});

	it("detects fine-tuning code", () => {
		const code = "const adapter = new LoRA({ rank: 16 });";
		const signals = extractTrainingData("finetune.ts", code);
		expect(signals.some((s) => s.type === "td-finetuning")).toBe(true);
	});
});

// ─── GenAI Detection Extractor Tests ────────────────────────────────────────

describe("extractGenAi", () => {
	it("detects OpenAI SDK import", () => {
		const code = `import OpenAI from "openai";`;
		const signals = extractGenAi("chat.ts", code);
		expect(signals.some((s) => s.type === "genai-openai-sdk")).toBe(true);
		expect(signals[0]?.confidence).toBe("high");
	});

	it("detects Anthropic SDK import", () => {
		const code = `import Anthropic from "@anthropic-ai/sdk";`;
		const signals = extractGenAi("ai.ts", code);
		expect(signals.some((s) => s.type === "genai-anthropic-sdk")).toBe(true);
	});

	it("detects chat completion API call", () => {
		const code = "const completion = await openai.chat.completions.create({";
		const signals = extractGenAi("chat.ts", code);
		expect(signals.some((s) => s.type === "genai-chat-completion")).toBe(true);
	});

	it("detects prompt template structure", () => {
		const code = `{ role: "system", content: "You are a helpful assistant" }`;
		const signals = extractGenAi("prompt.ts", code);
		expect(signals.some((s) => s.type === "genai-prompt-template")).toBe(true);
	});

	it("detects image generation", () => {
		const code = `const image = await openai.images.generate({ prompt: "cat" });`;
		const signals = extractGenAi("image.ts", code);
		expect(signals.some((s) => s.type === "genai-image-gen")).toBe(true);
	});

	it("detects known model identifiers", () => {
		const code = `const model = "gpt-4";`;
		const signals = extractGenAi("config.ts", code);
		expect(signals.some((s) => s.type === "genai-model-id")).toBe(true);
	});

	it("detects streaming response handling", () => {
		const code = "const stream = await openai.chat.completions.create({ stream: true });";
		const signals = extractGenAi("stream.ts", code);
		expect(signals.some((s) => s.type === "genai-streaming")).toBe(true);
	});
});

// ─── RAG Extractor Tests ────────────────────────────────────────────────────

describe("extractRag", () => {
	it("detects Pinecone vector DB client", () => {
		const code = `import { Pinecone } from "@pinecone-database/pinecone";`;
		const signals = extractRag("search.ts", code);
		expect(signals.some((s) => s.type === "rag-pinecone")).toBe(true);
	});

	it("detects ChromaDB", () => {
		const code = `import { ChromaClient } from "chromadb";`;
		const signals = extractRag("db.ts", code);
		expect(signals.some((s) => s.type === "rag-chromadb")).toBe(true);
	});

	it("detects embedding generation", () => {
		const code = "const embedding = await openai.embeddings.create({ input: text });";
		const signals = extractRag("embed.ts", code);
		expect(signals.some((s) => s.type === "rag-embedding")).toBe(true);
	});

	it("detects pgvector extension", () => {
		const code = "CREATE EXTENSION IF NOT EXISTS vector;";
		const signals = extractRag("migration.sql", code);
		expect(signals.some((s) => s.type === "rag-pgvector")).toBe(true);
	});

	it("detects document chunking", () => {
		const code = "const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500 });";
		const signals = extractRag("ingest.ts", code);
		expect(signals.some((s) => s.type === "rag-chunking")).toBe(true);
	});
});

// ─── Content Safety Extractor Tests ─────────────────────────────────────────

describe("extractContentSafety", () => {
	it("detects OpenAI Moderation API", () => {
		const code = "const result = await openai.moderations.create({ input: text });";
		const signals = extractContentSafety("safety.ts", code);
		expect(signals.some((s) => s.type === "cs-openai-moderation")).toBe(true);
	});

	it("detects content filter logic", () => {
		const code = "if (!isContentSafe(generatedOutput)) { return block(); }";
		const signals = extractContentSafety("filter.ts", code);
		expect(signals.some((s) => s.type === "cs-content-filter")).toBe(true);
	});

	it("detects guardrails framework", () => {
		const code = `import { NeMoGuardrails } from "nemo-guardrails";`;
		const signals = extractContentSafety("guard.ts", code);
		expect(signals.some((s) => s.type === "cs-guardrails")).toBe(true);
	});
});

// ─── Watermarking Extractor Tests ───────────────────────────────────────────

describe("extractWatermarking", () => {
	it("detects C2PA library", () => {
		const code = `import { createC2pa } from "c2pa-node";`;
		const signals = extractWatermarking("watermark.ts", code);
		expect(signals.some((s) => s.type === "wm-c2pa")).toBe(true);
	});

	it("detects AI content metadata", () => {
		const code = `headers["x-ai-generated"] = "true";`;
		const signals = extractWatermarking("response.ts", code);
		expect(signals.some((s) => s.type === "wm-ai-metadata")).toBe(true);
	});
});

// ─── Agentic AI Extractor Tests ─────────────────────────────────────────────

describe("extractAgentic", () => {
	it("detects tool/function definitions", () => {
		const code = `const response = await openai.chat.completions.create({\n  tools: [\n    { type: "function", function: { name: "get_weather" } }\n  ]\n});`;
		const signals = extractAgentic("agent.ts", code);
		expect(signals.some((s) => s.type === "ag-tool-defs")).toBe(true);
	});

	it("detects LangChain framework", () => {
		const code = `import { AgentExecutor } from "@langchain/core";`;
		const signals = extractAgentic("agent.ts", code);
		expect(signals.some((s) => s.type === "ag-langchain")).toBe(true);
	});

	it("detects payment action", () => {
		const code = "async function makePayment(amount: number, to: string) {";
		const signals = extractAgentic("actions.ts", code);
		expect(signals.some((s) => s.type === "ag-action-payment")).toBe(true);
	});

	it("detects kill switch pattern", () => {
		const code = "const maxIterations = 10;";
		const signals = extractAgentic("safety.ts", code);
		expect(signals.some((s) => s.type === "ag-kill-switch")).toBe(true);
	});

	it("detects approval gate", () => {
		const code = "await requireApproval(userId, action);";
		const signals = extractAgentic("gate.ts", code);
		expect(signals.some((s) => s.type === "ag-approval-gate")).toBe(true);
	});

	it("detects action logging", () => {
		const code = `logAction({ agent: "support-bot", action: "send-email", timestamp: Date.now() });`;
		const signals = extractAgentic("log.ts", code);
		expect(signals.some((s) => s.type === "ag-action-log")).toBe(true);
	});
});

// ─── Financial Service Extractor Tests ──────────────────────────────────────

describe("extractFinancialServices", () => {
	it("detects Stripe SDK", () => {
		const code = `import Stripe from "stripe";`;
		const signals = extractFinancialServices("payment.ts", code);
		expect(signals.some((s) => s.type === "fin-stripe")).toBe(true);
	});

	it("detects credit scoring logic", () => {
		const code = "const creditScore = calculateCreditScore(applicant);";
		const signals = extractFinancialServices("credit.ts", code);
		expect(signals.some((s) => s.type === "fin-credit-score")).toBe(true);
	});

	it("detects AML/KYC services", () => {
		const code = "const result = await ComplyAdvantage.screenEntity(customer);";
		const signals = extractFinancialServices("compliance.ts", code);
		expect(signals.some((s) => s.type === "fin-aml-kyc")).toBe(true);
	});

	it("detects Plaid SDK", () => {
		const code = "const plaidClient = new PlaidClient({ clientId, secret });";
		const signals = extractFinancialServices("banking.ts", code);
		expect(signals.some((s) => s.type === "fin-plaid")).toBe(true);
	});

	it("detects insurance pricing", () => {
		const code = "function calculatePremium(riskPricing: RiskFactors) {";
		const signals = extractFinancialServices("insurance.ts", code);
		expect(signals.some((s) => s.type === "fin-insurance-rating")).toBe(true);
	});
});

// ─── Gap Detector Tests ─────────────────────────────────────────────────────

describe("gap detector", () => {
	const emptyContext: CodebaseContext = {
		dataCollected: [],
		piiDetected: [],
		thirdParties: [],
		automatedDecisions: [],
		consentMechanisms: [],
		authFlows: [],
		trainingDataSources: [],
		genAiSignals: [],
		ragSignals: [],
		contentSafetySignals: [],
		watermarkingSignals: [],
		agenticSignals: [],
		financialServiceSignals: [],
	};

	it("always includes business context, target markets, and human review questions", () => {
		const questions = detectGaps(emptyContext);
		const ids = questions.map((q) => q.id);
		expect(ids).toContain("gap-business-context");
		expect(ids).toContain("gap-target-markets");
		expect(ids).toContain("gap-human-review");
	});

	it("triggers GenAI questions when GenAI signals are present", () => {
		const contextWithGenAi: CodebaseContext = {
			...emptyContext,
			genAiSignals: [
				{
					category: "genai",
					type: "genai-openai-sdk",
					description: "OpenAI SDK import",
					filePath: "chat.ts",
					lineNumber: 1,
					confidence: "high",
					evidence: 'import OpenAI from "openai"',
				},
			],
		};
		const questions = detectGaps(contextWithGenAi);
		const ids = questions.map((q) => q.id);
		expect(ids).toContain("gap-genai-provider-role");
		expect(ids).toContain("gap-genai-content-disclosure");
		expect(ids).toContain("gap-genai-training-data-provenance");
		expect(ids).toContain("gap-china-algorithm-filing");
	});

	it("does NOT trigger GenAI questions when no GenAI signals", () => {
		const questions = detectGaps(emptyContext);
		const ids = questions.map((q) => q.id);
		expect(ids).not.toContain("gap-genai-provider-role");
		expect(ids).not.toContain("gap-genai-content-disclosure");
	});

	it("triggers agentic questions when agentic signals are present", () => {
		const contextWithAgentic: CodebaseContext = {
			...emptyContext,
			agenticSignals: [
				{
					category: "agentic",
					type: "ag-tool-defs",
					description: "Tool/function definitions for LLM",
					filePath: "agent.ts",
					lineNumber: 5,
					confidence: "high",
					evidence: "tools: [",
				},
			],
		};
		const questions = detectGaps(contextWithAgentic);
		const ids = questions.map((q) => q.id);
		expect(ids).toContain("gap-agentic-checkpoints");
		expect(ids).toContain("gap-agentic-autonomy-boundary");
	});

	it("triggers financial service questions when financial signals are present", () => {
		const contextWithFinancial: CodebaseContext = {
			...emptyContext,
			financialServiceSignals: [
				{
					category: "financial-services",
					type: "fin-credit-score",
					description: "Credit scoring logic",
					filePath: "credit.ts",
					lineNumber: 10,
					confidence: "high",
					evidence: "creditScore",
				},
			],
		};
		const questions = detectGaps(contextWithFinancial);
		const ids = questions.map((q) => q.id);
		expect(ids).toContain("gap-fin-regulatory-status");
		expect(ids).toContain("gap-fin-model-risk-governance");
		expect(ids).toContain("gap-fin-consumer-impact");
	});
});

// ─── Full Analyzer Integration Test (against sample fixture) ────────────────

describe("analyzeCodebase (integration)", () => {
	const fixturePath = join(__dirname, "../fixtures/sample-repos/nextjs-prisma");

	it("detects PII fields from Prisma schema (email, dateOfBirth)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const piiTypes = result.context.piiDetected.map((s) => s.type);
		expect(piiTypes).toContain("pii-email");
		expect(piiTypes).toContain("pii-dob");
	});

	it("detects third-party sharing (OpenAI, Segment)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const tpTypes = result.context.thirdParties.map((s) => s.type);
		expect(tpTypes).toContain("tp-openai-api");
		expect(tpTypes).toContain("tp-segment");
	});

	it("detects GenAI/LLM usage (OpenAI SDK, chat completions)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const genAiTypes = result.context.genAiSignals.map((s) => s.type);
		expect(genAiTypes).toContain("genai-openai-sdk");
		expect(genAiTypes).toContain("genai-chat-completion");
	});

	it("detects prompt templates", async () => {
		const result = await analyzeCodebase(fixturePath);
		const genAiTypes = result.context.genAiSignals.map((s) => s.type);
		expect(genAiTypes).toContain("genai-prompt-template");
	});

	it("detects RAG pipeline (Pinecone, embeddings)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const ragTypes = result.context.ragSignals.map((s) => s.type);
		expect(ragTypes).toContain("rag-pinecone");
		expect(ragTypes).toContain("rag-embedding");
	});

	it("detects content safety (OpenAI Moderation API)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const csTypes = result.context.contentSafetySignals.map((s) => s.type);
		expect(csTypes).toContain("cs-openai-moderation");
	});

	it("detects streaming response handling", async () => {
		const result = await analyzeCodebase(fixturePath);
		const genAiTypes = result.context.genAiSignals.map((s) => s.type);
		expect(genAiTypes).toContain("genai-streaming");
	});

	it("detects known model identifier (gpt-4)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const genAiTypes = result.context.genAiSignals.map((s) => s.type);
		expect(genAiTypes).toContain("genai-model-id");
	});

	it("builds inferences for GenAI usage", async () => {
		const result = await analyzeCodebase(fixturePath);
		const inferenceFields = result.inferences.map((i) => i.field);
		expect(inferenceFields).toContain("generativeAiContext.usesFoundationModel");
	});

	it("builds inferences for RAG usage", async () => {
		const result = await analyzeCodebase(fixturePath);
		const inferenceFields = result.inferences.map((i) => i.field);
		expect(inferenceFields).toContain("generativeAiContext.usesRAG");
	});

	it("builds inferences for content safety", async () => {
		const result = await analyzeCodebase(fixturePath);
		const inferenceFields = result.inferences.map((i) => i.field);
		expect(inferenceFields).toContain("generativeAiContext.hasOutputFiltering");
	});

	it("builds inferences for PII detection", async () => {
		const result = await analyzeCodebase(fixturePath);
		const inferenceFields = result.inferences.map((i) => i.field);
		expect(inferenceFields).toContain("dataProcessed");
	});

	it("builds inferences for third-party sharing", async () => {
		const result = await analyzeCodebase(fixturePath);
		const inferenceFields = result.inferences.map((i) => i.field);
		expect(inferenceFields).toContain("thirdPartySharing");
	});

	it("gap detector flags business context as must-ask", async () => {
		const result = await analyzeCodebase(fixturePath);
		const questionIds = result.remainingQuestions.map((q) => q.id);
		expect(questionIds).toContain("gap-business-context");
	});

	it("gap detector flags target markets as must-ask", async () => {
		const result = await analyzeCodebase(fixturePath);
		const questionIds = result.remainingQuestions.map((q) => q.id);
		expect(questionIds).toContain("gap-target-markets");
	});

	it("gap detector flags provider vs. deployer role (GenAI detected)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const questionIds = result.remainingQuestions.map((q) => q.id);
		expect(questionIds).toContain("gap-genai-provider-role");
	});

	it("gap detector flags training data provenance (GenAI detected)", async () => {
		const result = await analyzeCodebase(fixturePath);
		const questionIds = result.remainingQuestions.map((q) => q.id);
		expect(questionIds).toContain("gap-genai-training-data-provenance");
	});

	it("all signals have filePath and evidence populated", async () => {
		const result = await analyzeCodebase(fixturePath);
		const allSignals = [
			...result.context.dataCollected,
			...result.context.piiDetected,
			...result.context.thirdParties,
			...result.context.genAiSignals,
			...result.context.ragSignals,
			...result.context.contentSafetySignals,
		];
		for (const signal of allSignals) {
			expect(signal.filePath).toBeTruthy();
			expect(signal.evidence).toBeTruthy();
		}
	});

	it("all signals have valid confidence levels", async () => {
		const result = await analyzeCodebase(fixturePath);
		const allSignals = [
			...result.context.dataCollected,
			...result.context.piiDetected,
			...result.context.thirdParties,
			...result.context.genAiSignals,
			...result.context.ragSignals,
			...result.context.contentSafetySignals,
		];
		for (const signal of allSignals) {
			expect(["high", "medium", "low"]).toContain(signal.confidence);
		}
	});
});
