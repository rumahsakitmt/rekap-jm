import { db } from "@/db";
import {
  master_triase_macam_kasus,
  master_triase_pemeriksaan,
  master_triase_skala3,
  master_triase_skala4,
  master_triase_skala5,
} from "@/db/schema";
import { master_triase_skala1 } from "@/db/schema/master_triase_skala1";
import { master_triase_skala2 } from "@/db/schema/master_triase_skala2";
import { publicProcedure, router } from "@/lib/trpc";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const triaseRouter = router({
  getMacamKasus: publicProcedure.query(async () => {
    return await db
      .select()
      .from(master_triase_macam_kasus)
      .orderBy(master_triase_macam_kasus.kode_kasus);
  }),
  getNamaPemeriksaan: publicProcedure.query(async () => {
    return await db
      .select()
      .from(master_triase_pemeriksaan)
      .orderBy(master_triase_pemeriksaan.nama_pemeriksaan);
  }),
  getTriaseSkala1: publicProcedure
    .input(
      z.object({
        no_rawat: z.string(),
        kode_pemeriksaan: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { no_rawat, kode_pemeriksaan } = input;
      console.log({
        no_rawat,
        kode_pemeriksaan,
      });

      return (
        db
          .select({
            kode_skala: master_triase_skala1.kode_skala1,
            kode_pemeriksaan: master_triase_skala1.kode_pemeriksaan,
            pengkajian: master_triase_skala1.pengkajian_skala1,
          })
          .from(master_triase_skala1)
          // .leftJoin(
          //   data_triase_igddetail_skala1,
          //   eq(
          //     master_triase_skala1.kode_skala1,
          //     data_triase_igddetail_skala1.kode_skala1
          //   )
          // )
          .where(
            and(
              eq(master_triase_skala1.kode_pemeriksaan, kode_pemeriksaan)
              // eq(data_triase_igddetail_skala1.no_rawat, no_rawat)
            )
          )
        // .orderBy(data_triase_igddetail_skala1.kode_skala1)
      );
    }),
  getTriaseSkala2: publicProcedure
    .input(
      z.object({
        no_rawat: z.string(),
        kode_pemeriksaan: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { no_rawat, kode_pemeriksaan } = input;

      return (
        db
          .select({
            kode_skala: master_triase_skala2.kode_skala2,
            kode_pemeriksaan: master_triase_skala2.kode_pemeriksaan,
            pengkajian: master_triase_skala2.pengkajian_skala2,
          })
          .from(master_triase_skala2)
          // .leftJoin(
          //   data_triase_igddetail_skala1,
          //   eq(
          //     master_triase_skala1.kode_skala1,
          //     data_triase_igddetail_skala1.kode_skala1
          //   )
          // )
          .where(
            and(
              eq(master_triase_skala2.kode_pemeriksaan, kode_pemeriksaan)
              // eq(data_triase_igddetail_skala1.no_rawat, no_rawat)
            )
          )
        // .orderBy(data_triase_igddetail_skala1.kode_skala1)
      );
    }),
  getTriaseSkala3: publicProcedure
    .input(
      z.object({
        no_rawat: z.string(),
        kode_pemeriksaan: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { no_rawat, kode_pemeriksaan } = input;

      return (
        db
          .select({
            kode_skala: master_triase_skala3.kode_skala3,
            kode_pemeriksaan: master_triase_skala3.kode_pemeriksaan,
            pengkajian: master_triase_skala3.pengkajian_skala3,
          })
          .from(master_triase_skala3)
          // .leftJoin(
          //   data_triase_igddetail_skala1,
          //   eq(
          //     master_triase_skala1.kode_skala1,
          //     data_triase_igddetail_skala1.kode_skala1
          //   )
          // )
          .where(
            and(
              eq(master_triase_skala3.kode_pemeriksaan, kode_pemeriksaan)
              // eq(data_triase_igddetail_skala1.no_rawat, no_rawat)
            )
          )
        // .orderBy(data_triase_igddetail_skala1.kode_skala1)
      );
    }),
  getTriaseSkala4: publicProcedure
    .input(
      z.object({
        no_rawat: z.string(),
        kode_pemeriksaan: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { no_rawat, kode_pemeriksaan } = input;

      return (
        db
          .select({
            kode_skala: master_triase_skala4.kode_skala4,
            kode_pemeriksaan: master_triase_skala4.kode_pemeriksaan,
            pengkajian: master_triase_skala4.pengkajian_skala4,
          })
          .from(master_triase_skala4)
          // .leftJoin(
          //   data_triase_igddetail_skala1,
          //   eq(
          //     master_triase_skala1.kode_skala1,
          //     data_triase_igddetail_skala1.kode_skala1
          //   )
          // )
          .where(
            and(
              eq(master_triase_skala4.kode_pemeriksaan, kode_pemeriksaan)
              // eq(data_triase_igddetail_skala1.no_rawat, no_rawat)
            )
          )
        // .orderBy(data_triase_igddetail_skala1.kode_skala1)
      );
    }),
  getTriaseSkala5: publicProcedure
    .input(
      z.object({
        no_rawat: z.string(),
        kode_pemeriksaan: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { no_rawat, kode_pemeriksaan } = input;

      return (
        db
          .select({
            kode_skala: master_triase_skala5.kode_skala5,
            kode_pemeriksaan: master_triase_skala5.kode_pemeriksaan,
            pengkajian: master_triase_skala5.pengkajian_skala5,
          })
          .from(master_triase_skala5)
          // .leftJoin(
          //   data_triase_igddetail_skala1,
          //   eq(
          //     master_triase_skala1.kode_skala1,
          //     data_triase_igddetail_skala1.kode_skala1
          //   )
          // )
          .where(
            and(
              eq(master_triase_skala5.kode_pemeriksaan, kode_pemeriksaan)
              // eq(data_triase_igddetail_skala1.no_rawat, no_rawat)
            )
          )
        // .orderBy(data_triase_igddetail_skala1.kode_skala1)
      );
    }),
});
