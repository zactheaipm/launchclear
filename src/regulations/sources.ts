import type { RegulationSourceConfig } from "../core/types.js";

// ─── Topic Taxonomy ──────────────────────────────────────────────────────────
// Canonical topic tags used for auto-tagging processed sections.
// Aligned with topics already used in existing manifest.json files
// (e.g., knowledge/provisions/eu/ai-act/manifest.json).

export const TOPIC_TAXONOMY: readonly string[] = [
	// Risk / classification
	"prohibited-practices",
	"high-risk",
	"risk-classification",
	"risk-management",
	"risk-assessment",
	// Data
	"data-governance",
	"data-subject-rights",
	"data-transfers",
	"consent",
	"dpia",
	"personal-data",
	"biometric",
	"biometric-categorization",
	// Transparency
	"transparency",
	"ai-generated-content",
	"chatbot-disclosure",
	"deepfake-labeling",
	"content-labeling",
	// AI models
	"gpai",
	"foundation-model",
	"systemic-risk",
	"open-source-exemption",
	"generative-ai",
	"training-data",
	"training-data-summary",
	"copyright-compliance",
	"downstream-documentation",
	// Oversight & decisions
	"automated-decision-making",
	"human-oversight",
	"profiling",
	"record-keeping",
	// Requirements
	"technical-documentation",
	"accuracy",
	"robustness",
	"cybersecurity",
	"conformity-assessment",
	// Sectors
	"financial-services",
	"credit-scoring",
	"creditworthiness",
	"insurance-risk",
	"insurance-pricing",
	"employment",
	"education",
	"law-enforcement",
	"migration",
	"justice",
	"essential-services",
	"critical-infrastructure",
	// Enforcement
	"enforcement",
	"penalties",
	"consumer-protection",
	// Governance
	"ai-governance",
	"model-risk-management",
	"algorithmic-accountability",
	"model-evaluation",
	"adversarial-testing",
	// Specific practices
	"social-scoring",
	"subliminal-manipulation",
	"vulnerability-exploitation",
	"real-time-biometric-identification",
	"emotion-recognition",
	"predictive-policing",
	"product-safety",
	"safety-components",
	// China-specific
	"algorithm-filing",
	"content-review",
	"socialist-core-values",
	"deep-synthesis",
	// Singapore-specific
	"pdpc",
	"imda",
	"mas",
	"agentic-ai",
	// UK-specific
	"frontier-model",
	"aisi",
	// Brazil-specific
	"lgpd",
	// Sectoral supervision
	"eba",
	"eiopa",
	"sectoral-supervision",
	"annex-iii",
];

// ─── Source Registry ─────────────────────────────────────────────────────────

export const REGULATION_SOURCES: readonly RegulationSourceConfig[] = [
	// EUR-Lex: EU AI Act
	{
		id: "eurlex-eu-ai-act",
		name: "EU AI Act (Regulation 2024/1689)",
		jurisdiction: "EU",
		baseUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689",
		type: "scrape",
		format: "html",
		rateLimitMs: 2000,
		scrapeConfig: {
			articleSelector: ".eli-container",
			sectionSelector: ".ti-art",
			titleSelector: ".sti-art",
		},
	},
	// EUR-Lex: GDPR
	{
		id: "eurlex-gdpr",
		name: "EU GDPR (Regulation 2016/679)",
		jurisdiction: "EU",
		baseUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679",
		type: "scrape",
		format: "html",
		rateLimitMs: 2000,
		scrapeConfig: {
			articleSelector: ".eli-container",
			sectionSelector: ".ti-art",
			titleSelector: ".sti-art",
		},
	},
	// UK legislation.gov.uk
	{
		id: "uk-legislation",
		name: "UK Legislation",
		jurisdiction: "UK",
		baseUrl: "https://www.legislation.gov.uk",
		type: "api",
		format: "xml",
		rateLimitMs: 1000,
		apiConfig: {
			headers: { Accept: "application/xml" },
		},
	},
	// US congress.gov
	{
		id: "us-congress",
		name: "US Federal Legislation (congress.gov)",
		jurisdiction: "US",
		baseUrl: "https://api.congress.gov/v3",
		type: "api",
		format: "json",
		rateLimitMs: 1000,
		apiConfig: {
			apiKeyEnvVar: "CONGRESS_API_KEY",
			queryParams: { format: "json" },
		},
	},
	// California legislature
	{
		id: "us-ca-legislature",
		name: "California Legislature",
		jurisdiction: "US-CA",
		baseUrl: "https://leginfo.legislature.ca.gov",
		type: "scrape",
		format: "html",
		rateLimitMs: 3000,
		scrapeConfig: {
			articleSelector: "#bill_all",
			sectionSelector: "span.content",
			titleSelector: "span.bill_detail_header",
		},
	},
	// Singapore statutes
	{
		id: "sg-statutes",
		name: "Singapore Statutes Online",
		jurisdiction: "SG",
		baseUrl: "https://sso.agc.gov.sg",
		type: "scrape",
		format: "html",
		rateLimitMs: 2000,
		scrapeConfig: {
			articleSelector: ".legis-body",
			sectionSelector: ".legis-section",
			titleSelector: ".legis-heading",
		},
	},
	// China: CAC GenAI measures
	{
		id: "cn-cac-genai",
		name: "China CAC Interim Measures for GenAI Services",
		jurisdiction: "CN",
		baseUrl: "https://www.cac.gov.cn",
		type: "scrape",
		format: "html",
		rateLimitMs: 3000,
		scrapeConfig: {
			articleSelector: ".TRS_Editor",
			sectionSelector: "p",
			titleSelector: "h1",
		},
	},
	// Brazil: LGPD + AI Bill
	{
		id: "br-legislation",
		name: "Brazil Legislation (LGPD / AI Bill)",
		jurisdiction: "BR",
		baseUrl: "https://www.planalto.gov.br",
		type: "scrape",
		format: "html",
		rateLimitMs: 3000,
		scrapeConfig: {
			articleSelector: "#conteudo",
			sectionSelector: "p",
			titleSelector: "h1",
		},
	},
];

// ─── Jurisdiction Path Mapping ───────────────────────────────────────────────
// Maps source IDs to their corresponding knowledge base paths
// (used by the processor to know where to write output).

export const SOURCE_TO_KNOWLEDGE_PATH: Readonly<Record<string, string>> = {
	"eurlex-eu-ai-act": "eu/ai-act",
	"eurlex-gdpr": "eu/gdpr",
	"uk-legislation": "uk",
	"us-congress": "us/federal",
	"us-ca-legislature": "us/states/california",
	"sg-statutes": "singapore",
	"cn-cac-genai": "china",
	"br-legislation": "brazil",
};

// ─── Source Lookup ───────────────────────────────────────────────────────────

export function getSource(id: string): RegulationSourceConfig | undefined {
	return REGULATION_SOURCES.find((s) => s.id === id);
}

export function getSourcesForJurisdiction(jurisdiction: string): readonly RegulationSourceConfig[] {
	return REGULATION_SOURCES.filter((s) => s.jurisdiction === jurisdiction);
}

export function getAllSourceIds(): readonly string[] {
	return REGULATION_SOURCES.map((s) => s.id);
}
