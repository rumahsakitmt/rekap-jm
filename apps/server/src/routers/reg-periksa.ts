import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { reg_periksa } from "../db/schema/reg_periksa";
import { rawat_jl_drpr } from "../db/schema/rawat_jl_drpr";
import { bridging_sep } from "../db/schema/bridging_sep";
import { permintaan_radiologi } from "../db/schema/permintaan_radiologi";
import { permintaan_lab } from "../db/schema/permintaan_lab";
import { sql, and, gte, lte, asc, eq, inArray } from "drizzle-orm";
import { dokter } from "@/db/schema/dokter";
import { jns_perawatan } from "@/db/schema/jns_perawatan";
import { pasien } from "@/db/schema/pasien";
import { poliklinik } from "@/db/schema/poliklinik";
import { z } from "zod";
import { jns_perawatan_radiologi } from "@/db/schema/jns_perawatan_radiologi";
import { permintaan_pemeriksaan_radiologi } from "@/db/schema/permintaan_pemeriksaan_radiologi";

export const regPeriksaRouter = router({
  getRegPeriksa: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        noSepList: z.array(z.string()).optional(),
        includeTotals: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          sql`(${reg_periksa.no_rawat} LIKE ${`%${input.search}%`} OR ${bridging_sep.no_sep} LIKE ${`%${input.search}%`} OR ${reg_periksa.no_rkm_medis} LIKE ${`%${input.search}%`})`
        );
      }

      if (input.dateFrom) {
        conditions.push(gte(reg_periksa.tgl_registrasi, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(reg_periksa.tgl_registrasi, input.dateTo));
      }

      if (input.noSepList && input.noSepList.length > 0) {
        conditions.push(inArray(bridging_sep.no_sep, input.noSepList));
      }

      const baseQuery = db
        .select({
          no_rawat: reg_periksa.no_rawat,
          no_rekam_medis: reg_periksa.no_rkm_medis,
          jns_perawatan: sql<string>`JSON_ARRAYAGG(
          CASE 
            WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' 
            AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%'
            AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%'
            AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%'
            AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%'
            THEN JSON_OBJECT(
              'kd_jenis_prw', ${jns_perawatan.kd_jenis_prw},
              'nm_perawatan', ${jns_perawatan.nm_perawatan}
            )
            ELSE NULL
          END
        )`,
          jns_perawatan_radiologi: sql<string>`(
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'kd_jenis_prw', jpr.kd_jenis_prw,
                'nm_perawatan', jpr.nm_perawatan,
                'noorder', pr.noorder
              )
            )
            FROM ${permintaan_radiologi} pr
            JOIN ${permintaan_pemeriksaan_radiologi} ppr ON pr.noorder = ppr.noorder
            JOIN ${jns_perawatan_radiologi} jpr ON ppr.kd_jenis_prw = jpr.kd_jenis_prw
            WHERE pr.no_rawat = ${reg_periksa.no_rawat}
          )`,
          konsul_count: sql<number>`SUM(CASE WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%' THEN 1 ELSE 0 END)`,
          kd_dokter: reg_periksa.kd_dokter,
          nip: rawat_jl_drpr.nip,
          tgl_perawatan: reg_periksa.tgl_registrasi,
          jam_rawat: reg_periksa.jam_reg,
          material: sql<number>`SUM(${rawat_jl_drpr.material})`,
          bhp: sql<number>`SUM(${rawat_jl_drpr.bhp})`,
          tarif_tindakandr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakandr})`,
          tarif_tindakanpr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakanpr})`,
          kso: sql<number>`SUM(${rawat_jl_drpr.kso})`,
          menejemen: sql<number>`SUM(${rawat_jl_drpr.menejemen})`,
          biaya_rawat: sql<number>`SUM(${rawat_jl_drpr.biaya_rawat})`,
          stts_bayar: reg_periksa.status_bayar,
          no_sep: bridging_sep.no_sep,
          total_permintaan_radiologi: sql<number>`(
          SELECT COUNT(*) 
          FROM ${permintaan_radiologi} 
          WHERE ${permintaan_radiologi.no_rawat} = ${reg_periksa.no_rawat}
        )`,
          total_permintaan_lab: sql<number>`(
          SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
          FROM ${permintaan_lab} 
          WHERE ${permintaan_lab.no_rawat} = ${reg_periksa.no_rawat}
        )`,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
          no_rkm_medis: pasien.no_rkm_medis,
          jk: pasien.jk,
          tgl_lahir: pasien.tgl_lahir,
          alamat: pasien.alamat,
          nm_poli: poliklinik.nm_poli,
        })
        .from(reg_periksa)
        .leftJoin(dokter, eq(reg_periksa.kd_dokter, dokter.kd_dokter))
        .leftJoin(
          rawat_jl_drpr,
          eq(reg_periksa.no_rawat, rawat_jl_drpr.no_rawat)
        )
        .leftJoin(
          jns_perawatan,
          eq(rawat_jl_drpr.kd_jenis_prw, jns_perawatan.kd_jenis_prw)
        )
        .innerJoin(
          bridging_sep,
          eq(reg_periksa.no_rawat, bridging_sep.no_rawat)
        )
        .leftJoin(
          permintaan_radiologi,
          eq(reg_periksa.no_rawat, permintaan_radiologi.no_rawat)
        )
        .leftJoin(
          permintaan_pemeriksaan_radiologi,
          eq(
            permintaan_radiologi.noorder,
            permintaan_pemeriksaan_radiologi.noorder
          )
        )
        .leftJoin(
          jns_perawatan_radiologi,
          eq(
            permintaan_pemeriksaan_radiologi.kd_jenis_prw,
            jns_perawatan_radiologi.kd_jenis_prw
          )
        )
        .leftJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
        .leftJoin(poliklinik, eq(reg_periksa.kd_poli, poliklinik.kd_poli))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(reg_periksa.no_rawat)
        .orderBy(asc(reg_periksa.tgl_registrasi));

      // Calculate totals if requested
      let totals = null;
      if (input.includeTotals) {
        const allResults = await baseQuery;
        totals = allResults.reduce(
          (acc, row) => {
            const tarif = row.biaya_rawat || 0;
            const alokasi = tarif * 0.2;
            const laboratorium = (row.total_permintaan_lab || 0) * 10000;

            const jnsPerawatanRadiologi = JSON.parse(
              row.jns_perawatan_radiologi || "[]"
            ) as {
              kd_jenis_prw: string;
              nm_perawatan: string;
              noorder: string;
            }[];

            const usgCount = jnsPerawatanRadiologi.filter(
              (item) =>
                item.nm_perawatan &&
                item.nm_perawatan.toLowerCase().includes("usg")
            ).length;
            const nonUsgCount =
              (row.total_permintaan_radiologi || 0) - usgCount;

            const radiologi =
              usgCount > 0
                ? Math.max(0, tarif - 185000) + nonUsgCount * 15000
                : (row.total_permintaan_radiologi || 0) * 15000;

            const dpjp_utama = alokasi - laboratorium - radiologi;
            const yang_terbagi = dpjp_utama + radiologi + laboratorium;
            const percent_dari_klaim =
              tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

            return {
              totalTarif: acc.totalTarif + tarif,
              totalAlokasi: acc.totalAlokasi + alokasi,
              totalDpjpUtama: acc.totalDpjpUtama + dpjp_utama,
              totalLaboratorium: acc.totalLaboratorium + laboratorium,
              totalRadiologi: acc.totalRadiologi + radiologi,
              totalYangTerbagi: acc.totalYangTerbagi + yang_terbagi,
              totalPercentDariKlaim:
                acc.totalPercentDariKlaim + percent_dari_klaim,
              count: acc.count + 1,
            };
          },
          {
            totalTarif: 0,
            totalAlokasi: 0,
            totalDpjpUtama: 0,
            totalLaboratorium: 0,
            totalRadiologi: 0,
            totalYangTerbagi: 0,
            totalPercentDariKlaim: 0,
            count: 0,
          }
        );
      }

      // Apply pagination to get the actual results
      const result = await baseQuery
        .offset(input.offset || 0)
        .limit(input.limit || 1000);

      const processedResult = result.map((row) => {
        const tarif = row.biaya_rawat || 0;
        const alokasi = tarif * 0.2;
        const laboratorium = (row.total_permintaan_lab || 0) * 10000;

        const jnsPerawatanRadiologi = JSON.parse(
          row.jns_perawatan_radiologi || "[]"
        ) as {
          kd_jenis_prw: string;
          nm_perawatan: string;
          noorder: string;
        }[];

        const usgCount = jnsPerawatanRadiologi.filter(
          (item) =>
            item.nm_perawatan && item.nm_perawatan.toLowerCase().includes("usg")
        ).length;
        const nonUsgCount = (row.total_permintaan_radiologi || 0) - usgCount;

        const radiologi =
          usgCount > 0
            ? Math.max(0, tarif - 185000) * usgCount + nonUsgCount * 15000
            : (row.total_permintaan_radiologi || 0) * 15000;
        const dpjp_utama = alokasi - laboratorium - radiologi;
        const yang_terbagi = dpjp_utama + radiologi + laboratorium;
        const percent_dari_klaim =
          tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

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
          alokasi,
          laboratorium,
          radiologi,
          dpjp_utama,
          yang_terbagi,
          percent_dari_klaim,
        };
      });

      return {
        data: processedResult,
        totals: totals
          ? {
              ...totals,
              averagePercentDariKlaim:
                totals.count > 0
                  ? Math.round(totals.totalPercentDariKlaim / totals.count)
                  : 0,
            }
          : null,
      };
    }),

  importCsv: publicProcedure
    .input(
      z.object({
        csvData: z
          .array(
            z.object({
              no_sep: z.string(),
              tarif: z.number(),
            })
          )
          .min(1)
          .max(10000),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        limit: z.number().min(1).max(10000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const conditions = [];
      const noSepList = input.csvData.map((item) => item.no_sep);

      conditions.push(inArray(bridging_sep.no_sep, noSepList));

      if (input.dateFrom) {
        conditions.push(gte(reg_periksa.tgl_registrasi, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(reg_periksa.tgl_registrasi, input.dateTo));
      }

      const result = await db
        .select({
          no_rawat: reg_periksa.no_rawat,
          no_rekam_medis: reg_periksa.no_rkm_medis,
          jns_perawatan: sql<string>`JSON_ARRAYAGG(
            CASE 
              WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' 
              AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%'
              AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%'
              AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%'
              AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%'
              THEN JSON_OBJECT(
                'kd_jenis_prw', ${jns_perawatan.kd_jenis_prw},
                'nm_perawatan', ${jns_perawatan.nm_perawatan}
              )
              ELSE NULL
            END
          )`,
          jns_perawatan_radiologi: sql<string>`(
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'kd_jenis_prw', jpr.kd_jenis_prw,
                'nm_perawatan', jpr.nm_perawatan,
                'noorder', pr.noorder
              )
            )
            FROM ${permintaan_radiologi} pr
            JOIN ${permintaan_pemeriksaan_radiologi} ppr ON pr.noorder = ppr.noorder
            JOIN ${jns_perawatan_radiologi} jpr ON ppr.kd_jenis_prw = jpr.kd_jenis_prw
            WHERE pr.no_rawat = ${reg_periksa.no_rawat}
          )`,
          konsul_count: sql<number>`SUM(CASE WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%' THEN 1 ELSE 0 END)`,
          kd_dokter: reg_periksa.kd_dokter,
          nip: rawat_jl_drpr.nip,
          tgl_perawatan: reg_periksa.tgl_registrasi,
          jam_rawat: reg_periksa.jam_reg,
          material: sql<number>`SUM(${rawat_jl_drpr.material})`,
          bhp: sql<number>`SUM(${rawat_jl_drpr.bhp})`,
          tarif_tindakandr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakandr})`,
          tarif_tindakanpr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakanpr})`,
          kso: sql<number>`SUM(${rawat_jl_drpr.kso})`,
          menejemen: sql<number>`SUM(${rawat_jl_drpr.menejemen})`,
          biaya_rawat: sql<number>`SUM(${rawat_jl_drpr.biaya_rawat})`,
          stts_bayar: reg_periksa.status_bayar,
          no_sep: bridging_sep.no_sep,
          total_permintaan_radiologi: sql<number>`(
          SELECT COUNT(*) 
          FROM ${permintaan_radiologi} 
          WHERE ${permintaan_radiologi.no_rawat} = ${reg_periksa.no_rawat}
        )`,
          total_permintaan_lab: sql<number>`(
          SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
          FROM ${permintaan_lab} 
          WHERE ${permintaan_lab.no_rawat} = ${reg_periksa.no_rawat}
        )`,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
          no_rkm_medis: pasien.no_rkm_medis,
          jk: pasien.jk,
          tgl_lahir: pasien.tgl_lahir,
          alamat: pasien.alamat,
          nm_poli: poliklinik.nm_poli,
        })
        .from(reg_periksa)
        .leftJoin(dokter, eq(reg_periksa.kd_dokter, dokter.kd_dokter))
        .leftJoin(
          rawat_jl_drpr,
          eq(reg_periksa.no_rawat, rawat_jl_drpr.no_rawat)
        )
        .leftJoin(
          jns_perawatan,
          eq(rawat_jl_drpr.kd_jenis_prw, jns_perawatan.kd_jenis_prw)
        )
        .innerJoin(
          bridging_sep,
          eq(reg_periksa.no_rawat, bridging_sep.no_rawat)
        )
        .leftJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
        .leftJoin(poliklinik, eq(reg_periksa.kd_poli, poliklinik.kd_poli))
        .where(and(...conditions))
        .groupBy(reg_periksa.no_rawat, bridging_sep.no_sep)
        .orderBy(asc(reg_periksa.tgl_registrasi));

      const csvTarifMap = new Map(
        input.csvData.map((item) => [item.no_sep, item.tarif])
      );

      const processedResult = result.map((row) => {
        const tarifFromCsv = csvTarifMap.get(row.no_sep || "") || 0;
        const alokasi = tarifFromCsv * 0.2;
        const laboratorium = (row.total_permintaan_lab || 0) * 10000;

        const jnsPerawatanRadiologi = JSON.parse(
          row.jns_perawatan_radiologi || "[]"
        ) as {
          kd_jenis_prw: string;
          nm_perawatan: string;
          noorder: string;
        }[];

        const usgCount = jnsPerawatanRadiologi.filter(
          (item) =>
            item.nm_perawatan && item.nm_perawatan.toLowerCase().includes("usg")
        ).length;
        const nonUsgCount = (row.total_permintaan_radiologi || 0) - usgCount;

        const radiologi =
          usgCount > 0
            ? Math.max(0, tarifFromCsv - 185000) + nonUsgCount * 15000
            : (row.total_permintaan_radiologi || 0) * 15000;
        const dpjp_utama = alokasi - laboratorium - radiologi;
        const konsul =
          row.konsul_count && row.konsul_count > 1
            ? dpjp_utama / row.konsul_count
            : 0;
        const yang_terbagi = dpjp_utama + konsul + radiologi + laboratorium;
        const percent_dari_klaim =
          tarifFromCsv > 0
            ? Math.floor((yang_terbagi / tarifFromCsv) * 100)
            : 0;

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
          tarif_from_csv: tarifFromCsv,
          alokasi,
          laboratorium,
          radiologi,
          dpjp_utama,
          konsul,
          yang_terbagi,
          percent_dari_klaim,
        };
      });

      const foundNoSepValues = processedResult.map((row) => row.no_sep);

      const notFoundNoSepValues = noSepList.filter(
        (noSep) => !foundNoSepValues.includes(noSep)
      );

      // Calculate totals from all processed data (before limiting)
      const totals = processedResult.reduce(
        (acc, row) => {
          const tarif = row.tarif_from_csv || 0;
          return {
            totalTarif: acc.totalTarif + Number(tarif),
            totalAlokasi: acc.totalAlokasi + Number(row.alokasi || 0),
            totalDpjpUtama: acc.totalDpjpUtama + Number(row.dpjp_utama || 0),
            totalKonsul: acc.totalKonsul + Number(row.konsul || 0),
            totalLaboratorium:
              acc.totalLaboratorium + Number(row.laboratorium || 0),
            totalRadiologi: acc.totalRadiologi + Number(row.radiologi || 0),
            totalYangTerbagi:
              acc.totalYangTerbagi + Number(row.yang_terbagi || 0),
            totalPercentDariKlaim:
              acc.totalPercentDariKlaim + Number(row.percent_dari_klaim || 0),
            count: acc.count + 1,
          };
        },
        {
          totalTarif: 0,
          totalAlokasi: 0,
          totalDpjpUtama: 0,
          totalKonsul: 0,
          totalLaboratorium: 0,
          totalRadiologi: 0,
          totalYangTerbagi: 0,
          totalPercentDariKlaim: 0,
          count: 0,
        }
      );

      // Calculate average percentage
      const averagePercentDariKlaim =
        totals.count > 0
          ? Math.floor(totals.totalPercentDariKlaim / totals.count)
          : 0;

      // Apply limit to returned data without affecting calculations
      const limitedData = input.limit
        ? processedResult.slice(0, input.limit)
        : processedResult;

      return {
        data: limitedData,
        totals: {
          ...totals,
          averagePercentDariKlaim,
        },
        statistics: {
          totalRequested: input.csvData.length,
          found: foundNoSepValues.length,
          notFound: notFoundNoSepValues.length,
          notFoundValues: notFoundNoSepValues,
        },
      };
    }),
});
