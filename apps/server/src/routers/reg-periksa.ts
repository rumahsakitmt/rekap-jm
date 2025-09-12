import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { z } from "zod";
import {
  getRegPeriksaData,
  getSummaryReport,
} from "../lib/reg-periksa-queries";

export const regPeriksaRouter = router({
  getRegPeriksa: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        includeTotals: z.boolean().optional(),
        filename: z.string().optional(),
        kd_dokter: z.string().optional(),
        kd_poli: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getRegPeriksaData(input);
    }),

  getSummaryReport: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        filename: z.string().optional(),
        kd_dokter: z.string().optional(),
        kd_poli: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getSummaryReport(input);
    }),
});
