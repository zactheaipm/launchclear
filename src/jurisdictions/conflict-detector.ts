import type { JurisdictionResult, ProductContext } from "../core/types.js";

export interface ConflictTension {
	readonly id: string;
	readonly title: string;
	readonly jurisdictions: readonly string[];
	readonly description: string;
	readonly recommendation: string;
}

/**
 * Detects cross-jurisdictional tensions and conflicts in multi-market reports.
 * These are areas where different jurisdictions' requirements may be in tension
 * and require specific legal counsel guidance.
 *
 * This function does NOT make legal determinations — it flags areas where
 * counsel should provide specific guidance.
 */
export function detectConflicts(
	ctx: ProductContext,
	jurisdictionResults: readonly JurisdictionResult[],
): readonly ConflictTension[] {
	const tensions: ConflictTension[] = [];
	const jurisdictions = new Set(jurisdictionResults.map((r) => r.jurisdiction));

	// 1. China mandatory content review vs EU freedom of expression
	if (
		jurisdictions.has("china") &&
		(jurisdictions.has("eu-ai-act") || jurisdictions.has("eu-gdpr"))
	) {
		tensions.push({
			id: "china-eu-content-review",
			title: "China mandatory content review vs. EU freedom of expression",
			jurisdictions: ["china", "eu-ai-act"],
			description:
				"China's CAC GenAI Measures (Articles 4-7) require content to align with socialist core values and prohibit specific content categories. The EU AI Act and fundamental rights framework protect freedom of expression. Content filtering calibrated for China compliance may be overly restrictive for EU users, or EU-appropriate content may violate Chinese requirements.",
			recommendation:
				"Consider implementing jurisdiction-specific content policies with separate filtering rulesets for China and EU markets. Consult counsel on whether a single global content policy can satisfy both frameworks, or whether market-specific deployments are necessary.",
		});
	}

	// 2. GDPR data minimisation vs China content logging
	if (jurisdictions.has("eu-gdpr") && jurisdictions.has("china")) {
		tensions.push({
			id: "gdpr-china-data-minimisation",
			title: "GDPR data minimisation vs. China content logging requirements",
			jurisdictions: ["eu-gdpr", "china"],
			description:
				"GDPR Article 5(1)(c) requires data minimisation — processing only data adequate, relevant, and limited to what is necessary. China's CAC GenAI Measures require extensive logging of generated content, user interactions, and training data records for regulatory review. These logging obligations may conflict with data minimisation principles for users in both markets.",
			recommendation:
				"Implement segregated data handling: maintain China-compliant logs for China users separately from EU user data. Ensure EU user data is not subject to Chinese logging requirements. Consult counsel on cross-border data flow implications under PIPL and GDPR.",
		});
	}

	// 3. Singapore proportionate governance vs EU mandatory conformity assessment
	if (jurisdictions.has("singapore") && jurisdictions.has("eu-ai-act")) {
		const euResult = jurisdictionResults.find((r) => r.jurisdiction === "eu-ai-act");
		const isHighRisk = euResult?.riskClassification.level === "high";
		if (isHighRisk) {
			tensions.push({
				id: "singapore-eu-proportionality",
				title: "Singapore proportionate governance vs. EU mandatory conformity assessment",
				jurisdictions: ["singapore", "eu-ai-act"],
				description:
					"Singapore's Model AI Governance Framework and IMDA guidelines advocate a proportionate, risk-based approach where governance measures scale with the risk level. The EU AI Act mandates specific conformity assessment procedures for high-risk AI systems regardless of proportionality considerations. A system classified as high-risk under the EU AI Act must complete full conformity assessment even if Singapore's framework would consider lighter governance sufficient.",
				recommendation:
					"Implement EU AI Act conformity assessment requirements as the baseline (as they are more prescriptive), and document how these also satisfy Singapore's governance framework requirements. The EU compliance baseline will typically exceed Singapore's requirements.",
			});
		}
	}

	// 4. US transparency vs China algorithm confidentiality
	if (
		(jurisdictions.has("us-federal") || jurisdictions.has("us-ca")) &&
		jurisdictions.has("china")
	) {
		tensions.push({
			id: "us-china-transparency",
			title: "US transparency expectations vs. China algorithm confidentiality",
			jurisdictions: ["us-federal", "china"],
			description:
				"US frameworks (FTC, NIST AI RMF, state laws) emphasize transparency and explainability of AI systems, including disclosure of how AI systems work and make decisions. China's algorithm filing and GenAI regulations require detailed disclosure to the CAC but may restrict public disclosure of certain algorithm details. Additionally, Chinese data localization requirements may limit what information can be shared with US regulators.",
			recommendation:
				"Develop separate disclosure frameworks for each market. Ensure US transparency requirements are met without disclosing information that could violate Chinese algorithm confidentiality requirements. Consult counsel on managing dual regulatory reporting obligations.",
		});
	}

	// 5. Cross-border data transfer tensions
	const hasDataProtection =
		jurisdictions.has("eu-gdpr") || jurisdictions.has("singapore") || jurisdictions.has("brazil");
	if (hasDataProtection && jurisdictions.has("china")) {
		tensions.push({
			id: "cross-border-data-transfer",
			title: "Cross-border data transfer conflicts between GDPR/PDPA/LGPD and China PIPL",
			jurisdictions: [...jurisdictions].filter((j) =>
				["eu-gdpr", "singapore", "china", "brazil"].includes(j),
			),
			description:
				"Multiple jurisdictions impose restrictions on cross-border personal data transfers, but with incompatible mechanisms. GDPR requires adequacy decisions or SCCs for EU-to-third-country transfers. China's PIPL requires security assessment or China SCCs for China-to-overseas transfers. These mechanisms may not be mutually compatible, creating challenges for systems that process data across these jurisdictions.",
			recommendation:
				"Map all personal data flows across jurisdictions. Implement jurisdiction-specific transfer mechanisms (EU SCCs for GDPR, China SCCs for PIPL). Consider data localization where transfer mechanisms are insufficient. Consult counsel on structuring data flows to minimize cross-border transfer requirements.",
		});
	}

	// 6. Agentic AI: Singapore specific framework vs others' general approach
	if (ctx.agenticAiContext?.isAgentic && jurisdictions.has("singapore") && jurisdictions.size > 1) {
		tensions.push({
			id: "agentic-ai-framework-divergence",
			title: "Singapore agentic AI framework vs. other jurisdictions' general AI frameworks",
			jurisdictions: ["singapore", ...[...jurisdictions].filter((j) => j !== "singapore")],
			description:
				"Singapore's IMDA Agentic AI Framework (January 2026) is the world's first dedicated governance framework for agentic AI systems, with specific requirements across four dimensions (risk bounding, human accountability, technical controls, end-user responsibility). Other jurisdictions currently address agentic AI through general AI frameworks (EU AI Act human oversight, US NIST AI RMF). Compliance approaches may differ significantly.",
			recommendation:
				"Use Singapore's IMDA Agentic AI Framework as the most comprehensive baseline for agentic governance, then verify coverage against other jurisdictions' general AI requirements. Singapore's specific agentic requirements (e.g., gradual rollout, action logging, risk bounding) will typically satisfy other jurisdictions' more general oversight requirements.",
		});
	}

	// 7. EU AI Act Article 50 vs China CAC Article 12 content labeling tension
	if (
		(jurisdictions.has("eu-ai-act") || jurisdictions.has("eu-gdpr")) &&
		jurisdictions.has("china")
	) {
		const isGenAi =
			ctx.generativeAiContext?.generatesContent ||
			ctx.productType === "generator" ||
			ctx.productType === "foundation-model";
		if (isGenAi) {
			tensions.push({
				id: "eu-china-content-labeling",
				title: "EU AI Act Article 50 vs. China CAC Article 12 content labeling requirements",
				jurisdictions: ["eu-ai-act", "china"],
				description:
					"EU AI Act Article 50 requires that AI-generated content be labeled in a machine-readable format (e.g., C2PA metadata, watermarking) so that recipients can detect it is AI-generated. China's CAC GenAI Measures Article 12 mandates visible labeling of AI-generated content and requires specific label formats defined by Chinese authorities. The labeling formats, metadata standards, and disclosure triggers differ: the EU emphasizes machine-readable interoperability while China prescribes specific visible labeling standards set by the Cyberspace Administration. A single labeling implementation may not satisfy both regimes.",
				recommendation:
					"Implement a dual-labeling approach: embed machine-readable provenance metadata (e.g., C2PA) for EU compliance alongside visible Chinese-format labels for China-market content. Consult counsel on whether a unified labeling standard can be devised or whether market-specific labeling pipelines are necessary.",
			});
		}
	}

	// 8. GDPR erasure (right to be forgotten) vs China data retention requirements
	if (jurisdictions.has("eu-gdpr") && jurisdictions.has("china")) {
		tensions.push({
			id: "gdpr-erasure-china-retention",
			title: "GDPR right to erasure vs. China data retention obligations",
			jurisdictions: ["eu-gdpr", "china"],
			description:
				"GDPR Article 17 grants data subjects the right to erasure ('right to be forgotten'), requiring controllers to delete personal data upon request when specific conditions are met. China's CAC GenAI Measures and Cybersecurity Law require retention of user interaction logs, generated content records, and training data provenance for a minimum period (typically 6 months for GenAI logs under CAC measures, longer under cybersecurity regulations) to enable regulatory review and law enforcement access. For users who interact with systems operating in both markets, an erasure request under GDPR may conflict with China's mandatory retention periods.",
			recommendation:
				"Implement strict data segregation: maintain separate data stores for EU and China users so that GDPR erasure requests can be honored for EU user data without affecting China-compliant retention of Chinese user data. Avoid architectures where a single user record is subject to both regimes simultaneously. Consult counsel on edge cases (e.g., cross-border users, shared training data).",
		});
	}

	// 9. GPAI open-source exemption (EU) vs China algorithm filing (no open-source exemption)
	if (jurisdictions.has("eu-ai-act") && jurisdictions.has("china")) {
		const isOpenSource = ctx.gpaiInfo?.isOpenSource;
		const isGpaiOrFoundation =
			ctx.gpaiInfo?.isGpaiModel ||
			ctx.productType === "foundation-model" ||
			ctx.generativeAiContext?.usesFoundationModel;
		if (isGpaiOrFoundation) {
			tensions.push({
				id: "gpai-opensource-china-filing",
				title: "EU AI Act GPAI open-source exemption vs. China algorithm filing requirement",
				jurisdictions: ["eu-ai-act", "china"],
				description: isOpenSource
					? "This product appears to use an open-source GPAI model. Under the EU AI Act Article 53(2), open-source GPAI models benefit from a limited exemption: providers need only publish a sufficiently detailed summary of training data and comply with copyright law, rather than meeting the full GPAI provider obligations. However, China's CAC Algorithm Registry and GenAI Measures make no distinction for open-source models — all GenAI services offered to users in China must complete algorithm filing with the CAC, regardless of whether the underlying model is open-source. An organization relying on the EU open-source exemption to reduce compliance burden will still face full filing and content review obligations in China."
					: "Under the EU AI Act Article 53(2), open-source GPAI models benefit from reduced provider obligations (primarily training data summary publication and copyright compliance). China's CAC Algorithm Registry and GenAI Measures require algorithm filing for all GenAI services regardless of open-source status. If the underlying model is or becomes open-source, the EU compliance burden may decrease but China obligations remain unchanged.",
				recommendation:
					"Do not assume that open-source model status reduces compliance obligations globally. Maintain full China CAC algorithm filing documentation regardless of open-source exemptions claimed under the EU AI Act. Consult counsel on whether the EU open-source exemption applies to your specific deployment model (the exemption does not apply if there is a systemic risk designation).",
			});
		}
	}

	// 10. Financial services: divergent regulatory approaches
	if (ctx.sectorContext?.sector === "financial-services") {
		const financialJurisdictions = [...jurisdictions].filter((j) =>
			["eu-ai-act", "singapore", "us-federal", "uk"].includes(j),
		);
		if (financialJurisdictions.length > 1) {
			tensions.push({
				id: "financial-ai-regulatory-divergence",
				title: "Divergent financial AI regulatory approaches across jurisdictions",
				jurisdictions: financialJurisdictions,
				description:
					"Financial AI is regulated differently across jurisdictions: EU AI Act classifies credit scoring and insurance pricing as high-risk (Annex III \u00A75) requiring full conformity assessment. MAS Guidelines (Singapore) use a proportionate risk-based approach with materiality assessment. US SR 11-7 focuses on model risk management. UK FCA uses a principles-based approach. These different frameworks may impose conflicting documentation, testing, and governance requirements.",
				recommendation:
					"Identify the most prescriptive requirements across all target jurisdictions (typically EU AI Act for classification, SR 11-7 for model validation, MAS for materiality assessment) and implement these as the compliance baseline. Document how the baseline satisfies each jurisdiction's specific requirements.",
			});
		}
	}

	return tensions;
}
