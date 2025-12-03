import { db } from "@/db";
import {
  dokter,
  pasien,
  reg_periksa,
  data_triase_igd,
  poliklinik,
} from "@/db/schema";
import { publicProcedure, router } from "@/lib/trpc";
import { and, eq, gte, lte, or, like, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { data_triase_igdprimer } from "@/db/schema/data_triase_igdprimer";
import { data_triase_igdsekunder } from "@/db/schema/data_triase_igdsekunder";

export const igdRouter = router({
  getUserRegistration: publicProcedure
    .input(
      z.object({
        norawat: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { norawat } = input;
      const registration = await db
        .select({
          no_reg: reg_periksa.no_reg,
          no_rawat: reg_periksa.no_rawat,
          no_rkm_medis: reg_periksa.no_rkm_medis,
          tgl_registrasi: sql<Date>`CAST(CONCAT(DATE(${reg_periksa.tgl_registrasi}), ' ', ${reg_periksa.jam_reg}) AS DATETIME)`,
          jam_reg: reg_periksa.jam_reg,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
          has_triase: sql<boolean>`${data_triase_igd.no_rawat} IS NOT NULL`,
        })
        .from(reg_periksa)
        .leftJoin(dokter, eq(dokter.kd_dokter, reg_periksa.kd_dokter))
        .leftJoin(pasien, eq(pasien.no_rkm_medis, reg_periksa.no_rkm_medis))
        .leftJoin(
          data_triase_igd,
          eq(data_triase_igd.no_rawat, reg_periksa.no_rawat)
        )
        .orderBy(reg_periksa.tgl_registrasi)
        .where(eq(reg_periksa.no_rawat, norawat))
        .limit(1);

      return registration[0];
    }),
  getTodayRegistration: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
        dateFrom: z.coerce.date(),
        dateTo: z.coerce.date(),
      })
    )
    .query(async ({ input }) => {
      const { dateFrom, dateTo, keyword } = input;
      const normalizedKeyword = keyword.trim();
      const baseFilters: SQL<unknown>[] = [
        gte(reg_periksa.tgl_registrasi, dateFrom),
        lte(reg_periksa.tgl_registrasi, dateTo),
        eq(poliklinik.kd_poli, "IGDK"),
      ];

      if (normalizedKeyword) {
        const fuzzyKeyword = `%${normalizedKeyword}%`;
        const keywordFilter = or(
          eq(reg_periksa.no_rkm_medis, normalizedKeyword),
          eq(reg_periksa.no_rawat, normalizedKeyword),
          eq(reg_periksa.no_reg, normalizedKeyword),
          like(pasien.nm_pasien, fuzzyKeyword),
          like(dokter.nm_dokter, fuzzyKeyword)
        );
        baseFilters.push(keywordFilter as SQL<unknown>);
      }

      const whereClause = (and(...baseFilters) ??
        baseFilters[0]!) as SQL<unknown>;

      const registrations = await db
        .select({
          no_reg: reg_periksa.no_reg,
          no_rawat: reg_periksa.no_rawat,
          no_rkm_medis: reg_periksa.no_rkm_medis,
          tgl_registrasi: sql<Date>`CAST(CONCAT(DATE(${reg_periksa.tgl_registrasi}), ' ', ${reg_periksa.jam_reg}) AS DATETIME)`,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
          has_triase: sql<boolean>`${data_triase_igd.no_rawat} IS NOT NULL`,
          triase_type: sql<string>`CASE 
            WHEN ${data_triase_igdprimer.no_rawat} IS NOT NULL THEN 'primer'
            WHEN ${data_triase_igdsekunder.no_rawat} IS NOT NULL THEN 'sekunder'
            ELSE NULL
          END`,
        })
        .from(reg_periksa)
        .innerJoin(dokter, eq(dokter.kd_dokter, reg_periksa.kd_dokter))
        .innerJoin(pasien, eq(pasien.no_rkm_medis, reg_periksa.no_rkm_medis))
        .innerJoin(poliklinik, eq(poliklinik.kd_poli, reg_periksa.kd_poli))
        .leftJoin(
          data_triase_igd,
          eq(data_triase_igd.no_rawat, reg_periksa.no_rawat)
        )
        .leftJoin(
          data_triase_igdprimer,
          eq(data_triase_igdprimer.no_rawat, reg_periksa.no_rawat)
        )
        .leftJoin(
          data_triase_igdsekunder,
          eq(data_triase_igdsekunder.no_rawat, reg_periksa.no_rawat)
        )
        .where(whereClause)
        .orderBy(reg_periksa.tgl_registrasi)
        .limit(100);

      return registrations;
    }),
});
