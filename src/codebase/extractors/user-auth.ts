import type { CodebaseSignal } from "../../core/types.js";
import { userAuthPatterns } from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * Detects authentication flows: auth middleware (Passport, NextAuth, Auth0,
 * Clerk), OAuth configs, JWT handling, session management, age verification,
 * and consent collection mechanisms.
 */
export function extractUserAuth(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, userAuthPatterns);
}
