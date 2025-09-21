import { z } from "zod";

// Input schemas
export const rawatInapFilterSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  filename: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  kd_dokter: z.string().optional(),
  kd_poli: z.string().optional(),
  kd_bangsal: z.string().optional(),
  includeTotals: z.boolean().optional(),
  selectedSupport: z.string().optional(),
  operation: z.boolean().optional(),
  generalDoctor: z.boolean().optional(),
  viisiteAnesthesia: z.boolean().optional(),
  visiteDokterSpesialis: z.boolean().optional(),
});

export const detailedReportSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  filename: z.string().optional(),
  kd_dokter: z.string().optional(),
  kd_bangsal: z.string().optional(),
  selectedSupport: z.string().optional(),
});

export const csvDownloadSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  filename: z.string().min(1, "CSV filename is required for download"),
  kd_dokter: z.string().optional(),
  kd_bangsal: z.string().optional(),
  selectedSupport: z.string().optional(),
});

// Type definitions
export type RawatInapFilterInput = z.infer<typeof rawatInapFilterSchema>;
export type DetailedReportInput = z.infer<typeof detailedReportSchema>;
export type CsvDownloadInput = z.infer<typeof csvDownloadSchema>;

// Data interfaces
export interface RawatInapData {
  no_rawat: string;
  no_rkm_medis: string | null;
  nm_pasien: string | null;
  no_sep: string;
  jnspelayanan: string;
  kamar: string | null;
  trf_kamar: number | null;
  diagnosa_awal: string | null;
  diagnosa_akhir: string | null;
  tgl_masuk: Date | null;
  tgl_keluar: Date | null;
  stts_pulang: string | null;
  lama: number | null;
  nm_dokter: string;
  jns_perawatan: any[];
  total_permintaan_radiologi: number;
  total_permintaan_lab: number;
  has_operasi: boolean;
  operator: string;
  anestesi: string;
}

// Summary data interface (for detailed reports)
export interface RawatInapSummaryData {
  no_rawat: string;
  kd_dokter: string | null;
  nm_dokter: string;
  tgl_masuk: Date | null;
  tgl_keluar: Date | null;
  jns_perawatan: any[];
  total_permintaan_radiologi: number;
  total_permintaan_lab: number;
  has_operasi: boolean;
  operator: string;
  anestesi: string;
  no_sep: string | null;
}

// Radiologi and Lab data interfaces
export interface RadiologiData {
  no_rawat: string | null;
  kd_jenis_prw: string;
  nm_perawatan: string | null;
  noorder: string;
  kd_dokter: string | null;
  nm_dokter: string | null;
}

export interface LabData {
  no_rawat: string | null;
  kd_jenis_prw: string;
  nm_perawatan: string | null;
  kd_dokter: string | null;
  nm_dokter: string | null;
  tgl_periksa: Date | null;
}

export interface ProcessedRawatInapData
  extends Omit<RawatInapData, "jns_perawatan"> {
  visite_dpjp_utama: number;
  visite_konsul_1: any[];
  visite_konsul_2: any[];
  visite_dokter_umum: any[];
  jns_perawatan: any[];
  jns_perawatan_radiologi: any[];
  jns_perawatan_lab: any[];
  hari_rawat: number;
  tarif_from_csv?: number;
  totalVisite: number;
  alokasi: number;
  dpjp_ranap: number;
  remun_dpjp_utama: number;
  remun_konsul_anastesi: number;
  remun_konsul_2: number;
  remun_dokter_umum: number;
  remun_lab: number;
  remun_rad: number;
  remun_operator: number;
  remun_anestesi: number;
  remun_anastesi_pengganti: number;
  yang_terbagi: number;
  percent_dari_klaim: number;
}

export interface RawatInapResponse {
  data: ProcessedRawatInapData[];
  totals: {
    totalTarif: number;
    totalAlokasi: number;
    totalDpjpRanap: number;
    totalRemunDpjp: number;
    totalRemunKonsulAnestesi: number;
    totalRemunKonsul1: number;
    totalRemunKonsul2: number;
    totalRemunDokterUmum: number;
    totalRemunLab: number;
    totalRemunRadiologi: number;
    totalRemunOperator: number;
    totalRemunAnestesi: number;
    totalRemunAnastesiPengganti: number;
    totalYangTerbagi: number;
    totalPercentDariKlaim: number;
    count: number;
    averagePercentDariKlaim: number;
  } | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
  };
}

export interface DetailedReportResponse {
  dpjp: Array<{ name: string; visite: number; total: number }>;
  dpjpTotal: number;
  konsulAnastesi: Array<{ name: string; visite: number; total: number }>;
  konsulAnastesiTotal: number;
  konsul: Array<{
    name: string;
    visite: number;
    total: number;
  }>;
  konsulTotal: number;
  dokterUmum: Array<{ name: string; visite: number; total: number }>;
  dokterUmumTotal: number;
  operator: Array<{ name: string; visite: number; total: number }>;
  operatorTotal: number;
  anestesi: Array<{ name: string; visite: number; total: number }>;
  anestesiTotal: number;
  penunjang: Array<{ name: string; visite: number; total: number }>;
  penunjangTotal: number;
  labTotal: number;
  radTotal: number;
  rekapBulanan: Array<{ name: string; visite: number; total: number }>;
  grandTotal: number;
}

export interface CsvDownloadResponse {
  csv: string;
}
