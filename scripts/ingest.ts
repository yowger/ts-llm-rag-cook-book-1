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

const FILE_NAME = "13k-recipes.csv"
const CSV_PATH = path.resolve(process.cwd(), "data", FILE_NAME)
const MAX_ROWS = 100

function normalizeHeaders(headers: string[]): string[] {
    return headers.map((header) => {
        const normalized = header.trim()
        if (!normalized) return "id"
        if (normalized === "Title") return "title"
        if (normalized === "Ingredients") return "ingredients"
        if (normalized === "Instructions") return "instructions"
        if (normalized === "Image_Name") return "imageName"
        if (normalized === "Cleaned_Ingredients") return "cleanedIngredients"
        return normalized
    })
}

function isValidRecipe(recipe: Partial<Recipe>): recipe is Recipe {
    return !!(
        recipe.id &&
        recipe.title &&
        recipe.cleanedIngredients &&
        recipe.instructions
    )
}

function recipeToDocument(recipe: Recipe): Document {
    return new Document({
        pageContent: `Recipe: ${recipe.title}

Ingredients:
${recipe.cleanedIngredients}

Instructions:
${recipe.instructions}`,
        metadata: {
            recipeId: recipe.id,
            title: recipe.title,
            imageName: recipe.imageName || "",
        },
    })
}

async function loadRecipes({ to }: { to?: number } = {}): Promise<Recipe[]> {
    const csv = fs.readFileSync(CSV_PATH, "utf-8")

    const rawRecipes = parse(csv, {
        columns: normalizeHeaders,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        bom: true,
        to: to,
    }) as Partial<Recipe>[]

    const recipes = rawRecipes.filter(isValidRecipe)

    return recipes
}

async function uploadToPinecone(documents: Document[]) {
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

async function main() {
    try {
        const recipes = await loadRecipes({ to: MAX_ROWS })
        console.log("Loaded recipes:", recipes.length)

        const documents = recipes.map(recipeToDocument)
        if (!documents.length) {
            throw new Error("No valid recipe documents were created")
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1500,
            chunkOverlap: 200,
        })

        const chunks = await splitter.splitDocuments(documents)
        console.log("Split into chunks:", chunks.length)

        if (!chunks.length) {
            throw new Error("No chunks were generated")
        }

        await uploadToPinecone(chunks.slice(0, 100))
        console.log("Uploaded:", chunks.slice(0, 100).length)
    } catch (error) {
        console.error("Ingest failed:", error)
        process.exit(1)
    }
}

main()
