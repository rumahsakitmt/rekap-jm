import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap/rawat-inap-filter-utils";
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

  async generateDetailedMonthlyReport(
    input: RawatInapFilterInput
  ): Promise<DetailedReportResponse> {
    let csvData: CsvData[] = [];
    if (input?.filename) {
      csvData = await readCsvFile(input.filename);
    }

    const filterConditions = buildRawatInapFilterConditions({
      ...input,
      csvSepNumbers: csvData.map((item) => item.no_sep),
    });

    const query = createRawatInapSummaryQuery(and(filterConditions.where));
    const results = await query;
    const csvTarifMap = createCsvTarifMap(csvData);

    const noRawatList = results
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [radiologiData, labData] = await Promise.all([
      getRadiologiData(noRawatList),
      getLabData(noRawatList),
    ]);

    const radiologiMap = this.createDataMap(radiologiData, "no_rawat");
    const labMap = this.createDataMap(labData, "no_rawat");

    const dpjpMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();
    const konsulAnastesiMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();
    const konsulMap = new Map<
      string,
      {
        name: string;
        visite: number;
        total: number;
      }
    >();
    const dokterUmumMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();
    const operatorMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();
    const anestesiMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();
    const anestesiPenggantiMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();
    const penunjangMap = new Map<
      string,
      { name: string; visite: number; total: number }
    >();

    let labTotal = 0;
    let radTotal = 0;
    let grandTotal = 0;

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
      this.aggregateDpjpUtama(
        dpjpMap,
        row,
        calculation.remun_dpjp_utama,
        visiteData
      );

      // Aggregate Konsul Anastesi
      this.aggregateKonsulAnastesi(
        konsulAnastesiMap,
        visiteData,
        calculation.remun_konsul_anastesi
      );

      // Aggregate Visite Antar Spesialis
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

      this.aggregatePenunjang(
        penunjangMap,
        radiologiMap,
        labMap,
        row,
        calculation.remun_lab,
        calculation.remun_rad
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
    dpjpMap: Map<string, { name: string; visite: number; total: number }>,
    row: RawatInapSummaryData,
    remun_dpjp_utama: number,
    visiteData: any
  ) {
    const dpjpKey = row.kd_dokter || "Unknown";
    const dpjpName = row.nm_dokter || "Unknown";
    const visiteDpjp = visiteData.visiteDpjpUtama;
    if (dpjpMap.has(dpjpKey)) {
      const existing = dpjpMap.get(dpjpKey)!;
      existing.visite += visiteDpjp;
      existing.total += remun_dpjp_utama;
    } else {
      dpjpMap.set(dpjpKey, {
        name: dpjpName,
        visite: visiteDpjp,
        total: remun_dpjp_utama,
      });
    }
  }

  private aggregateKonsulAnastesi(
    konsulAnastesiMap: Map<
      string,
      { name: string; visite: number; total: number }
    >,
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

        const visiteKonsul1 = visiteData.visiteKonsul1.length;
        if (konsulAnastesiMap.has(konsulKey)) {
          const existing = konsulAnastesiMap.get(konsulKey)!;
          existing.visite += visiteKonsul1;
          existing.total += remun_konsul_anastesi / anastesiDoctors.length;
        } else {
          konsulAnastesiMap.set(konsulKey, {
            name: konsulName,
            visite: visiteKonsul1,
            total: remun_konsul_anastesi / anastesiDoctors.length,
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

        const visiteKonsul2 = visiteData.visiteKonsul2.length;
        if (konsulMap.has(konsulKey)) {
          const existing = konsulMap.get(konsulKey)!;
          existing.visite += visiteKonsul2;
          existing.total += remun_konsul_2 / konsul2Doctors.length;
        } else {
          konsulMap.set(konsulKey, {
            name: konsulName,
            visite: visiteKonsul2,
            total: remun_konsul_2 / konsul2Doctors.length,
          });
        }
      }
    }
  }

  private aggregateDokterUmum(
    dokterUmumMap: Map<string, { name: string; visite: number; total: number }>,
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

        const visiteDokterUmum = remun_dokter_umum / umumDoctors.length / 20000;
        if (dokterUmumMap.has(umumKey)) {
          const existing = dokterUmumMap.get(umumKey)!;
          existing.visite += visiteDokterUmum;
          existing.total += remun_dokter_umum / umumDoctors.length;
        } else {
          dokterUmumMap.set(umumKey, {
            name: umumName,
            visite: visiteDokterUmum,
            total: remun_dokter_umum / umumDoctors.length,
          });
        }
      }
    }
  }

  private aggregateOperator(
    operatorMap: Map<string, { name: string; visite: number; total: number }>,
    row: RawatInapSummaryData,
    remun_operator: number
  ) {
    if (remun_operator > 0 && row.operator) {
      const operatorKey = row.operator;
      const operatorName = row.operator;

      if (operatorMap.has(operatorKey)) {
        const existing = operatorMap.get(operatorKey)!;
        existing.visite += 1;
        existing.total += remun_operator;
      } else {
        operatorMap.set(operatorKey, {
          name: operatorName,
          visite: 1,
          total: remun_operator,
        });
      }
    }
  }

  private aggregateAnestesi(
    anestesiMap: Map<string, { name: string; visite: number; total: number }>,
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
        const existing = anestesiMap.get(anestesiKey)!;
        existing.visite += 1;
        existing.total += remun;
      } else {
        anestesiMap.set(anestesiKey, {
          name: anestesiName,
          visite: 1,
          total: remun,
        });
      }
    }
  }

  private aggregatePenunjang(
    penunjangMap: Map<string, { name: string; visite: number; total: number }>,
    radiologiMap: Map<string, any[]>,
    labMap: Map<string, any[]>,
    row: RawatInapSummaryData,
    labRemun: number,
    radRemun: number
  ) {
    const radiologiDoctors: { kd_dokter: string; nm_dokter: string }[] = [];
    const labDoctors: { kd_dokter: string; nm_dokter: string }[] = [];

    const radiologiRecords = radiologiMap.get(row.no_rawat) || [];
    radiologiRecords.forEach((rad: any) => {
      if (rad.kd_dokter && rad.nm_dokter) {
        radiologiDoctors.push({
          kd_dokter: rad.kd_dokter,
          nm_dokter: rad.nm_dokter,
        });
      }
    });

    const labRecords = labMap.get(row.no_rawat) || [];
    labRecords.forEach((lab: any) => {
      if (lab.kd_dokter && lab.nm_dokter) {
        labDoctors.push({
          kd_dokter: lab.kd_dokter,
          nm_dokter: lab.nm_dokter,
        });
      }
    });

    const uniqueRadiologiDoctors = radiologiDoctors.filter(
      (doctor, index, self) =>
        index === self.findIndex((d) => d.kd_dokter === doctor.kd_dokter)
    );

    const uniqueLabDoctors = labDoctors.filter(
      (doctor, index, self) =>
        index === self.findIndex((d) => d.kd_dokter === doctor.kd_dokter)
    );

    if (radRemun > 0 && uniqueRadiologiDoctors.length > 0) {
      for (const doctor of uniqueRadiologiDoctors) {
        const penunjangKey = doctor.kd_dokter;
        const penunjangName = doctor.nm_dokter;

        if (penunjangMap.has(penunjangKey)) {
          const existing = penunjangMap.get(penunjangKey)!;
          existing.visite += 1;
          existing.total += radRemun / uniqueRadiologiDoctors.length;
        } else {
          penunjangMap.set(penunjangKey, {
            name: penunjangName,
            visite: 1,
            total: radRemun / uniqueRadiologiDoctors.length,
          });
        }
      }
    }

    if (labRemun > 0 && uniqueLabDoctors.length > 0) {
      for (const doctor of uniqueLabDoctors) {
        const penunjangKey = doctor.kd_dokter;
        const penunjangName = doctor.nm_dokter;

        if (penunjangMap.has(penunjangKey)) {
          const existing = penunjangMap.get(penunjangKey)!;
          existing.visite += 1;
          existing.total += labRemun / uniqueLabDoctors.length;
        } else {
          penunjangMap.set(penunjangKey, {
            name: penunjangName,
            visite: 1,
            total: labRemun / uniqueLabDoctors.length,
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
    map: Map<string, { name: string; visite: number; total: number }>
  ): Array<{ name: string; visite: number; total: number }> {
    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        name: item.name,
        visite: Math.round(item.visite),
        total: Math.round(item.total),
      }));
  }

  private convertKonsulMapToSortedArray(map: Map<string, any>): Array<{
    name: string;
    visite: number;
    total: number;
  }> {
    return Array.from(map.values())
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        name: item.name,
        visite: Math.round(item.visite),
        total: Math.round(item.total),
      }));
  }

  private createMonthlySummary(
    allTotals: Array<{ name: string; visite: number; total: number }>
  ): Array<{ name: string; visite: number; total: number }> {
    const rekapBulanan = new Map<string, { visite: number; total: number }>();

    for (const item of allTotals) {
      const existing = rekapBulanan.get(item.name) || { visite: 0, total: 0 };
      rekapBulanan.set(item.name, {
        visite: existing.visite + item.visite,
        total: existing.total + item.total,
      });
    }

    return Array.from(rekapBulanan.entries())
      .map(([name, data]) => ({
        name,
        visite: Math.round(data.visite),
        total: Math.round(data.total),
      }))
      .sort((a, b) => b.total - a.total);
  }
}
