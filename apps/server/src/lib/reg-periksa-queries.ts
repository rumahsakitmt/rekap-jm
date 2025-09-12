import {
  createBaseRegPeriksaQuery,
  createSummaryReportQuery,
} from "./query-builders";
import { buildFilterConditions, type FilterInput } from "./filter-utils";
import { readCsvFile, createCsvTarifMap, type CsvData } from "./csv-utils";
import {
  calculateFinancials,
  accumulateTotals,
  createEmptyTotals,
  type CalculationInput,
  type TotalsAccumulator,
} from "./calculation-utils";

export interface RegPeriksaQueryInput extends FilterInput {
  limit?: number;
  offset?: number;
  includeTotals?: boolean;
  filename?: string;
}

export interface RegPeriksaResult {
  data: any[];
  totals: {
    totalTarif: number;
    totalAlokasi: number;
    totalDpjpUtama: number;
    totalKonsul: number;
    totalLaboratorium: number;
    totalRadiologi: number;
    totalYangTerbagi: number;
    totalPercentDariKlaim: number;
    averagePercentDariKlaim: number;
    count: number;
  } | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
  };
}

export async function getRegPeriksaData(
  input: RegPeriksaQueryInput
): Promise<RegPeriksaResult> {
  let csvData: CsvData[] = [];
  if (input.filename) {
    csvData = readCsvFile(input.filename);
  }

  const filterInput: FilterInput = {
    ...input,
    csvSepNumbers: csvData.map((item) => item.no_sep),
  };
  const whereCondition = buildFilterConditions(filterInput);

  const baseQuery = createBaseRegPeriksaQuery(whereCondition);
  const csvTarifMap = createCsvTarifMap(csvData);

  const totalCount = await baseQuery.then((results) => results.length);

  const limit = input.limit || 50;
  const offset = input.offset || 0;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  let totals: TotalsAccumulator | null = null;
  if (input.includeTotals) {
    const allResults = await baseQuery;
    totals = allResults.reduce((acc, row) => {
      const tarif = csvTarifMap.get(row.no_sep || "") || row.biaya_rawat || 0;
      const calculationInput: CalculationInput = {
        tarif,
        total_permintaan_lab: row.total_permintaan_lab || 0,
        total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
        jns_perawatan_radiologi: row.jns_perawatan_radiologi || "[]",
        konsul_count: row.konsul_count || 0,
      };
      const calculation = calculateFinancials(calculationInput);
      return accumulateTotals(acc, tarif, calculation);
    }, createEmptyTotals());
  }

  const result = await baseQuery.offset(offset).limit(limit);

  const processedResult = result.map((row) => {
    const tarif = csvTarifMap.get(row.no_sep || "") || row.biaya_rawat || 0;
    const calculationInput: CalculationInput = {
      tarif,
      total_permintaan_lab: row.total_permintaan_lab || 0,
      total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
      jns_perawatan_radiologi: row.jns_perawatan_radiologi || "[]",
      konsul_count: row.konsul_count || 0,
    };
    const calculation = calculateFinancials(calculationInput);

    return {
      ...row,
      jns_perawatan: (
        JSON.parse(row.jns_perawatan || "[]") as {
          kd_jenis_prw: string;
          nm_perawatan: string;
        }[]
      ).filter((item) => item !== null),
      jns_perawatan_radiologi: (
        JSON.parse(row.jns_perawatan_radiologi || "[]") as {
          kd_jenis_prw: string;
          nm_perawatan: string;
          noorder: string;
        }[]
      ).filter((item) => item !== null),
      tarif_from_csv: csvTarifMap.get(row.no_sep || "") || undefined,
      ...calculation,
    };
  });

  return {
    data: processedResult,
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

export interface SummaryReportInput extends FilterInput {
  filename?: string;
}

export interface SummaryReportResult {
  dpjp: Array<{ name: string; total: number }>;
  konsul: Array<{ name: string; total: number }>;
  dpjpTotal: number;
  konsulTotal: number;
  labTotal: number;
  radTotal: number;
}

export async function getSummaryReport(
  input: SummaryReportInput
): Promise<SummaryReportResult> {
  let csvData: CsvData[] = [];
  if (input.filename) {
    csvData = readCsvFile(input.filename);
  }

  const filterInput: FilterInput = {
    ...input,
    csvSepNumbers: csvData.map((item) => item.no_sep),
  };
  const whereCondition = buildFilterConditions(filterInput);

  const query = createSummaryReportQuery(whereCondition);
  const results = await query;

  const csvTarifMap = createCsvTarifMap(csvData);

  const dpjpMap = new Map<string, { name: string; total: number }>();
  const konsulMap = new Map<string, { name: string; total: number }>();
  let labTotal = 0;
  let radTotal = 0;

  for (const row of results) {
    const tarif = csvTarifMap.get(row.no_sep || "") || 0;
    const calculationInput: CalculationInput = {
      tarif,
      total_permintaan_lab: row.total_permintaan_lab || 0,
      total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
      jns_perawatan_radiologi: row.jns_perawatan_radiologi || "[]",
      konsul_count: row.konsul_count || 0,
    };
    const calculation = calculateFinancials(calculationInput);

    const dpjpKey = row.kd_dokter || "Unknown";
    const dpjpName = row.nm_dokter || "Unknown";
    if (dpjpMap.has(dpjpKey)) {
      dpjpMap.get(dpjpKey)!.total += calculation.dpjp_utama;
    } else {
      dpjpMap.set(dpjpKey, { name: dpjpName, total: calculation.dpjp_utama });
    }

    if (calculation.konsul > 0) {
      if (konsulMap.has(dpjpKey)) {
        konsulMap.get(dpjpKey)!.total += calculation.konsul;
      } else {
        konsulMap.set(dpjpKey, { name: dpjpName, total: calculation.konsul });
      }
    }

    labTotal += calculation.laboratorium;
    radTotal += calculation.radiologi;
  }

  const dpjpTotals = Array.from(dpjpMap.values())
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.name,
      total: Math.round(item.total),
    }));

  const konsulTotals = Array.from(konsulMap.values())
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.name,
      total: Math.round(item.total),
    }));

  dpjpTotals.sort((a, b) => b.total - a.total);

  return {
    dpjp: dpjpTotals,
    konsul: konsulTotals,
    dpjpTotal: dpjpTotals.reduce((sum, item) => sum + item.total, 0),
    konsulTotal: konsulTotals.reduce((sum, item) => sum + item.total, 0),
    labTotal: Math.round(labTotal),
    radTotal: Math.round(radTotal),
  };
}
