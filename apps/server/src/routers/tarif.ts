import { db } from "@/db";
import { jns_perawatan, jns_perawatan_inap } from "@/db/schema";
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

const insertTarifInapSchema = z.object({
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
  kd_bangsal: z.string().max(10).optional(),
  status: z.string().max(1).optional(),
  kelas: z.string().max(20).optional(),
});

const updateTarifInapSchema = z.object({
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
  kd_bangsal: z.string().max(10).optional(),
  status: z.string().max(1).optional(),
  kelas: z.string().max(20).optional(),
});

const deleteTarifInapSchema = z.object({
  kd_jenis_prw: z.string().max(15),
});

export const tarifRouter = router({
  getTarifRawatJalan: publicProcedure.query(async () => {
    const rj = db
      .select()
      .from(jns_perawatan)
      .where(eq(jns_perawatan.status, "1"));

    return rj;
  }),

  getTarifRawatInap: publicProcedure.query(async () => {
    const ri = db
      .select()
      .from(jns_perawatan_inap)
      .where(eq(jns_perawatan_inap.status, "1"));

    return ri;
  }),

  insertTarif: publicProcedure
    .input(insertTarifSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(jns_perawatan).values(input);
      return result;
    }),

  insertTarifInap: publicProcedure
    .input(insertTarifInapSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(jns_perawatan_inap).values(input);
      return result;
    }),

  updateTarif: publicProcedure
    .input(
      z.object({
        ...insertTarifSchema.shape,
      })
    )
    .mutation(async ({ input }) => {
      const { kd_jenis_prw, ...updateData } = input;
      const result = await db
        .update(jns_perawatan)
        .set(updateData)
        .where(eq(jns_perawatan.kd_jenis_prw, kd_jenis_prw));
      return result;
    }),

  updateTarifInap: publicProcedure
    .input(updateTarifInapSchema)
    .mutation(async ({ input }) => {
      const { kd_jenis_prw, ...updateData } = input;
      const result = await db
        .update(jns_perawatan_inap)
        .set(updateData)
        .where(eq(jns_perawatan_inap.kd_jenis_prw, kd_jenis_prw));
      return result;
    }),

  deleteTarif: publicProcedure
    .input(
      z.object({
        kd_jenis_prw: z.string().max(15),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .delete(jns_perawatan)
        .where(eq(jns_perawatan.kd_jenis_prw, input.kd_jenis_prw));
      return result;
    }),

  deleteTarifInap: publicProcedure
    .input(deleteTarifInapSchema)
    .mutation(async ({ input }) => {
      const result = await db
        .delete(jns_perawatan_inap)
        .where(eq(jns_perawatan_inap.kd_jenis_prw, input.kd_jenis_prw));
      return result;
    }),

  resetAllStatus: publicProcedure.mutation(async () => {
    const result = await db
      .update(jns_perawatan)
      .set({ status: "0" })
      .where(eq(jns_perawatan.status, "1"));
    return result;
  }),

  resetAllStatusInap: publicProcedure.mutation(async () => {
    const result = await db
      .update(jns_perawatan_inap)
      .set({ status: "0" })
      .where(eq(jns_perawatan_inap.status, "1"));
    return result;
  }),

  deleteTarifTRJ: publicProcedure.mutation(async () => {
    const result = await db
      .delete(jns_perawatan)
      .where(like(jns_perawatan.kd_jenis_prw, "TRJ%"));
    return result;
  }),

  deleteTarifTRJInap: publicProcedure.mutation(async () => {
    const result = await db
      .delete(jns_perawatan_inap)
      .where(like(jns_perawatan_inap.kd_jenis_prw, "TRJ%"));
    return result;
  }),
});
