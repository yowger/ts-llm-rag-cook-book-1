import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"
import { OpenAIEmbeddings } from "@langchain/openai"

export function createVectorStore(): Promise<PineconeStore> {
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
