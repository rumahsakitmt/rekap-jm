import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap-filter-utils";
import {
  createRawatInapQuery,
  getRadiologiData,
  getLabData,
} from "@/lib/rawat-inap-query-builder";
import {
  readCsvFile,
  createCsvTarifMap,
  convertToCsv,
  type CsvData,
} from "@/lib/csv-utils";
import { accumulateTotals, createEmptyTotals } from "@/lib/calculation-utils";
import { RawatInapCalculationService } from "./calculation-service";
import type { RawatInapFilterInput, CsvDownloadResponse } from "./types";

export class RawatInapCsvService {
  private calculationService = new RawatInapCalculationService();

  /**
   * Generate CSV download data
   */
  async generateCsvDownload(
    input: RawatInapFilterInput
  ): Promise<CsvDownloadResponse> {
    if (!input.filename) {
      return { csv: "" };
    }

    const csvData = await readCsvFile(input.filename);

    if (csvData.length === 0) {
      return { csv: "" };
    }

    // Build filter conditions
    const filterConditions = buildRawatInapFilterConditions({
      ...input,
      csvSepNumbers: csvData.map((item) => item.no_sep),
    });

    const baseQuery = createRawatInapQuery(and(filterConditions.where));
    const csvTarifMap = createCsvTarifMap(csvData);

    const filteredResults = await baseQuery;

    // Get radiologi and lab data for filtered results
    const filteredNoRawatList = filteredResults
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [filteredRadiologiData, filteredLabData] = await Promise.all([
      getRadiologiData(filteredNoRawatList),
      getLabData(filteredNoRawatList),
    ]);

    // Create maps for quick lookup
    const filteredRadiologiMap = this.createDataMap(
      filteredRadiologiData,
      "no_rawat"
    );
    const filteredLabMap = this.createDataMap(filteredLabData, "no_rawat");

    // Process results for CSV
    const processedResult = filteredResults.map((row) => {
      const tarif = csvTarifMap.get(row.no_sep || "") || 0;
      const jnsPerawatanRadiologiArray =
        filteredRadiologiMap.get(row.no_rawat) || [];

      const calculation = this.calculationService.calculateFinancials(
        row,
        tarif,
        jnsPerawatanRadiologiArray,
        input?.selectedSupport
      );

      const visiteData = this.calculationService.calculateVisiteData(
        row,
        input?.selectedSupport
      );

      return {
        ...row,
        jns_perawatan: (
          JSON.parse(row.jns_perawatan || "[]") as {
            kd_jenis_prw: string;
            nm_perawatan: string;
          }[]
        ).filter((item) => item !== null),
        jns_perawatan_radiologi:
          filteredRadiologiMap.get(row.no_rawat || "") || [],
        jns_perawatan_lab: filteredLabMap.get(row.no_rawat || "") || [],
        tarif_from_csv: csvTarifMap.get(row.no_sep || "") || undefined,
        // Visite data
        visite_dpjp_utama: visiteData.visiteDpjpUtama,
        visite_konsul_anastesi: visiteData.visiteKonsul1.length,
        visite_konsul_2: visiteData.visiteKonsul2.length,
        visite_konsul_3: visiteData.visiteKonsul3.length,
        visite_dokter_umum: visiteData.visiteDokterUmum.length,
        total_visite: visiteData.totalVisite,
        // Financial data
        alokasi: calculation.alokasi,
        dpjp_ranap: calculation.dpjp_ranap,
        remun_dpjp_utama: calculation.remun_dpjp_utama,
        remun_konsul_anastesi: calculation.remun_konsul_anastesi,
        remun_konsul_2: calculation.remun_konsul_2,
        remun_konsul_3: calculation.remun_konsul_3,
        remun_dokter_umum: calculation.remun_dokter_umum,
        remun_lab: calculation.remun_lab,
        remun_rad: calculation.remun_rad,
        remun_operator: calculation.remun_operator,
        remun_anestesi: calculation.remun_anestesi,
        yang_terbagi: calculation.yang_terbagi,
        percent_dari_klaim: calculation.percent_dari_klaim,
        // Legacy fields for compatibility
        laboratorium: calculation.remun_lab,
        radiologi: calculation.remun_rad,
        operator: calculation.remun_operator,
        anestesi: calculation.remun_anestesi,
      };
    });

    // Calculate totals using the filtered results
    const totals = filteredResults.reduce((acc, row) => {
      const tarif = csvTarifMap.get(row.no_sep || "") || 0;
      const jnsPerawatanRadiologiArray =
        filteredRadiologiMap.get(row.no_rawat) || [];
      const calculation = this.calculationService.calculateFinancials(
        row,
        tarif,
        jnsPerawatanRadiologiArray,
        input?.selectedSupport
      );
      return accumulateTotals(acc, tarif, calculation);
    }, createEmptyTotals());

    // Create totals row
    const totalsRow = this.createTotalsRow(totals);

    // Add totals row to the data
    const dataWithTotals = [...processedResult, totalsRow];

    // Convert to CSV
    const csv = convertToCsv(dataWithTotals, {
      fields: [
        "tgl_masuk",
        "tgl_keluar",
        "no_rekam_medis",
        "nm_pasien",
        "no_sep",
        "kamar",
        "nm_dokter",
        "total_permintaan_lab",
        "total_permintaan_radiologi",
        "visite_dpjp_utama",
        "visite_konsul_anastesi",
        "visite_konsul_2",
        "visite_konsul_3",
        "visite_dokter_umum",
        "hari_rawat",
        "total_visite",
        "tarif_from_csv",
        "alokasi",
        "dpjp_ranap",
        "remun_dpjp_utama",
        "remun_konsul_anastesi",
        "remun_konsul_2",
        "remun_konsul_3",
        "remun_dokter_umum",
        "remun_lab",
        "remun_rad",
        "remun_operator",
        "remun_anestesi",
        "yang_terbagi",
        "percent_dari_klaim",
      ],
      fieldLabels: {
        tgl_masuk: "Tanggal Masuk",
        tgl_keluar: "Tanggal Keluar",
        no_rekam_medis: "No RM",
        nm_pasien: "Nama Pasien",
        no_sep: "No SEP",
        kamar: "Kamar",
        nm_dokter: "DPJP",
        total_permintaan_lab: "Lab",
        total_permintaan_radiologi: "Radiologi",
        visite_dpjp_utama: "Visite DPJP Utama",
        visite_konsul_anastesi: "Visite Konsul Anastesi",
        visite_konsul_2: "Visite Konsul 2",
        visite_konsul_3: "Visite Konsul 3",
        visite_dokter_umum: "Visite Dokter Umum",
        hari_rawat: "Hari Rawat",
        total_visite: "Total Visite",
        tarif_from_csv: "Total Tarif",
        alokasi: "Alokasi",
        dpjp_ranap: "DPJP Ranap",
        remun_dpjp_utama: "Remun DPJP Utama",
        remun_konsul_anastesi: "Remun Konsul Anastesi",
        remun_konsul_2: "Remun Konsul 2",
        remun_konsul_3: "Remun Konsul 3",
        remun_dokter_umum: "Remun Dokter Umum",
        remun_lab: "Remun Lab",
        remun_rad: "Remun Radiologi",
        remun_operator: "Remun Operator",
        remun_anestesi: "Remun Anestesi",
        yang_terbagi: "Yang Terbagi",
        percent_dari_klaim: "Persentase Dari Klaim",
      },
    });

    return { csv };
  }

  /**
   * Create a map from array data for quick lookup
   */
  private createDataMap<T extends Record<string, any>>(
    data: T[],
    keyField: keyof T
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    data.forEach((item) => {
      const key = item[keyField] as string;
      if (key) {
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(item);
      }
    });
    return map;
  }

  /**
   * Create totals row for CSV
   */
  private createTotalsRow(totals: any) {
    return {
      tgl_masuk: "",
      tgl_keluar: "",
      no_rekam_medis: "",
      nm_pasien: "TOTAL",
      no_sep: "",
      kamar: "",
      nm_dokter: "",
      total_permintaan_lab: "",
      total_permintaan_radiologi: "",
      visite_dpjp_utama: "",
      visite_konsul_anastesi: "",
      visite_konsul_2: "",
      visite_konsul_3: "",
      visite_dokter_umum: "",
      hari_rawat: "",
      total_visite: "",
      tarif_from_csv: Math.round(totals.totalTarif),
      alokasi: Math.round(totals.totalAlokasi),
      dpjp_ranap: Math.round(totals.totalDpjpRanap),
      remun_dpjp_utama: Math.round(totals.totalRemunDpjp),
      remun_konsul_anastesi: Math.round(totals.totalRemunKonsulAnestesi),
      remun_konsul_2: Math.round(totals.totalRemunKonsul2),
      remun_konsul_3: 0, // Not tracked separately in totals
      remun_dokter_umum: Math.round(totals.totalRemunDokterUmum),
      remun_lab: Math.round(totals.totalRemunLab),
      remun_rad: Math.round(totals.totalRemunRadiologi),
      remun_operator: Math.round(totals.totalRemunOperator),
      remun_anestesi: Math.round(totals.totalRemunAnestesi),
      yang_terbagi: Math.round(totals.totalYangTerbagi),
      percent_dari_klaim:
        totals.count > 0
          ? Math.round(totals.totalPercentDariKlaim / totals.count)
          : 0,
    };
  }
}
