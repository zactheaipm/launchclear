/**
 * Adds YAML frontmatter to all provision markdown files in the knowledge base.
 * Run with: npx tsx scripts/add-frontmatter.ts
 *
 * This script reads each provision .md file, extracts metadata from the existing
 * header lines (**Law**, **Articles**, **Effective**, etc.), and prepends
 * structured YAML frontmatter with verification status.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const KNOWLEDGE_DIR = join(import.meta.dirname, "..", "knowledge", "provisions");

interface FrontmatterData {
	id: string;
	law: string;
	articles: string[];
	effectiveDate: string | null;
	generatedBy: string;
	sources: Array<{ id: string; articles?: string[] }>;
	verification: {
		status: "unverified";
		lastAuditDate: null;
		auditor: null;
		issues: never[];
	};
}

// Map provision files to their citation registry source IDs
const FILE_TO_SOURCE: Record<string, string[]> = {
	// EU AI Act
	"eu/ai-act/prohibited-practices.md": ["eurlex-ai-act"],
	"eu/ai-act/risk-classification.md": ["eurlex-ai-act"],
	"eu/ai-act/high-risk-requirements.md": ["eurlex-ai-act"],
	"eu/ai-act/transparency-obligations.md": ["eurlex-ai-act"],
	"eu/ai-act/gpai-provisions.md": ["eurlex-ai-act", "eurlex-dsm-directive"],
	"eu/ai-act/financial-services.md": ["eurlex-ai-act"],
	// EU GDPR
	"eu/gdpr/legal-basis.md": ["eurlex-gdpr"],
	"eu/gdpr/data-subject-rights.md": ["eurlex-gdpr"],
	"eu/gdpr/automated-decisions.md": ["eurlex-gdpr"],
	"eu/gdpr/dpia-requirements.md": ["eurlex-gdpr"],
	"eu/gdpr/transfers.md": ["eurlex-gdpr"],
	// US Federal
	"us/federal/ftc-enforcement.md": ["ftc-act"],
	"us/federal/nist-ai-rmf.md": ["nist-ai-rmf"],
	"us/federal/nist-genai-profile.md": ["nist-genai-profile"],
	"us/federal/ftc-genai-guidance.md": ["ftc-act"],
	"us/federal/federal-financial-ai.md": ["sr-11-7"],
	"us/federal/eeoc-ai-guidance.md": ["eeoc-ai-guidance", "adea"],
	// US States - California
	"us/states/california/ccpa-cpra-ai.md": ["ccpa"],
	"us/states/california/sb942-genai-transparency.md": ["ca-sb942"],
	"us/states/california/deepfake-laws.md": ["ccpa"],
	// US States - Colorado
	"us/states/colorado/colorado-ai-act.md": ["colorado-ai-act"],
	// US States - Illinois
	"us/states/illinois/bipa.md": ["il-bipa"],
	"us/states/illinois/ai-video-interview-act.md": ["il-aivaa"],
	// US States - New York
	"us/states/new-york/ll144-aedt.md": ["nyc-ll144"],
	// US States - Texas
	"us/states/texas/traiga.md": ["tx-traiga"],
	"us/states/texas/deepfake-laws.md": ["tx-traiga"],
	// UK
	"uk/ico-ai-guidance.md": ["ico-ai-guidance", "uk-gdpr", "uk-dpa-2018"],
	"uk/aisi-frontier-models.md": ["aisi-framework"],
	"uk/dsit-foundation-models.md": ["dsit-foundation-models"],
	"uk/fca-ai-guidance.md": ["fca-ai-guidance"],
	// Singapore
	"singapore/pdpc-ai-governance.md": ["sg-pdpc-ai-governance", "sg-pdpa"],
	"singapore/imda-genai-guidelines.md": ["sg-imda-genai"],
	"singapore/imda-agentic-ai.md": ["sg-imda-agentic-ai"],
	"singapore/mas-ai-risk-management.md": ["sg-mas-ai-risk"],
	// China
	"china/cac-genai-measures.md": ["cn-cac-genai-measures", "cn-cac-genai-measures-en"],
	"china/cac-algorithm-registry.md": ["cn-cac-algorithm-provisions"],
	"china/cac-deep-synthesis.md": ["cn-cac-deep-synthesis"],
	"china/cac-recommendation-algo.md": ["cn-cac-recommendation-algo"],
	"china/pipl-cross-border.md": ["cn-pipl"],
	// Brazil
	"brazil/lgpd-ai-processing.md": ["br-lgpd"],
	"brazil/ai-bill-genai.md": ["br-ai-bill"],
};

function findMdFiles(dir: string): string[] {
	const results: string[] = [];
	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			results.push(...findMdFiles(fullPath));
		} else if (entry.endsWith(".md")) {
			results.push(fullPath);
		}
	}
	return results;
}

function extractMetadataFromContent(content: string): {
	law: string;
	articles: string[];
	effectiveDate: string | null;
} {
	const lines = content.split("\n");
	let law = "";
	const articles: string[] = [];
	let effectiveDate: string | null = null;

	for (const line of lines.slice(0, 20)) {
		// Extract law name from **Law**: or **Legal Basis**: lines
		const lawMatch = line.match(/^\*\*(?:Law|Legal Basis)\*\*:\s*(.+)/);
		if (lawMatch) {
			law = lawMatch[1].trim();
		}

		// Extract articles from **Articles**: or **Article**: lines
		const articleMatch = line.match(/^\*\*Articles?\*\*:\s*(.+)/);
		if (articleMatch) {
			const raw = articleMatch[1].trim();
			// Split on commas and "and"
			for (const part of raw.split(/,\s*|\s+and\s+/)) {
				const trimmed = part.trim();
				if (trimmed) articles.push(trimmed);
			}
		}

		// Extract effective date
		const effectiveMatch = line.match(/^\*\*(?:Effective|Status)\*\*:\s*(.+)/);
		if (effectiveMatch) {
			const text = effectiveMatch[1].trim();
			// Try to find a date pattern
			const dateMatch = text.match(
				/(\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/,
			);
			if (dateMatch) {
				effectiveDate = dateMatch[1];
			}
		}
	}

	return { law, articles, effectiveDate };
}

function generateId(relPath: string): string {
	return relPath
		.replace(/\.md$/, "")
		.replace(/\//g, "-")
		.replace(/^us-states-/, "us-")
		.replace(/^us-federal-/, "us-federal-");
}

function buildFrontmatter(data: FrontmatterData): string {
	const lines = ["---"];
	lines.push(`id: "${data.id}"`);
	lines.push(`law: "${data.law.replace(/"/g, '\\"')}"`);
	lines.push(`articles: [${data.articles.map((a) => `"${a}"`).join(", ")}]`);
	lines.push(`effectiveDate: ${data.effectiveDate ? `"${data.effectiveDate}"` : "null"}`);
	lines.push(`generatedBy: "${data.generatedBy}"`);
	lines.push("sources:");
	for (const source of data.sources) {
		lines.push(`  - id: "${source.id}"`);
		if (source.articles && source.articles.length > 0) {
			lines.push(`    articles: [${source.articles.map((a) => `"${a}"`).join(", ")}]`);
		}
	}
	lines.push("verification:");
	lines.push(`  status: "${data.verification.status}"`);
	lines.push("  lastAuditDate: null");
	lines.push("  auditor: null");
	lines.push("  issues: []");
	lines.push("---");
	return lines.join("\n");
}

function main(): void {
	const files = findMdFiles(KNOWLEDGE_DIR);
	let processed = 0;
	let skipped = 0;

	for (const filePath of files) {
		const content = readFileSync(filePath, "utf-8");

		// Skip if already has frontmatter
		if (content.startsWith("---\n")) {
			console.log(`SKIP (already has frontmatter): ${filePath}`);
			skipped++;
			continue;
		}

		const relPath = relative(KNOWLEDGE_DIR, filePath);
		const metadata = extractMetadataFromContent(content);
		const id = generateId(relPath);
		const sourceIds = FILE_TO_SOURCE[relPath] ?? [];

		const frontmatterData: FrontmatterData = {
			id,
			law: metadata.law || basename(filePath, ".md"),
			articles: metadata.articles,
			effectiveDate: metadata.effectiveDate,
			generatedBy: "claude-opus-4",
			sources: sourceIds.map((sid) => ({
				id: sid,
				articles: metadata.articles.length > 0 ? metadata.articles : undefined,
			})),
			verification: {
				status: "unverified",
				lastAuditDate: null,
				auditor: null,
				issues: [],
			},
		};

		const frontmatter = buildFrontmatter(frontmatterData);
		const newContent = `${frontmatter}\n${content}`;
		writeFileSync(filePath, newContent, "utf-8");
		console.log(`ADDED: ${relPath} (id: ${id})`);
		processed++;
	}

	console.log(`\nDone. Processed: ${processed}, Skipped: ${skipped}`);
}

main();
