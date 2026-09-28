import { streamText, convertToModelMessages, type UIMessage } from "ai"

import { openai } from "@ai-sdk/openai"
import { classifyIntent } from "@/lib/ai/classifier"
import { createVectorStore } from "@/app/db/vector/create"

export const maxDuration = 30

export async function POST(request: Request) {
    const { messages }: { messages: UIMessage[] } = await request.json()

    const lastMessage = messages[messages.length - 1]

    const question = lastMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")

    const intent = await classifyIntent(question)
    console.log("🚀 ~ POST ~ intent:", intent)

    const vectorStore = await createVectorStore()

    const results = await vectorStore.similaritySearch(question, 5)

    const context = results.map((doc) => doc.pageContent).join("\n\n")

    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
        model: openai("gpt-5-mini"),

        system: `
        You are a helpful recipe assistant.

        Answer the user's question using the recipe context below.

        If the answer cannot be found in the provided context,
        say that you don't have enough information.

        Recipe context:

        ${context}
        `,

        messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
}
