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

// ─── Ollama API Types (minimal, inline) ─────────────────────────────────────

interface OllamaChatMessage {
	readonly role: "system" | "user" | "assistant";
	readonly content: string;
}

interface OllamaRequestBody {
	readonly model: string;
	readonly messages: readonly OllamaChatMessage[];
	readonly stream: false;
	readonly options: {
		readonly temperature: number;
		readonly num_predict: number;
	};
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parseOllamaResponse(json: unknown): Result<LLMResponse> {
	if (!isRecord(json)) {
		return err(providerError("ollama", "Invalid response: not an object"));
	}

	const message = json.message;
	if (!isRecord(message)) {
		return err(providerError("ollama", "Invalid response: missing message object"));
	}

	const content = extractString(message, "content");
	if (content === undefined) {
		return err(providerError("ollama", "Invalid response: missing content in message"));
	}

	const promptEvalCount = extractNumber(json, "prompt_eval_count");
	const evalCount = extractNumber(json, "eval_count");

	return ok({
		content,
		usage: buildUsage(promptEvalCount, evalCount),
	});
}

// ─── Create Provider ────────────────────────────────────────────────────────

export function createOllamaProvider(options: ProviderOptions = {}): LLMProvider {
	const baseUrl =
		options.baseUrl ?? process.env.OLLAMA_BASE_URL ?? PROVIDER_DEFAULTS.ollama.baseUrl;
	const model = options.model ?? PROVIDER_DEFAULTS.ollama.model;
	const timeoutMs = options.timeoutMs ?? 300_000; // Local models can be slow

	return {
		id: "ollama",
		name: "Ollama (Local)",

		async complete(request: LLMRequest): Promise<Result<LLMResponse>> {
			const { messages, systemPrompt, maxTokens, temperature } = normalizeRequest(request);

			const chatMessages: OllamaChatMessage[] = [];

			if (systemPrompt) {
				chatMessages.push({ role: "system", content: systemPrompt });
			}

			for (const m of messages) {
				chatMessages.push({ role: m.role, content: m.content });
			}

			const body: OllamaRequestBody = {
				model,
				messages: chatMessages,
				stream: false,
				options: {
					temperature,
					num_predict: maxTokens,
				},
			};

			const result = await fetchJSON(`${baseUrl}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				timeoutMs,
			});

			if (!result.ok) {
				return err(
					providerError("ollama", `${result.error.message}. Is Ollama running at ${baseUrl}?`),
				);
			}

			return parseOllamaResponse(result.value);
		},
	};
}
