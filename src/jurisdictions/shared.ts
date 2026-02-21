import type { ProductContext } from "../core/types.js";

// ─── Shared Jurisdiction Helpers ──────────────────────────────────────────
//
// Common helper functions used across multiple jurisdiction modules.
// These extract frequently-checked conditions from ProductContext to
// reduce duplication and ensure consistency across jurisdictions.
//
// NOTE: Some jurisdiction modules intentionally use different thresholds
// or criteria for similar checks. These helpers cover the COMMON cases.
// Jurisdiction-specific variations should remain in their respective modules.

/**
 * Checks if the product context involves processing personal data.
 * This is the most common trigger across all data protection laws
 * (GDPR, PDPA, LGPD, PIPL, UK GDPR, CCPA/CPRA).
 */
export function processesPersonalData(ctx: ProductContext): boolean {
	return ctx.dataProcessed.some(
		(d) =>
			d === "personal" ||
			d === "sensitive" ||
			d === "biometric" ||
			d === "health" ||
			d === "financial" ||
			d === "location" ||
			d === "minor",
	);
}

/**
 * Checks if the product uses generative AI capabilities.
 * Triggers GenAI-specific requirements in EU AI Act, China CAC,
 * UK DSIT/AISI, Singapore IMDA, Brazil AI Bill, and US state laws.
 */
export function isGenAiProduct(ctx: ProductContext): boolean {
	return (
		ctx.productType === "generator" ||
		ctx.productType === "foundation-model" ||
		ctx.generativeAiContext?.generatesContent === true ||
		ctx.generativeAiContext?.usesFoundationModel === true
	);
}

/**
 * Checks if the product operates in the financial services sector.
 * Triggers sector-specific requirements from MAS, FCA, OCC/Fed,
 * EU AI Act Annex III §5, etc.
 */
export function isFinancialServicesAi(ctx: ProductContext): boolean {
	return ctx.sectorContext?.sector === "financial-services";
}

/**
 * Checks if the product has agentic AI capabilities.
 * Triggers Singapore IMDA Agentic AI Framework, and may elevate
 * risk classifications in other jurisdictions.
 */
export function hasAgenticCapabilities(ctx: ProductContext): boolean {
	return (
		ctx.agenticAiContext?.isAgentic === true ||
		ctx.generativeAiContext?.usesAgenticCapabilities === true
	);
}

/**
 * Checks if the product involves automated decision-making that
 * materially affects individuals. Triggers ADM-specific obligations
 * in GDPR Article 22, LGPD Article 20, CCPA/CPRA, etc.
 */
export function makesMaterialDecisions(ctx: ProductContext): boolean {
	return ctx.decisionImpact === "material" || ctx.decisionImpact === "determinative";
}

/**
 * Checks if the product targets or may affect minors (under 18).
 * Triggers age-appropriate protections across jurisdictions.
 */
export function involvesMinors(ctx: ProductContext): boolean {
	return ctx.userPopulations.includes("minors") || ctx.dataProcessed.includes("minor");
}

/**
 * Checks if the product processes biometric data.
 * Triggers enhanced protections in GDPR, BIPA, UK GDPR, PDPA.
 */
export function processesBiometricData(ctx: ProductContext): boolean {
	return ctx.dataProcessed.includes("biometric");
}

/**
 * Checks if the product processes special category / sensitive data.
 * Covers GDPR Article 9 special categories and equivalent concepts
 * in other jurisdictions.
 */
export function processesSpecialCategoryData(ctx: ProductContext): boolean {
	return ctx.dataProcessed.some(
		(d) =>
			d === "sensitive" ||
			d === "biometric" ||
			d === "health" ||
			d === "genetic" ||
			d === "political" ||
			d === "criminal",
	);
}

/**
 * Checks if the product is consumer-facing (serves general public
 * or consumer users). Affects deployer obligations, transparency
 * requirements, and which data protection provisions apply.
 */
export function isConsumerFacing(ctx: ProductContext): boolean {
	return (
		ctx.userPopulations.includes("consumers") || ctx.userPopulations.includes("general-public")
	);
}

/**
 * Checks if the product is fully automated (no human in the loop).
 * Combined with material/determinative decisions, this is the
 * strongest trigger for human oversight requirements across
 * GDPR Article 22, EU AI Act Article 14, PDPA, etc.
 */
export function isFullyAutomated(ctx: ProductContext): boolean {
	return ctx.automationLevel === "fully-automated";
}

/**
 * Checks if the product uses a foundation model (either as provider
 * or deployer). Triggers EU AI Act GPAI provisions, UK DSIT/AISI
 * framework, China CAC measures, and Singapore IMDA guidelines.
 */
export function usesFoundationModel(ctx: ProductContext): boolean {
	return (
		ctx.productType === "foundation-model" || ctx.generativeAiContext?.usesFoundationModel === true
	);
}

/**
 * Checks if the product can generate deepfakes or synthetic media
 * of real people. Triggers specific regulations in China (deep
 * synthesis rules), US states (California, Texas), and EU
 * (AI Act Article 50).
 */
export function canGenerateDeepfakes(ctx: ProductContext): boolean {
	return (
		ctx.generativeAiContext?.canGenerateDeepfakes === true ||
		ctx.generativeAiContext?.canGenerateSyntheticVoice === true
	);
}

/**
 * Checks if the product involves credit scoring or insurance pricing.
 * Triggers EU AI Act Annex III §5 high-risk classification,
 * US fair lending obligations, and MAS lifecycle controls.
 */
export function involvesCreditOrInsurance(ctx: ProductContext): boolean {
	const fin = ctx.sectorContext?.financialServices;
	return fin?.involvesCredit === true || fin?.involvesInsurancePricing === true;
}

/**
 * Checks if the product is in an employment context (hiring,
 * screening, performance evaluation). Triggers bias audit
 * requirements (NYC LL144), EU AI Act Annex III high-risk,
 * and EEOC/FTC enforcement exposure.
 */
export function isEmploymentContext(ctx: ProductContext): boolean {
	return (
		ctx.userPopulations.includes("job-applicants") || ctx.userPopulations.includes("employees")
	);
}

/**
 * Checks if GenAI training data includes personal data or
 * user-generated content. Triggers data protection obligations
 * for training data across GDPR, LGPD, PDPA, etc.
 */
export function trainingDataIncludesPersonalData(ctx: ProductContext): boolean {
	if (!ctx.generativeAiContext) return false;
	return (
		ctx.generativeAiContext.trainingDataIncludes.includes("personal-data") ||
		ctx.generativeAiContext.trainingDataIncludes.includes("user-generated-content")
	);
}

// ─── Regulatory Trigger Evaluation ────────────────────────────────────────

/**
 * Regulatory trigger interface — documents why a specific regulatory
 * requirement applies and what evidence from the context supports it.
 */
export interface RegulatoryTrigger {
	readonly triggerId: string;
	readonly description: string;
	readonly satisfied: boolean;
	readonly evidence: string;
}

/**
 * Evaluates a set of regulatory triggers against a product context.
 * Returns only the triggered (satisfied) triggers.
 */
export function evaluateTriggers(
	triggers: readonly RegulatoryTrigger[],
): readonly RegulatoryTrigger[] {
	return triggers.filter((t) => t.satisfied);
}
