import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { z } from "zod"

const intentSchema = z.object({
    intent: z.enum([
        "semantic_search",
        "exact_recipe",
        "count",
        "filter",
        "out_of_scope",
    ]),
})

export type Intent = z.infer<typeof intentSchema>["intent"]

export async function classifyIntent(question: string): Promise<Intent> {
    const { output } = await generateText({
        model: openai("gpt-5-nano"),
        output: Output.object({
            schema: intentSchema,
        }),
        prompt: `
            You are an intent classifier for a recipe application.

            Classify the user's message into exactly one intent.

            semantic_search:
            The user wants recipe recommendations based on
            ingredients, preferences, descriptions, or meaning.

            exact_recipe:
            The user wants a specific recipe.

            count:
            The user wants to know how many recipes exist.

            filter:
            The user wants recipes matching specific conditions.

            out_of_scope:
            The user asks about something unrelated to recipes or the recipe application's capabilities.

            User message:
            ${question}
        `,
    })

    return output.intent
}
