import fs from "fs"
import path from "path"

import { parse } from "csv-parse/sync"

import { Recipe } from "./types"

const FILE_NAME = "13k-recipes-edited.csv"
const CSV_PATH = path.resolve(process.cwd(), "data", FILE_NAME)

export function normalizeHeaders(headers: string[]): string[] {
    return headers.map((header) => {
        const normalized = header.trim()
        if (!normalized) return "id"
        if (normalized === "Title") return "title"
        if (normalized === "Ingredients") return "ingredients"
        if (normalized === "Instructions") return "instructions"
        return normalized
    })
}

function isValidRecipe(recipe: Partial<Recipe>): recipe is Recipe {
    return !!(
        recipe.id &&
        recipe.title &&
        recipe.ingredients &&
        recipe.instructions
    )
}

export async function loadRecipes({
    maxRows,
}: { maxRows?: number } = {}): Promise<Recipe[]> {
    const csv = fs.readFileSync(CSV_PATH, "utf-8")

    const rawRecipes = parse(csv, {
        columns: normalizeHeaders,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        bom: true,
        to: maxRows,
    }) as Partial<Recipe>[]

    const recipes = rawRecipes.filter(isValidRecipe)

    return recipes
}
