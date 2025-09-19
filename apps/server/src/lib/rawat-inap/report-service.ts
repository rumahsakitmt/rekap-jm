import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap-filter-utils";
import {
  createRawatInapSummaryQuery,
  getRadiologiData,
  getLabData,
} from "@/lib/rawat-inap/rawat-inap-query-builder";
import { readCsvFile, createCsvTarifMap, type CsvData } from "@/lib/csv-utils";
import { RawatInapCalculationService } from "./calculation-service";
import type {
  RawatInapFilterInput,
  RawatInapSummaryData,
  DetailedReportResponse,
} from "./types";

export class RawatInapReportService {
  private calculationService = new RawatInapCalculationService();

  /**
   * Generate detailed monthly report
   */
  async generateDetailedMonthlyReport(
    input: RawatInapFilterInput
  ): Promise<DetailedReportResponse> {
    // Load CSV data if filename provided
    let csvData: CsvData[] = [];
    if (input?.filename) {
      csvData = await readCsvFile(input.filename);
    }

    // Build filter conditions
    const filterConditions = buildRawatInapFilterConditions({
      ...input,
      csvSepNumbers: csvData.map((item) => item.no_sep),
    });

    const query = createRawatInapSummaryQuery(and(filterConditions.where));
    const results = await query;
    const csvTarifMap = createCsvTarifMap(csvData);

    // Get radiologi and lab data
    const noRawatList = results
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [radiologiData, labData] = await Promise.all([
      getRadiologiData(noRawatList),
      getLabData(noRawatList),
    ]);

    // Create maps for quick lookup
    const radiologiMap = this.createDataMap(radiologiData, "no_rawat");
    const labMap = this.createDataMap(labData, "no_rawat");

    // Initialize aggregation maps
    const dpjpMap = new Map<string, { name: string; total: number }>();
    const konsulAnastesiMap = new Map<
      string,
      { name: string; total: number }
    >();
    const konsulMap = new Map<
      string,
      {
        name: string;
        konsul1: number;
        konsul2: number;
        total: number;
      }
    >();
    const dokterUmumMap = new Map<string, { name: string; total: number }>();
    const operatorMap = new Map<string, { name: string; total: number }>();
    const anestesiMap = new Map<string, { name: string; total: number }>();
    const anestesiPenggantiMap = new Map<
      string,
      { name: string; total: number }
    >();
    const penunjangMap = new Map<string, { name: string; total: number }>();

    let labTotal = 0;
    let radTotal = 0;
    let grandTotal = 0;

    // Process each result
    for (const row of results) {
      const tarif = csvTarifMap.get(row.no_sep || "") || 0;
      const jnsPerawatanRadiologiArray = radiologiMap.get(row.no_rawat) || [];

      const calculation = this.calculationService.calculateFinancials(
        row,
        tarif,
        jnsPerawatanRadiologiArray
      );

      const visiteData = this.calculationService.calculateVisiteData(row);

      // Aggregate DPJP Utama
      this.aggregateDpjpUtama(dpjpMap, row, calculation.remun_dpjp_utama);

      // Aggregate Konsul Anastesi
      this.aggregateKonsulAnastesi(
        konsulAnastesiMap,
        visiteData,
        calculation.remun_konsul_anastesi
      );

      // Aggregate Konsul 2
      this.aggregateKonsul2(konsulMap, visiteData, calculation.remun_konsul_2);

      // Aggregate Dokter Umum
      this.aggregateDokterUmum(
        dokterUmumMap,
        visiteData,
        calculation.remun_dokter_umum
      );

      // Aggregate Operator
      this.aggregateOperator(operatorMap, row, calculation.remun_operator);

      // Aggregate Anestesi
      this.aggregateAnestesi(
        anestesiMap,
        row,
        calculation.remun_anestesi,
        calculation.remun_anastesi_pengganti
      );

      // Aggregate Penunjang
      this.aggregatePenunjang(
        penunjangMap,
        radiologiMap,
        labMap,
        row,
        calculation.remun_lab + calculation.remun_rad
      );

      labTotal += calculation.remun_lab;
      radTotal += calculation.remun_rad;
      grandTotal +=
        calculation.remun_dpjp_utama +
        calculation.remun_konsul_anastesi +
        calculation.remun_konsul_2 +
        calculation.remun_dokter_umum +
        calculation.remun_operator +
        calculation.remun_anestesi +
        calculation.remun_anastesi_pengganti +
        calculation.remun_lab +
        calculation.remun_rad;
    }

    // Convert maps to sorted arrays
    const dpjpTotals = this.convertMapToSortedArray(dpjpMap);
    const konsulAnastesiTotals =
      this.convertMapToSortedArray(konsulAnastesiMap);
    const konsulTotals = this.convertKonsulMapToSortedArray(konsulMap);
    const dokterUmumTotals = this.convertMapToSortedArray(dokterUmumMap);
    const operatorTotals = this.convertMapToSortedArray(operatorMap);
    const anestesiTotals = this.convertMapToSortedArray(anestesiMap);
    const anestesiPenggantiTotals =
      this.convertMapToSortedArray(anestesiPenggantiMap);
    const penunjangTotals = this.convertMapToSortedArray(penunjangMap);

    // Create monthly summary
    const rekapBulanan = this.createMonthlySummary([
      ...dpjpTotals,
      ...konsulTotals,
      ...dokterUmumTotals,
      ...konsulAnastesiTotals,
      ...operatorTotals,
      ...anestesiTotals,
      ...anestesiPenggantiTotals,
      ...penunjangTotals,
    ]);

    return {
      dpjp: dpjpTotals,
      dpjpTotal: dpjpTotals.reduce((sum, item) => sum + item.total, 0),
      konsulAnastesi: konsulAnastesiTotals,
      konsulAnastesiTotal: konsulAnastesiTotals.reduce(
        (sum, item) => sum + item.total,
        0
      ),
      konsul: konsulTotals,
      konsulTotal: konsulTotals.reduce((sum, item) => sum + item.total, 0),
      dokterUmum: dokterUmumTotals,
      dokterUmumTotal: dokterUmumTotals.reduce(
        (sum, item) => sum + item.total,
        0
      ),
      operator: operatorTotals,
      operatorTotal: operatorTotals.reduce((sum, item) => sum + item.total, 0),
      anestesi: anestesiTotals,
      anestesiTotal: anestesiTotals.reduce((sum, item) => sum + item.total, 0),
      penunjang: penunjangTotals,
      penunjangTotal: penunjangTotals.reduce(
        (sum, item) => sum + item.total,
        0
      ),
      labTotal: Math.round(labTotal),
      radTotal: Math.round(radTotal),
      rekapBulanan,
      grandTotal: Math.round(grandTotal),
    };
  }

  private aggregateDpjpUtama(
    dpjpMap: Map<string, { name: string; total: number }>,
    row: RawatInapSummaryData,
    remun_dpjp_utama: number
  ) {
    const dpjpKey = row.kd_dokter || "Unknown";
    const dpjpName = row.nm_dokter || "Unknown";
    if (dpjpMap.has(dpjpKey)) {
      dpjpMap.get(dpjpKey)!.total += remun_dpjp_utama;
    } else {
      dpjpMap.set(dpjpKey, {
        name: dpjpName,
        total: remun_dpjp_utama,
      });
    }
  }

  private aggregateKonsulAnastesi(
    konsulAnastesiMap: Map<string, { name: string; total: number }>,
    visiteData: any,
    remun_konsul_anastesi: number
  ) {
    if (remun_konsul_anastesi > 0) {
      const anastesiDoctors = visiteData.finalVisiteKonsul1.map((k: any) => ({
        kd_dokter: k.kd_dokter,
        nm_dokter: k.nm_dokter,
      }));

      for (const doctor of anastesiDoctors) {
        const konsulKey = doctor.kd_dokter;
        const konsulName = doctor.nm_dokter;

        if (konsulAnastesiMap.has(konsulKey)) {
          const existing = konsulAnastesiMap.get(konsulKey)!;
          existing.total += remun_konsul_anastesi;
        } else {
          konsulAnastesiMap.set(konsulKey, {
            name: konsulName,
            total: remun_konsul_anastesi,
          });
        }
      }
    }
  }

  private aggregateKonsul2(
    konsulMap: Map<string, any>,
    visiteData: any,
    remun_konsul_2: number
  ) {
    if (remun_konsul_2 > 0) {
      const konsul2Doctors = visiteData.finalVisiteKonsul2.map((k: any) => ({
        kd_dokter: k.kd_dokter,
        nm_dokter: k.nm_dokter,
      }));

      for (const doctor of konsul2Doctors) {
        const konsulKey = doctor.kd_dokter;
        const konsulName = doctor.nm_dokter;

        if (konsulMap.has(konsulKey)) {
          const existing = konsulMap.get(konsulKey)!;
          existing.konsul2 += remun_konsul_2 / konsul2Doctors.length;
          existing.total += remun_konsul_2 / konsul2Doctors.length;
        } else {
          konsulMap.set(konsulKey, {
            name: konsulName,
            konsul1: 0,
            konsul2: remun_konsul_2 / konsul2Doctors.length,
            total: remun_konsul_2 / konsul2Doctors.length,
          });
        }
      }
    }
  }

  private aggregateDokterUmum(
    dokterUmumMap: Map<string, { name: string; total: number }>,
    visiteData: any,
    remun_dokter_umum: number
  ) {
    if (remun_dokter_umum > 0) {
      const umumDoctors = visiteData.visiteDokterUmum.map((k: any) => ({
        kd_dokter: k.kd_dokter,
        nm_dokter: k.nm_dokter,
      }));

      for (const doctor of umumDoctors) {
        const umumKey = doctor.kd_dokter;
        const umumName = doctor.nm_dokter;

        if (dokterUmumMap.has(umumKey)) {
          dokterUmumMap.get(umumKey)!.total +=
            remun_dokter_umum / umumDoctors.length;
        } else {
          dokterUmumMap.set(umumKey, {
            name: umumName,
            total: remun_dokter_umum / umumDoctors.length,
          });
        }
      }
    }
  }

  private aggregateOperator(
    operatorMap: Map<string, { name: string; total: number }>,
    row: RawatInapSummaryData,
    remun_operator: number
  ) {
    if (remun_operator > 0 && row.operator) {
      const operatorKey = row.operator;
      const operatorName = row.operator;

      if (operatorMap.has(operatorKey)) {
        operatorMap.get(operatorKey)!.total += remun_operator;
      } else {
        operatorMap.set(operatorKey, {
          name: operatorName,
          total: remun_operator,
        });
      }
    }
  }

  private aggregateAnestesi(
    anestesiMap: Map<string, { name: string; total: number }>,
    row: RawatInapSummaryData,
    remun_anestesi: number,
    remun_anastesi_pengganti: number
  ) {
    if (remun_anestesi > 0 && row.anestesi) {
      const isAnestesiPengganti = row.anestesi.includes(":");
      const anestesiKey = isAnestesiPengganti
        ? row.anestesi.split(":")[1]
        : row.anestesi;
      const anestesiName = isAnestesiPengganti
        ? row.anestesi.split(":")[1]
        : row.anestesi;
      const remun = isAnestesiPengganti
        ? remun_anastesi_pengganti
        : remun_anestesi;

      if (anestesiMap.has(anestesiKey)) {
        anestesiMap.get(anestesiKey)!.total += remun;
      } else {
        anestesiMap.set(anestesiKey, {
          name: anestesiName,
          total: remun,
        });
      }
    }
  }

  private aggregateAnestesiPengganti(
    anestesiPenggantiMap: Map<string, { name: string; total: number }>,
    row: RawatInapSummaryData,
    remun_anastesi_pengganti: number
  ) {
    if (remun_anastesi_pengganti > 0 && row.anestesi) {
      const anestesiName = row.anestesi.split(":")[1];

      if (anestesiPenggantiMap.has(anestesiName)) {
        anestesiPenggantiMap.get(anestesiName)!.total +=
          remun_anastesi_pengganti;
      } else {
        anestesiPenggantiMap.set(anestesiName, {
          name: anestesiName,
          total: remun_anastesi_pengganti,
        });
      }
    }
  }

  private aggregatePenunjang(
    penunjangMap: Map<string, { name: string; total: number }>,
    radiologiMap: Map<string, any[]>,
    labMap: Map<string, any[]>,
    row: RawatInapSummaryData,
    penunjangRemun: number
  ) {
    const penunjangDoctors: { kd_dokter: string; nm_dokter: string }[] = [];

    // Get doctors from radiologi data
    const radiologiRecords = radiologiMap.get(row.no_rawat) || [];
    radiologiRecords.forEach((rad: any) => {
      if (rad.kd_dokter && rad.nm_dokter) {
        penunjangDoctors.push({
          kd_dokter: rad.kd_dokter,
          nm_dokter: rad.nm_dokter,
        });
      }
    });

    // Get doctors from lab data
    const labRecords = labMap.get(row.no_rawat) || [];
    labRecords.forEach((lab: any) => {
      if (lab.kd_dokter && lab.nm_dokter) {
        penunjangDoctors.push({
          kd_dokter: lab.kd_dokter,
          nm_dokter: lab.nm_dokter,
        });
      }
    });

    // Remove duplicates based on kd_dokter
    const uniquePenunjangDoctors = penunjangDoctors.filter(
      (doctor, index, self) =>
        index === self.findIndex((d) => d.kd_dokter === doctor.kd_dokter)
    );

    // Distribute penunjang remuneration
    if (penunjangRemun > 0 && uniquePenunjangDoctors.length > 0) {
      for (const doctor of uniquePenunjangDoctors) {
        const penunjangKey = doctor.kd_dokter;
        const penunjangName = doctor.nm_dokter;

        if (penunjangMap.has(penunjangKey)) {
          penunjangMap.get(penunjangKey)!.total +=
            penunjangRemun / uniquePenunjangDoctors.length;
        } else {
          penunjangMap.set(penunjangKey, {
            name: penunjangName,
            total: penunjangRemun / uniquePenunjangDoctors.length,
          });
        }
      }
    }
  }

  private createDataMap<T extends Record<string, any>>(
    data: T[],
    keyField: keyof T
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    data.forEach((item) => {
      const key = item[keyField] as string;
      if (key && !map.has(key)) {
        map.set(key, []);
      }
      if (key) {
        map.get(key)!.push(item);
      }
    });
    return map;
  }

  private convertMapToSortedArray(
    map: Map<string, { name: string; total: number }>
  ): Array<{ name: string; total: number }> {
    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        name: item.name,
        total: Math.round(item.total),
      }));
  }

  private convertKonsulMapToSortedArray(map: Map<string, any>): Array<{
    name: string;
    konsul1: number;
    konsul2: number;
    total: number;
  }> {
    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        name: item.name,
        konsul1: Math.round(item.konsul1),
        konsul2: Math.round(item.konsul2),
        total: Math.round(item.total),
      }));
  }

  private createMonthlySummary(
    allTotals: Array<{ name: string; total: number }>
  ): Array<{ name: string; total: number }> {
    const rekapBulanan = new Map<string, number>();

    for (const item of allTotals) {
      rekapBulanan.set(
        item.name,
        (rekapBulanan.get(item.name) || 0) + item.total
      );
    }

    return Array.from(rekapBulanan.entries())
      .map(([name, total]) => ({ name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);
  }
}
