import { and, SQL } from "drizzle-orm";
import { buildRawatInapFilterConditions } from "@/lib/rawat-inap/rawat-inap-filter-utils";
import {
  createRawatInapQuery,
  getRadiologiData,
  getLabData,
  getJenisPerwatanRawatInap,
} from "@/lib/rawat-inap/rawat-inap-query-builder";
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
  async getRawatInapDenganJnsPerawatan(whereCondition?: SQL) {
    const mainData = await createRawatInapQuery(whereCondition);

    if (mainData.length === 0) {
      return mainData.map((item) => ({ ...item, jns_perawatan: [] }));
    }

    const no_rawat_list = mainData.map((item) => item.no_rawat);
    const jnsPerawatan = await getJenisPerwatanRawatInap(no_rawat_list);

    const jnsPerawatanMap = jnsPerawatan.reduce(
      (acc, perwatan) => {
        if (!acc[perwatan.no_rawat]) {
          acc[perwatan.no_rawat] = [];
        }
        acc[perwatan.no_rawat].push({
          kd_jenis_prw: perwatan.kd_jenis_prw,
          nm_perawatan: perwatan.nm_perawatan,
          kd_dokter: perwatan.kd_dokter,
          nm_dokter: perwatan.nm_dokter,
          nm_bangsal: perwatan.nm_bangsal,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    return mainData.map((item) => ({
      ...item,
      jns_perawatan: jnsPerawatanMap[item.no_rawat] || [],
    }));
  }

  async getRawatInapData(
    input: RawatInapFilterInput
  ): Promise<RawatInapResponse> {
    let csvData: CsvData[] = [];
    if (input?.filename) {
      csvData = await readCsvFile(input.filename);
    }
    const filterConditions = buildRawatInapFilterConditions({
      ...input,
      csvSepNumbers: csvData.map((item) => item.no_sep),
    });

    const csvTarifMap = createCsvTarifMap(csvData);
    const limit = input?.limit || 50;
    const offset = input?.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const allData = await this.getRawatInapDenganJnsPerawatan(
      and(filterConditions.where)
    );
    const totalCount = allData.length;
    const totalPages = Math.ceil(totalCount / limit);

    const paginatedData = allData.slice(offset, offset + limit);

    let totals: TotalsAccumulator | null = null;
    if (input?.includeTotals) {
      totals = await this.calculateTotals(
        allData,
        csvTarifMap,
        input?.selectedSupport
      );
    }

    const processedData = await this.processRawatInapData(
      paginatedData,
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

    const results = await this.getRawatInapDenganJnsPerawatan(
      and(filterConditions.where) as SQL
    );
    return results;
  }
  private async processRawatInapData(
    jenisPerawatanRanap: RawatInapData[],
    csvTarifMap: Map<string, number>,
    selectedSupport?: string
  ): Promise<ProcessedRawatInapData[]> {
    if (jenisPerawatanRanap.length === 0) {
      return [];
    }

    const noRawatList = jenisPerawatanRanap
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [radiologiData, labData] = await Promise.all([
      getRadiologiData(noRawatList) as Promise<RadiologiData[]>,
      getLabData(noRawatList) as Promise<LabData[]>,
    ]);

    const radiologiMap = this.createDataMap(radiologiData, "no_rawat");
    const labMap = this.createDataMap(labData, "no_rawat");

    return jenisPerawatanRanap.map((item) => {
      const jnsPerawatanRadiologiArray = radiologiMap.get(item.no_rawat) || [];
      const jnsPerawatanLabArray = labMap.get(item.no_rawat) || [];
      const tarif = csvTarifMap.get(item.no_sep || "") || 0;

      const visiteData = extractRawatInapVisiteData(
        item.jns_perawatan,
        item.nm_dokter || "",
        item.tgl_masuk,
        item.tgl_keluar
      );

      const calculation = calculateRawatInapFinancials({
        tarif,
        total_permintaan_lab: item.total_permintaan_lab || 0,
        total_permintaan_radiologi: item.total_permintaan_radiologi || 0,
        jns_perawatan: item.jns_perawatan,
        jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
        nm_dokter: item.nm_dokter || "",
        tgl_masuk: item.tgl_masuk,
        tgl_keluar: item.tgl_keluar,
        has_operasi: item.has_operasi || false,
        selectedSupport,
        dokter_anestesi: item.anestesi || "",
      });

      return {
        ...item,
        visite_dpjp_utama: visiteData.visiteDpjpUtama,
        visite_konsul_1: visiteData.finalVisiteKonsul1,
        visite_konsul_2: visiteData.finalVisiteKonsul2,
        visite_dokter_umum: visiteData.visiteDokterUmum,
        jns_perawatan: item.jns_perawatan,
        jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
        jns_perawatan_lab: jnsPerawatanLabArray,
        hari_rawat:
          item.tgl_masuk && item.tgl_keluar
            ? differenceInDays(item.tgl_keluar, item.tgl_masuk)
            : 1,
        tarif_from_csv: tarif || undefined,
        totalVisite: visiteData.totalVisite,
        ...calculation,
      };
    });
  }

  private async calculateTotals(
    baseQuery: RawatInapData[],
    csvTarifMap: Map<string, number>,
    selectedSupport?: string
  ): Promise<TotalsAccumulator> {
    if (baseQuery.length === 0) {
      return createEmptyTotals();
    }

    const noRawatList = baseQuery
      .map((item) => item.no_rawat)
      .filter((id): id is string => id !== null);

    const [radiologiData] = await Promise.all([
      getRadiologiData(noRawatList) as Promise<RadiologiData[]>,
    ]);

    const radiologiMap = this.createDataMap(radiologiData, "no_rawat");

    return baseQuery.reduce((acc, row) => {
      const tarif = csvTarifMap.get(row.no_sep || "") || 0;
      const jnsPerawatanRadiologiArray = radiologiMap.get(row.no_rawat) || [];
      const calculation = calculateRawatInapFinancials({
        tarif,
        total_permintaan_lab: row.total_permintaan_lab || 0,
        total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
        jns_perawatan: row.jns_perawatan,
        jns_perawatan_radiologi: jnsPerawatanRadiologiArray,
        nm_dokter: row.nm_dokter || "",
        tgl_masuk: row.tgl_masuk,
        tgl_keluar: row.tgl_keluar,
        has_operasi: row.has_operasi || false,
        selectedSupport,
        dokter_anestesi: row.anestesi || "",
      });
      return accumulateTotals(acc, tarif, calculation);
    }, createEmptyTotals());
  }

  private createDataMap<T extends Record<string, any>>(
    data: T[],
    keyField: keyof T
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();

    for (const item of data) {
      const key = item[keyField] as string;
      if (key) {
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(item);
      }
    }

    return map;
  }
}
