import type { LLMProvider, Result } from "../core/types.js";
import { createAnthropicProvider } from "./anthropic.js";
import { type ProviderOptions, err, ok, providerError } from "./base.js";
import { createOllamaProvider } from "./ollama.js";
import { createOpenAIProvider } from "./openai.js";

// ─── Provider IDs ───────────────────────────────────────────────────────────

export type ProviderId = "anthropic" | "openai" | "ollama";

const PROVIDER_IDS: readonly ProviderId[] = ["anthropic", "openai", "ollama"];

// ─── Provider Factory Map ───────────────────────────────────────────────────

const PROVIDER_FACTORIES: Record<ProviderId, (options?: ProviderOptions) => LLMProvider> = {
	anthropic: createAnthropicProvider,
	openai: createOpenAIProvider,
	ollama: createOllamaProvider,
};

// ─── Create Provider by ID ──────────────────────────────────────────────────

export function createProvider(id: ProviderId, options?: ProviderOptions): Result<LLMProvider> {
	const factory = PROVIDER_FACTORIES[id];
	if (!factory) {
		return err(
			providerError("registry", `Unknown provider "${id}". Available: ${PROVIDER_IDS.join(", ")}`),
		);
	}
	return ok(factory(options));
}

// ─── Auto-Detect Provider from Environment ──────────────────────────────────

function detectProviderFromEnv(): ProviderId | undefined {
	const explicit = process.env.LAUNCHCLEAR_DEFAULT_PROVIDER;
	if (explicit && PROVIDER_IDS.includes(explicit as ProviderId)) {
		return explicit as ProviderId;
	}

	if (process.env.ANTHROPIC_API_KEY) return "anthropic";
	if (process.env.OPENAI_API_KEY) return "openai";
	if (process.env.DASHSCOPE_API_KEY) return "openai";
	if (process.env.OLLAMA_BASE_URL) return "ollama";

	return undefined;
}

export function getDefaultProvider(options?: ProviderOptions): Result<LLMProvider> {
	const id = detectProviderFromEnv();
	if (!id) {
		return err(
			providerError(
				"registry",
				"No LLM provider configured. Set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, DASHSCOPE_API_KEY, or OLLAMA_BASE_URL.",
			),
		);
	}
	return createProvider(id, options);
}

// ─── List Available Providers ───────────────────────────────────────────────

export interface AvailableProvider {
	readonly id: ProviderId;
	readonly name: string;
	readonly configured: boolean;
}

export function listProviders(): readonly AvailableProvider[] {
	return PROVIDER_IDS.map((id) => {
		const provider = PROVIDER_FACTORIES[id]();
		return {
			id,
			name: provider.name,
			configured: isProviderConfigured(id),
		};
	});
}

function isProviderConfigured(id: ProviderId): boolean {
	switch (id) {
		case "anthropic":
			return !!process.env.ANTHROPIC_API_KEY;
		case "openai":
			return !!(process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY);
		case "ollama":
			// Ollama doesn't need an API key, just needs to be running
			return true;
	}
}

// ─── Re-exports ─────────────────────────────────────────────────────────────

export { createAnthropicProvider } from "./anthropic.js";
export { createOpenAIProvider } from "./openai.js";
export { createOllamaProvider } from "./ollama.js";
export type { ProviderOptions } from "./base.js";
