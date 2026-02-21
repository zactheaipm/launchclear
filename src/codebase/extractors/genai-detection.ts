import type { CodebaseSignal } from "../../core/types.js";
import {
	agenticPatterns,
	contentSafetyPatterns,
	financialServicePatterns,
	genAiPatterns,
	ragPatterns,
	watermarkingPatterns,
} from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * The most important extractor — detects GenAI / foundation model usage,
 * RAG pipelines, content safety measures, watermarking, agentic capabilities,
 * and financial service indicators.
 *
 * These signals directly feed the GenerativeAiContext, AgenticAiContext,
 * and SectorContext on ProductContext.
 */

/** Detect LLM SDK imports, chat/completion calls, prompt templates, image/audio generation */
export function extractGenAi(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, genAiPatterns);
}

/** Detect vector DB clients, embedding generation, document chunking */
export function extractRag(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, ragPatterns);
}

/** Detect content moderation APIs, profanity filters, guardrails */
export function extractContentSafety(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, contentSafetyPatterns);
}

/** Detect C2PA, watermarking, provenance tracking */
export function extractWatermarking(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, watermarkingPatterns);
}

/** Detect agent frameworks, tool definitions, action execution, kill switches */
export function extractAgentic(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, agenticPatterns);
}

/** Detect payment SDKs, credit scoring, insurance, trading, AML/KYC */
export function extractFinancialServices(
	filePath: string,
	content: string,
): readonly CodebaseSignal[] {
	return scanLines(filePath, content, financialServicePatterns);
}
