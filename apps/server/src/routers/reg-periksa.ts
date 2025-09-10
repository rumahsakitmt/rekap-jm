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

export const regPeriksaRouter = router({
  getRegPeriksa: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        noSepList: z.array(z.string()).optional(),
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
            THEN JSON_OBJECT(
              'kd_jenis_prw', ${jns_perawatan.kd_jenis_prw},
              'nm_perawatan', ${jns_perawatan.nm_perawatan}
            )
            ELSE NULL
          END
        )`,
          konsul_count: sql<number>`SUM(CASE WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' THEN 1 ELSE 0 END)`,
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
          SELECT COUNT(*) 
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
        .leftJoin(bridging_sep, eq(reg_periksa.no_rawat, bridging_sep.no_rawat))
        .leftJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
        .leftJoin(poliklinik, eq(reg_periksa.kd_poli, poliklinik.kd_poli))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(reg_periksa.no_rawat)
        .orderBy(asc(reg_periksa.tgl_registrasi));

      const result = input.limit
        ? await baseQuery.limit(input.limit)
        : await baseQuery;

      return result.map((row) => ({
        ...row,
        jns_perawatan: (
          JSON.parse(row.jns_perawatan || "[]") as {
            kd_jenis_prw: string;
            nm_perawatan: string;
          }[]
        ).filter((item) => item !== null),
      }));
    }),

  importCsv: publicProcedure
    .input(
      z.object({
        noSepList: z.array(z.string()).min(1).max(10000),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const conditions = [];

      conditions.push(inArray(bridging_sep.no_sep, input.noSepList));

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
            THEN JSON_OBJECT(
              'kd_jenis_prw', ${jns_perawatan.kd_jenis_prw},
              'nm_perawatan', ${jns_perawatan.nm_perawatan}
            )
            ELSE NULL
          END
        )`,
          konsul_count: sql<number>`SUM(CASE WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' THEN 1 ELSE 0 END)`,
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
          SELECT COUNT(*) 
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
        .leftJoin(bridging_sep, eq(reg_periksa.no_rawat, bridging_sep.no_rawat))
        .leftJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
        .leftJoin(poliklinik, eq(reg_periksa.kd_poli, poliklinik.kd_poli))
        .where(and(...conditions))
        .groupBy(reg_periksa.no_rawat, bridging_sep.no_sep)
        .orderBy(asc(reg_periksa.tgl_registrasi));

      const processedResult = result.map((row) => ({
        ...row,
        jns_perawatan: (
          JSON.parse(row.jns_perawatan || "[]") as {
            kd_jenis_prw: string;
            nm_perawatan: string;
          }[]
        ).filter((item) => item !== null),
      }));

      // Get the no_sep values that were found in the database
      const foundNoSepValues = processedResult.map((row) => row.no_sep);

      // Find the no_sep values that were not found
      const notFoundNoSepValues = input.noSepList.filter(
        (noSep) => !foundNoSepValues.includes(noSep)
      );

      return {
        data: processedResult,
        statistics: {
          totalRequested: input.noSepList.length,
          found: foundNoSepValues.length,
          notFound: notFoundNoSepValues.length,
          notFoundValues: notFoundNoSepValues,
        },
      };
    }),
});
