import type { CodebaseSignal } from "../../core/types.js";
import { dataStoragePatterns, piiPatterns } from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * Detects data storage: DB schemas (Prisma, Drizzle, TypeORM, Sequelize,
 * Mongoose), migration files, ORM model definitions.
 * Also detects PII field names within those schemas.
 */
export function extractDataStorage(filePath: string, content: string): readonly CodebaseSignal[] {
	const storageSignals = scanLines(filePath, content, dataStoragePatterns);
	const piiSignals = scanLines(filePath, content, piiPatterns);
	return [...storageSignals, ...piiSignals];
}
