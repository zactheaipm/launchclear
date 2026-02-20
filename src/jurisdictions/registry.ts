import type { Jurisdiction, JurisdictionModule } from "../core/types.js";
import type { Result } from "../core/types.js";

// ─── Jurisdiction Registry Entry ──────────────────────────────────────────

export interface JurisdictionRegistryEntry {
	readonly id: Jurisdiction;
	readonly name: string;
	readonly region: string;
	readonly description: string;
	readonly module: JurisdictionModule;
}

// ─── Registry State ───────────────────────────────────────────────────────

const registry = new Map<Jurisdiction, JurisdictionRegistryEntry>();

// ─── Public API ───────────────────────────────────────────────────────────

export function registerJurisdiction(entry: JurisdictionRegistryEntry): void {
	registry.set(entry.id, entry);
}

export function getJurisdiction(id: Jurisdiction): Result<JurisdictionRegistryEntry> {
	const entry = registry.get(id);
	if (!entry) {
		return {
			ok: false,
			error: new Error(`Jurisdiction "${id}" is not registered`),
		};
	}
	return { ok: true, value: entry };
}

export function getJurisdictionModule(id: Jurisdiction): Result<JurisdictionModule> {
	const result = getJurisdiction(id);
	if (!result.ok) {
		return result;
	}
	return { ok: true, value: result.value.module };
}

export function listJurisdictions(): readonly JurisdictionRegistryEntry[] {
	return [...registry.values()];
}

export function listJurisdictionIds(): readonly Jurisdiction[] {
	return [...registry.keys()];
}

export function hasJurisdiction(id: Jurisdiction): boolean {
	return registry.has(id);
}

export function clearRegistry(): void {
	registry.clear();
}
