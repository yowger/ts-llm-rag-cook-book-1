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
            - Never use SELECT *.
            - Always explicitly specify the columns you need.
            - Never return more than 10 rows.
            - For queries that return multiple recipes, always use LIMIT 10.
            - Use COUNT(*) when the user asks "how many" or asks for a count.
            - Use WHERE when the user specifies a condition.
            - You may use COUNT, WHERE, ORDER BY, GROUP BY, and LIMIT.
            - Never generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, GRANT, or other write operations.
            - Never query any table other than recipes.
            - Return only SQL.

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