import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap/rawat-inap-filter-utils";
import {
  getRadiologiData,
  getLabData,
} from "@/lib/rawat-inap/rawat-inap-query-builder";
import { readCsvFile, createCsvTarifMap } from "@/lib/csv-utils";
import { accumulateTotals, createEmptyTotals } from "@/lib/calculation-utils";
import { RawatInapCalculationService } from "./calculation-service";
import type { RawatInapFilterInput } from "./types";
import { RawatInapDataService } from "./data-service";

export class RawatInapXlsxService {
  private calculationService = new RawatInapCalculationService();
  private dataService = new RawatInapDataService();

  async generateXlsxDownload(input: RawatInapFilterInput): Promise<Buffer> {
    if (!input.filename) {
      return Buffer.from("");
    }

    const csvData = await readCsvFile(input.filename);

    if (csvData.length === 0) {
      return Buffer.from("");
    }

    const filterConditions = buildRawatInapFilterConditions({
      ...input,
      csvSepNumbers: csvData.map((item) => item.no_sep),
    });

    const csvTarifMap = createCsvTarifMap(csvData);

    const filteredResults =
      await this.dataService.getRawatInapDenganJnsPerawatan(
        and(filterConditions.where)
      );

    const filteredNoRawatList = filteredResults
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [filteredRadiologiData, filteredLabData] = await Promise.all([
      getRadiologiData(filteredNoRawatList),
      getLabData(filteredNoRawatList),
    ]);

    const filteredRadiologiMap = this.createDataMap(
      filteredRadiologiData,
      "no_rawat"
    );
    const filteredLabMap = this.createDataMap(filteredLabData, "no_rawat");

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

      const visiteData = this.calculationService.calculateVisiteData(row);

      return {
        ...row,
        jns_perawatan: row.jns_perawatan.filter((item) => item !== null),
        jns_perawatan_radiologi:
          filteredRadiologiMap.get(row.no_rawat || "") || [],
        jns_perawatan_lab: filteredLabMap.get(row.no_rawat || "") || [],
        tarif_from_csv: csvTarifMap.get(row.no_sep || "") || undefined,
        visite_dpjp_utama: visiteData.visiteDpjpUtama,
        visite_konsul_anastesi: visiteData.visiteKonsul1.length,
        visite_konsul_2: visiteData.visiteKonsul2.length,
        visite_dokter_umum: visiteData.visiteDokterUmum.length,
        total_visite: visiteData.totalVisite,
        alokasi: calculation.alokasi,
        dpjp_ranap: calculation.dpjp_ranap,
        remun_dpjp_utama: calculation.remun_dpjp_utama,
        remun_konsul_anastesi: calculation.remun_konsul_anastesi,
        remun_konsul_2: calculation.remun_konsul_2,
        remun_dokter_umum: calculation.remun_dokter_umum,
        remun_lab: calculation.remun_lab,
        remun_rad: calculation.remun_rad,
        remun_operator: calculation.remun_operator,
        remun_anestesi: calculation.remun_anestesi,
        yang_terbagi: calculation.yang_terbagi,
        percent_dari_klaim: calculation.percent_dari_klaim,
        laboratorium: calculation.remun_lab,
        radiologi: calculation.remun_rad,
        operator: calculation.remun_operator,
        anestesi: calculation.remun_anestesi,
      };
    });

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

    const totalsRow = this.createTotalsRow(totals);
    const dataWithTotals = [...processedResult, totalsRow];

    const XLSX = require("xlsx");

    const fields = [
      "tgl_masuk",
      "tgl_keluar",
      "no_rkm_medis",
      "nm_pasien",
      "no_sep",
      "kamar",
      "nm_dokter",
      "total_permintaan_lab",
      "total_permintaan_radiologi",
      "visite_dpjp_utama",
      "visite_konsul_anastesi",
      "visite_konsul_2",
      "visite_dokter_umum",
      "hari_rawat",
      "total_visite",
      "tarif_from_csv",
      "alokasi",
      "dpjp_ranap",
      "remun_dpjp_utama",
      "remun_konsul_anastesi",
      "remun_konsul_2",
      "remun_dokter_umum",
      "remun_lab",
      "remun_rad",
      "remun_operator",
      "remun_anestesi",
      "yang_terbagi",
      "percent_dari_klaim",
    ];

    const fieldLabels = {
      tgl_masuk: "Tanggal Masuk",
      tgl_keluar: "Tanggal Keluar",
      no_rkm_medis: "No RM",
      nm_pasien: "Nama Pasien",
      no_sep: "No SEP",
      kamar: "Kamar",
      nm_dokter: "DPJP",
      total_permintaan_lab: "Lab",
      total_permintaan_radiologi: "Radiologi",
      visite_dpjp_utama: "Visite DPJP Utama",
      visite_konsul_anastesi: "Visite Konsul Anastesi",
      visite_konsul_2: "Visite Konsul 2",
      visite_dokter_umum: "Visite Dokter Umum",
      hari_rawat: "Hari Rawat",
      total_visite: "Total Visite",
      tarif_from_csv: "Total Tarif",
      alokasi: "Alokasi",
      dpjp_ranap: "DPJP Ranap",
      remun_dpjp_utama: "Remun DPJP Utama",
      remun_konsul_anastesi: "Remun Konsul Anastesi",
      remun_konsul_2: "Remun Konsul 2",
      remun_dokter_umum: "Remun Dokter Umum",
      remun_lab: "Remun Lab",
      remun_rad: "Remun Radiologi",
      remun_operator: "Remun Operator",
      remun_anestesi: "Remun Anestesi",
      yang_terbagi: "Yang Terbagi",
      percent_dari_klaim: "Persentase Dari Klaim",
    };

    const headers = fields.map(
      (field) => fieldLabels[field as keyof typeof fieldLabels]
    );
    const worksheetData = [
      headers,
      ...dataWithTotals.map((row) =>
        fields.map((field) => (row as any)[field] || "")
      ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = [
      { wch: 15 }, // tgl_masuk
      { wch: 15 }, // tgl_keluar
      { wch: 15 }, // no_rekam_medis
      { wch: 25 }, // nm_pasien
      { wch: 25 }, // no_sep
      { wch: 20 }, // kamar
      { wch: 25 }, // nm_dokter
      { wch: 8 }, // total_permintaan_lab
      { wch: 8 }, // total_permintaan_radiologi
      { wch: 8 }, // visite_dpjp_utama
      { wch: 8 }, // visite_konsul_anastesi
      { wch: 8 }, // visite_konsul_2
      { wch: 8 }, // visite_dokter_umum
      { wch: 8 }, // hari_rawat
      { wch: 8 }, // total_visite
      { wch: 15 }, // tarif_from_csv
      { wch: 12 }, // alokasi
      { wch: 12 }, // dpjp_ranap
      { wch: 12 }, // remun_dpjp_utama
      { wch: 12 }, // remun_konsul_anastesi
      { wch: 12 }, // remun_konsul_2
      { wch: 12 }, // remun_dokter_umum
      { wch: 12 }, // remun_lab
      { wch: 12 }, // remun_rad
      { wch: 12 }, // remun_operator
      { wch: 12 }, // remun_anestesi
      { wch: 12 }, // yang_terbagi
      { wch: 15 }, // percent_dari_klaim
    ];
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rawat Inap");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

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

  private createTotalsRow(totals: any) {
    return {
      tgl_masuk: "",
      tgl_keluar: "",
      no_rkm_medis: "",
      nm_pasien: "TOTAL",
      no_sep: "",
      kamar: "",
      nm_dokter: "",
      total_permintaan_lab: "",
      total_permintaan_radiologi: "",
      visite_dpjp_utama: "",
      visite_konsul_anastesi: "",
      visite_konsul_2: "",
      visite_dokter_umum: "",
      hari_rawat: "",
      total_visite: "",
      tarif_from_csv: Math.round(totals.totalTarif),
      alokasi: Math.round(totals.totalAlokasi),
      dpjp_ranap: Math.round(totals.totalDpjpRanap),
      remun_dpjp_utama: Math.round(totals.totalRemunDpjp),
      remun_konsul_anastesi: Math.round(totals.totalRemunKonsulAnestesi),
      remun_konsul_2: Math.round(totals.totalRemunKonsul2),
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
