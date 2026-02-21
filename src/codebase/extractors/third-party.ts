import type { CodebaseSignal } from "../../core/types.js";
import { thirdPartyPatterns } from "../patterns.js";
import { scanLines } from "./shared.js";

/**
 * Detects third-party data sharing: analytics SDKs (Segment, Mixpanel, GA),
 * advertising SDKs (Facebook Pixel, Google Ads), webhook configs,
 * cloud AI API calls (OpenAI, Anthropic, Google), error tracking (Sentry),
 * and customer communication tools (Intercom).
 */
export function extractThirdParty(filePath: string, content: string): readonly CodebaseSignal[] {
	return scanLines(filePath, content, thirdPartyPatterns);
}
