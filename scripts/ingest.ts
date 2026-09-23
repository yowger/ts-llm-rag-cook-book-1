import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { Document } from "@langchain/core/documents"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"

import "dotenv/config"

type Recipe = {
    id: string
    title: string
    ingredients: string
    instructions: string
    imageName: string
    cleanedIngredients: string
}

async function main() {
    const filePath = path.join("data", "13k-recipes.csv")
    const csv = fs.readFileSync(filePath, "utf-8")

    const recipes = parse<Recipe>(csv, {
        columns: (headers) => {
            return headers.map((header) => {
                if (header === "") return "id"
                if (header === "Title") return "title"
                if (header === "Ingredients") return "ingredients"
                if (header === "Instructions") return "instructions"
                if (header === "Image_Name") return "imageName"
                if (header === "Cleaned_Ingredients")
                    return "cleanedIngredients"

                return header
            })
        },
        to: 100,
        skip_empty_lines: true,
    })

    const documents = recipes.map((recipe) => {
        return new Document({
            pageContent: `Recipe: ${recipe.title}

Ingredients:
${recipe.cleanedIngredients}

Instructions:
${recipe.instructions}`,
            metadata: {
                recipeId: recipe.id,
                title: recipe.title,
                imageName: recipe.imageName,
            },
        })
    })

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500,
        chunkOverlap: 200,
    })

    const chunks = await splitter.splitDocuments(documents)

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    })

    // test
    // const vector = await embeddings.embedQuery(chunks[0].pageContent)

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    })

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

    // const testDocuments = chunks.slice(0, 3)
    const testDocuments = chunks.slice(0, 100)

    const vectorStore = await PineconeStore.fromDocuments(
        testDocuments,
        embeddings,
        {
            pineconeIndex: index,
        },
    )

    // const results = await vectorStore.similaritySearch("crispy potatoes", 2)

    console.log("Uploaded:", testDocuments.length)
}

main()
