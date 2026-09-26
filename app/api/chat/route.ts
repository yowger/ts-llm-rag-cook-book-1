import { openai } from "@ai-sdk/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"
import { OpenAIEmbeddings } from "@langchain/openai"
import { streamText, convertToModelMessages, type UIMessage } from "ai"

function createVectorStore(): Promise<PineconeStore> {
    const apiKey = process.env.PINECONE_API_KEY
    const indexName = process.env.PINECONE_INDEX_NAME

    if (!apiKey) {
        throw new Error("Missing PINECONE_API_KEY")
    }

    if (!indexName) {
        throw new Error("Missing PINECONE_INDEX_NAME")
    }

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    })

    const pinecone = new Pinecone({
        apiKey,
    })

    const index = pinecone.index(indexName)

    return PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
    })
}

export const maxDuration = 30

export async function POST(request: Request) {
    const { messages }: { messages: UIMessage[] } = await request.json()

    const lastMessage = messages[messages.length - 1]

    const question = lastMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")

    const vectorStore = await createVectorStore()

    const results = await vectorStore.similaritySearch(question, 5)
    console.log("🚀 ~ POST ~ results:", results)

    const context = results.map((doc) => doc.pageContent).join("\n\n")
    const sources = results.map((doc) => ({
        recipeId: doc.metadata.recipeId,
        title: doc.metadata.title,
        imageName: doc.metadata.imageName,
    }))

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

    return result.toUIMessageStreamResponse({
        messageMetadata: ({ part }) => {
            if (part.type === "start") {
                return {
                    sources,
                }
            }

            return undefined
        },
    })
}
