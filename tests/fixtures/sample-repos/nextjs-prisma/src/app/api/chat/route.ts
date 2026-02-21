import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { analytics } from "../../../lib/analytics";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY ?? "",
});

const index = pinecone.Index("knowledge-base");

export async function POST(req: Request) {
	const { message, conversationId } = await req.json();

	// Track user interaction
	analytics.track("chat_message_sent", {
		conversationId,
		messageLength: message.length,
	});

	// 1. Generate embedding for the user query
	const embeddingResponse = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input: message,
	});
	const queryEmbedding = embeddingResponse.data[0]?.embedding;

	// 2. Search vector DB for relevant context
	const searchResults = await index.query({
		vector: queryEmbedding,
		topK: 5,
		includeMetadata: true,
	});

	const contextChunks = searchResults.matches
		.map((match) => match.metadata?.text)
		.filter(Boolean)
		.join("\n\n");

	// 3. Run content moderation on the user's message
	const moderation = await openai.moderations.create({
		input: message,
	});

	if (moderation.results[0]?.flagged) {
		return Response.json({ error: "Message flagged by content moderation" }, { status: 400 });
	}

	// 4. Generate response with context
	const completion = await openai.chat.completions.create({
		model: "gpt-4",
		messages: [
			{
				role: "system",
				content: `You are a helpful assistant. Use the following context to answer the user's question:\n\n${contextChunks}`,
			},
			{ role: "user", content: message },
		],
		stream: true,
	});

	// 5. Stream the response
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			for await (const chunk of completion) {
				const text = chunk.choices[0]?.delta?.content || "";
				controller.enqueue(encoder.encode(text));
			}
			controller.close();
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "text/event-stream" },
	});
}
