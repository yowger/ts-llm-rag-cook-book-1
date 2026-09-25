import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"

import "dotenv/config"

async function main() {
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    })

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    })

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
    })

    // const results = await vectorStore.similaritySearch("crispy potatoes", 2)
    const results = await vectorStore.similaritySearch("potato", 3)

    // console.log(results)

    const queries = [
        // "crispy potatoes",
        // "creamy potato side dish",
        // "something crunchy made with potatoes",
        // "chocolate cake",
        // "easy chicken dinner",
        "Whats a good potato recipe?",
    ]

    for (const query of queries) {
        const results = await vectorStore.similaritySearch(query, 3)

        console.log(`\nQuery: ${query}`)

        for (const result of results) {
            console.log("-", result.metadata.title)
        }
    }
}

main()
