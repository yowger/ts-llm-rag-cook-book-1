import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { z } from "zod"

const sqlSchema = z.object({
    sql: z.string(),
})

export async function textToSql(question: string) {
    const prompt = `
            You are a PostgreSQL SQL generator for a recipe application.

            Database schema:

            Table: recipes

            Columns:
            - id: integer
            - title: text
            - ingredients: text
            - instructions: text

            Rules:

            - Only query the recipes table.
            - Only generate SELECT queries.
            - You may use COUNT, WHERE, ORDER BY, GROUP BY, and LIMIT.
            - Never generate INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE.
            - Return only SQL that can safely read recipe data.

            User question:
            ${question}
        `

    const { output } = await generateText({
        model: openai("gpt-5-nano"),
        output: Output.object({
            schema: sqlSchema,
        }),
        prompt: prompt,
    })

    return output.sql
}

export function isSafeQuery(sql: string): boolean {
  const cleanSql = sql.toUpperCase();
  const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT'];
  
  for (const keyword of forbiddenKeywords) {
    if (cleanSql.includes(keyword)) {
      return false;
    }
  }

  return true;
}