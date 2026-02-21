/**
 * Fixes manifest.json lastUpdated dates from generation dates to actual law dates.
 * Run with: npx tsx scripts/fix-manifest-dates.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PROVISIONS_DIR = join(import.meta.dirname, "..", "knowledge", "provisions");

// Actual law publication/amendment dates (not when files were generated)
// null = unknown, needs verification
const ACTUAL_DATES: Record<string, string | null> = {
	"eu/ai-act": "2024-07-12", // Published in Official Journal
	"eu/gdpr": "2016-05-04", // Published (effective 2018-05-25)
	"us/federal": null, // Mixed: FTC Act is old, NIST AI RMF is 2023, etc.
	uk: null, // Mixed: UK GDPR retained, ICO guidance updated rolling
	singapore: null, // Mixed: PDPA 2012, IMDA agentic AI Jan 2026
	china: null, // Mixed: GenAI measures 2023, deep synthesis 2023, PIPL 2021
	brazil: null, // Mixed: LGPD 2018, AI Bill pending
	"us/states/california": null, // Mixed: CCPA 2018, SB 942 signed Sep 2024
	"us/states/colorado": "2024-05-17", // Colorado AI Act signed
	"us/states/illinois": null, // Mixed: BIPA 2008, AIVAA 2019
	"us/states/new-york": "2021-12-11", // LL144 enacted
	"us/states/texas": null, // TRAIGA — needs verification of exact date
};

function findManifests(dir: string): string[] {
	const results: string[] = [];
	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			results.push(...findManifests(fullPath));
		} else if (entry === "manifest.json") {
			results.push(fullPath);
		}
	}
	return results;
}

function main(): void {
	const manifests = findManifests(PROVISIONS_DIR);

	for (const manifestPath of manifests) {
		const raw = readFileSync(manifestPath, "utf-8");
		const manifest = JSON.parse(raw);

		// Determine the relative key for date lookup
		const relDir = manifestPath.replace(`${PROVISIONS_DIR}/`, "").replace("/manifest.json", "");
		const actualDate = ACTUAL_DATES[relDir];

		const oldDate = manifest.lastUpdated;
		manifest.lastUpdated = actualDate; // null if unknown

		writeFileSync(manifestPath, `${JSON.stringify(manifest, null, "\t")}\n`, "utf-8");

		const status = actualDate
			? `${oldDate} → ${actualDate}`
			: `${oldDate} → null (needs verification)`;
		console.log(`${relDir}: ${status}`);
	}

	console.log(`\nUpdated ${manifests.length} manifests.`);
}

main();
