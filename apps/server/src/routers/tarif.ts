import { db } from "@/db";
import { jns_perawatan } from "@/db/schema";
import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";
import { eq, like } from "drizzle-orm";

const insertTarifSchema = z.object({
  kd_jenis_prw: z.string().max(15),
  nm_perawatan: z.string().max(80).optional(),
  kd_kategori: z.string().max(5).optional(),
  material: z.number().optional(),
  bhp: z.number().optional(),
  tarif_tindakandr: z.number().optional(),
  tarif_tindakanpr: z.number().optional(),
  kso: z.number().optional(),
  menejemen: z.number().optional(),
  total_byrdr: z.number().optional(),
  total_byrpr: z.number().optional(),
  total_byrdrpr: z.number().optional(),
  kd_pj: z.string().max(3).optional(),
  kd_poli: z.string().max(5).optional(),
  status: z.string().max(1).optional(),
});

export const tarifRouter = router({
  getTarifRawatJalan: publicProcedure.query(async () => {
    const rj = db
      .select()
      .from(jns_perawatan)
      .where(eq(jns_perawatan.status, "1"));

    return rj;
  }),

  insertTarif: publicProcedure
    .input(insertTarifSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(jns_perawatan).values(input);
      return result;
    }),

  resetAllStatus: publicProcedure.mutation(async () => {
    const result = await db
      .update(jns_perawatan)
      .set({ status: "0" })
      .where(eq(jns_perawatan.status, "1"));
    return result;
  }),

  deleteTarifTRJ: publicProcedure.mutation(async () => {
    const result = await db
      .delete(jns_perawatan)
      .where(like(jns_perawatan.kd_jenis_prw, "TRJ%"));
    return result;
  }),
});
