import { formOptions } from "@tanstack/react-form";
import type { AppFieldExtendedReactFormApi } from "@tanstack/react-form";
import z from "zod";

export const infoSchema = z.object({
  norawat: z.string(),
  norm: z.string(),
  nama: z.string(),
  tanggalKunjungan: z.date(),
  caraMasuk: z.string(),
  transportasi: z.string(),
  alasanKedatagan: z.string(),
  macamKasus: z.string(),
  keterangan: z.string(),
});

export const formOpts = formOptions({
  defaultValues: {
    norawat: "",
    norm: "",
    nama: "",
    tanggalKunjugan: new Date(),
    caraMasuk: "jalan",
    transportasi: "sendiri",
    alasanKedatangan: "datang sendiri",
    macamKasus: "",
    keterangan: "",
    keluhanUtama: "",
    suhu: "",
    nyeri: "",
    tensi: "",
    nadi: "",
    saturasi: "",
    respirasi: "",
    kebutuhanKhusus: "",
    pemeriksaan: "",
    skala1: [] as string[],
    skala2: [] as string[],
    skala3: [] as string[],
    skala4: [] as string[],
    skala5: [] as string[],
    catatan: "",
    keputusan: "Ruang Resusitasi",
    tanggalTriase: new Date(),
    petugas: "",
  },
  onSubmit: ({ value }) => {
    console.log(value);
  },
});

export type TriaseFormValues = typeof formOpts.defaultValues;

export type TriaseFormInstance = AppFieldExtendedReactFormApi<
  TriaseFormValues,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  Record<string, never>,
  Record<string, never>
>;
