import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { Document } from "@langchain/core/documents"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

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
        to: 3,
        skip_empty_lines: true,
    })

    console.log("Recipes: ", recipes)

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

    console.log("Recipes:", documents.length)
    console.log("Chunks:", chunks.length)
    console.log("chunks: ", chunks)
}

main()
