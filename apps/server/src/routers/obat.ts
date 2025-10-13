import { router, publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { databarang, detail_pemberian_obat, gudangbarang } from "@/db/schema";
import { eq, sql, desc, asc, gte, lte, and } from "drizzle-orm";
import { z } from "zod";

export const obatRouter = router({
  getObat: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date(),
        dateTo: z.coerce.date(),
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
            gte(detail_pemberian_obat.tgl_perawatan, input.dateFrom),
            lte(detail_pemberian_obat.tgl_perawatan, input.dateTo),
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
          databarang.status
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
        };
      });
    }),
});
