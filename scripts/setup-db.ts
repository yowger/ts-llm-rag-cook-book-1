import { Pinecone } from "@pinecone-database/pinecone"
import "dotenv/config"

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
})

const indexName = process.env.PINECONE_INDEX_NAME!

async function main() {
    const indexes = await pinecone.listIndexes()

    const exists = indexes.indexes?.some((index) => index.name === indexName)

    if (exists) {
        console.log(`Index "${indexName}" already exists.`)
        return
    }

    await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        metric: "cosine",
        spec: {
            serverless: {
                cloud: "aws",
                region: "us-east-1",
            },
        },
    })

    console.log(`Created index "${indexName}".`)
}

main()
