import { router } from "@/lib/trpc";
import { publicProcedure } from "@/lib/trpc";
import {
  getRawatJalan,
  getSummaryReport,
  getRegPeriksaDataForXlsx,
} from "@/lib/rawat-jalan-queries";
import { z } from "zod";

export const rawatJalanRouter = router({
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
        konsul: z.boolean().optional(),
        konsulFilters: z
          .array(
            z.object({
              field: z.string(),
              operator: z.string(),
              value: z.string(),
            })
          )
          .optional(),
        selectedSupport: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getRawatJalan(input);
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
  downloadXlsx: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        filename: z.string().min(1, "XLSX filename is required for download"),
        kd_dokter: z.string().optional(),
        kd_poli: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getRegPeriksaDataForXlsx(input);
    }),
});
