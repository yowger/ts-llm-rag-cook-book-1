import { integer, pgTable, text } from "drizzle-orm/pg-core"

export const recipes = pgTable("recipes", {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    ingredients: text("ingredients").notNull(),
    instructions: text("instructions").notNull(),
})
