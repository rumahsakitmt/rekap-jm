import { db } from "@/db";
import {
  data_triase_igddetail_skala1,
  data_triase_igddetail_skala2,
  data_triase_igddetail_skala3,
  data_triase_igddetail_skala4,
  data_triase_igddetail_skala5,
  master_triase_macam_kasus,
  master_triase_pemeriksaan,
  master_triase_skala3,
  master_triase_skala4,
  master_triase_skala5,
  pasien,
  pegawai,
  reg_periksa,
} from "@/db/schema";
import { data_triase_igd } from "@/db/schema/data_triase_igd";
import { data_triase_igdprimer } from "@/db/schema/data_triase_igdprimer";
import { data_triase_igdsekunder } from "@/db/schema/data_triase_igdsekunder";
import { master_triase_skala1 } from "@/db/schema/master_triase_skala1";
import { master_triase_skala2 } from "@/db/schema/master_triase_skala2";
import { publicProcedure, router } from "@/lib/trpc";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const triaseRouter = router({
  createTriase: publicProcedure
    .input(
      z.object({
        norawat: z.string().min(15, "Nomor Rawat tidak boleh kosong."),
        norm: z.string().min(6, "Nomor RM tidak boleh kosong."),
        nama: z.string().min(3, "Nama tidak boleh kosong."),
        tanggalKunjungan: z.coerce.date(),
        caraMasuk: z.string().min(1, "Cara masuk tidak boleh kosong."),
        transportasi: z.string().min(1, "Transportasi tidak boleh kosong."),
        alasanKedatangan: z
          .string()
          .min(1, "Alasan kedatangan tidak boleh kosong."),
        macamKasus: z.string().min(1, "Macam kasus tidak boleh kosong."),
        keterangan: z.string().min(1, "Keterangan tidak boleh kosong."),
        keluhanUtama: z.string().min(1, "Keluhan utama tidak boleh kosong."),
        suhu: z.string().min(1, "Suhu tidak boleh kosong."),
        nyeri: z.string().min(1, "Nyeri tidak boleh kosong."),
        tensi: z.string().min(1, "Tensi tidak boleh kosong."),
        nadi: z.string().min(1, "Nadi tidak boleh kosong."),
        saturasi: z.string().min(1, "Saturasi tidak boleh kosong."),
        respirasi: z.string().min(1, "Respirasi tidak boleh kosong."),
        kebutuhanKhusus: z.string(),
        pemeriksaan: z.string().min(1, "Pemeriksaan tidak boleh kosong."),
        skala1: z.array(z.string()),
        skala2: z.array(z.string()),
        skala3: z.array(z.string()),
        skala4: z.array(z.string()),
        skala5: z.array(z.string()),
        catatan: z.string(),
        keputusan: z.string().min(1, "Keputusan tidak boleh kosong."),
        tanggalTriase: z.coerce.date(),
        petugas: z.string().min(1, "Petugas tidak boleh kosong."),
        type: z.string(),
        skala: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        await tx.insert(data_triase_igd).values({
          no_rawat: input.norawat,
          tgl_kunjungan: input.tanggalKunjungan,
          cara_masuk: input.caraMasuk,
          alat_transportasi: input.transportasi,
          alasan_kedatangan: input.alasanKedatangan,
          keterangan_kedatangan: input.keterangan,
          kode_kasus: input.macamKasus,
          tekanan_darah: input.tensi,
          nadi: input.nadi,
          pernapasan: input.respirasi,
          suhu: input.suhu,
          saturasi_o2: input.saturasi,
          nyeri: input.nyeri,
        });

        if (input.type === "primer") {
          await tx.insert(data_triase_igdprimer).values({
            no_rawat: input.norawat,
            keluhan_utama: input.keluhanUtama,
            kebutuhan_khusus: input.kebutuhanKhusus,
            catatan: input.catatan,
            plan: input.keputusan,
            tanggaltriase: input.tanggalTriase,
            nik: input.petugas,
          });

          if (
            input.skala === "skala1" &&
            input.skala1 &&
            input.skala1.length > 0
          ) {
            await tx.insert(data_triase_igddetail_skala1).values(
              input.skala1.map((s) => ({
                no_rawat: input.norawat,
                kode_skala1: s,
              }))
            );
          } else if (
            input.skala === "skala2" &&
            input.skala2 &&
            input.skala2.length > 0
          ) {
            await tx.insert(data_triase_igddetail_skala2).values(
              input.skala2.map((s) => ({
                no_rawat: input.norawat,
                kode_skala2: s,
              }))
            );
          }
        } else if (input.type === "sekunder") {
          await tx.insert(data_triase_igdsekunder).values({
            no_rawat: input.norawat,
            anamnesa_singkat: input.keluhanUtama,
            catatan: input.catatan,
            plan: input.keputusan,
            tanggaltriase: input.tanggalTriase,
            nik: input.petugas,
          });

          if (
            input.skala === "skala3" &&
            input.skala3 &&
            input.skala3.length > 0
          ) {
            await tx.insert(data_triase_igddetail_skala3).values(
              input.skala3.map((s) => ({
                no_rawat: input.norawat,
                kode_skala3: s,
              }))
            );
          } else if (
            input.skala === "skala4" &&
            input.skala4 &&
            input.skala4.length > 0
          ) {
            await tx.insert(data_triase_igddetail_skala4).values(
              input.skala4.map((s) => ({
                no_rawat: input.norawat,
                kode_skala4: s,
              }))
            );
          } else if (
            input.skala === "skala5" &&
            input.skala5 &&
            input.skala5.length > 0
          ) {
            await tx.insert(data_triase_igddetail_skala5).values(
              input.skala5.map((s) => ({
                no_rawat: input.norawat,
                kode_skala5: s,
              }))
            );
          }
        }

        return { message: "success" };
      });
    }),
  getPatientTriase: publicProcedure
    .input(z.object({ no_rawat: z.string(), triase_type: z.string() }))
    .query(async ({ input }) => {
      const patient = await db
        .select({
          no_rawat: reg_periksa.no_rawat,
          no_rkm_medis: pasien.no_rkm_medis,
          nama_pasien: pasien.nm_pasien,
          tanggal_kunjungan: reg_periksa.tgl_registrasi,
          cara_masuk: data_triase_igd.cara_masuk,
          transportasi: data_triase_igd.alat_transportasi,
          alasan_kedatangan: data_triase_igd.alasan_kedatangan,
          keterangan: data_triase_igd.keterangan_kedatangan,
          macam_kasus: master_triase_macam_kasus.macam_kasus,
        })
        .from(reg_periksa)
        .innerJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
        .innerJoin(
          data_triase_igd,
          eq(reg_periksa.no_rawat, data_triase_igd.no_rawat)
        )
        .innerJoin(
          master_triase_macam_kasus,
          eq(data_triase_igd.kode_kasus, master_triase_macam_kasus.kode_kasus)
        )
        .where(eq(reg_periksa.no_rawat, input.no_rawat))
        .limit(1);

      if (input.triase_type === "primer") {
        const triasePrimer = await db
          .select({
            keluhan_utama: data_triase_igdprimer.keluhan_utama,
            kebutuhan_khusus: data_triase_igdprimer.kebutuhan_khusus,
            catatan: data_triase_igdprimer.catatan,
            plan: data_triase_igdprimer.plan,
            tanggaltriase: data_triase_igdprimer.tanggaltriase,
            nik: data_triase_igdprimer.nik,
            tekanan_darah: data_triase_igd.tekanan_darah,
            nadi: data_triase_igd.nadi,
            pernapasan: data_triase_igd.pernapasan,
            suhu: data_triase_igd.suhu,
            saturasi_o2: data_triase_igd.saturasi_o2,
            nyeri: data_triase_igd.nyeri,
            no_rawat: data_triase_igd.no_rawat,
            nm_pegawai: pegawai.nama,
          })
          .from(data_triase_igdprimer)
          .innerJoin(pegawai, eq(data_triase_igdprimer.nik, pegawai.nik))
          .innerJoin(
            data_triase_igd,
            eq(data_triase_igd.no_rawat, data_triase_igdprimer.no_rawat)
          )
          .where(eq(data_triase_igd.no_rawat, input.no_rawat))
          .limit(1);

        const [pemeriksaan1Results, pemeriksaan2Results] = await Promise.all([
          db
            .select({
              kode_pemeriksaan: master_triase_pemeriksaan.kode_pemeriksaan,
              nama_pemeriksaan: master_triase_pemeriksaan.nama_pemeriksaan,
            })
            .from(master_triase_pemeriksaan)
            .innerJoin(
              master_triase_skala1,
              eq(
                master_triase_pemeriksaan.kode_pemeriksaan,
                master_triase_skala1.kode_pemeriksaan
              )
            )
            .innerJoin(
              data_triase_igddetail_skala1,
              eq(
                master_triase_skala1.kode_skala1,
                data_triase_igddetail_skala1.kode_skala1
              )
            )
            .where(eq(data_triase_igddetail_skala1.no_rawat, input.no_rawat))
            .groupBy(master_triase_pemeriksaan.kode_pemeriksaan)
            .orderBy(master_triase_pemeriksaan.kode_pemeriksaan),
          db
            .select({
              kode_pemeriksaan: master_triase_pemeriksaan.kode_pemeriksaan,
              nama_pemeriksaan: master_triase_pemeriksaan.nama_pemeriksaan,
            })
            .from(master_triase_pemeriksaan)
            .innerJoin(
              master_triase_skala2,
              eq(
                master_triase_pemeriksaan.kode_pemeriksaan,
                master_triase_skala2.kode_pemeriksaan
              )
            )
            .innerJoin(
              data_triase_igddetail_skala2,
              eq(
                master_triase_skala2.kode_skala2,
                data_triase_igddetail_skala2.kode_skala2
              )
            )
            .where(eq(data_triase_igddetail_skala2.no_rawat, input.no_rawat))
            .groupBy(master_triase_pemeriksaan.kode_pemeriksaan)
            .orderBy(master_triase_pemeriksaan.kode_pemeriksaan),
        ]);

        const [skala1, skala2] = await Promise.all([
          pemeriksaan1Results.length > 0
            ? db
                .select({
                  kode_skala: master_triase_skala1.kode_pemeriksaan,
                  pengkajian_skala: master_triase_skala1.pengkajian_skala1,
                })
                .from(master_triase_skala1)
                .innerJoin(
                  data_triase_igddetail_skala1,
                  eq(
                    master_triase_skala1.kode_skala1,
                    data_triase_igddetail_skala1.kode_skala1
                  )
                )
                .where(
                  eq(data_triase_igddetail_skala1.no_rawat, input.no_rawat)
                )
            : Promise.resolve([]),
          pemeriksaan2Results.length > 0
            ? db
                .select({
                  kode_skala: master_triase_skala2.kode_pemeriksaan,
                  pengkajian_skala: master_triase_skala2.pengkajian_skala2,
                })
                .from(master_triase_skala2)
                .innerJoin(
                  data_triase_igddetail_skala2,
                  eq(
                    master_triase_skala2.kode_skala2,
                    data_triase_igddetail_skala2.kode_skala2
                  )
                )
                .where(
                  eq(data_triase_igddetail_skala2.no_rawat, input.no_rawat)
                )
            : Promise.resolve([]),
        ]);

        const allPemeriksaan =
          pemeriksaan1Results.length > 0
            ? pemeriksaan1Results
            : pemeriksaan2Results;
        const allSkala = skala1.length > 0 ? skala1 : skala2;
        const skala_type =
          pemeriksaan1Results.length > 0
            ? ("skala1" as const)
            : ("skala2" as const);

        const combinedData = allPemeriksaan.map((p) => ({
          ...p,
          skala: allSkala.filter((s) => s.kode_skala === p.kode_pemeriksaan),
        }));

        return {
          patient: patient[0],
          triase_type: "primer" as const,
          triase: triasePrimer[0],
          ...(combinedData.length > 0 && {
            pemeriksaan: combinedData,
            skala_type,
          }),
        };
      } else if (input.triase_type === "sekunder") {
        const triaseSekunder = await db
          .select({
            amnesia_singkat: data_triase_igdsekunder.anamnesa_singkat,
            catatan: data_triase_igdsekunder.catatan,
            plan: data_triase_igdsekunder.plan,
            tanggaltriase: data_triase_igdsekunder.tanggaltriase,
            nik: data_triase_igdsekunder.nik,
            tekanan_darah: data_triase_igd.tekanan_darah,
            nadi: data_triase_igd.nadi,
            pernapasan: data_triase_igd.pernapasan,
            suhu: data_triase_igd.suhu,
            saturasi_o2: data_triase_igd.saturasi_o2,
            nyeri: data_triase_igd.nyeri,
            no_rawat: data_triase_igd.no_rawat,
            nm_pegawai: pegawai.nama,
          })
          .from(data_triase_igdsekunder)
          .innerJoin(pegawai, eq(data_triase_igdsekunder.nik, pegawai.nik))
          .innerJoin(
            data_triase_igd,
            eq(data_triase_igd.no_rawat, data_triase_igdsekunder.no_rawat)
          )
          .where(eq(data_triase_igd.no_rawat, input.no_rawat));

        const [pemeriksaan3Results, pemeriksaan4Results, pemeriksaan5Results] =
          await Promise.all([
            db
              .select({
                kode_pemeriksaan: master_triase_pemeriksaan.kode_pemeriksaan,
                nama_pemeriksaan: master_triase_pemeriksaan.nama_pemeriksaan,
              })
              .from(master_triase_pemeriksaan)
              .innerJoin(
                master_triase_skala3,
                eq(
                  master_triase_pemeriksaan.kode_pemeriksaan,
                  master_triase_skala3.kode_pemeriksaan
                )
              )
              .innerJoin(
                data_triase_igddetail_skala3,
                eq(
                  master_triase_skala3.kode_skala3,
                  data_triase_igddetail_skala3.kode_skala3
                )
              )
              .where(eq(data_triase_igddetail_skala3.no_rawat, input.no_rawat))
              .groupBy(master_triase_pemeriksaan.kode_pemeriksaan)
              .orderBy(master_triase_pemeriksaan.kode_pemeriksaan),
            db
              .select({
                kode_pemeriksaan: master_triase_pemeriksaan.kode_pemeriksaan,
                nama_pemeriksaan: master_triase_pemeriksaan.nama_pemeriksaan,
              })
              .from(master_triase_pemeriksaan)
              .innerJoin(
                master_triase_skala4,
                eq(
                  master_triase_pemeriksaan.kode_pemeriksaan,
                  master_triase_skala4.kode_pemeriksaan
                )
              )
              .innerJoin(
                data_triase_igddetail_skala4,
                eq(
                  master_triase_skala4.kode_skala4,
                  data_triase_igddetail_skala4.kode_skala4
                )
              )
              .where(eq(data_triase_igddetail_skala4.no_rawat, input.no_rawat))
              .groupBy(master_triase_pemeriksaan.kode_pemeriksaan)
              .orderBy(master_triase_pemeriksaan.kode_pemeriksaan),
            db
              .select({
                kode_pemeriksaan: master_triase_pemeriksaan.kode_pemeriksaan,
                nama_pemeriksaan: master_triase_pemeriksaan.nama_pemeriksaan,
              })
              .from(master_triase_pemeriksaan)
              .innerJoin(
                master_triase_skala5,
                eq(
                  master_triase_pemeriksaan.kode_pemeriksaan,
                  master_triase_skala5.kode_pemeriksaan
                )
              )
              .innerJoin(
                data_triase_igddetail_skala5,
                eq(
                  master_triase_skala5.kode_skala5,
                  data_triase_igddetail_skala5.kode_skala5
                )
              )
              .where(eq(data_triase_igddetail_skala5.no_rawat, input.no_rawat))
              .groupBy(master_triase_pemeriksaan.kode_pemeriksaan)
              .orderBy(master_triase_pemeriksaan.kode_pemeriksaan),
          ]);

        const [skala3, skala4, skala5] = await Promise.all([
          pemeriksaan3Results.length > 0
            ? db
                .select({
                  kode_skala: master_triase_skala3.kode_pemeriksaan,
                  pengkajian_skala: master_triase_skala3.pengkajian_skala3,
                })
                .from(master_triase_skala3)
                .innerJoin(
                  data_triase_igddetail_skala3,
                  eq(
                    master_triase_skala3.kode_skala3,
                    data_triase_igddetail_skala3.kode_skala3
                  )
                )
                .where(
                  eq(data_triase_igddetail_skala3.no_rawat, input.no_rawat)
                )
            : Promise.resolve([]),
          pemeriksaan4Results.length > 0
            ? db
                .select({
                  kode_skala: master_triase_skala4.kode_pemeriksaan,
                  pengkajian_skala: master_triase_skala4.pengkajian_skala4,
                })
                .from(master_triase_skala4)
                .innerJoin(
                  data_triase_igddetail_skala4,
                  eq(
                    master_triase_skala4.kode_skala4,
                    data_triase_igddetail_skala4.kode_skala4
                  )
                )
                .where(
                  eq(data_triase_igddetail_skala4.no_rawat, input.no_rawat)
                )
            : Promise.resolve([]),
          pemeriksaan5Results.length > 0
            ? db
                .select({
                  kode_skala: master_triase_skala5.kode_pemeriksaan,
                  pengkajian_skala: master_triase_skala5.pengkajian_skala5,
                })
                .from(master_triase_skala5)
                .innerJoin(
                  data_triase_igddetail_skala5,
                  eq(
                    master_triase_skala5.kode_skala5,
                    data_triase_igddetail_skala5.kode_skala5
                  )
                )
                .where(
                  eq(data_triase_igddetail_skala5.no_rawat, input.no_rawat)
                )
            : Promise.resolve([]),
        ]);

        const allPemeriksaan =
          pemeriksaan3Results.length > 0
            ? pemeriksaan3Results
            : pemeriksaan4Results.length > 0
              ? pemeriksaan4Results
              : pemeriksaan5Results;
        const allSkala =
          skala3.length > 0 ? skala3 : skala4.length > 0 ? skala4 : skala5;
        const skala_type =
          pemeriksaan3Results.length > 0
            ? ("skala3" as const)
            : pemeriksaan4Results.length > 0
              ? ("skala4" as const)
              : ("skala5" as const);

        const combinedData = allPemeriksaan.map((p) => ({
          ...p,
          skala: allSkala.filter((s) => s.kode_skala === p.kode_pemeriksaan),
        }));

        return {
          patient: patient[0],
          triase_type: "sekunder" as const,
          triase: triaseSekunder[0],
          ...(combinedData.length > 0 && {
            pemeriksaan: combinedData,
            skala_type,
          }),
        };
      }
    }),
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
