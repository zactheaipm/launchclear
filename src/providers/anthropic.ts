import type { LLMProvider, LLMRequest, LLMResponse, Result } from "../core/types.js";
import {
	PROVIDER_DEFAULTS,
	type ProviderOptions,
	buildUsage,
	err,
	extractNumber,
	extractString,
	fetchJSON,
	isRecord,
	normalizeRequest,
	ok,
	providerError,
} from "./base.js";

// ─── Anthropic API Types (minimal, inline) ──────────────────────────────────

interface AnthropicMessage {
	readonly role: "user" | "assistant";
	readonly content: string;
}

interface AnthropicRequestBody {
	readonly model: string;
	readonly max_tokens: number;
	readonly temperature: number;
	readonly system?: string;
	readonly messages: readonly AnthropicMessage[];
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parseAnthropicResponse(json: unknown): Result<LLMResponse> {
	if (!isRecord(json)) {
		return err(providerError("anthropic", "Invalid response: not an object"));
	}

	const content = json.content;
	if (!Array.isArray(content) || content.length === 0) {
		return err(providerError("anthropic", "Invalid response: missing content array"));
	}

	const firstBlock: unknown = content[0];
	if (!isRecord(firstBlock)) {
		return err(providerError("anthropic", "Invalid response: content block is not an object"));
	}

	const text = extractString(firstBlock, "text");
	if (text === undefined) {
		return err(providerError("anthropic", "Invalid response: missing text in content block"));
	}

	const usage = json.usage;
	let inputTokens = 0;
	let outputTokens = 0;
	if (isRecord(usage)) {
		inputTokens = extractNumber(usage, "input_tokens");
		outputTokens = extractNumber(usage, "output_tokens");
	}

	return ok({
		content: text,
		usage: buildUsage(inputTokens, outputTokens),
	});
}

// ─── Create Provider ────────────────────────────────────────────────────────

const DEFAULT_ANTHROPIC_API_VERSION = "2024-10-22";

export function createAnthropicProvider(options: ProviderOptions = {}): LLMProvider {
	const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
	const baseUrl = options.baseUrl ?? PROVIDER_DEFAULTS.anthropic.baseUrl;
	const model = options.model ?? PROVIDER_DEFAULTS.anthropic.model;
	const timeoutMs = options.timeoutMs;
	const apiVersion = options.apiVersion ?? DEFAULT_ANTHROPIC_API_VERSION;

	return {
		id: "anthropic",
		name: "Anthropic Claude",

		async complete(request: LLMRequest): Promise<Result<LLMResponse>> {
			if (!apiKey) {
				return err(
					providerError(
						"anthropic",
						"API key not configured. Set ANTHROPIC_API_KEY environment variable or pass apiKey in options.",
					),
				);
			}

			const { messages, systemPrompt, maxTokens, temperature } = normalizeRequest(request);

			const body: AnthropicRequestBody = {
				model,
				max_tokens: maxTokens,
				temperature,
				...(systemPrompt ? { system: systemPrompt } : {}),
				messages: messages.map((m) => ({
					role: m.role,
					content: m.content,
				})),
			};

			const result = await fetchJSON(`${baseUrl}/v1/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": apiKey,
					"anthropic-version": apiVersion,
				},
				body: JSON.stringify(body),
				timeoutMs,
			});

			if (!result.ok) {
				return err(providerError("anthropic", result.error.message));
			}

			return parseAnthropicResponse(result.value);
		},
	};
}
