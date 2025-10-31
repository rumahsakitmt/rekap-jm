import { router, publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { databarang, detail_pemberian_obat, gudangbarang } from "@/db/schema";
import { eq, sql, asc, gte, lte, and } from "drizzle-orm";
import { z } from "zod";
import { differenceInMonths, startOfDay } from "date-fns";

export const obatRouter = router({
  getObat: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        leadingTime: z.string().optional().default("6"),
        selectedBangsal: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const leadingTimeNumber = parseInt(input.leadingTime);

      const results = await db
        .select({
          kode_brng: databarang.kode_brng,
          nama_brng: databarang.nama_brng,
          expire: databarang.expire,
          h_beli: databarang.h_beli,
          status: databarang.status,
          stok: gudangbarang.stok,
          penggunaan: sql<number>`COALESCE(SUM(${detail_pemberian_obat.jml}), 0)`,
          total_biaya_obat: sql<number>`COALESCE(SUM(${detail_pemberian_obat.biaya_obat}), 0)`,
          total_embalase: sql<number>`COALESCE(SUM(${detail_pemberian_obat.embalase}), 0)`,
          total_tuslah: sql<number>`COALESCE(SUM(${detail_pemberian_obat.tuslah}), 0)`,
          total_harga: sql<number>`COALESCE(SUM(${detail_pemberian_obat.total}), 0)`,
        })
        .from(databarang)
        .leftJoin(
          detail_pemberian_obat,
          and(
            input.dateFrom
              ? gte(detail_pemberian_obat.tgl_perawatan, input.dateFrom)
              : undefined,
            input.dateTo
              ? lte(detail_pemberian_obat.tgl_perawatan, input.dateTo)
              : undefined,
            eq(databarang.kode_brng, detail_pemberian_obat.kode_brng)
          )
        )
        .leftJoin(
          gudangbarang,
          eq(databarang.kode_brng, gudangbarang.kode_brng)
        )
        .groupBy(
          databarang.kode_brng,
          databarang.nama_brng,
          databarang.h_beli,
          databarang.status,
          databarang.expire
        )
        .where(
          and(
            eq(databarang.status, "1"),
            eq(gudangbarang.kd_bangsal, input.selectedBangsal || "GF")
          )
        )
        .orderBy(asc(databarang.nama_brng));

      return results.map((row) => {
        const avgUsage = row.penggunaan || 0;
        const Smin = 2 * ((avgUsage / 30) * leadingTimeNumber);
        const stok = row.stok || 0;

        const rawExpire = row.expire as unknown as string | Date | null;
        const parsedExpire = rawExpire ? new Date(rawExpire as any) : null;
        const isValidExpire = !!(
          parsedExpire && !isNaN(parsedExpire.getTime())
        );

        const isEpoch = isValidExpire && parsedExpire!.getTime() === 0;

        const today = startOfDay(new Date());
        const daysUntilExpire =
          isValidExpire && !isEpoch
            ? differenceInMonths(parsedExpire!, today)
            : -999;

        const monthsUntilExpire =
          daysUntilExpire >= 0 ? Math.floor(daysUntilExpire) : -1;

        const getStatus = (months: number, days: number) => {
          if (days < 0) return "merah";
          if (months < 6) return "merah";
          if (months <= 12) return "kuning";
          return "hijau";
        };

        let stockStatus = "sehat";
        if (stok < Smin) {
          stockStatus = "rendah";
        } else if (stok > Smin && stok < Smin * 2) {
          stockStatus = "sedang";
        }

        return {
          ...row,
          smin: Smin,
          stockStatus,
          expireStatus: getStatus(monthsUntilExpire, daysUntilExpire),
        };
      });
    }),
});
