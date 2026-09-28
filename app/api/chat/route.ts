import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"

import { classifyIntent } from "@/lib/ai/classifier"
import { createVectorStore } from "@/lib/db/vector/create"
import { isSafeQuery, textToSql } from "@/lib/ai/text-to-sql"
import { executeQuery } from "@/lib/db/pgsql/query"

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

    if (intent === "out_of_scope") {
        const modelMessages = await convertToModelMessages(messages)
        const result = streamText({
            model: openai("gpt-5-mini"),
            system: ` You are a helpful recipe assistant. The user's question is outside the scope of this recipe application. Politely explain that you can only help with recipes and information available in the recipe database. `,
            messages: modelMessages,
        })
        return result.toUIMessageStreamResponse()
    }

    let context = ""

    if (intent === "vector_search") {
        const vectorStore = await createVectorStore()
        const results = await vectorStore.similaritySearch(question, 5)
        context = results.map((doc) => doc.pageContent).join("\n\n")
    }

    if (intent === "database_search") {
        const sqlQuery = await textToSql(question)
        console.log("🚀 ~ POST ~ sqlQuery:", sqlQuery)

        const isSafe = isSafeQuery(sqlQuery)
        if (!isSafe) {
            throw new Error("Unsafe SQL query")
        }

        const queryResult = await executeQuery(sqlQuery)
        console.log("🚀 ~ POST ~ queryResult:", queryResult)
        context = JSON.stringify(queryResult)
    }

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
