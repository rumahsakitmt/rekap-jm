import { and } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap-filter-utils";
import {
  createRawatInapQuery,
  createRawatInapSummaryQuery,
  getRadiologiData,
  getLabData,
} from "@/lib/rawat-inap-query-builder";
import { readCsvFile, createCsvTarifMap, type CsvData } from "@/lib/csv-utils";
import { differenceInDays } from "date-fns";
import {
  calculateRawatInapFinancials,
  extractRawatInapVisiteData,
  accumulateTotals,
  createEmptyTotals,
  type TotalsAccumulator,
} from "@/lib/calculation-utils";
import type {
  RawatInapFilterInput,
  RawatInapData,
  RawatInapSummaryData,
  RadiologiData,
  LabData,
  ProcessedRawatInapData,
  RawatInapResponse,
} from "./types";

export class RawatInapDataService {
  /**
   * Get rawat inap data with filtering and pagination
   */
  async getRawatInapData(
    input: RawatInapFilterInput
  ): Promise<RawatInapResponse> {
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

    const baseQuery = createRawatInapQuery(and(filterConditions.where));
    const csvTarifMap = createCsvTarifMap(csvData);

    // Get total count for pagination
    const totalCount = await baseQuery.then((results) => results.length);

    // Calculate pagination
    const limit = input?.limit || 50;
    const offset = input?.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalCount / limit);

    // Calculate totals if requested
    let totals: TotalsAccumulator | null = null;
    if (input?.includeTotals) {
      totals = await this.calculateTotals(
        baseQuery,
        csvTarifMap,
        input?.selectedSupport
      );
    }

    // Get paginated data
    const rawatInap = await baseQuery.offset(offset).limit(limit);

    // Process the data
    const processedData = await this.processRawatInapData(
      rawatInap,
      csvTarifMap,
      input?.selectedSupport
    );

    return {
      data: processedData,
      totals: totals
        ? {
            ...totals,
            averagePercentDariKlaim:
              totals.count > 0
                ? Math.round(totals.totalPercentDariKlaim / totals.count)
                : 0,
          }
        : null,
      pagination: {
        total: totalCount,
        limit,
        offset,
        page,
        totalPages,
      },
    };
  }

  /**
   * Get summary data for detailed reports
   */
  async getSummaryData(
    input: RawatInapFilterInput
  ): Promise<RawatInapSummaryData[]> {
    let csvData: CsvData[] = [];
    if (input?.filename) {
      csvData = await readCsvFile(input.filename);
    }

    const filterConditions = buildRawatInapFilterConditions({
      ...input,
      csvSepNumbers: csvData.map((item) => item.no_sep),
    });

    const query = createRawatInapSummaryQuery(and(filterConditions.where));
    return await query;
  }

  /**
   * Process rawat inap data with calculations
   */
  private async processRawatInapData(
    rawatInap: RawatInapData[],
    csvTarifMap: Map<string, number>,
    selectedSupport?: string
  ): Promise<ProcessedRawatInapData[]> {
    // Get radiologi and lab data
    const noRawatList = rawatInap
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [radiologiData, labData] = await Promise.all([
      getRadiologiData(noRawatList) as Promise<RadiologiData[]>,
      getLabData(noRawatList) as Promise<LabData[]>,
    ]);

    // Create maps for quick lookup
    const radiologiMap = this.createDataMap(radiologiData, "no_rawat");
    const labMap = this.createDataMap(labData, "no_rawat");

    // Process each record
    return rawatInap.map((item) => {
      const jnsPerawatanArray = JSON.parse(item.jns_perawatan || "[]");
      const jnsPerawatanRadiologiArray = radiologiMap.get(item.no_rawat) || [];
      const jnsPerawatanLabArray = labMap.get(item.no_rawat) || [];
      const tarif = csvTarifMap.get(item.no_sep || "") || 0;

      const visiteData = extractRawatInapVisiteData(
        item.jns_perawatan || "[]",
        item.nm_dokter || "",
        item.tgl_masuk,
        item.tgl_keluar,
        selectedSupport
      );

      const calculation = calculateRawatInapFinancials({
        tarif,
        total_permintaan_lab: item.total_permintaan_lab || 0,
        total_permintaan_radiologi: item.total_permintaan_radiologi || 0,
        jns_perawatan: item.jns_perawatan || "[]",
        jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
        nm_dokter: item.nm_dokter || "",
        tgl_masuk: item.tgl_masuk,
        tgl_keluar: item.tgl_keluar,
        has_operasi: item.has_operasi || false,
        selectedSupport,
      });

      return {
        ...item,
        visite_dpjp_utama: visiteData.visiteDpjpUtama,
        visite_konsul_1: visiteData.finalVisiteKonsul1,
        visite_konsul_2: visiteData.finalVisiteKonsul2,
        visite_konsul_3: visiteData.finalVisiteKonsul3,
        visite_dokter_umum: visiteData.visiteDokterUmum,
        jns_perawatan: jnsPerawatanArray,
        jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
        jns_perawatan_lab: jnsPerawatanLabArray,
        hari_rawat:
          item.tgl_masuk && item.tgl_keluar
            ? differenceInDays(item.tgl_keluar, item.tgl_masuk)
            : 1,
        tarif_from_csv: csvTarifMap.get(item.no_sep || "") || undefined,
        totalVisite: visiteData.totalVisite,
        ...calculation,
      };
    });
  }

  /**
   * Calculate totals for all data
   */
  private async calculateTotals(
    baseQuery: Promise<RawatInapData[]>,
    csvTarifMap: Map<string, number>,
    selectedSupport?: string
  ): Promise<TotalsAccumulator> {
    const allResults = await baseQuery;
    const noRawatList = allResults
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [radiologiData, labData] = await Promise.all([
      getRadiologiData(noRawatList) as Promise<RadiologiData[]>,
      getLabData(noRawatList) as Promise<LabData[]>,
    ]);

    const radiologiMap = this.createDataMap(radiologiData, "no_rawat");

    return allResults.reduce((acc, row) => {
      const tarif = csvTarifMap.get(row.no_sep || "") || 0;
      const jnsPerawatanRadiologiArray = radiologiMap.get(row.no_rawat) || [];
      const calculation = calculateRawatInapFinancials({
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
      });
      return accumulateTotals(acc, tarif, calculation);
    }, createEmptyTotals());
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
      if (key && !map.has(key)) {
        map.set(key, []);
      }
      if (key) {
        map.get(key)!.push(item);
      }
    });
    return map;
  }
}
