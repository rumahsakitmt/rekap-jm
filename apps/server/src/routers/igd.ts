import { db } from "@/db";
import { dokter, pasien, reg_periksa } from "@/db/schema";
import { publicProcedure, router } from "@/lib/trpc";
import { and, eq, gte, lte, or, like, type SQL } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";
import { z } from "zod";

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
          tgl_registrasi: reg_periksa.tgl_registrasi,
          jam_reg: reg_periksa.jam_reg,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
        })
        .from(reg_periksa)
        .leftJoin(dokter, eq(dokter.kd_dokter, reg_periksa.kd_dokter))
        .leftJoin(pasien, eq(pasien.no_rkm_medis, reg_periksa.no_rkm_medis))
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
      console.log({ dateFrom, dateTo, keyword });
      const normalizedKeyword = keyword.trim();
      const baseFilters: SQL<unknown>[] = [
        gte(reg_periksa.tgl_registrasi, dateFrom),
        lte(reg_periksa.tgl_registrasi, dateTo),
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

      return await db
        .select({
          no_reg: reg_periksa.no_reg,
          no_rawat: reg_periksa.no_rawat,
          no_rkm_medis: reg_periksa.no_rkm_medis,
          tgl_registrasi: reg_periksa.tgl_registrasi,
          nm_dokter: dokter.nm_dokter,
          nm_pasien: pasien.nm_pasien,
        })
        .from(reg_periksa)
        .leftJoin(dokter, eq(dokter.kd_dokter, reg_periksa.kd_dokter))
        .leftJoin(pasien, eq(pasien.no_rkm_medis, reg_periksa.no_rkm_medis))
        .where(whereClause)
        .orderBy(reg_periksa.tgl_registrasi)
        .limit(50);
    }),
});
