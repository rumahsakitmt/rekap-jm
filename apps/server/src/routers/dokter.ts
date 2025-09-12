import { router } from "../lib/trpc";
import { publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { dokter } from "../db/schema/dokter";
import { sql, and, like, asc, eq } from "drizzle-orm";
import { z } from "zod";

export const dokterRouter = router({
  getDoctor: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        kd_dokter: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          sql`(${dokter.kd_dokter} LIKE ${`%${input.search}%`} OR ${dokter.nm_dokter} LIKE ${`%${input.search}%`} OR ${dokter.alumni} LIKE ${`%${input.search}%`})`
        );
      }

      if (input.kd_dokter) {
        conditions.push(eq(dokter.kd_dokter, input.kd_dokter));
      }

      const result = await db
        .select({
          kd_dokter: dokter.kd_dokter,
          nm_dokter: dokter.nm_dokter,
          jk: dokter.jk,
          tmp_lahir: dokter.tmp_lahir,
          gol_drh: dokter.gol_drh,
          agama: dokter.agama,
          almt_tgl: dokter.almt_tgl,
          no_telp: dokter.no_telp,
          stts_nikah: dokter.stts_nikah,
          kd_sps: dokter.kd_sps,
          alumni: dokter.alumni,
          no_ijin_praktek: dokter.no_ijin_praktek,
          status: dokter.status,
        })
        .from(dokter)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(dokter.nm_dokter))
        .offset(input.offset || 0)
        .limit(input.limit || 1000);

      return {
        data: result,
      };
    }),
});
