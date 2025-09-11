import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { bridgingSepRouter } from "./bridging-sep";
import { regPeriksaRouter } from "./reg-periksa";
import { csvUploadRouter } from "./csv-upload";

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
  bridgingSep: bridgingSepRouter,
  regPeriksa: regPeriksaRouter,
  csvUpload: csvUploadRouter,
});
export type AppRouter = typeof appRouter;
