import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { rawat_jl_drpr } from "../db/schema/rawat_jl_drpr";
import { bridging_sep } from "../db/schema/bridging_sep";
import { permintaan_radiologi } from "../db/schema/permintaan_radiologi";
import { permintaan_lab } from "../db/schema/permintaan_lab";
import { desc, eq, sql, and, gte, lte, asc } from "drizzle-orm";
import { dokter } from "@/db/schema/dokter";
import { jns_perawatan } from "@/db/schema/jns_perawatan";
import { pasien } from "@/db/schema/pasien";
import { reg_periksa } from "@/db/schema/reg_periksa";
import { poliklinik } from "@/db/schema/poliklinik";
import { z } from "zod";

export const rawatJalanRouter = router({
  getRawatJalan: publicProcedure
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
          sql`(${rawat_jl_drpr.no_rawat} LIKE ${`%${input.search}%`} OR ${bridging_sep.no_sep} LIKE ${`%${input.search}%`} OR ${reg_periksa.no_rkm_medis} LIKE ${`%${input.search}%`})`
        );
      }

      if (input.dateFrom) {
        conditions.push(gte(rawat_jl_drpr.tgl_perawatan, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(rawat_jl_drpr.tgl_perawatan, input.dateTo));
      }

      const baseQuery = db
        .select({
          no_rawat: rawat_jl_drpr.no_rawat,
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
          kd_dokter: rawat_jl_drpr.kd_dokter,
          nip: rawat_jl_drpr.nip,
          tgl_perawatan: rawat_jl_drpr.tgl_perawatan,
          jam_rawat: rawat_jl_drpr.jam_rawat,
          material: sql<number>`SUM(${rawat_jl_drpr.material})`,
          bhp: sql<number>`SUM(${rawat_jl_drpr.bhp})`,
          tarif_tindakandr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakandr})`,
          tarif_tindakanpr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakanpr})`,
          kso: sql<number>`SUM(${rawat_jl_drpr.kso})`,
          menejemen: sql<number>`SUM(${rawat_jl_drpr.menejemen})`,
          biaya_rawat: sql<number>`SUM(${rawat_jl_drpr.biaya_rawat})`,
          stts_bayar: rawat_jl_drpr.stts_bayar,
          no_sep: bridging_sep.no_sep,
          total_permintaan_radiologi: sql<number>`(
          SELECT COUNT(*) 
          FROM ${permintaan_radiologi} 
          WHERE ${permintaan_radiologi.no_rawat} = ${rawat_jl_drpr.no_rawat}
        )`,
          total_permintaan_lab: sql<number>`(
          SELECT COUNT(*) 
          FROM ${permintaan_lab} 
          WHERE ${permintaan_lab.no_rawat} = ${rawat_jl_drpr.no_rawat}
        )`,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
          no_rkm_medis: pasien.no_rkm_medis,
          jk: pasien.jk,
          tgl_lahir: pasien.tgl_lahir,
          alamat: pasien.alamat,
          nm_poli: poliklinik.nm_poli,
        })
        .from(rawat_jl_drpr)
        .leftJoin(dokter, eq(rawat_jl_drpr.kd_dokter, dokter.kd_dokter))
        .leftJoin(
          jns_perawatan,
          eq(rawat_jl_drpr.kd_jenis_prw, jns_perawatan.kd_jenis_prw)
        )
        .innerJoin(
          bridging_sep,
          eq(rawat_jl_drpr.no_rawat, bridging_sep.no_rawat)
        )
        .leftJoin(reg_periksa, eq(rawat_jl_drpr.no_rawat, reg_periksa.no_rawat))
        .leftJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
        .leftJoin(poliklinik, eq(reg_periksa.kd_poli, poliklinik.kd_poli))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(rawat_jl_drpr.no_rawat)
        .orderBy(asc(rawat_jl_drpr.tgl_perawatan));

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
});
