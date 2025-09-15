import { publicProcedure, router } from "@/lib/trpc";
import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap-filter-utils";
import {
  createRawatInapQuery,
  createRawatInapSummaryQuery,
} from "@/lib/rawat-inap-query-builder";
import { z } from "zod";
import { readCsvFile, type CsvData } from "@/lib/csv-utils";
import { differenceInDays } from "date-fns";

const rawatInapFilterSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  filename: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  kd_dokter: z.string().optional(),
  kd_poli: z.string().optional(),
  kd_bangsal: z.string().optional(),
  includeTotals: z.boolean().optional(),
});

export const rawatInapRouter = router({
  getRawatInap: publicProcedure
    .input(rawatInapFilterSchema.optional())
    .query(async ({ input }) => {
      let csvData: CsvData[] = [];
      if (input?.filename) {
        csvData = await readCsvFile(input.filename);
      }
      const filterConditions = buildRawatInapFilterConditions({
        ...input,
        csvSepNumbers: csvData.map((item) => item.no_sep),
      });

      const baseQuery = createRawatInapQuery(and(filterConditions.where));

      const totalCount = await baseQuery.then((results) => results.length);

      const limit = input?.limit || 50;
      const offset = input?.offset || 0;
      const page = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalCount / limit);

      const rawatInap = await baseQuery.offset(offset).limit(limit);

      const rawatInapWithArray = rawatInap.map((item) => {
        const jnsPerawatanArray = JSON.parse(item.jns_perawatan || "[]");

        const mainDoctor = item.nm_dokter;
        const emergencyCount = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan?.nm_dokter === mainDoctor &&
            perawatan.nm_perawatan.toLowerCase().includes("emergency")
        ).length;

        const visiteDpjpUtama =
          (item.tgl_masuk && item.tgl_keluar
            ? Math.max(differenceInDays(item.tgl_keluar, item.tgl_masuk), 1)
            : 1) + emergencyCount;

        const visiteKonsul1 = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan &&
            perawatan.nm_perawatan.toLowerCase().includes("anastesi")
        );

        const visiteKonsul2 = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan &&
            perawatan.nm_dokter !== mainDoctor &&
            !perawatan.nm_perawatan.toLowerCase().includes("anastesi") &&
            !visiteKonsul1.some(
              (konsul: any) => konsul.nm_dokter === perawatan.nm_dokter
            ) &&
            perawatan.nm_perawatan.toLowerCase() !== "visite dokter" &&
            perawatan.nm_perawatan.toLowerCase().includes("visite dokter")
        );

        const visiteKonsul3 = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan &&
            perawatan.nm_dokter !== mainDoctor &&
            !visiteKonsul1.some(
              (konsul: any) => konsul.nm_dokter === perawatan.nm_dokter
            ) &&
            !visiteKonsul2.some(
              (konsul: any) => konsul.nm_dokter === perawatan.nm_dokter
            ) &&
            perawatan.nm_perawatan.toLowerCase() !== "visite dokter" &&
            perawatan.nm_perawatan.toLowerCase().includes("visite dokter")
        );

        const visiteDokterUmum = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan &&
            perawatan.nm_dokter !== mainDoctor &&
            perawatan.nm_perawatan.toLowerCase() === "visite dokter"
        );

        // visiteKonsul1 is always for anastesi only, don't move other konsul data to it
        let finalVisiteKonsul1 = visiteKonsul1;
        let finalVisiteKonsul2 = visiteKonsul2;
        let finalVisiteKonsul3 = visiteKonsul3;

        if (finalVisiteKonsul2.length === 0 && finalVisiteKonsul3.length > 0) {
          finalVisiteKonsul2 = finalVisiteKonsul3;
          finalVisiteKonsul3 = [];
        }

        return {
          ...item,
          visite_dpjp_utama: visiteDpjpUtama,
          visite_konsul_1: finalVisiteKonsul1,
          visite_konsul_2: finalVisiteKonsul2,
          visite_konsul_3: finalVisiteKonsul3,
          visite_dokter_umum: visiteDokterUmum,
          jns_perawatan: jnsPerawatanArray,
          jns_perawatan_radiologi: JSON.parse(
            item.jns_perawatan_radiologi || "[]"
          ),
          hari_rawat:
            item.tgl_masuk && item.tgl_keluar
              ? differenceInDays(item.tgl_keluar, item.tgl_masuk)
              : 1,
        };
      });

      return {
        data: rawatInapWithArray,
        pagination: {
          total: totalCount,
          limit,
          offset,
          page,
          totalPages,
        },
      };
    }),

  getSummaryReport: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        filename: z.string().optional(),
        kd_dokter: z.string().optional(),
        kd_bangsal: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let csvData: CsvData[] = [];
      if (input?.filename) {
        csvData = await readCsvFile(input.filename);
      }
      const filterConditions = buildRawatInapFilterConditions({
        ...input,
        csvSepNumbers: csvData.map((item) => item.no_sep),
      });

      const query = createRawatInapSummaryQuery(and(filterConditions.where));
      const results = await query;

      const dpjpMap = new Map<string, { name: string; total: number }>();
      const konsulMap = new Map<string, { name: string; total: number }>();
      let labTotal = 0;
      let radTotal = 0;

      for (const row of results) {
        const jnsPerawatanData = JSON.parse(
          row.jns_perawatan || "[]"
        ) as Array<{
          kd_jenis_prw: string;
          nm_perawatan: string;
          nm_dokter: string;
        }>;

        const dpjpKey = row.kd_dokter || "Unknown";
        const dpjpName = row.nm_dokter || "Unknown";

        // Count DPJP visits (main doctor visits)
        const dpjpVisits = jnsPerawatanData.filter(
          (item) => item && item.nm_dokter === dpjpName
        ).length;

        if (dpjpMap.has(dpjpKey)) {
          dpjpMap.get(dpjpKey)!.total += dpjpVisits;
        } else {
          dpjpMap.set(dpjpKey, { name: dpjpName, total: dpjpVisits });
        }

        // Count konsul visits (other doctors)
        const konsulVisits = jnsPerawatanData.filter(
          (item) => item && item.nm_dokter !== dpjpName
        );

        if (konsulVisits.length > 0) {
          const konsulDoctor = konsulVisits[0];
          const konsulKey = konsulDoctor.nm_dokter;
          const konsulName = konsulDoctor.nm_dokter;

          if (konsulMap.has(konsulKey)) {
            konsulMap.get(konsulKey)!.total += konsulVisits.length;
          } else {
            konsulMap.set(konsulKey, {
              name: konsulName,
              total: konsulVisits.length,
            });
          }
        }

        labTotal += row.total_permintaan_lab || 0;
        radTotal += row.total_permintaan_radiologi || 0;
      }

      const dpjpTotals = Array.from(dpjpMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      const konsulTotals = Array.from(konsulMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      return {
        dpjp: dpjpTotals,
        konsul: konsulTotals,
        dpjpTotal: dpjpTotals.reduce((sum, item) => sum + item.total, 0),
        konsulTotal: konsulTotals.reduce((sum, item) => sum + item.total, 0),
        labTotal: Math.round(labTotal),
        radTotal: Math.round(radTotal),
      };
    }),
});
