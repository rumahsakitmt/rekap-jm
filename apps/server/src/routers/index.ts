import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { dokter } from "../db/schema/dokter";
import { sql } from "drizzle-orm";
import { rawatJalanRouter } from "./rawat-jalan";

export const appRouter = router({
  healthCheck: publicProcedure.query(async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return { status: "OK", database: "connected" };
    } catch (error) {
      return {
        status: "ERROR",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
  getDokter: publicProcedure.query(() => {
    return db.select().from(dokter);
  }),
  rawatJalan: rawatJalanRouter,
});
export type AppRouter = typeof appRouter;
