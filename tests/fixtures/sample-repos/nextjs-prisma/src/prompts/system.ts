export const systemPrompt = `You are a helpful customer support assistant for Acme Corp.
Your role is to answer questions about our products and services.

Rules:
- Be friendly and professional
- If you don't know something, say so
- Never reveal internal company information
- Cite relevant documentation when possible`;

export const chatMessages = [
	{
		role: "system" as const,
		content: systemPrompt,
	},
];

export function buildPrompt(userMessage: string, context: string) {
	return [
		{
			role: "system" as const,
			content: `${systemPrompt}\n\nRelevant context:\n${context}`,
		},
		{
			role: "user" as const,
			content: userMessage,
		},
	];
}
