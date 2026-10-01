import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"
import { Document } from "@langchain/core/documents"

export async function uploadToPinecone(documents: Document[]) {
    const apiKey = process.env.PINECONE_API_KEY
    const indexName = process.env.PINECONE_INDEX_NAME

    if (!apiKey) throw new Error("Missing PINECONE_API_KEY")
    if (!indexName) throw new Error("Missing PINECONE_INDEX_NAME")

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    })

    const pinecone = new Pinecone({ apiKey })
    const index = pinecone.index(indexName)

    const vectorStore = await PineconeStore.fromDocuments(
        documents,
        embeddings,
        {
            pineconeIndex: index,
        },
    )

    return vectorStore
}