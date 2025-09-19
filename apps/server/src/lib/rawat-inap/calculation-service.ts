import {
  calculateRawatInapFinancials,
  extractRawatInapVisiteData,
} from "@/lib/calculation-utils";
import type { RawatInapData, RawatInapSummaryData } from "./types";

export class RawatInapCalculationService {
  /**
   * Calculate financial data for a single rawat inap record
   */
  calculateFinancials(
    row: RawatInapData | RawatInapSummaryData,
    tarif: number,
    jnsPerawatanRadiologiArray: any[],
    selectedSupport?: string
  ) {
    return calculateRawatInapFinancials({
      tarif,
      total_permintaan_lab: row.total_permintaan_lab || 0,
      total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
      jns_perawatan: row.jns_perawatan || "[]",
      jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
      nm_dokter: row.nm_dokter || "",
      tgl_masuk: row.tgl_masuk,
      tgl_keluar: row.tgl_keluar,
      has_operasi: row.has_operasi || false,
      selectedSupport,
      dokter_anestesi: row.anestesi || "",
    });
  }

  /**
   * Calculate visite data for a single rawat inap record
   */
  calculateVisiteData(row: RawatInapData | RawatInapSummaryData) {
    return extractRawatInapVisiteData(
      row.jns_perawatan || "[]",
      row.nm_dokter || "",
      row.tgl_masuk,
      row.tgl_keluar
    );
  }

  /**
   * Create CSV calculation result format
   */
  createCsvCalculation(
    calculation: ReturnType<typeof calculateRawatInapFinancials>
  ) {
    return {
      alokasi: calculation.alokasi,
      laboratorium: calculation.remun_lab,
      radiologi: calculation.remun_rad,
      dpjp_utama: calculation.remun_dpjp_utama,
      konsul: calculation.remun_konsul_anastesi + calculation.remun_konsul_2,
      yang_terbagi: calculation.yang_terbagi,
      percent_dari_klaim: calculation.percent_dari_klaim,
    };
  }
}
