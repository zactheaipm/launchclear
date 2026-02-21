import type { Dirent } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import type {
	CodebaseAnalysisResult,
	CodebaseContext,
	CodebaseInference,
	CodebaseSignal,
	ConfidenceLevel,
	IntakeQuestion,
} from "../core/types.js";
import { aggregateConfidence } from "./confidence.js";
import { extractDataCollection } from "./extractors/data-collection.js";
import { extractDataStorage } from "./extractors/data-storage.js";
import {
	extractAgentic,
	extractContentSafety,
	extractFinancialServices,
	extractGenAi,
	extractRag,
	extractWatermarking,
} from "./extractors/genai-detection.js";
import { extractModelInference } from "./extractors/model-inference.js";
import { extractThirdParty } from "./extractors/third-party.js";
import { extractTrainingData } from "./extractors/training-data.js";
import { extractUserAuth } from "./extractors/user-auth.js";
import { detectGaps } from "./gap-detector.js";
import { relevantExtensions, skipDirectories } from "./patterns.js";

// ─── File Tree Walker ───────────────────────────────────────────────────────

async function walkDirectory(dirPath: string, maxDepth = 10): Promise<readonly string[]> {
	if (maxDepth <= 0) return [];

	const files: string[] = [];

	let entries: readonly Dirent[];
	try {
		entries = (await readdir(dirPath, { withFileTypes: true })) as unknown as Dirent[];
	} catch {
		return [];
	}

	for (const entry of entries) {
		const name = String(entry.name);
		if (name.startsWith(".") && skipDirectories.has(name)) continue;
		if (skipDirectories.has(name)) continue;

		const fullPath = join(dirPath, name);

		if (entry.isDirectory()) {
			const subFiles = await walkDirectory(fullPath, maxDepth - 1);
			files.push(...subFiles);
		} else if (entry.isFile()) {
			const ext = extname(name);
			if (relevantExtensions.has(ext) || name === ".env.example") {
				files.push(fullPath);
			}
			// Also include Prisma files and other schema files
			if (name.endsWith(".prisma") || name === "schema.prisma") {
				if (!files.includes(fullPath)) {
					files.push(fullPath);
				}
			}
		}
	}

	return files;
}

// ─── Signal Routing ─────────────────────────────────────────────────────────

interface CategoryBuckets {
	dataCollected: CodebaseSignal[];
	piiDetected: CodebaseSignal[];
	thirdParties: CodebaseSignal[];
	automatedDecisions: CodebaseSignal[];
	consentMechanisms: CodebaseSignal[];
	authFlows: CodebaseSignal[];
	trainingDataSources: CodebaseSignal[];
	genAiSignals: CodebaseSignal[];
	ragSignals: CodebaseSignal[];
	contentSafetySignals: CodebaseSignal[];
	watermarkingSignals: CodebaseSignal[];
	agenticSignals: CodebaseSignal[];
	financialServiceSignals: CodebaseSignal[];
}

function createEmptyBuckets(): CategoryBuckets {
	return {
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
}

function routeSignal(signal: CodebaseSignal, buckets: CategoryBuckets): void {
	switch (signal.category) {
		case "data-collection":
			buckets.dataCollected.push(signal);
			break;
		case "data-storage":
			buckets.dataCollected.push(signal);
			break;
		case "pii":
			buckets.piiDetected.push(signal);
			break;
		case "third-party":
			buckets.thirdParties.push(signal);
			break;
		case "automated-decision":
			buckets.automatedDecisions.push(signal);
			break;
		case "consent":
			buckets.consentMechanisms.push(signal);
			break;
		case "user-auth":
			buckets.authFlows.push(signal);
			break;
		case "training-data":
			buckets.trainingDataSources.push(signal);
			break;
		case "genai":
			buckets.genAiSignals.push(signal);
			break;
		case "rag":
			buckets.ragSignals.push(signal);
			break;
		case "content-safety":
			buckets.contentSafetySignals.push(signal);
			break;
		case "watermarking":
			buckets.watermarkingSignals.push(signal);
			break;
		case "agentic":
			buckets.agenticSignals.push(signal);
			break;
		case "financial-services":
			buckets.financialServiceSignals.push(signal);
			break;
	}
}

// ─── Inference Builder ──────────────────────────────────────────────────────

function buildInferences(context: CodebaseContext): readonly CodebaseInference[] {
	const inferences: CodebaseInference[] = [];

	// PII detected → infer dataProcessed includes "personal"
	if (context.piiDetected.length > 0) {
		inferences.push({
			field: "dataProcessed",
			inferredValue: ["personal"],
			confidence: aggregateConfidence(context.piiDetected),
			codeEvidence: context.piiDetected.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	// Biometric PII → infer dataProcessed includes "biometric"
	const biometricSignals = context.piiDetected.filter((s) => s.type === "pii-biometric");
	if (biometricSignals.length > 0) {
		inferences.push({
			field: "dataProcessed",
			inferredValue: ["biometric"],
			confidence: aggregateConfidence(biometricSignals),
			codeEvidence: biometricSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	// GenAI detected → infer generativeAiContext.usesFoundationModel
	if (context.genAiSignals.length > 0) {
		const modelIdSignals = context.genAiSignals.filter((s) => s.type === "genai-model-id");
		const modelId = modelIdSignals.length > 0 ? modelIdSignals[0]?.evidence : undefined;

		inferences.push({
			field: "generativeAiContext.usesFoundationModel",
			inferredValue: true,
			confidence: aggregateConfidence(context.genAiSignals),
			codeEvidence: context.genAiSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});

		// Infer output modalities
		const hasImageGen = context.genAiSignals.some((s) => s.type === "genai-image-gen");
		const hasAudioGen = context.genAiSignals.some((s) => s.type === "genai-audio-gen");
		const hasTextGen = context.genAiSignals.some(
			(s) => s.type === "genai-chat-completion" || s.type === "genai-text-completion",
		);

		const modalities: string[] = [];
		if (hasTextGen) modalities.push("text");
		if (hasImageGen) modalities.push("image");
		if (hasAudioGen) modalities.push("audio");

		if (modalities.length > 0) {
			inferences.push({
				field: "generativeAiContext.outputModalities",
				inferredValue: modalities,
				confidence: "high",
				codeEvidence: context.genAiSignals
					.filter(
						(s) =>
							s.type === "genai-chat-completion" ||
							s.type === "genai-text-completion" ||
							s.type === "genai-image-gen" ||
							s.type === "genai-audio-gen",
					)
					.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}

		if (modelId) {
			inferences.push({
				field: "generativeAiContext.modelIdentifier",
				inferredValue: modelId,
				confidence: "high",
				codeEvidence: modelIdSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}
	}

	// RAG detected → infer generativeAiContext.usesRAG
	if (context.ragSignals.length > 0) {
		inferences.push({
			field: "generativeAiContext.usesRAG",
			inferredValue: true,
			confidence: aggregateConfidence(context.ragSignals),
			codeEvidence: context.ragSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	// Content safety detected → infer generativeAiContext.hasOutputFiltering
	if (context.contentSafetySignals.length > 0) {
		inferences.push({
			field: "generativeAiContext.hasOutputFiltering",
			inferredValue: true,
			confidence: aggregateConfidence(context.contentSafetySignals),
			codeEvidence: context.contentSafetySignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	// Watermarking detected → infer generativeAiContext.hasOutputWatermarking
	if (context.watermarkingSignals.length > 0) {
		inferences.push({
			field: "generativeAiContext.hasOutputWatermarking",
			inferredValue: true,
			confidence: aggregateConfidence(context.watermarkingSignals),
			codeEvidence: context.watermarkingSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	// Agentic detected → infer agenticAiContext.isAgentic
	if (context.agenticSignals.length > 0) {
		inferences.push({
			field: "agenticAiContext.isAgentic",
			inferredValue: true,
			confidence: aggregateConfidence(context.agenticSignals),
			codeEvidence: context.agenticSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});

		// Infer tool access from detected action types
		const toolAccess: string[] = [];
		for (const s of context.agenticSignals) {
			if (s.type === "ag-action-email") toolAccess.push("email");
			if (s.type === "ag-action-payment") toolAccess.push("payment");
			if (s.type === "ag-action-db") toolAccess.push("database");
			if (s.type === "ag-action-code-exec") toolAccess.push("code-execution");
			if (s.type === "ag-action-browse") toolAccess.push("web-browsing");
		}
		if (toolAccess.length > 0) {
			inferences.push({
				field: "agenticAiContext.toolAccess",
				inferredValue: [...new Set(toolAccess)],
				confidence: "medium",
				codeEvidence: context.agenticSignals
					.filter((s) => s.type.startsWith("ag-action-"))
					.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}

		// Check for kill switches / failsafes
		const hasFailsafe = context.agenticSignals.some((s) => s.type === "ag-kill-switch");
		if (hasFailsafe) {
			inferences.push({
				field: "agenticAiContext.hasFailsafeMechanisms",
				inferredValue: true,
				confidence: "medium",
				codeEvidence: context.agenticSignals
					.filter((s) => s.type === "ag-kill-switch")
					.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}

		// Check for approval gates
		const hasApproval = context.agenticSignals.some((s) => s.type === "ag-approval-gate");
		if (hasApproval) {
			inferences.push({
				field: "agenticAiContext.hasHumanCheckpoints",
				inferredValue: true,
				confidence: "medium",
				codeEvidence: context.agenticSignals
					.filter((s) => s.type === "ag-approval-gate")
					.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}

		// Check for action logging
		const hasLogging = context.agenticSignals.some((s) => s.type === "ag-action-log");
		if (hasLogging) {
			inferences.push({
				field: "agenticAiContext.hasActionLogging",
				inferredValue: true,
				confidence: "medium",
				codeEvidence: context.agenticSignals
					.filter((s) => s.type === "ag-action-log")
					.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}
	}

	// Financial services detected → infer sectorContext
	if (context.financialServiceSignals.length > 0) {
		inferences.push({
			field: "sectorContext.sector",
			inferredValue: "financial-services",
			confidence: aggregateConfidence(context.financialServiceSignals),
			codeEvidence: context.financialServiceSignals.map(
				(s) => `${s.filePath}:${s.lineNumber ?? 0}`,
			),
			confirmedByUser: false,
		});

		// Infer credit involvement
		const creditSignals = context.financialServiceSignals.filter(
			(s) =>
				s.type === "fin-credit-score" || s.type === "fin-credit-bureau" || s.type === "fin-lending",
		);
		if (creditSignals.length > 0) {
			inferences.push({
				field: "sectorContext.financialServices.involvesCredit",
				inferredValue: true,
				confidence: aggregateConfidence(creditSignals),
				codeEvidence: creditSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}

		// Infer AML/KYC
		const amlSignals = context.financialServiceSignals.filter((s) => s.type === "fin-aml-kyc");
		if (amlSignals.length > 0) {
			inferences.push({
				field: "sectorContext.financialServices.involvesAmlKyc",
				inferredValue: true,
				confidence: aggregateConfidence(amlSignals),
				codeEvidence: amlSignals.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
				confirmedByUser: false,
			});
		}
	}

	// Third-party data sharing detected
	if (context.thirdParties.length > 0) {
		const thirdPartyNames = [...new Set(context.thirdParties.map((s) => s.description))];
		inferences.push({
			field: "thirdPartySharing",
			inferredValue: thirdPartyNames,
			confidence: aggregateConfidence(context.thirdParties),
			codeEvidence: context.thirdParties.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	// Training data detected
	if (context.trainingDataSources.length > 0) {
		inferences.push({
			field: "trainingData.usesTrainingData",
			inferredValue: true,
			confidence: aggregateConfidence(context.trainingDataSources),
			codeEvidence: context.trainingDataSources.map((s) => `${s.filePath}:${s.lineNumber ?? 0}`),
			confirmedByUser: false,
		});
	}

	return inferences;
}

// ─── Main Analyzer ──────────────────────────────────────────────────────────

/**
 * Orchestrates codebase analysis:
 * 1. Walk the file tree (skipping node_modules, dist, .git)
 * 2. Run all extractors on relevant files
 * 3. Build CodebaseContext with confidence scores
 * 4. Run gap detector to identify remaining questions
 * 5. Return { context, inferences, remainingQuestions }
 */
export async function analyzeCodebase(directoryPath: string): Promise<CodebaseAnalysisResult> {
	// 1. Walk the file tree
	const filePaths = await walkDirectory(directoryPath);

	// 2. Run all extractors on each file
	const buckets = createEmptyBuckets();

	for (const filePath of filePaths) {
		let content: string;
		try {
			content = await readFile(filePath, "utf-8");
		} catch {
			continue;
		}

		// Run all extractors and route signals to buckets
		const allSignals: CodebaseSignal[] = [
			...extractDataCollection(filePath, content),
			...extractDataStorage(filePath, content),
			...extractModelInference(filePath, content),
			...extractUserAuth(filePath, content),
			...extractThirdParty(filePath, content),
			...extractTrainingData(filePath, content),
			...extractGenAi(filePath, content),
			...extractRag(filePath, content),
			...extractContentSafety(filePath, content),
			...extractWatermarking(filePath, content),
			...extractAgentic(filePath, content),
			...extractFinancialServices(filePath, content),
		];

		for (const signal of allSignals) {
			routeSignal(signal, buckets);
		}
	}

	// 3. Build CodebaseContext
	const context: CodebaseContext = {
		dataCollected: buckets.dataCollected,
		piiDetected: buckets.piiDetected,
		thirdParties: buckets.thirdParties,
		automatedDecisions: buckets.automatedDecisions,
		consentMechanisms: buckets.consentMechanisms,
		authFlows: buckets.authFlows,
		trainingDataSources: buckets.trainingDataSources,
		genAiSignals: buckets.genAiSignals,
		ragSignals: buckets.ragSignals,
		contentSafetySignals: buckets.contentSafetySignals,
		watermarkingSignals: buckets.watermarkingSignals,
		agenticSignals: buckets.agenticSignals,
		financialServiceSignals: buckets.financialServiceSignals,
	};

	// 4. Build inferences from detected signals
	const inferences = buildInferences(context);

	// 5. Run gap detector
	const remainingQuestions = detectGaps(context);

	return {
		context,
		inferences,
		remainingQuestions,
	};
}
