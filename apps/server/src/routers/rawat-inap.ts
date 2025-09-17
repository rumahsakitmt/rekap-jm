import { publicProcedure, router } from "@/lib/trpc";
import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap-filter-utils";
import {
  createRawatInapQuery,
  createRawatInapSummaryQuery,
  getRadiologiData,
  getLabData,
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
  accumulateTotals,
  createEmptyTotals,
  calculateRawatInapFinancials,
  extractRawatInapVisiteData,
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
  selectedSupport: z.string().optional(),
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
        const noRawatList = allResults
          .map((item) => item.no_rawat)
          .filter((id): id is string => id !== null);
        const [radiologiData, labData] = await Promise.all([
          getRadiologiData(noRawatList),
          getLabData(noRawatList),
        ]);

        const radiologiMap = new Map<string, any[]>();
        const labMap = new Map<string, any[]>();

        radiologiData.forEach((item) => {
          if (item.no_rawat && !radiologiMap.has(item.no_rawat)) {
            radiologiMap.set(item.no_rawat, []);
          }
          if (item.no_rawat) {
            radiologiMap.get(item.no_rawat)!.push(item);
          }
        });

        labData.forEach((item) => {
          if (item.no_rawat && !labMap.has(item.no_rawat)) {
            labMap.set(item.no_rawat, []);
          }
          if (item.no_rawat) {
            labMap.get(item.no_rawat)!.push(item);
          }
        });

        totals = allResults.reduce((acc, row) => {
          const tarif = csvTarifMap.get(row.no_sep || "") || 0;
          const jnsPerawatanRadiologiArray =
            radiologiMap.get(row.no_rawat) || [];
          const calculation = calculateRawatInapFinancials({
            tarif,
            total_permintaan_lab: row.total_permintaan_lab || 0,
            total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
            jns_perawatan: row.jns_perawatan || "[]",
            jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
            nm_dokter: row.nm_dokter || "",
            tgl_masuk: row.tgl_masuk,
            tgl_keluar: row.tgl_keluar,
            has_operasi: row.has_operasi || false,
            selectedSupport: input?.selectedSupport || undefined,
          });
          return accumulateTotals(acc, tarif, calculation);
        }, createEmptyTotals());
      }

      const rawatInap = await baseQuery.offset(offset).limit(limit);

      const noRawatList = rawatInap
        .map((item) => item.no_rawat)
        .filter((id): id is string => id !== null);
      const [radiologiData, labData] = await Promise.all([
        getRadiologiData(noRawatList),
        getLabData(noRawatList),
      ]);

      const radiologiMap = new Map<string, any[]>();
      const labMap = new Map<string, any[]>();

      radiologiData.forEach((item) => {
        if (item.no_rawat && !radiologiMap.has(item.no_rawat)) {
          radiologiMap.set(item.no_rawat, []);
        }
        if (item.no_rawat) {
          radiologiMap.get(item.no_rawat)!.push(item);
        }
      });

      labData.forEach((item) => {
        if (item.no_rawat && !labMap.has(item.no_rawat)) {
          labMap.set(item.no_rawat, []);
        }
        if (item.no_rawat) {
          labMap.get(item.no_rawat)!.push(item);
        }
      });

      const rawatInapWithArray = rawatInap.map((item) => {
        const jnsPerawatanArray = JSON.parse(item.jns_perawatan || "[]");
        const jnsPerawatanRadiologiArray: {
          kd_jenis_prw: string;
          nm_perawatan: string;
          nm_dokter: string;
          noorder: string;
        }[] = radiologiMap.get(item.no_rawat) || [];
        const jnsPerawatanLabArray = labMap.get(item.no_rawat) || [];
        const tarif = csvTarifMap.get(item.no_sep || "") || 0;

        const visiteData = extractRawatInapVisiteData(
          item.jns_perawatan || "[]",
          item.nm_dokter || "",
          item.tgl_masuk,
          item.tgl_keluar,
          input?.selectedSupport || undefined
        );

        const calculation = calculateRawatInapFinancials({
          tarif,
          total_permintaan_lab: item.total_permintaan_lab || 0,
          total_permintaan_radiologi: item.total_permintaan_radiologi || 0,
          jns_perawatan: item.jns_perawatan || "[]",
          jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
          nm_dokter: item.nm_dokter || "",
          tgl_masuk: item.tgl_masuk,
          tgl_keluar: item.tgl_keluar,
          has_operasi: item.has_operasi || false,
          selectedSupport: input?.selectedSupport || undefined,
        });

        return {
          ...item,
          visite_dpjp_utama: visiteData.visiteDpjpUtama,
          visite_konsul_1: visiteData.finalVisiteKonsul1,
          visite_konsul_2: visiteData.finalVisiteKonsul2,
          visite_konsul_3: visiteData.finalVisiteKonsul3,
          visite_dokter_umum: visiteData.visiteDokterUmum,
          jns_perawatan: jnsPerawatanArray,
          jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
          jns_perawatan_lab: jnsPerawatanLabArray,
          hari_rawat:
            item.tgl_masuk && item.tgl_keluar
              ? differenceInDays(item.tgl_keluar, item.tgl_masuk)
              : 1,
          tarif_from_csv: csvTarifMap.get(item.no_sep || "") || undefined,
          totalVisite: visiteData.totalVisite,
          ...calculation,
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

  getDetailedMonthlyReport: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        filename: z.string().optional(),
        kd_dokter: z.string().optional(),
        kd_bangsal: z.string().optional(),
        selectedSupport: z.string().optional(),
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

      const noRawatList = results
        .map((item) => item.no_rawat)
        .filter((id): id is string => id !== null);
      const [radiologiData, labData] = await Promise.all([
        getRadiologiData(noRawatList),
        getLabData(noRawatList),
      ]);

      const radiologiMap = new Map<string, any[]>();
      const labMap = new Map<string, any[]>();

      radiologiData.forEach((item) => {
        if (item.no_rawat && !radiologiMap.has(item.no_rawat)) {
          radiologiMap.set(item.no_rawat, []);
        }
        if (item.no_rawat) {
          radiologiMap.get(item.no_rawat)!.push(item);
        }
      });

      labData.forEach((item) => {
        if (item.no_rawat && !labMap.has(item.no_rawat)) {
          labMap.set(item.no_rawat, []);
        }
        if (item.no_rawat) {
          labMap.get(item.no_rawat)!.push(item);
        }
      });

      const dpjpMap = new Map<string, { name: string; total: number }>();
      const konsulAnastesiMap = new Map<
        string,
        { name: string; total: number }
      >();
      const konsulMap = new Map<
        string,
        {
          name: string;
          konsul1: number;
          konsul2: number;
          konsul3: number;
          total: number;
        }
      >();
      const dokterUmumMap = new Map<string, { name: string; total: number }>();
      const operatorMap = new Map<string, { name: string; total: number }>();
      const anestesiMap = new Map<string, { name: string; total: number }>();
      const penunjangMap = new Map<string, { name: string; total: number }>();

      let labTotal = 0;
      let radTotal = 0;
      let grandTotal = 0;

      for (const row of results) {
        const tarif = csvTarifMap.get(row.no_sep || "") || 0;

        const visiteData = extractRawatInapVisiteData(
          row.jns_perawatan || "[]",
          row.nm_dokter || "",
          row.tgl_masuk,
          row.tgl_keluar,
          input?.selectedSupport || undefined
        );

        const {
          remun_dpjp_utama,
          remun_konsul_anastesi,
          remun_konsul_2,
          remun_konsul_3,
          remun_dokter_umum,
          remun_operator,
          remun_anestesi,
          remun_lab,
          remun_rad,
        } = calculateRawatInapFinancials({
          tarif,
          total_permintaan_lab: row.total_permintaan_lab || 0,
          total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
          jns_perawatan: row.jns_perawatan || "[]",
          jns_perawatan_radiologi: radiologiMap.get(row.no_rawat) || [],
          nm_dokter: row.nm_dokter || "",
          tgl_masuk: row.tgl_masuk,
          tgl_keluar: row.tgl_keluar,
          has_operasi: row.has_operasi || false,
          selectedSupport: input?.selectedSupport || undefined,
        });

        // DPJP Utama
        const dpjpKey = row.kd_dokter || "Unknown";
        const dpjpName = row.nm_dokter || "Unknown";
        if (dpjpMap.has(dpjpKey)) {
          dpjpMap.get(dpjpKey)!.total += remun_dpjp_utama;
        } else {
          dpjpMap.set(dpjpKey, {
            name: dpjpName,
            total: remun_dpjp_utama,
          });
        }

        // Konsul Dokter Anestesi
        if (remun_konsul_anastesi > 0) {
          const anastesiDoctors = visiteData.finalVisiteKonsul1.map(
            (k: any) => ({
              kd_dokter: k.kd_dokter,
              nm_dokter: k.nm_dokter,
            })
          );

          for (const doctor of anastesiDoctors) {
            const konsulKey = doctor.kd_dokter;
            const konsulName = doctor.nm_dokter;

            if (konsulAnastesiMap.has(konsulKey)) {
              const existing = konsulAnastesiMap.get(konsulKey)!;
              existing.total += remun_konsul_anastesi;
            } else {
              konsulAnastesiMap.set(konsulKey, {
                name: konsulName,
                total: remun_konsul_anastesi,
              });
            }
          }
        }

        if (remun_konsul_2 > 0) {
          const konsul2Doctors = visiteData.finalVisiteKonsul2.map(
            (k: any) => ({
              kd_dokter: k.kd_dokter,
              nm_dokter: k.nm_dokter,
            })
          );

          for (const doctor of konsul2Doctors) {
            const konsulKey = doctor.kd_dokter;
            const konsulName = doctor.nm_dokter;

            if (konsulMap.has(konsulKey)) {
              const existing = konsulMap.get(konsulKey)!;
              existing.konsul2 += remun_konsul_2 / konsul2Doctors.length;
              existing.total += remun_konsul_2 / konsul2Doctors.length;
            } else {
              konsulMap.set(konsulKey, {
                name: konsulName,
                konsul1: 0,
                konsul2: remun_konsul_2 / konsul2Doctors.length,
                konsul3: 0,
                total: remun_konsul_2 / konsul2Doctors.length,
              });
            }
          }
        }

        if (remun_konsul_3 > 0) {
          const konsul3Doctors = visiteData.finalVisiteKonsul3.map(
            (k: any) => ({
              kd_dokter: k.kd_dokter,
              nm_dokter: k.nm_dokter,
            })
          );

          for (const doctor of konsul3Doctors) {
            const konsulKey = doctor.kd_dokter;
            const konsulName = doctor.nm_dokter;

            if (konsulMap.has(konsulKey)) {
              const existing = konsulMap.get(konsulKey)!;
              existing.konsul3 += remun_konsul_3 / konsul3Doctors.length;
              existing.total += remun_konsul_3 / konsul3Doctors.length;
            } else {
              konsulMap.set(konsulKey, {
                name: konsulName,
                konsul1: 0,
                konsul2: 0,
                konsul3: remun_konsul_3 / konsul3Doctors.length,
                total: remun_konsul_3 / konsul3Doctors.length,
              });
            }
          }
        }

        // Dokter Umum
        if (remun_dokter_umum > 0) {
          const umumDoctors = visiteData.visiteDokterUmum.map((k: any) => ({
            kd_dokter: k.kd_dokter,
            nm_dokter: k.nm_dokter,
          }));

          for (const doctor of umumDoctors) {
            const umumKey = doctor.kd_dokter;
            const umumName = doctor.nm_dokter;

            if (dokterUmumMap.has(umumKey)) {
              dokterUmumMap.get(umumKey)!.total +=
                remun_dokter_umum / umumDoctors.length;
            } else {
              dokterUmumMap.set(umumKey, {
                name: umumName,
                total: remun_dokter_umum / umumDoctors.length,
              });
            }
          }
        }

        // Operator
        if (remun_operator > 0 && row.operator) {
          const operatorKey = row.operator; // Use the actual operator from the query
          const operatorName = row.operator;

          if (operatorMap.has(operatorKey)) {
            operatorMap.get(operatorKey)!.total += remun_operator;
          } else {
            operatorMap.set(operatorKey, {
              name: operatorName,
              total: remun_operator,
            });
          }
        }

        // Anestesi
        if (remun_anestesi > 0 && row.anestesi) {
          const anestesiKey = row.anestesi;
          const anestesiName = row.anestesi;

          if (anestesiMap.has(anestesiKey)) {
            anestesiMap.get(anestesiKey)!.total += remun_anestesi;
          } else {
            anestesiMap.set(anestesiKey, {
              name: anestesiName,
              total: remun_anestesi,
            });
          }
        }

        // Dokter Penunjang (from radiologi and lab data)
        const penunjangDoctors: { kd_dokter: string; nm_dokter: string }[] = [];

        // Get doctors from radiologi data
        const radiologiRecords = radiologiMap.get(row.no_rawat) || [];
        radiologiRecords.forEach((rad: any) => {
          if (rad.kd_dokter && rad.nm_dokter) {
            penunjangDoctors.push({
              kd_dokter: rad.kd_dokter,
              nm_dokter: rad.nm_dokter,
            });
          }
        });

        // Get doctors from lab data
        const labRecords = labMap.get(row.no_rawat) || [];
        labRecords.forEach((lab: any) => {
          if (lab.kd_dokter && lab.nm_dokter) {
            penunjangDoctors.push({
              kd_dokter: lab.kd_dokter,
              nm_dokter: lab.nm_dokter,
            });
          }
        });

        // Remove duplicates based on kd_dokter
        const uniquePenunjangDoctors = penunjangDoctors.filter(
          (doctor, index, self) =>
            index === self.findIndex((d) => d.kd_dokter === doctor.kd_dokter)
        );

        // Distribute penunjang remuneration (lab + radiologi)
        const penunjangRemun = remun_lab + remun_rad;
        if (penunjangRemun > 0 && uniquePenunjangDoctors.length > 0) {
          for (const doctor of uniquePenunjangDoctors) {
            const penunjangKey = doctor.kd_dokter;
            const penunjangName = doctor.nm_dokter;

            if (penunjangMap.has(penunjangKey)) {
              penunjangMap.get(penunjangKey)!.total +=
                penunjangRemun / uniquePenunjangDoctors.length;
            } else {
              penunjangMap.set(penunjangKey, {
                name: penunjangName,
                total: penunjangRemun / uniquePenunjangDoctors.length,
              });
            }
          }
        }

        labTotal += remun_lab;
        radTotal += remun_rad;
        grandTotal +=
          remun_dpjp_utama +
          remun_konsul_anastesi +
          remun_konsul_2 +
          remun_konsul_3 +
          remun_dokter_umum +
          remun_operator +
          remun_anestesi +
          remun_lab +
          remun_rad;
      }

      // Convert maps to sorted arrays
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
          konsul1: Math.round(item.konsul1),
          konsul2: Math.round(item.konsul2),
          konsul3: Math.round(item.konsul3),
          total: Math.round(item.total),
        }));

      const konsulAnastesiTotals = Array.from(konsulAnastesiMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      const dokterUmumTotals = Array.from(dokterUmumMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      const operatorTotals = Array.from(operatorMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      const anestesiTotals = Array.from(anestesiMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      const penunjangTotals = Array.from(penunjangMap.values())
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          name: item.name,
          total: Math.round(item.total),
        }));

      // Create rekap bulanan (monthly summary)
      const rekapBulanan = new Map<string, number>();

      // Add DPJP
      for (const dpjp of dpjpTotals) {
        rekapBulanan.set(
          dpjp.name,
          (rekapBulanan.get(dpjp.name) || 0) + dpjp.total
        );
      }

      // Add Konsul
      for (const konsul of konsulTotals) {
        rekapBulanan.set(
          konsul.name,
          (rekapBulanan.get(konsul.name) || 0) + konsul.total
        );
      }

      // Add Dokter Umum
      for (const umum of dokterUmumTotals) {
        rekapBulanan.set(
          umum.name,
          (rekapBulanan.get(umum.name) || 0) + umum.total
        );
      }

      // Add Anestesi
      for (const anestesi of konsulAnastesiTotals) {
        rekapBulanan.set(
          anestesi.name,
          (rekapBulanan.get(anestesi.name) || 0) + anestesi.total
        );
      }

      // Add Operator Operasi
      for (const operator of operatorTotals) {
        rekapBulanan.set(
          operator.name,
          (rekapBulanan.get(operator.name) || 0) + operator.total
        );
      }

      // Add Anestesi Operasi
      for (const anestesi of anestesiTotals) {
        rekapBulanan.set(
          anestesi.name,
          (rekapBulanan.get(anestesi.name) || 0) + anestesi.total
        );
      }

      // Add Penunjang
      for (const penunjang of penunjangTotals) {
        rekapBulanan.set(
          penunjang.name,
          (rekapBulanan.get(penunjang.name) || 0) + penunjang.total
        );
      }

      const rekapBulananTotals = Array.from(rekapBulanan.entries())
        .map(([name, total]) => ({ name, total: Math.round(total) }))
        .sort((a, b) => b.total - a.total);

      return {
        dpjp: dpjpTotals,
        dpjpTotal: dpjpTotals.reduce((sum, item) => sum + item.total, 0),
        konsulAnastesi: konsulAnastesiTotals,
        konsulAnastesiTotal: konsulAnastesiTotals.reduce(
          (sum, item) => sum + item.total,
          0
        ),
        konsul: konsulTotals,
        konsulTotal: konsulTotals.reduce((sum, item) => sum + item.total, 0),
        dokterUmum: dokterUmumTotals,
        dokterUmumTotal: dokterUmumTotals.reduce(
          (sum, item) => sum + item.total,
          0
        ),
        operator: operatorTotals,
        operatorTotal: operatorTotals.reduce(
          (sum, item) => sum + item.total,
          0
        ),
        anestesi: anestesiTotals,
        anestesiTotal: anestesiTotals.reduce(
          (sum, item) => sum + item.total,
          0
        ),
        penunjang: penunjangTotals,
        penunjangTotal: penunjangTotals.reduce(
          (sum, item) => sum + item.total,
          0
        ),
        labTotal: Math.round(labTotal),
        radTotal: Math.round(radTotal),
        rekapBulanan: rekapBulananTotals,
        grandTotal: Math.round(grandTotal),
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
        selectedSupport: z.string().optional(),
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

      const filteredResults = await baseQuery;

      // Get radiologi and lab data for filtered results
      const filteredNoRawatList = filteredResults
        .map((item) => item.no_rawat)
        .filter((id): id is string => id !== null);
      const [filteredRadiologiData, filteredLabData] = await Promise.all([
        getRadiologiData(filteredNoRawatList),
        getLabData(filteredNoRawatList),
      ]);

      // Create maps for quick lookup
      const filteredRadiologiMap = new Map<string, any[]>();
      const filteredLabMap = new Map<string, any[]>();

      filteredRadiologiData.forEach((item) => {
        if (item.no_rawat) {
          if (!filteredRadiologiMap.has(item.no_rawat)) {
            filteredRadiologiMap.set(item.no_rawat, []);
          }
          filteredRadiologiMap.get(item.no_rawat)!.push(item);
        }
      });

      filteredLabData.forEach((item) => {
        if (item.no_rawat) {
          if (!filteredLabMap.has(item.no_rawat)) {
            filteredLabMap.set(item.no_rawat, []);
          }
          filteredLabMap.get(item.no_rawat)!.push(item);
        }
      });

      const processedResult = filteredResults.map((row) => {
        const tarif = csvTarifMap.get(row.no_sep || "") || 0;
        const jnsPerawatanRadiologiArray =
          filteredRadiologiMap.get(row.no_rawat) || [];
        const calculation = calculateRawatInapFinancials({
          tarif,
          total_permintaan_lab: row.total_permintaan_lab || 0,
          total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
          jns_perawatan: row.jns_perawatan || "[]",
          jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
          nm_dokter: row.nm_dokter || "",
          tgl_masuk: row.tgl_masuk,
          tgl_keluar: row.tgl_keluar,
          has_operasi: row.has_operasi || false,
          selectedSupport: input?.selectedSupport || undefined,
        });

        // Create calculation result in the format expected by the CSV
        const csvCalculation = {
          alokasi: calculation.alokasi,
          laboratorium: calculation.remun_lab,
          radiologi: calculation.remun_rad,
          dpjp_utama: calculation.remun_dpjp_utama,
          konsul:
            calculation.remun_konsul_anastesi +
            calculation.remun_konsul_2 +
            calculation.remun_konsul_3,
          yang_terbagi: calculation.yang_terbagi,
          percent_dari_klaim: calculation.percent_dari_klaim,
        };

        return {
          ...row,
          jns_perawatan: (
            JSON.parse(row.jns_perawatan || "[]") as {
              kd_jenis_prw: string;
              nm_perawatan: string;
            }[]
          ).filter((item) => item !== null),
          jns_perawatan_radiologi:
            filteredRadiologiMap.get(row.no_rawat || "") || [],
          jns_perawatan_lab: filteredLabMap.get(row.no_rawat || "") || [],
          tarif_from_csv: csvTarifMap.get(row.no_sep || "") || undefined,
          ...csvCalculation,
        };
      });

      // Calculate totals using the filtered results
      const totals = filteredResults.reduce((acc, row) => {
        const tarif = csvTarifMap.get(row.no_sep || "") || 0;
        const jnsPerawatanRadiologiArray =
          filteredRadiologiMap.get(row.no_rawat) || [];
        const calculation = calculateRawatInapFinancials({
          tarif,
          total_permintaan_lab: row.total_permintaan_lab || 0,
          total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
          jns_perawatan: row.jns_perawatan || "[]",
          jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
          nm_dokter: row.nm_dokter || "",
          tgl_masuk: row.tgl_masuk,
          tgl_keluar: row.tgl_keluar,
          has_operasi: row.has_operasi || false,
          selectedSupport: input?.selectedSupport || undefined,
        });
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
        dpjp_ranap: Math.round(totals.totalDpjpRanap),
        remun_dpjp_utama: Math.round(totals.totalRemunDpjp),
        remun_konsul_anastesi: Math.round(totals.totalRemunKonsulAnestesi),
        remun_konsul_2: Math.round(totals.totalRemunKonsul2),
        remun_konsul_3: 0, // Not tracked separately in totals
        remun_dokter_umum: Math.round(totals.totalRemunDokterUmum),
        remun_lab: Math.round(totals.totalRemunLab),
        remun_rad: Math.round(totals.totalRemunRadiologi),
        remun_operator: Math.round(totals.totalRemunOperator),
        remun_anestesi: Math.round(totals.totalRemunAnestesi),
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
