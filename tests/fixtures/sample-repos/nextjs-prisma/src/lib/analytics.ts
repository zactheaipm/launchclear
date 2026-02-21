import Analytics from "@segment/analytics-node";

export const analytics = new Analytics({
	writeKey: process.env.SEGMENT_WRITE_KEY ?? "",
});

export function trackPageView(userId: string, page: string) {
	analytics.page({
		userId,
		name: page,
		properties: {
			url: `https://example.com${page}`,
		},
	});
}

export function identifyUser(userId: string, traits: { email: string; name?: string }) {
	analytics.identify({
		userId,
		traits,
	});
}
