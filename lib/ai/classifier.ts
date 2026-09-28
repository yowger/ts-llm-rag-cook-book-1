import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { z } from "zod"

const intentSchema = z.object({
    intent: z.enum(["vector_search", "database_search", "out_of_scope"]),
})

export type Intent = z.infer<typeof intentSchema>["intent"]

export async function classifyIntent(question: string): Promise<Intent> {
    const prompt = `
        You are an intent classifier for a recipe application.

        Classify the user's message into exactly one of these intents:

        vector_search:
        The user wants recipe recommendations or wants to find recipes
        based on meaning, preferences, ingredients, descriptions, or similarity.
        Examples:
        - "Give me a creamy chicken recipe"
        - "I want something spicy with potatoes"
        - "What can I make with chicken and rice?"
        - "Show me a crispy potato dish"

        database_search:
        The user wants specific information that should be retrieved
        directly from the recipe database.
        This includes counting recipes, filtering recipes by specific
        conditions, finding a recipe by name, or retrieving specific
        recipe information.
        Examples:
        - "How many recipes do you have?"
        - "How many chicken recipes are there?"
        - "Show me 10 recipes containing chicken"
        - "Find the recipe called Chicken Adobo"
        - "What recipes contain both chicken and potatoes?"

        out_of_scope:
        The user asks about something unrelated to the recipe application
        or something the application cannot answer using its recipe data.
        Examples:
        - "What's the weather today?"
        - "Who is the president of the Philippines?"
        - "Help me write a Python program"

        User message:
        ${question}
    `

    const { output } = await generateText({
        model: openai("gpt-5-nano"),
        output: Output.object({
            schema: intentSchema,
        }),
        prompt: prompt,
    })

    return output.intent
}
