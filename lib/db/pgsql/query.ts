import { sql } from "drizzle-orm"
import { db } from "./index"

export async function executeQuery(query: string) {
    return db.execute(sql.raw(query))
}
