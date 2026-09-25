import { Pinecone } from "@pinecone-database/pinecone"
import "dotenv/config"

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
})

const indexName = process.env.PINECONE_INDEX_NAME!

async function main() {
    const index = pinecone.index(indexName)

    await index.namespace("__default__").deleteAll()

    console.log("All vectors deleted.")
}

main()
