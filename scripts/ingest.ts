import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

import { loadRecipes } from "@/lib/db/recipes/csv"
import { recipeToDocument } from "@/lib/db/recipes/document"
import "dotenv/config"
import { uploadToPinecone } from "@/lib/db/vector/upload"

async function main() {
    try {
        const recipes = await loadRecipes()
        console.log("Loaded recipes:", recipes.length)

        const documents = recipes.map(recipeToDocument)
        if (!documents.length) {
            throw new Error("No valid recipe documents were created")
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 0,
            // test-1
            // chunkSize: 1000,
            // chunkOverlap: 200,
        })

        const chunks = await splitter.splitDocuments(documents)
        console.log("Split into chunks:", chunks.length)

        if (!chunks.length) {
            throw new Error("No chunks were generated")
        }

        // await uploadToPinecone(chunks.slice(0, 100))
        // console.log("Uploaded:", chunks.slice(0, 100).length)

        await uploadToPinecone(chunks)
        // console.log("Uploaded:", chunks.slice(0, 100).length)
    } catch (error) {
        console.error("Ingest failed:", error)
        process.exit(1)
    }
}

main()
