import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { bridging_sep } from "../db/schema/bridging_sep";
import { sql, and, gte, lte, asc } from "drizzle-orm";
import { z } from "zod";

export const bridgingSepRouter = router({
  getBridgingSep: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          sql`(${bridging_sep.no_sep} LIKE ${`%${input.search}%`} OR ${bridging_sep.no_rawat} LIKE ${`%${input.search}%`})`
        );
      }

      if (input.dateFrom) {
        conditions.push(gte(bridging_sep.tglsep, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(bridging_sep.tglsep, input.dateTo));
      }

      const baseQuery = db
        .select()
        .from(bridging_sep)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(bridging_sep.tglsep));

      const result = input.limit
        ? await baseQuery.limit(input.limit)
        : await baseQuery;

      return result;
    }),
});
