import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { poliklinik } from "../db/schema/poliklinik";
import { sql, and, like, asc, eq } from "drizzle-orm";
import { z } from "zod";

export const poliklinikRouter = router({
  getPoliklinik: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        kd_poli: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          sql`(${poliklinik.kd_poli} LIKE ${`%${input.search}%`} OR ${poliklinik.nm_poli} LIKE ${`%${input.search}%`})`
        );
      }

      if (input.kd_poli) {
        conditions.push(eq(poliklinik.kd_poli, input.kd_poli));
      }

      const result = await db
        .select({
          kd_poli: poliklinik.kd_poli,
          nm_poli: poliklinik.nm_poli,
          registrasi: poliklinik.registrasi,
          registrasilama: poliklinik.registrasilama,
          status: poliklinik.status,
        })
        .from(poliklinik)
        .where(
          conditions.length > 0
            ? and(...conditions, eq(poliklinik.status, "1"))
            : undefined
        )
        .orderBy(asc(poliklinik.nm_poli))
        .offset(input.offset || 0);

      return {
        data: result,
      };
    }),
});
