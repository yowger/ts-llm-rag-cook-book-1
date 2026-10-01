import { Document } from "@langchain/core/documents"

import { Recipe } from "./types"

export function recipeToDocument(recipe: Recipe): Document {
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
