// test average chars on documents

import { loadRecipes } from "@/lib/db/recipes/csv"
import { recipeToDocument } from "@/lib/db/recipes/document"

async function testRecipeLengths() {
    const recipes = await loadRecipes({ maxRows: 1000 })
    console.log("Loaded recipes:", recipes.length)

    const documents = recipes.map(recipeToDocument)
    if (!documents.length) {
        throw new Error("No valid recipe documents were created")
    }

    const lengths = documents.map((doc) => doc.pageContent.length)

    const total = lengths.reduce((sum, length) => sum + length, 0)
    const average = total / lengths.length

    console.log("Shortest:", Math.min(...lengths))
    console.log("Longest:", Math.max(...lengths))
    console.log("Average:", Math.round(average))

    const sortedLengths = [...lengths].sort((a, b) => a - b)

    const percentile = (percent: number) => {
        const index = Math.floor((percent / 100) * sortedLengths.length)
        return sortedLengths[index]
    }

    console.log("50th percentile:", percentile(50))
    console.log("75th percentile:", percentile(75))
    console.log("90th percentile:", percentile(90))
    console.log("95th percentile:", percentile(95))
    console.log("99th percentile:", percentile(99))
}

testRecipeLengths()
