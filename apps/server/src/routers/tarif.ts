import { db } from "@/db";
import {
  jns_perawatan,
  jns_perawatan_inap,
  jns_perawatan_lab,
  jns_perawatan_radiologi,
  jns_perawatan_utd,
} from "@/db/schema";
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

const insertTarifLabSchema = z.object({
  kdJenisPrw: z.string().max(15),
  nmPerawatan: z.string().max(80).optional(),
  bagianRs: z.number().optional(),
  bhp: z.number().optional(),
  tarifPerujuk: z.number().optional(),
  tarifTindakanDokter: z.number().optional(),
  tarifTindakanPetugas: z.number().optional(),
  kso: z.number().optional(),
  menejemen: z.number().optional(),
  totalByr: z.number().optional(),
  kdPj: z.string().max(3).optional(),
  status: z.string().max(1).optional(),
  kelas: z.string().max(20).optional(),
  kategori: z.string().max(2).optional(),
});

const insertTarifRadiologiSchema = z.object({
  kd_jenis_prw: z.string().max(15),
  nm_perawatan: z.string().max(80).optional(),
  bagian_rs: z.number().optional(),
  bhp: z.number().optional(),
  tarif_perujuk: z.number().optional(),
  tarif_tindakan_dokter: z.number().optional(),
  tarif_tindakan_petugas: z.number().optional(),
  kso: z.number().optional(),
  menejemen: z.number().optional(),
  total_byr: z.number().optional(),
  kd_pj: z.string().max(3).optional(),
  status: z.string().max(2).optional(),
  kelas: z.string().max(20).optional(),
});

const insertTarifUtdSchema = z.object({
  kdJenisPrw: z.string().max(15),
  nmPerawatan: z.string().max(80).optional(),
  bagianRs: z.number().optional(),
  bhp: z.number().optional(),
  tarifPerujuk: z.number().optional(),
  tarifTindakanDokter: z.number().optional(),
  tarifTindakanPetugas: z.number().optional(),
  kso: z.number().optional(),
  manajemen: z.number().optional(),
  totalByr: z.number().optional(),
  kdPj: z.string().max(3).optional(),
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

  // Lab procedures
  getTarifLab: publicProcedure.query(async () => {
    const lab = db
      .select()
      .from(jns_perawatan_lab)
      .where(eq(jns_perawatan_lab.status, "1"));

    return lab;
  }),

  insertTarifLab: publicProcedure
    .input(insertTarifLabSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(jns_perawatan_lab).values(input);
      return result;
    }),

  resetAllStatusLab: publicProcedure.mutation(async () => {
    const result = await db
      .update(jns_perawatan_lab)
      .set({ status: "0" })
      .where(eq(jns_perawatan_lab.status, "1"));
    return result;
  }),

  // Radiologi procedures
  getTarifRadiologi: publicProcedure.query(async () => {
    const radiologi = db
      .select()
      .from(jns_perawatan_radiologi)
      .where(eq(jns_perawatan_radiologi.status, "1"));

    return radiologi;
  }),

  insertTarifRadiologi: publicProcedure
    .input(insertTarifRadiologiSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(jns_perawatan_radiologi).values(input);
      return result;
    }),

  resetAllStatusRadiologi: publicProcedure.mutation(async () => {
    const result = await db
      .update(jns_perawatan_radiologi)
      .set({ status: "0" })
      .where(eq(jns_perawatan_radiologi.status, "1"));
    return result;
  }),

  // UTD procedures
  insertTarifUtd: publicProcedure
    .input(insertTarifUtdSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(jns_perawatan_utd).values(input);
      return result;
    }),

  resetAllStatusUtd: publicProcedure.mutation(async () => {
    const result = await db
      .update(jns_perawatan_utd)
      .set({ status: "0" })
      .where(eq(jns_perawatan_utd.status, "1"));
    return result;
  }),
});
