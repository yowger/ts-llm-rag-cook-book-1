import { db } from "./index"
import { recipes } from "./schema"

import { count, ilike } from "drizzle-orm"

export async function countRecipes() {
    const result = await db.select({ count: count() }).from(recipes)

    return result[0].count
}

export async function countRecipesByIngredient(ingredient: string) {
    const result = await db
        .select({ count: count() })
        .from(recipes)
        .where(ilike(recipes.ingredients, `%${ingredient}%`))

    return result[0].count
}
