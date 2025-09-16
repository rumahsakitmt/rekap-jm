import { publicProcedure, router } from "@/lib/trpc";
import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap-filter-utils";
import {
  createRawatInapQuery,
  createRawatInapSummaryQuery,
} from "@/lib/rawat-inap-query-builder";
import { z } from "zod";
import {
  readCsvFile,
  createCsvTarifMap,
  convertToCsv,
  type CsvData,
} from "@/lib/csv-utils";
import { differenceInDays } from "date-fns";
import {
  calculateFinancials,
  accumulateTotals,
  createEmptyTotals,
  type CalculationInput,
  type TotalsAccumulator,
} from "@/lib/calculation-utils";

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
      const csvTarifMap = createCsvTarifMap(csvData);

      const totalCount = await baseQuery.then((results) => results.length);

      const limit = input?.limit || 50;
      const offset = input?.offset || 0;
      const page = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalCount / limit);

      let totals: TotalsAccumulator | null = null;
      if (input?.includeTotals) {
        const allResults = await baseQuery;
        totals = allResults.reduce((acc, row) => {
          const tarif = csvTarifMap.get(row.no_sep || "") || 0;

          // Use rawat-inap specific calculation logic
          const jnsPerawatanArray = JSON.parse(row.jns_perawatan || "[]");
          const mainDoctor = row.nm_dokter;
          const emergencyCount = jnsPerawatanArray.filter(
            (perawatan: any) =>
              perawatan?.nm_dokter === mainDoctor &&
              perawatan.nm_perawatan.toLowerCase().includes("emergency")
          ).length;

          const visiteDpjpUtama =
            (row.tgl_masuk && row.tgl_keluar
              ? Math.max(differenceInDays(row.tgl_keluar, row.tgl_masuk), 1)
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

          if (
            finalVisiteKonsul2.length === 0 &&
            finalVisiteKonsul3.length > 0
          ) {
            finalVisiteKonsul2 = finalVisiteKonsul3;
            finalVisiteKonsul3 = [];
          }

          const remun_lab = (row.total_permintaan_lab || 0) * 5000;
          const remun_rad = (row.total_permintaan_radiologi || 0) * 15000;
          const remun_dokter_umum = (visiteDokterUmum.length || 0) * 20000;
          const totalVisite =
            visiteDpjpUtama +
            visiteKonsul1.length +
            visiteKonsul2.length +
            visiteKonsul3.length +
            visiteDokterUmum.length;
          const alokasi = tarif * 0.2 - remun_lab - remun_rad;
          const dpjp_ranap = alokasi * 0.3 - remun_dokter_umum;
          const remun_dpjp_utama = (visiteDpjpUtama / totalVisite) * dpjp_ranap;
          const remun_konsul_anastesi =
            (visiteKonsul1.length / totalVisite) * dpjp_ranap;
          const remun_konsul_2 =
            (visiteKonsul2.length / totalVisite) * dpjp_ranap;
          const remun_konsul_3 =
            (visiteKonsul3.length / totalVisite) * dpjp_ranap;
          const remun_operator = row.has_operasi ? alokasi * 0.7 * 0.7 : 0;
          const remun_anestesi = row.has_operasi ? alokasi * 0.7 * 0.3 : 0;

          // Calculate total yang terbagi and percentage dari klaim
          const yang_terbagi =
            remun_dpjp_utama +
            remun_konsul_anastesi +
            remun_konsul_2 +
            remun_konsul_3 +
            remun_dokter_umum +
            remun_operator +
            remun_anestesi +
            remun_lab +
            remun_rad;
          const percent_dari_klaim =
            tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

          // Create calculation result in the format expected by accumulateTotals
          const calculation = {
            alokasi,
            laboratorium: remun_lab,
            radiologi: remun_rad,
            dpjp_utama: remun_dpjp_utama,
            konsul: remun_konsul_anastesi + remun_konsul_2 + remun_konsul_3,
            usgCount: 0, // Not used in rawat-inap
            nonUsgCount: 0, // Not used in rawat-inap
            yang_terbagi,
            percent_dari_klaim,
          };

          return accumulateTotals(acc, tarif, calculation);
        }, createEmptyTotals());
      }

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

        const tarif = csvTarifMap.get(item.no_sep || "") || 0;
        const remun_lab = (item.total_permintaan_lab || 0) * 5000;
        const remun_rad = (item.total_permintaan_radiologi || 0) * 15000;
        const remun_dokter_umum = (visiteDokterUmum.length || 0) * 20000;
        const totalVisite =
          visiteDpjpUtama +
          visiteKonsul1.length +
          visiteKonsul2.length +
          visiteKonsul3.length +
          visiteDokterUmum.length;
        const alokasi = tarif * 0.2 - remun_lab - remun_rad;
        const dpjp_ranap = alokasi * 0.3 - remun_dokter_umum;
        const remun_dpjp_utama = (visiteDpjpUtama / totalVisite) * dpjp_ranap;
        const remun_konsul_anastesi =
          (visiteKonsul1.length / totalVisite) * dpjp_ranap;
        const remun_konsul_2 =
          (visiteKonsul2.length / totalVisite) * dpjp_ranap;
        const remun_konsul_3 =
          (visiteKonsul3.length / totalVisite) * dpjp_ranap;
        const remun_operator = item.has_operasi ? alokasi * 0.7 * 0.7 : 0;
        const remun_anestesi = item.has_operasi ? alokasi * 0.7 * 0.3 : 0;

        // Calculate total yang terbagi and percentage dari klaim
        const yang_terbagi =
          remun_dpjp_utama +
          remun_konsul_anastesi +
          remun_konsul_2 +
          remun_konsul_3 +
          remun_dokter_umum +
          remun_operator +
          remun_anestesi +
          remun_lab +
          remun_rad;
        const percent_dari_klaim =
          tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

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
          tarif_from_csv: csvTarifMap.get(item.no_sep || "") || undefined,
          alokasi,
          dpjp_ranap,
          remun_lab,
          remun_rad,
          remun_dokter_umum,
          totalVisite,
          remun_dpjp_utama,
          remun_konsul_anastesi,
          remun_konsul_2,
          remun_konsul_3,
          remun_operator,
          remun_anestesi,
          yang_terbagi,
          percent_dari_klaim,
        };
      });

      return {
        data: rawatInapWithArray,
        totals: totals
          ? {
              ...totals,
              averagePercentDariKlaim:
                totals.count > 0
                  ? Math.round(totals.totalPercentDariKlaim / totals.count)
                  : 0,
            }
          : null,
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
      const csvTarifMap = createCsvTarifMap(csvData);

      const dpjpMap = new Map<string, { name: string; total: number }>();
      const konsulMap = new Map<string, { name: string; total: number }>();
      let labTotal = 0;
      let radTotal = 0;

      for (const row of results) {
        const tarif = csvTarifMap.get(row.no_sep || "") || 0;

        // Use rawat-inap specific calculation logic
        const jnsPerawatanArray = JSON.parse(row.jns_perawatan || "[]");
        const mainDoctor = row.nm_dokter;
        const emergencyCount = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan?.nm_dokter === mainDoctor &&
            perawatan.nm_perawatan.toLowerCase().includes("emergency")
        ).length;

        const visiteDpjpUtama =
          (row.tgl_masuk && row.tgl_keluar
            ? Math.max(differenceInDays(row.tgl_keluar, row.tgl_masuk), 1)
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

        const remun_lab = (row.total_permintaan_lab || 0) * 5000;
        const remun_rad = (row.total_permintaan_radiologi || 0) * 15000;
        const remun_dokter_umum = (visiteDokterUmum.length || 0) * 20000;
        const totalVisite =
          visiteDpjpUtama +
          visiteKonsul1.length +
          visiteKonsul2.length +
          visiteKonsul3.length +
          visiteDokterUmum.length;
        const alokasi = tarif * 0.2 - remun_lab - remun_rad;
        const dpjp_ranap = alokasi * 0.3 - remun_dokter_umum;
        const remun_dpjp_utama = (visiteDpjpUtama / totalVisite) * dpjp_ranap;
        const remun_konsul_anastesi =
          (visiteKonsul1.length / totalVisite) * dpjp_ranap;
        const remun_konsul_2 =
          (visiteKonsul2.length / totalVisite) * dpjp_ranap;
        const remun_konsul_3 =
          (visiteKonsul3.length / totalVisite) * dpjp_ranap;
        const remun_operator = row.has_operasi ? alokasi * 0.7 * 0.7 : 0;
        const remun_anestesi = row.has_operasi ? alokasi * 0.7 * 0.3 : 0;

        // Calculate total yang terbagi and percentage dari klaim
        const yang_terbagi =
          remun_dpjp_utama +
          remun_konsul_anastesi +
          remun_konsul_2 +
          remun_konsul_3 +
          remun_dokter_umum +
          remun_operator +
          remun_anestesi +
          remun_lab +
          remun_rad;
        const percent_dari_klaim =
          tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

        // Create calculation result in the format expected by the summary
        const calculation = {
          alokasi,
          laboratorium: remun_lab,
          radiologi: remun_rad,
          dpjp_utama: remun_dpjp_utama,
          konsul: remun_konsul_anastesi + remun_konsul_2 + remun_konsul_3,
          yang_terbagi,
          percent_dari_klaim,
        };

        const dpjpKey = row.kd_dokter || "Unknown";
        const dpjpName = row.nm_dokter || "Unknown";

        if (dpjpMap.has(dpjpKey)) {
          dpjpMap.get(dpjpKey)!.total += calculation.dpjp_utama;
        } else {
          dpjpMap.set(dpjpKey, {
            name: dpjpName,
            total: calculation.dpjp_utama,
          });
        }

        if (calculation.konsul > 0) {
          // Parse jns_perawatan to get konsul doctors
          const jnsPerawatanData = JSON.parse(
            row.jns_perawatan || "[]"
          ) as Array<{
            kd_jenis_prw: string;
            nm_perawatan: string;
            kd_dokter: string;
            nm_dokter: string;
            is_konsul?: boolean;
          }>;

          // Filter konsul treatments and get unique konsul doctors
          const konsulDoctors = jnsPerawatanData
            .filter(
              (item) => item && item.is_konsul && item.nm_dokter !== dpjpName
            )
            .map((item) => ({
              kd_dokter: item.kd_dokter,
              nm_dokter: item.nm_dokter,
            }));

          if (konsulDoctors.length > 0) {
            const konsulDoctor = konsulDoctors[0];
            const konsulKey = konsulDoctor.kd_dokter;
            const konsulName = konsulDoctor.nm_dokter;

            if (konsulMap.has(konsulKey)) {
              konsulMap.get(konsulKey)!.total += calculation.konsul;
            } else {
              konsulMap.set(konsulKey, {
                name: konsulName,
                total: calculation.konsul,
              });
            }
          }
        }

        labTotal += calculation.laboratorium;
        radTotal += calculation.radiologi;
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

  downloadCsv: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        filename: z.string().min(1, "CSV filename is required for download"),
        kd_dokter: z.string().optional(),
        kd_bangsal: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      if (!input.filename) {
        return "";
      }

      const csvData = await readCsvFile(input.filename);

      if (csvData.length === 0) {
        return "";
      }

      const filterConditions = buildRawatInapFilterConditions({
        ...input,
        csvSepNumbers: csvData.map((item) => item.no_sep),
      });

      const baseQuery = createRawatInapQuery(and(filterConditions.where));
      const csvTarifMap = createCsvTarifMap(csvData);

      const allResults = await baseQuery;

      const csvSepSet = new Set(csvData.map((item) => item.no_sep));

      const filteredResults = allResults.filter((row) =>
        csvSepSet.has(row.no_sep || "")
      );

      const processedResult = filteredResults.map((row) => {
        const tarif = csvTarifMap.get(row.no_sep || "") || 0;

        // Use rawat-inap specific calculation logic
        const jnsPerawatanArray = JSON.parse(row.jns_perawatan || "[]");
        const mainDoctor = row.nm_dokter;
        const emergencyCount = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan?.nm_dokter === mainDoctor &&
            perawatan.nm_perawatan.toLowerCase().includes("emergency")
        ).length;

        const visiteDpjpUtama =
          (row.tgl_masuk && row.tgl_keluar
            ? Math.max(differenceInDays(row.tgl_keluar, row.tgl_masuk), 1)
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

        const remun_lab = (row.total_permintaan_lab || 0) * 5000;
        const remun_rad = (row.total_permintaan_radiologi || 0) * 15000;
        const remun_dokter_umum = (visiteDokterUmum.length || 0) * 20000;
        const totalVisite =
          visiteDpjpUtama +
          visiteKonsul1.length +
          visiteKonsul2.length +
          visiteKonsul3.length +
          visiteDokterUmum.length;
        const alokasi = tarif * 0.2 - remun_lab - remun_rad;
        const dpjp_ranap = alokasi * 0.3 - remun_dokter_umum;
        const remun_dpjp_utama = (visiteDpjpUtama / totalVisite) * dpjp_ranap;
        const remun_konsul_anastesi =
          (visiteKonsul1.length / totalVisite) * dpjp_ranap;
        const remun_konsul_2 =
          (visiteKonsul2.length / totalVisite) * dpjp_ranap;
        const remun_konsul_3 =
          (visiteKonsul3.length / totalVisite) * dpjp_ranap;
        const remun_operator = row.has_operasi ? alokasi * 0.7 * 0.7 : 0;
        const remun_anestesi = row.has_operasi ? alokasi * 0.7 * 0.3 : 0;

        // Calculate total yang terbagi and percentage dari klaim
        const yang_terbagi =
          remun_dpjp_utama +
          remun_konsul_anastesi +
          remun_konsul_2 +
          remun_konsul_3 +
          remun_dokter_umum +
          remun_operator +
          remun_anestesi +
          remun_lab +
          remun_rad;
        const percent_dari_klaim =
          tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

        // Create calculation result in the format expected by the CSV
        const calculation = {
          alokasi,
          laboratorium: remun_lab,
          radiologi: remun_rad,
          dpjp_utama: remun_dpjp_utama,
          konsul: remun_konsul_anastesi + remun_konsul_2 + remun_konsul_3,
          yang_terbagi,
          percent_dari_klaim,
        };

        return {
          ...row,
          jns_perawatan: (
            JSON.parse(row.jns_perawatan || "[]") as {
              kd_jenis_prw: string;
              nm_perawatan: string;
            }[]
          ).filter((item) => item !== null),
          jns_perawatan_radiologi: (
            JSON.parse(row.jns_perawatan_radiologi || "[]") as {
              kd_jenis_prw: string;
              nm_perawatan: string;
              noorder: string;
            }[]
          ).filter((item) => item !== null),
          tarif_from_csv: csvTarifMap.get(row.no_sep || "") || undefined,
          ...calculation,
        };
      });

      // Calculate totals using the original row data before processing
      const totals = filteredResults.reduce((acc, row) => {
        const tarif = csvTarifMap.get(row.no_sep || "") || 0;

        // Use rawat-inap specific calculation logic
        const jnsPerawatanArray = JSON.parse(row.jns_perawatan || "[]");
        const mainDoctor = row.nm_dokter;
        const emergencyCount = jnsPerawatanArray.filter(
          (perawatan: any) =>
            perawatan?.nm_dokter === mainDoctor &&
            perawatan.nm_perawatan.toLowerCase().includes("emergency")
        ).length;

        const visiteDpjpUtama =
          (row.tgl_masuk && row.tgl_keluar
            ? Math.max(differenceInDays(row.tgl_keluar, row.tgl_masuk), 1)
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

        const remun_lab = (row.total_permintaan_lab || 0) * 5000;
        const remun_rad = (row.total_permintaan_radiologi || 0) * 15000;
        const remun_dokter_umum = (visiteDokterUmum.length || 0) * 20000;
        const totalVisite =
          visiteDpjpUtama +
          visiteKonsul1.length +
          visiteKonsul2.length +
          visiteKonsul3.length +
          visiteDokterUmum.length;
        const alokasi = tarif * 0.2 - remun_lab - remun_rad;
        const dpjp_ranap = alokasi * 0.3 - remun_dokter_umum;
        const remun_dpjp_utama = (visiteDpjpUtama / totalVisite) * dpjp_ranap;
        const remun_konsul_anastesi =
          (visiteKonsul1.length / totalVisite) * dpjp_ranap;
        const remun_konsul_2 =
          (visiteKonsul2.length / totalVisite) * dpjp_ranap;
        const remun_konsul_3 =
          (visiteKonsul3.length / totalVisite) * dpjp_ranap;
        const remun_operator = row.has_operasi ? alokasi * 0.7 * 0.7 : 0;
        const remun_anestesi = row.has_operasi ? alokasi * 0.7 * 0.3 : 0;

        // Calculate total yang terbagi and percentage dari klaim
        const yang_terbagi =
          remun_dpjp_utama +
          remun_konsul_anastesi +
          remun_konsul_2 +
          remun_konsul_3 +
          remun_dokter_umum +
          remun_operator +
          remun_anestesi +
          remun_lab +
          remun_rad;
        const percent_dari_klaim =
          tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

        // Create calculation result in the format expected by accumulateTotals
        const calculation = {
          alokasi,
          laboratorium: remun_lab,
          radiologi: remun_rad,
          dpjp_utama: remun_dpjp_utama,
          konsul: remun_konsul_anastesi + remun_konsul_2 + remun_konsul_3,
          usgCount: 0, // Not used in rawat-inap
          nonUsgCount: 0, // Not used in rawat-inap
          yang_terbagi,
          percent_dari_klaim,
        };

        return accumulateTotals(acc, tarif, calculation);
      }, createEmptyTotals());

      // Create totals row
      const totalsRow = {
        tgl_masuk: "",
        no_rekam_medis: "",
        nm_pasien: "TOTAL",
        no_sep: "",
        tarif_from_csv: Math.round(totals.totalTarif),
        kamar: "",
        nm_dokter: "",
        total_permintaan_lab: "",
        total_permintaan_radiologi: "",
        alokasi: Math.round(totals.totalAlokasi),
        dpjp_utama: Math.round(totals.totalDpjpUtama),
        konsul: Math.round(totals.totalKonsul),
        laboratorium: Math.round(totals.totalLaboratorium),
        radiologi: Math.round(totals.totalRadiologi),
        yang_terbagi: Math.round(totals.totalYangTerbagi),
        percent_dari_klaim:
          totals.count > 0
            ? Math.round(totals.totalPercentDariKlaim / totals.count)
            : 0,
      };

      // Add totals row to the data
      const dataWithTotals = [...processedResult, totalsRow];

      return convertToCsv(dataWithTotals, {
        fields: [
          "tgl_masuk",
          "no_rekam_medis",
          "nm_pasien",
          "no_sep",
          "tarif_from_csv",
          "kamar",
          "nm_dokter",
          "total_permintaan_lab",
          "total_permintaan_radiologi",
          "alokasi",
          "dpjp_utama",
          "konsul",
          "laboratorium",
          "radiologi",
          "yang_terbagi",
          "percent_dari_klaim",
        ],
        fieldLabels: {
          tgl_masuk: "Tanggal Masuk",
          no_rekam_medis: "No RM",
          nm_pasien: "Nama Pasien",
          no_sep: "No SEP",
          tarif_from_csv: "Total Tarif",
          kamar: "Kamar",
          nm_dokter: "DPJP",
          total_permintaan_lab: "Lab",
          total_permintaan_radiologi: "Radiologi",
          alokasi: "Alokasi",
          dpjp_utama: "DPJP Utama",
          konsul: "Konsul",
          laboratorium: "Laboratorium",
          radiologi: "Radiologi",
          yang_terbagi: "Yang Terbagi",
          percent_dari_klaim: "Persentase Dari Klaim",
        },
      });
    }),
});
