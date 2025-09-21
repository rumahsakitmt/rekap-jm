import {
  createBaseRawatJalanQuery,
  getJenisPerawatanRawatJalan,
  getJenisPerawatanRadiologiRawatJalan,
} from "./query-builders";
import { buildFilterConditions, type FilterInput } from "./filter-utils";
import {
  readCsvFile,
  createCsvTarifMap,
  convertToCsv,
  type CsvData,
} from "./csv-utils";
import {
  calculateFinancials,
  accumulateTotalsRawatJalan,
  createEmptyRawatJalanTotals,
  type CalculationInput,
  type RawatJalanTotalsAccumulator,
} from "./calculation-utils";

interface ProcessedRawatJalanData {
  [key: string]: any;
  jns_perawatan: any[];
  jns_perawatan_radiologi: any[];
  tarif_from_csv?: number;
}

interface CsvProcessingResult {
  csvData: CsvData[];
  csvTarifMap: Map<string, number>;
  filterConditions: { where?: any; having?: any };
}

// CSV export configuration
const CSV_EXPORT_CONFIG = {
  fields: [
    "tgl_perawatan",
    "no_rekam_medis",
    "nm_pasien",
    "no_sep",
    "tarif_from_csv",
    "nm_poli",
    "nm_dokter",
    "konsul_count",
    "total_permintaan_lab",
    "total_permintaan_radiologi",
    "alokasi",
    "dpjp_utama",
    "konsul",
    "laboratorium",
    "radiologi",
    "yang_terbagi",
    "percent_dari_klaim",
  ],
  fieldLabels: {
    tgl_perawatan: "Tanggal Perawatan",
    no_rekam_medis: "No RM",
    nm_pasien: "Nama Pasien",
    no_sep: "No SEP",
    tarif_from_csv: "Total Tarif",
    nm_poli: "Poli",
    nm_dokter: "DPJP",
    konsul_count: "Konsul",
    total_permintaan_lab: "Lab",
    total_permintaan_radiologi: "Radiologi",
    alokasi: "Alokasi",
    dpjp_utama: "DPJP Utama",
    konsul: "Konsul",
    laboratorium: "Laboratorium",
    radiologi: "Radiologi",
    yang_terbagi: "Yang Terbagi",
    percent_dari_klaim: "Persentase Dari Klaim",
  },
};

export interface RawatJalanQueryInput extends FilterInput {
  limit?: number;
  offset?: number;
  includeTotals?: boolean;
  filename?: string;
}

async function processCsvAndFilters(
  input: FilterInput & { filename?: string }
): Promise<CsvProcessingResult> {
  let csvData: CsvData[] = [];
  if (input.filename) {
    csvData = await readCsvFile(input.filename);
  }

  const filterInput: FilterInput = {
    ...input,
    csvSepNumbers: csvData.map((item) => item.no_sep),
  };

  return {
    csvData,
    csvTarifMap: createCsvTarifMap(csvData),
    filterConditions: buildFilterConditions(filterInput),
  };
}

function createCalculationInput(row: any, tarif: number): CalculationInput {
  return {
    tarif,
    total_permintaan_lab: row.total_permintaan_lab || 0,
    total_permintaan_radiologi: row.total_permintaan_radiologi || 0,
    jns_perawatan_radiologi: row.jns_perawatan_radiologi || [],
    konsul_count: row.konsul_count || 0,
    jns_perawatan: row.jns_perawatan || undefined,
    nm_dokter: row.nm_dokter || undefined,
    nm_poli: row.nm_poli || undefined,
  };
}

function processRawatJalanRow(
  row: any,
  csvTarifMap: Map<string, number>
): ProcessedRawatJalanData {
  const tarif = csvTarifMap.get(row.no_sep || "") || row.biaya_rawat || 0;
  const calculationInput = createCalculationInput(row, tarif);
  const calculation = calculateFinancials(calculationInput);

  return {
    ...row,
    jns_perawatan: row.jns_perawatan || [],
    jns_perawatan_radiologi: row.jns_perawatan_radiologi || [],
    tarif_from_csv: csvTarifMap.get(row.no_sep || "") || undefined,
    ...calculation,
  };
}

function calculateTotalsFromRows(
  rows: any[],
  csvTarifMap: Map<string, number>
): RawatJalanTotalsAccumulator {
  return rows.reduce((acc, row) => {
    const tarif = csvTarifMap.get(row.no_sep || "") || row.biaya_rawat || 0;
    const calculationInput = createCalculationInput(row, tarif);
    const calculation = calculateFinancials(calculationInput);
    return accumulateTotalsRawatJalan(acc, tarif, calculation);
  }, createEmptyRawatJalanTotals());
}

export async function getRawatJalanDenganJnsPerawatan(
  whereCondition?: any,
  havingCondition?: any
) {
  const mainData = await createBaseRawatJalanQuery(
    whereCondition,
    havingCondition
  );

  if (mainData.length === 0) {
    return mainData.map((item) => ({
      ...item,
      jns_perawatan: [],
      jns_perawatan_radiologi: [],
    }));
  }

  const no_rawat_list = mainData
    .map((item) => item.no_rawat)
    .filter((id): id is string => id !== null);

  const [jnsPerawatan, jnsPerawatanRadiologi] = await Promise.all([
    getJenisPerawatanRawatJalan(no_rawat_list),
    getJenisPerawatanRadiologiRawatJalan(no_rawat_list),
  ]);

  const jnsPerawatanMap = jnsPerawatan.reduce(
    (acc, perwatan) => {
      if (perwatan.no_rawat && !acc[perwatan.no_rawat]) {
        acc[perwatan.no_rawat] = [];
      }
      if (perwatan.no_rawat) {
        acc[perwatan.no_rawat].push({
          kd_jenis_prw: perwatan.kd_jenis_prw,
          nm_perawatan: perwatan.nm_perawatan,
          kd_dokter: perwatan.kd_dokter,
          nm_dokter: perwatan.nm_dokter,
        });
      }
      return acc;
    },
    {} as Record<string, any[]>
  );

  const jnsPerawatanRadiologiMap = jnsPerawatanRadiologi.reduce(
    (acc, radiologi) => {
      if (radiologi.no_rawat && !acc[radiologi.no_rawat]) {
        acc[radiologi.no_rawat] = [];
      }
      if (radiologi.no_rawat) {
        acc[radiologi.no_rawat].push({
          kd_jenis_prw: radiologi.kd_jenis_prw,
          nm_perawatan: radiologi.nm_perawatan,
          noorder: radiologi.noorder,
        });
      }
      return acc;
    },
    {} as Record<string, any[]>
  );

  return mainData.map((item) => ({
    ...item,
    jns_perawatan: item.no_rawat ? jnsPerawatanMap[item.no_rawat] || [] : [],
    jns_perawatan_radiologi: item.no_rawat
      ? jnsPerawatanRadiologiMap[item.no_rawat] || []
      : [],
  }));
}

export interface RawatJalanResult {
  data: any[];
  totals:
    | (RawatJalanTotalsAccumulator & {
        averagePercentDariKlaim: number;
      })
    | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
  };
}

export async function getRawatJalan(
  input: RawatJalanQueryInput
): Promise<RawatJalanResult> {
  const { csvTarifMap, filterConditions } = await processCsvAndFilters(input);

  const allData = await getRawatJalanDenganJnsPerawatan(
    filterConditions.where,
    filterConditions.having
  );
  const totalCount = allData.length;

  const limit = input.limit || 50;
  const offset = input.offset || 0;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  const totals = input.includeTotals
    ? calculateTotalsFromRows(allData, csvTarifMap)
    : null;

  const paginatedData = allData.slice(offset, offset + limit);
  const processedResult = paginatedData.map((row) =>
    processRawatJalanRow(row, csvTarifMap)
  );

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
  const { csvTarifMap, filterConditions } = await processCsvAndFilters(input);

  const results = await getRawatJalanDenganJnsPerawatan(
    filterConditions.where,
    filterConditions.having
  );

  const dpjpMap = new Map<string, { name: string; total: number }>();
  const konsulMap = new Map<string, { name: string; total: number }>();
  let labTotal = 0;
  let radTotal = 0;

  for (const row of results) {
    const tarif = csvTarifMap.get(row.no_sep || "") || 0;
    const calculationInput = createCalculationInput(row, tarif);
    const calculation = calculateFinancials(calculationInput);

    const dpjpKey = row.kd_dokter || "Unknown";
    const dpjpName = row.nm_dokter || "Unknown";

    // Update DPJP totals
    if (dpjpMap.has(dpjpKey)) {
      dpjpMap.get(dpjpKey)!.total += calculation.dpjp_utama;
    } else {
      dpjpMap.set(dpjpKey, { name: dpjpName, total: calculation.dpjp_utama });
    }

    // Update konsul totals
    if (calculation.konsul > 0) {
      const jnsPerawatanData = row.jns_perawatan || [];
      const konsulDoctors = jnsPerawatanData
        .filter((item: any) => item && item.nm_dokter !== dpjpName)
        .map((item: any) => ({
          kd_dokter: item.kd_dokter,
          nm_dokter: item.nm_dokter,
        }));

      if (konsulDoctors.length > 0) {
        const konsulDoctor = konsulDoctors[0];
        const konsulKey = konsulDoctor.kd_dokter;
        const konsulName = konsulDoctor.nm_dokter;

        if (konsulMap.has(konsulKey)) {
          konsulMap.get(konsulKey)!.total += calculation.konsul;
        } else {
          konsulMap.set(konsulKey, {
            name: konsulName,
            total: calculation.konsul,
          });
        }
      }
    }

    labTotal += calculation.laboratorium;
    radTotal += calculation.radiologi;
  }

  const dpjpTotals = Array.from(dpjpMap.values())
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.name,
      total: Math.round(item.total),
    }));

  const konsulTotals = Array.from(konsulMap.values())
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.name,
      total: Math.round(item.total),
    }));

  return {
    dpjp: dpjpTotals,
    konsul: konsulTotals,
    dpjpTotal: dpjpTotals.reduce((sum, item) => sum + item.total, 0),
    konsulTotal: konsulTotals.reduce((sum, item) => sum + item.total, 0),
    labTotal: Math.round(labTotal),
    radTotal: Math.round(radTotal),
  };
}

export interface CsvExportInput extends FilterInput {
  filename?: string;
}

export async function getRegPeriksaDataForCsv(
  input: CsvExportInput
): Promise<string> {
  if (!input.filename) {
    return "";
  }

  const { csvData, csvTarifMap, filterConditions } =
    await processCsvAndFilters(input);

  if (csvData.length === 0) {
    return "";
  }

  const allResults = await getRawatJalanDenganJnsPerawatan(
    filterConditions.where,
    filterConditions.having
  );

  const csvSepSet = new Set(csvData.map((item) => item.no_sep));
  const filteredResults = allResults.filter((row) =>
    csvSepSet.has(row.no_sep || "")
  );

  const processedResult = filteredResults.map((row) =>
    processRawatJalanRow(row, csvTarifMap)
  );

  const totals = calculateTotalsFromRows(filteredResults, csvTarifMap);

  const totalsRow = {
    tgl_perawatan: "",
    no_rekam_medis: "",
    nm_pasien: "TOTAL",
    no_sep: "",
    tarif_from_csv: Math.round(totals.totalTarif),
    nm_poli: "",
    nm_dokter: "",
    konsul_count: "",
    total_permintaan_lab: "",
    total_permintaan_radiologi: "",
    alokasi: Math.round(totals.totalAlokasi),
    dpjp_utama: Math.round(totals.totalDpjpUtama),
    konsul: Math.round(totals.totalKonsul),
    laboratorium: Math.round(totals.totalLaboratorium),
    radiologi: Math.round(totals.totalRadiologi),
    yang_terbagi: Math.round(totals.totalYangTerbagi),
    percent_dari_klaim:
      totals.count > 0
        ? Math.round(totals.totalPercentDariKlaim / totals.count)
        : 0,
  };

  const dataWithTotals = [...processedResult, totalsRow];

  return convertToCsv(dataWithTotals, CSV_EXPORT_CONFIG);
}
