import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LLMRequest } from "../../src/core/types.js";
import { createAnthropicProvider } from "../../src/providers/anthropic.js";
import {
	DEFAULT_MAX_TOKENS,
	DEFAULT_TEMPERATURE,
	buildUsage,
	err,
	extractNumber,
	extractString,
	fetchJSON,
	isRecord,
	normalizeRequest,
	ok,
	providerError,
} from "../../src/providers/base.js";
import { createProvider, getDefaultProvider, listProviders } from "../../src/providers/index.js";
import { createOllamaProvider } from "../../src/providers/ollama.js";
import { createOpenAIProvider } from "../../src/providers/openai.js";

// ─── Base Utilities ─────────────────────────────────────────────────────────

describe("base utilities", () => {
	describe("ok / err", () => {
		it("creates a successful result", () => {
			const result = ok("hello");
			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toBe("hello");
		});

		it("creates a failure result", () => {
			const result = err(new Error("oops"));
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.message).toBe("oops");
		});
	});

	describe("providerError", () => {
		it("creates a prefixed error", () => {
			const error = providerError("anthropic", "API key missing");
			expect(error.message).toBe("[anthropic] API key missing");
		});

		it("attaches a cause if provided", () => {
			const cause = new Error("network failure");
			const error = providerError("openai", "Request failed", cause);
			expect(error.cause).toBe(cause);
		});
	});

	describe("normalizeRequest", () => {
		it("fills default maxTokens and temperature", () => {
			const request: LLMRequest = {
				messages: [{ role: "user", content: "hello" }],
			};
			const normalized = normalizeRequest(request);
			expect(normalized.maxTokens).toBe(DEFAULT_MAX_TOKENS);
			expect(normalized.temperature).toBe(DEFAULT_TEMPERATURE);
		});

		it("preserves explicit values", () => {
			const request: LLMRequest = {
				messages: [{ role: "user", content: "hello" }],
				systemPrompt: "Be helpful",
				maxTokens: 1000,
				temperature: 0.7,
			};
			const normalized = normalizeRequest(request);
			expect(normalized.maxTokens).toBe(1000);
			expect(normalized.temperature).toBe(0.7);
			expect(normalized.systemPrompt).toBe("Be helpful");
		});
	});

	describe("isRecord", () => {
		it("returns true for plain objects", () => {
			expect(isRecord({})).toBe(true);
			expect(isRecord({ a: 1 })).toBe(true);
		});

		it("returns false for non-objects", () => {
			expect(isRecord(null)).toBe(false);
			expect(isRecord(undefined)).toBe(false);
			expect(isRecord("string")).toBe(false);
			expect(isRecord(42)).toBe(false);
			expect(isRecord([])).toBe(false);
		});
	});

	describe("extractString / extractNumber", () => {
		it("extracts string values", () => {
			expect(extractString({ key: "value" }, "key")).toBe("value");
			expect(extractString({ key: 42 }, "key")).toBeUndefined();
			expect(extractString({}, "missing")).toBeUndefined();
		});

		it("extracts number values with fallback to 0", () => {
			expect(extractNumber({ key: 42 }, "key")).toBe(42);
			expect(extractNumber({ key: "string" }, "key")).toBe(0);
			expect(extractNumber({}, "missing")).toBe(0);
		});
	});

	describe("buildUsage", () => {
		it("creates usage object", () => {
			const usage = buildUsage(100, 200);
			expect(usage.inputTokens).toBe(100);
			expect(usage.outputTokens).toBe(200);
		});
	});
});

// ─── Mock Fetch ─────────────────────────────────────────────────────────────

function mockFetchSuccess(responseBody: unknown): void {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(responseBody),
		}),
	);
}

function mockFetchError(status: number, body: string): void {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: false,
			status,
			text: () => Promise.resolve(body),
		}),
	);
}

function mockFetchThrow(error: Error): void {
	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
}

// ─── Anthropic Provider ─────────────────────────────────────────────────────

describe("anthropic provider", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const ANTHROPIC_RESPONSE = {
		id: "msg_123",
		type: "message",
		role: "assistant",
		content: [{ type: "text", text: "Hello from Claude!" }],
		usage: { input_tokens: 10, output_tokens: 20 },
	};

	it("sends correct request format", async () => {
		mockFetchSuccess(ANTHROPIC_RESPONSE);

		const provider = createAnthropicProvider({ apiKey: "test-key" });
		await provider.complete({
			messages: [{ role: "user", content: "hello" }],
			systemPrompt: "Be helpful",
			maxTokens: 500,
			temperature: 0.5,
		});

		const fetchCall = vi.mocked(fetch).mock.calls[0];
		expect(fetchCall[0]).toBe("https://api.anthropic.com/v1/messages");

		const options = fetchCall[1] as RequestInit;
		const headers = options.headers as Record<string, string>;
		expect(headers["x-api-key"]).toBe("test-key");
		expect(headers["anthropic-version"]).toBe("2024-10-22");
		expect(headers["Content-Type"]).toBe("application/json");

		const body = JSON.parse(options.body as string);
		expect(body.model).toBe("claude-sonnet-4-20250514");
		expect(body.max_tokens).toBe(500);
		expect(body.temperature).toBe(0.5);
		expect(body.system).toBe("Be helpful");
		expect(body.messages).toEqual([{ role: "user", content: "hello" }]);
	});

	it("parses successful response", async () => {
		mockFetchSuccess(ANTHROPIC_RESPONSE);

		const provider = createAnthropicProvider({ apiKey: "test-key" });
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.content).toBe("Hello from Claude!");
			expect(result.value.usage.inputTokens).toBe(10);
			expect(result.value.usage.outputTokens).toBe(20);
		}
	});

	it("returns error when API key is missing", async () => {
		// Save and clear env — must use delete, not assign undefined,
		// because process.env coerces undefined to the string "undefined".
		const savedKey = process.env.ANTHROPIC_API_KEY;
		// biome-ignore lint/performance/noDelete: process.env requires delete to truly remove a key
		delete process.env.ANTHROPIC_API_KEY;

		const provider = createAnthropicProvider();
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		if (savedKey !== undefined) process.env.ANTHROPIC_API_KEY = savedKey;

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("API key not configured");
		}
	});

	it("returns error on HTTP failure", async () => {
		mockFetchError(401, "Invalid API key");

		const provider = createAnthropicProvider({ apiKey: "bad-key" });
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("401");
		}
	});

	it("returns error on malformed response", async () => {
		mockFetchSuccess({ not_content: true });

		const provider = createAnthropicProvider({ apiKey: "test-key" });
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("missing content array");
		}
	});

	it("omits system field when no systemPrompt given", async () => {
		mockFetchSuccess(ANTHROPIC_RESPONSE);

		const provider = createAnthropicProvider({ apiKey: "test-key" });
		await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
		expect(body.system).toBeUndefined();
	});

	it("uses custom baseUrl and model", async () => {
		mockFetchSuccess(ANTHROPIC_RESPONSE);

		const provider = createAnthropicProvider({
			apiKey: "test-key",
			baseUrl: "https://custom.api.com",
			model: "claude-opus-4-20250514",
		});
		await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		const fetchCall = vi.mocked(fetch).mock.calls[0];
		expect(fetchCall[0]).toBe("https://custom.api.com/v1/messages");

		const body = JSON.parse(fetchCall[1]?.body as string);
		expect(body.model).toBe("claude-opus-4-20250514");
	});
});

// ─── OpenAI Provider ────────────────────────────────────────────────────────

describe("openai provider", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const OPENAI_RESPONSE = {
		id: "chatcmpl-123",
		choices: [
			{
				index: 0,
				message: { role: "assistant", content: "Hello from GPT!" },
				finish_reason: "stop",
			},
		],
		usage: { prompt_tokens: 15, completion_tokens: 25, total_tokens: 40 },
	};

	it("sends correct request format with system message", async () => {
		mockFetchSuccess(OPENAI_RESPONSE);

		const provider = createOpenAIProvider({ apiKey: "test-key" });
		await provider.complete({
			messages: [{ role: "user", content: "hello" }],
			systemPrompt: "Be helpful",
			maxTokens: 500,
			temperature: 0.5,
		});

		const fetchCall = vi.mocked(fetch).mock.calls[0];
		expect(fetchCall[0]).toBe("https://api.openai.com/v1/chat/completions");

		const options = fetchCall[1] as RequestInit;
		const headers = options.headers as Record<string, string>;
		expect(headers.Authorization).toBe("Bearer test-key");

		const body = JSON.parse(options.body as string);
		expect(body.model).toBe("gpt-4o");
		expect(body.messages[0]).toEqual({ role: "system", content: "Be helpful" });
		expect(body.messages[1]).toEqual({ role: "user", content: "hello" });
	});

	it("parses successful response", async () => {
		mockFetchSuccess(OPENAI_RESPONSE);

		const provider = createOpenAIProvider({ apiKey: "test-key" });
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.content).toBe("Hello from GPT!");
			expect(result.value.usage.inputTokens).toBe(15);
			expect(result.value.usage.outputTokens).toBe(25);
		}
	});

	it("returns error when API key is missing", async () => {
		const savedOpenAI = process.env.OPENAI_API_KEY;
		const savedDash = process.env.DASHSCOPE_API_KEY;
		// biome-ignore lint/performance/noDelete: process.env requires delete to truly remove a key
		delete process.env.OPENAI_API_KEY;
		// biome-ignore lint/performance/noDelete: process.env requires delete to truly remove a key
		delete process.env.DASHSCOPE_API_KEY;

		const provider = createOpenAIProvider();
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		if (savedOpenAI !== undefined) process.env.OPENAI_API_KEY = savedOpenAI;
		if (savedDash !== undefined) process.env.DASHSCOPE_API_KEY = savedDash;

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("API key not configured");
		}
	});

	it("returns error on malformed response", async () => {
		mockFetchSuccess({ choices: [] });

		const provider = createOpenAIProvider({ apiKey: "test-key" });
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("missing choices array");
		}
	});

	it("works with custom baseUrl for compatible APIs", async () => {
		mockFetchSuccess(OPENAI_RESPONSE);

		const provider = createOpenAIProvider({
			apiKey: "test-key",
			baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
			model: "qwen-plus",
		});
		await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		const fetchCall = vi.mocked(fetch).mock.calls[0];
		expect(fetchCall[0]).toBe("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions");

		const body = JSON.parse(fetchCall[1]?.body as string);
		expect(body.model).toBe("qwen-plus");
	});
});

// ─── Ollama Provider ────────────────────────────────────────────────────────

describe("ollama provider", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const OLLAMA_RESPONSE = {
		model: "llama3.2",
		message: { role: "assistant", content: "Hello from Llama!" },
		done: true,
		prompt_eval_count: 12,
		eval_count: 18,
	};

	it("sends correct request format", async () => {
		mockFetchSuccess(OLLAMA_RESPONSE);

		const provider = createOllamaProvider();
		await provider.complete({
			messages: [{ role: "user", content: "hello" }],
			systemPrompt: "Be helpful",
			maxTokens: 500,
			temperature: 0.5,
		});

		const fetchCall = vi.mocked(fetch).mock.calls[0];
		expect(fetchCall[0]).toBe("http://localhost:11434/api/chat");

		const body = JSON.parse(fetchCall[1]?.body as string);
		expect(body.model).toBe("llama3.2");
		expect(body.stream).toBe(false);
		expect(body.options.temperature).toBe(0.5);
		expect(body.options.num_predict).toBe(500);
		expect(body.messages[0]).toEqual({ role: "system", content: "Be helpful" });
		expect(body.messages[1]).toEqual({ role: "user", content: "hello" });
	});

	it("parses successful response", async () => {
		mockFetchSuccess(OLLAMA_RESPONSE);

		const provider = createOllamaProvider();
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.content).toBe("Hello from Llama!");
			expect(result.value.usage.inputTokens).toBe(12);
			expect(result.value.usage.outputTokens).toBe(18);
		}
	});

	it("includes helpful error message on connection failure", async () => {
		mockFetchThrow(new Error("ECONNREFUSED"));

		const provider = createOllamaProvider();
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("Is Ollama running");
		}
	});

	it("does not require an API key", async () => {
		mockFetchSuccess(OLLAMA_RESPONSE);

		const provider = createOllamaProvider();
		const result = await provider.complete({
			messages: [{ role: "user", content: "hello" }],
		});

		expect(result.ok).toBe(true);
	});
});

// ─── Provider Registry ──────────────────────────────────────────────────────

describe("provider registry", () => {
	describe("createProvider", () => {
		it("creates anthropic provider", () => {
			const result = createProvider("anthropic", { apiKey: "test" });
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("anthropic");
				expect(result.value.name).toBe("Anthropic Claude");
			}
		});

		it("creates openai provider", () => {
			const result = createProvider("openai", { apiKey: "test" });
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("openai");
			}
		});

		it("creates ollama provider", () => {
			const result = createProvider("ollama");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("ollama");
			}
		});
	});

	describe("getDefaultProvider", () => {
		const ENV_KEYS = [
			"LAUNCHCLEAR_DEFAULT_PROVIDER",
			"ANTHROPIC_API_KEY",
			"OPENAI_API_KEY",
			"DASHSCOPE_API_KEY",
			"OLLAMA_BASE_URL",
		] as const;
		const savedEnv: Record<string, string | undefined> = {};

		beforeEach(() => {
			for (const key of ENV_KEYS) {
				savedEnv[key] = process.env[key];
				delete process.env[key];
			}
		});

		afterEach(() => {
			for (const key of ENV_KEYS) {
				const value = savedEnv[key];
				if (value === undefined) {
					delete process.env[key];
				} else {
					process.env[key] = value;
				}
			}
		});

		it("returns error when no provider is configured", () => {
			const result = getDefaultProvider();
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain("No LLM provider configured");
			}
		});

		it("respects LAUNCHCLEAR_DEFAULT_PROVIDER", () => {
			process.env.LAUNCHCLEAR_DEFAULT_PROVIDER = "ollama";
			const result = getDefaultProvider();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("ollama");
			}
		});

		it("auto-detects anthropic from ANTHROPIC_API_KEY", () => {
			process.env.ANTHROPIC_API_KEY = "sk-test";
			const result = getDefaultProvider();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("anthropic");
			}
		});

		it("auto-detects openai from OPENAI_API_KEY", () => {
			process.env.OPENAI_API_KEY = "sk-test";
			const result = getDefaultProvider();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("openai");
			}
		});

		it("auto-detects openai from DASHSCOPE_API_KEY", () => {
			process.env.DASHSCOPE_API_KEY = "sk-test";
			const result = getDefaultProvider();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("openai");
			}
		});

		it("auto-detects ollama from OLLAMA_BASE_URL", () => {
			process.env.OLLAMA_BASE_URL = "http://localhost:11434";
			const result = getDefaultProvider();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("ollama");
			}
		});

		it("prefers explicit provider over auto-detection", () => {
			process.env.ANTHROPIC_API_KEY = "sk-test";
			process.env.LAUNCHCLEAR_DEFAULT_PROVIDER = "openai";
			process.env.OPENAI_API_KEY = "sk-test";
			const result = getDefaultProvider();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("openai");
			}
		});
	});

	describe("listProviders", () => {
		it("returns all three providers", () => {
			const providers = listProviders();
			expect(providers).toHaveLength(3);

			const ids = providers.map((p) => p.id);
			expect(ids).toContain("anthropic");
			expect(ids).toContain("openai");
			expect(ids).toContain("ollama");
		});

		it("ollama is always marked as configured", () => {
			const providers = listProviders();
			const ollama = providers.find((p) => p.id === "ollama");
			expect(ollama?.configured).toBe(true);
		});
	});
});

// ─── fetchJSON ──────────────────────────────────────────────────────────────

describe("fetchJSON", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns parsed JSON on success", async () => {
		mockFetchSuccess({ data: "test" });

		const result = await fetchJSON("https://api.example.com/test", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}",
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual({ data: "test" });
		}
	});

	it("returns error on HTTP failure", async () => {
		mockFetchError(500, "Internal Server Error");

		const result = await fetchJSON("https://api.example.com/test", {
			method: "POST",
			headers: {},
			body: "{}",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("500");
		}
	});

	it("returns error on network failure", async () => {
		mockFetchThrow(new Error("network down"));

		const result = await fetchJSON("https://api.example.com/test", {
			method: "POST",
			headers: {},
			body: "{}",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain("Request failed");
		}
	});
});
