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

// ─── OpenAI API Types (minimal, inline) ─────────────────────────────────────

interface OpenAIChatMessage {
	readonly role: "system" | "user" | "assistant";
	readonly content: string;
}

interface OpenAIRequestBody {
	readonly model: string;
	readonly max_tokens: number;
	readonly temperature: number;
	readonly messages: readonly OpenAIChatMessage[];
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parseOpenAIResponse(json: unknown): Result<LLMResponse> {
	if (!isRecord(json)) {
		return err(providerError("openai", "Invalid response: not an object"));
	}

	const choices = json.choices;
	if (!Array.isArray(choices) || choices.length === 0) {
		return err(providerError("openai", "Invalid response: missing choices array"));
	}

	const firstChoice: unknown = choices[0];
	if (!isRecord(firstChoice)) {
		return err(providerError("openai", "Invalid response: choice is not an object"));
	}

	const message = firstChoice.message;
	if (!isRecord(message)) {
		return err(providerError("openai", "Invalid response: missing message in choice"));
	}

	const content = extractString(message, "content");
	if (content === undefined) {
		return err(providerError("openai", "Invalid response: missing content in message"));
	}

	const usage = json.usage;
	let inputTokens = 0;
	let outputTokens = 0;
	if (isRecord(usage)) {
		inputTokens = extractNumber(usage, "prompt_tokens");
		outputTokens = extractNumber(usage, "completion_tokens");
	}

	return ok({
		content,
		usage: buildUsage(inputTokens, outputTokens),
	});
}

// ─── Create Provider ────────────────────────────────────────────────────────

/**
 * Creates an OpenAI-compatible provider.
 * Works with OpenAI, Qwen (DashScope), DeepSeek, and other compatible APIs.
 *
 * For DashScope (Qwen): set baseUrl to "https://dashscope.aliyuncs.com/compatible-mode/v1"
 * For DeepSeek: set baseUrl to "https://api.deepseek.com/v1"
 */
export function createOpenAIProvider(options: ProviderOptions = {}): LLMProvider {
	const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY ?? process.env.DASHSCOPE_API_KEY;
	const baseUrl = options.baseUrl ?? PROVIDER_DEFAULTS.openai.baseUrl;
	const model = options.model ?? PROVIDER_DEFAULTS.openai.model;
	const timeoutMs = options.timeoutMs;

	return {
		id: "openai",
		name: "OpenAI Compatible",

		async complete(request: LLMRequest): Promise<Result<LLMResponse>> {
			if (!apiKey) {
				return err(
					providerError(
						"openai",
						"API key not configured. Set OPENAI_API_KEY (or DASHSCOPE_API_KEY) environment variable or pass apiKey in options.",
					),
				);
			}

			const { messages, systemPrompt, maxTokens, temperature } = normalizeRequest(request);

			const chatMessages: OpenAIChatMessage[] = [];

			if (systemPrompt) {
				chatMessages.push({ role: "system", content: systemPrompt });
			}

			for (const m of messages) {
				chatMessages.push({ role: m.role, content: m.content });
			}

			const body: OpenAIRequestBody = {
				model,
				max_tokens: maxTokens,
				temperature,
				messages: chatMessages,
			};

			const result = await fetchJSON(`${baseUrl}/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify(body),
				timeoutMs,
			});

			if (!result.ok) {
				return err(providerError("openai", result.error.message));
			}

			return parseOpenAIResponse(result.value);
		},
	};
}
