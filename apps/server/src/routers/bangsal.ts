import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { bangsal } from "../db/schema/bangsal";
import { asc } from "drizzle-orm";

export const bangsalRouter = router({
  getBangsal: publicProcedure.query(async () => {
    return await db.select().from(bangsal).orderBy(asc(bangsal.nm_bangsal));
  }),
});
