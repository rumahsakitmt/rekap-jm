import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { bangsal } from "../db/schema/bangsal";
import { asc, eq } from "drizzle-orm";

export const kamarRouter = router({
  getKamar: publicProcedure.query(async () => {
    return await db
      .select()
      .from(bangsal)
      .orderBy(asc(bangsal.nm_bangsal))
      .where(eq(bangsal.status, "1"));
  }),
});
