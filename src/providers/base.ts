import type { LLMMessage, LLMRequest, LLMResponse, Result } from "../core/types.js";

// ─── Provider Defaults ──────────────────────────────────────────────────────

export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TEMPERATURE = 0.3;

export const PROVIDER_DEFAULTS = {
	anthropic: {
		model: "claude-sonnet-4-20250514",
		baseUrl: "https://api.anthropic.com",
	},
	openai: {
		model: "gpt-4o",
		baseUrl: "https://api.openai.com/v1",
	},
	ollama: {
		model: "llama3.2",
		baseUrl: "http://localhost:11434",
	},
} as const;

// ─── Provider Configuration ─────────────────────────────────────────────────

export interface ProviderOptions {
	readonly apiKey?: string;
	readonly baseUrl?: string;
	readonly model?: string;
	readonly timeoutMs?: number;
}

// ─── Error Helpers ──────────────────────────────────────────────────────────

export function providerError(provider: string, message: string, cause?: unknown): Error {
	const err = new Error(`[${provider}] ${message}`);
	if (cause instanceof Error) {
		err.cause = cause;
	}
	return err;
}

export function ok<T>(value: T): Result<T> {
	return { ok: true, value };
}

export function err<T>(error: Error): Result<T> {
	return { ok: false, error };
}

// ─── Request Normalization ──────────────────────────────────────────────────

export function normalizeRequest(request: LLMRequest): {
	readonly messages: readonly LLMMessage[];
	readonly systemPrompt: string | undefined;
	readonly maxTokens: number;
	readonly temperature: number;
} {
	return {
		messages: request.messages,
		systemPrompt: request.systemPrompt,
		maxTokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
		temperature: request.temperature ?? DEFAULT_TEMPERATURE,
	};
}

// ─── HTTP Fetch Helper ──────────────────────────────────────────────────────

export async function fetchJSON(
	url: string,
	options: {
		readonly method: string;
		readonly headers: Record<string, string>;
		readonly body: string;
		readonly timeoutMs?: number;
	},
): Promise<Result<unknown>> {
	const timeoutMs = options.timeoutMs ?? 120_000;

	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);

		const response = await fetch(url, {
			method: options.method,
			headers: options.headers,
			body: options.body,
			signal: controller.signal,
		});

		clearTimeout(timer);

		if (!response.ok) {
			const errorBody = await response.text().catch(() => "unknown error");
			return err(providerError("http", `HTTP ${response.status}: ${errorBody}`));
		}

		const json: unknown = await response.json();
		return ok(json);
	} catch (error: unknown) {
		if (error instanceof DOMException && error.name === "AbortError") {
			return err(providerError("http", `Request timed out after ${timeoutMs}ms`));
		}
		return err(providerError("http", "Request failed", error));
	}
}

// ─── Response Type Guard Helpers ────────────────────────────────────────────

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function extractString(obj: Record<string, unknown>, key: string): string | undefined {
	const value = obj[key];
	return typeof value === "string" ? value : undefined;
}

export function extractNumber(obj: Record<string, unknown>, key: string): number {
	const value = obj[key];
	return typeof value === "number" ? value : 0;
}

// ─── Usage Extraction ───────────────────────────────────────────────────────

export function buildUsage(inputTokens: number, outputTokens: number): LLMResponse["usage"] {
	return { inputTokens, outputTokens };
}
