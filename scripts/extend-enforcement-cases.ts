/**
 * Extends enforcement cases.json with verification fields.
 * Run with: npx tsx scripts/extend-enforcement-cases.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CASES_PATH = join(import.meta.dirname, "..", "knowledge", "enforcement", "cases.json");

interface OriginalCase {
	id: string;
	jurisdiction: string;
	authority: string;
	date: string;
	respondent: string;
	summary: string;
	relevantProvisions: string[];
	outcome: string;
	fine?: number;
	url?: string;
}

interface ExtendedCase extends OriginalCase {
	fineCurrency?: string;
	sources: Array<{
		type: string;
		title: string;
		url: string;
		decisionNumber?: string;
		accessDate: string;
	}>;
	verification: {
		status: string;
		fineVerified: boolean;
		dateVerified: boolean;
		factsVerified: boolean;
		auditor: null;
		auditDate: null;
		notes: string[];
	};
	generatedBy: string;
}

// Infer currency from jurisdiction
function inferCurrency(jurisdiction: string, fine?: number): string | undefined {
	if (fine === undefined) return undefined;
	if (jurisdiction.startsWith("eu")) return "EUR";
	if (jurisdiction.startsWith("us") || jurisdiction === "us-federal") return "USD";
	if (jurisdiction === "uk") return "GBP";
	if (jurisdiction === "singapore") return "SGD";
	if (jurisdiction === "china") return "USD"; // Didi/Ant reported in USD equivalent
	if (jurisdiction === "brazil") return "BRL";
	return "USD";
}

// Known generic URLs that need replacement
const GENERIC_URL_PATTERNS = [
	"http://www.cac.gov.cn",
	"https://cnpd.public.lu/en.html",
	"https://www.pdpc.gov.sg/all-commissions-decisions",
	"https://www.gov.br/anpd/pt-br",
	"https://www.eeoc.gov/ai",
];

function isGenericUrl(url: string): boolean {
	return GENERIC_URL_PATTERNS.some((pattern) => url === pattern || url === `${pattern}/`);
}

function main(): void {
	const raw = readFileSync(CASES_PATH, "utf-8");
	const cases: OriginalCase[] = JSON.parse(raw);

	const extended: ExtendedCase[] = cases.map((c) => {
		const notes: string[] = [];

		// Fix known errors
		let authority = c.authority;
		const url = c.url;

		// Fix: cn-cac-ant-group-2023 — CBIRC was dissolved into NFRA in May 2023
		if (c.id === "cn-cac-ant-group-2023") {
			authority = "PBOC, NFRA (formerly CBIRC), CSRC, SAFE (coordinated)";
			notes.push("Authority corrected: CBIRC renamed to NFRA in May 2023");
		}

		// Fix: us-bipa-meta-facebook-2021 — URL points to FTC, should be BIPA class action
		if (c.id === "us-bipa-meta-facebook-2021") {
			notes.push(
				"Original URL pointed to FTC proceeding, not the BIPA class action settlement. URL needs replacement with court settlement documentation.",
			);
		}

		// Flag generic URLs
		if (url && isGenericUrl(url)) {
			notes.push(
				`URL is generic homepage (${url}), not a specific decision page. Needs replacement with decision-specific URL.`,
			);
		}

		// Flag sg-pdpc-singhealth fine discrepancy
		if (c.id === "sg-pdpc-singhealth-2019") {
			notes.push(
				"Fine field (SGD 250,000) captures only SingHealth's portion. IHiS was separately fined SGD 750,000. Total enforcement action was SGD 1,000,000.",
			);
		}

		const fineCurrency = inferCurrency(c.jurisdiction, c.fine);

		// Override currency for specific cases
		let currencyOverride = fineCurrency;
		if (c.id === "cn-cac-didi-2022") currencyOverride = "USD"; // Reported as USD equivalent
		if (c.id === "cn-cac-ant-group-2023") currencyOverride = "USD"; // Reported as USD equivalent
		if (c.id === "uk-ico-clearview-2022") currencyOverride = "GBP";
		if (c.id === "uk-ico-british-airways-2020") currencyOverride = "GBP";
		if (c.id === "uk-ico-marriott-2020") currencyOverride = "GBP";

		return {
			...c,
			authority,
			fineCurrency: currencyOverride,
			sources: url
				? [
						{
							type: "press-release" as const,
							title: `${authority} — ${c.respondent}`,
							url,
							accessDate: "2026-02-20",
						},
					]
				: [],
			verification: {
				status: "unverified",
				fineVerified: false,
				dateVerified: false,
				factsVerified: false,
				auditor: null,
				auditDate: null,
				notes,
			},
			generatedBy: "claude-opus-4",
		};
	});

	writeFileSync(CASES_PATH, JSON.stringify(extended, null, "\t"), "utf-8");
	console.log(`Extended ${extended.length} enforcement cases.`);

	const withNotes = extended.filter((c) => c.verification.notes.length > 0);
	console.log(`\n${withNotes.length} cases have verification notes:`);
	for (const c of withNotes) {
		console.log(`  ${c.id}:`);
		for (const note of c.verification.notes) {
			console.log(`    - ${note}`);
		}
	}
}

main();
