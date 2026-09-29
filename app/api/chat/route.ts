import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"

import { classifyIntent } from "@/lib/ai/classifier"
import { createVectorStore } from "@/lib/db/vector/create"
import { isSafeQuery, textToSql } from "@/lib/ai/text-to-sql"
import { executeQuery } from "@/lib/db/pgsql/query"

async function generateResponse(messages: UIMessage[], context: string) {
    const modelMessages = await convertToModelMessages(messages)

    return streamText({
        model: openai("gpt-5-mini"),

        system: `
            You are a helpful recipe assistant.

            Answer the user's question using the provided context.

            Rules:
            - Base your answer on the provided context.
            - Do not invent recipes, ingredients, or instructions.
            - Only include information relevant to the user's question.
            - If the context does not contain enough information to answer the question, say that you don't have enough information.

            Context:
            ${context}
        `,

        messages: modelMessages,
    })
}

async function generateOutOfScopeResponse(
    messages: UIMessage[],
): Promise<Response> {
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
        model: openai("gpt-5-mini"),
        system: `
                You are a helpful recipe assistant.

                The user's question is outside the scope of this
                recipe application.

                Politely explain that you can only help with recipes
                and information available in the recipe database.
            `,
        messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
}

async function searchRecipes(question: string): Promise<string> {
    const vectorStore = await createVectorStore()
    const results = await vectorStore.similaritySearch(question, 5)
    return results.map((doc) => doc.pageContent).join("\n\n")
}

async function searchDatabase(question: string): Promise<string> {
    const sqlQuery = await textToSql(question)

    const isSafe = isSafeQuery(sqlQuery)
    if (!isSafe) {
        throw new Error("Unsafe SQL query")
    }

    const queryResult = await executeQuery(sqlQuery)
    console.log("🚀 ~ POST ~ sqlQuery:", sqlQuery)
    console.log("🚀 ~ POST ~ queryResult:", queryResult)
    return JSON.stringify(queryResult)
}

const MAX_INPUT_LENGTH = 1000

export async function POST(request: Request) {
    const { messages }: { messages: UIMessage[] } = await request.json()
    const lastMessage = messages[messages.length - 1]
    const question = lastMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")

    if (!question) {
        return new Response("Question is required", { status: 400 })
    }

    if (question.length > MAX_INPUT_LENGTH) {
        return new Response("Question is too long", { status: 400 })
    }

    const intent = await classifyIntent(question)
    console.log("🚀 ~ POST ~ intent:", intent)

    let context = ""

    if (intent === "out_of_scope") {
        return generateOutOfScopeResponse(messages)
    }

    if (intent === "vector_search") {
        context = await searchRecipes(question)
    }

    if (intent === "database_search") {
        context = await searchDatabase(question)
    }

    const result = await generateResponse(messages, context)

    return result.toUIMessageStreamResponse()
}
