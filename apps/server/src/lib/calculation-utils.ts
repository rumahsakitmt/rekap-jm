import { differenceInDays } from "date-fns";

export interface RadiologiData {
  kd_jenis_prw: string;
  nm_perawatan: string;
  noorder: string;
}

export interface CalculationInput {
  tarif: number;
  total_permintaan_lab: number;
  total_permintaan_radiologi: number;
  jns_perawatan_radiologi: string;
  konsul_count: number;
  jns_perawatan?: string;
  nm_dokter?: string;
  nm_poli?: string;
}

export interface CalculationResult {
  alokasi: number;
  laboratorium: number;
  radiologi: number;
  dpjp_utama: number;
  konsul: number;
  usgCount: number;
  nonUsgCount: number;
  yang_terbagi: number;
  percent_dari_klaim: number;
}

export function calculateFinancials(
  input: CalculationInput
): CalculationResult {
  const {
    tarif,
    total_permintaan_lab,
    total_permintaan_radiologi,
    jns_perawatan_radiologi,
    konsul_count,
    jns_perawatan,
    nm_dokter,
    nm_poli,
  } = input;

  // If nm_poli is IGD, set alokasi and dpjp_utama to 0
  const isIGD = nm_poli === "IGD" && konsul_count < 1;
  const alokasi = isIGD ? 0 : tarif * 0.2;
  const laboratorium = (total_permintaan_lab || 0) * 10000;

  const jnsPerawatanRadiologi = JSON.parse(
    jns_perawatan_radiologi || "[]"
  ) as RadiologiData[];

  const usgCount =
    jnsPerawatanRadiologi.filter(
      (item) =>
        item.nm_perawatan && item.nm_perawatan.toLowerCase().includes("usg")
    ).length || 0;
  const nonUsgCount = (total_permintaan_radiologi || 0) - usgCount;

  const radiologi =
    usgCount > 0
      ? Math.max(0, tarif - 185000) * usgCount * 0.2 + nonUsgCount * 15000
      : (total_permintaan_radiologi || 0) * 15000;

  const dpjp_utama = isIGD ? 0 : alokasi - laboratorium - radiologi;

  let shouldCountKonsul = konsul_count && konsul_count >= 1;

  if (shouldCountKonsul && jns_perawatan && nm_dokter) {
    const jnsPerawatanData = JSON.parse(jns_perawatan || "[]") as Array<{
      kd_jenis_prw: string;
      nm_perawatan: string;
      kd_dokter: string;
      nm_dokter: string;
      is_konsul?: boolean;
    }>;

    const konsulTreatments = jnsPerawatanData.filter(
      (item) => item && item.is_konsul
    );

    const allSameDoctor = konsulTreatments.every(
      (item) => item.nm_dokter === nm_dokter
    );

    shouldCountKonsul = !allSameDoctor;
  }

  const konsul = shouldCountKonsul ? dpjp_utama / 2 : 0;

  const yang_terbagi = dpjp_utama + konsul + radiologi + laboratorium;
  const percent_dari_klaim =
    tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

  return {
    alokasi,
    laboratorium,
    radiologi,
    dpjp_utama,
    konsul,
    usgCount,
    nonUsgCount,
    yang_terbagi,
    percent_dari_klaim,
  };
}

export interface TotalsAccumulator {
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
  totalYangTerbagi: number;
  totalPercentDariKlaim: number;
  count: number;
}

export function createEmptyTotals(): TotalsAccumulator {
  return {
    totalTarif: 0,
    totalAlokasi: 0,
    totalDpjpRanap: 0,
    totalRemunDpjp: 0,
    totalRemunKonsulAnestesi: 0,
    totalRemunKonsul1: 0,
    totalRemunKonsul2: 0,
    totalRemunDokterUmum: 0,
    totalRemunLab: 0,
    totalRemunRadiologi: 0,
    totalRemunOperator: 0,
    totalRemunAnestesi: 0,
    totalYangTerbagi: 0,
    totalPercentDariKlaim: 0,
    count: 0,
  };
}

export interface RawatInapCalculationResult {
  alokasi: number;
  dpjp_ranap: number;
  remun_dpjp_utama: number;
  remun_konsul_anastesi: number;
  remun_konsul_2: number;
  remun_konsul_3: number;
  remun_dokter_umum: number;
  remun_lab: number;
  remun_rad: number;
  remun_operator: number;
  remun_anestesi: number;
  yang_terbagi: number;
  percent_dari_klaim: number;
}

export function accumulateTotals(
  acc: TotalsAccumulator,
  tarif: number,
  calculation: RawatInapCalculationResult
): TotalsAccumulator {
  return {
    totalTarif: acc.totalTarif + tarif,
    totalAlokasi: acc.totalAlokasi + calculation.alokasi,
    totalDpjpRanap: acc.totalDpjpRanap + calculation.dpjp_ranap,
    totalRemunDpjp: acc.totalRemunDpjp + calculation.remun_dpjp_utama,
    totalRemunKonsulAnestesi:
      acc.totalRemunKonsulAnestesi + calculation.remun_konsul_anastesi,
    totalRemunKonsul1:
      acc.totalRemunKonsul1 + calculation.remun_konsul_anastesi, // konsul 1 is anastesi
    totalRemunKonsul2: acc.totalRemunKonsul2 + calculation.remun_konsul_2,
    totalRemunDokterUmum:
      acc.totalRemunDokterUmum + calculation.remun_dokter_umum,
    totalRemunLab: acc.totalRemunLab + calculation.remun_lab,
    totalRemunRadiologi: acc.totalRemunRadiologi + calculation.remun_rad,
    totalRemunOperator: acc.totalRemunOperator + calculation.remun_operator,
    totalRemunAnestesi: acc.totalRemunAnestesi + calculation.remun_anestesi,
    totalYangTerbagi: acc.totalYangTerbagi + calculation.yang_terbagi,
    totalPercentDariKlaim:
      acc.totalPercentDariKlaim + calculation.percent_dari_klaim,
    count: acc.count + 1,
  };
}

export interface RawatJalanTotalsAccumulator {
  totalTarif: number;
  totalAlokasi: number;
  totalDpjpUtama: number;
  totalKonsul: number;
  totalLaboratorium: number;
  totalRadiologi: number;
  totalYangTerbagi: number;
  totalPercentDariKlaim: number;
  count: number;
}

export function createEmptyRawatJalanTotals(): RawatJalanTotalsAccumulator {
  return {
    totalTarif: 0,
    totalAlokasi: 0,
    totalDpjpUtama: 0,
    totalKonsul: 0,
    totalLaboratorium: 0,
    totalRadiologi: 0,
    totalYangTerbagi: 0,
    totalPercentDariKlaim: 0,
    count: 0,
  };
}

export function accumulateTotalsRawatJalan(
  acc: RawatJalanTotalsAccumulator,
  tarif: number,
  calculation: CalculationResult
): RawatJalanTotalsAccumulator {
  return {
    totalTarif: acc.totalTarif + tarif,
    totalAlokasi: acc.totalAlokasi + calculation.alokasi,
    totalDpjpUtama: acc.totalDpjpUtama + calculation.dpjp_utama,
    totalKonsul: acc.totalKonsul + calculation.konsul,
    totalLaboratorium: acc.totalLaboratorium + calculation.laboratorium,
    totalRadiologi: acc.totalRadiologi + calculation.radiologi,
    totalYangTerbagi: acc.totalYangTerbagi + calculation.yang_terbagi,
    totalPercentDariKlaim:
      acc.totalPercentDariKlaim + calculation.percent_dari_klaim,
    count: acc.count + 1,
  };
}

export interface RawatInapCalculationInput {
  tarif: number;
  total_permintaan_lab: number;
  total_permintaan_radiologi: number;
  jns_perawatan: string;
  nm_dokter: string;
  tgl_masuk: Date | null;
  tgl_keluar: Date | null;
  has_operasi: boolean;
}

export interface RawatInapVisiteData {
  visiteDpjpUtama: number;
  visiteKonsul1: any[];
  visiteKonsul2: any[];
  visiteKonsul3: any[];
  visiteDokterUmum: any[];
  finalVisiteKonsul1: any[];
  finalVisiteKonsul2: any[];
  finalVisiteKonsul3: any[];
  totalVisite: number;
}

export function extractRawatInapVisiteData(
  jns_perawatan: string,
  nm_dokter: string,
  tgl_masuk: Date | null,
  tgl_keluar: Date | null
): RawatInapVisiteData {
  const jnsPerawatanArray = JSON.parse(jns_perawatan || "[]");
  const mainDoctor = nm_dokter;
  const emergencyCount = jnsPerawatanArray.filter(
    (perawatan: any) =>
      perawatan?.nm_dokter === mainDoctor &&
      perawatan.nm_perawatan.toLowerCase().includes("emergency")
  ).length;

  const visiteDpjpUtama =
    (tgl_masuk && tgl_keluar
      ? Math.max(differenceInDays(tgl_keluar, tgl_masuk), 1)
      : 1) + emergencyCount;

  const visiteKonsul1 = jnsPerawatanArray.filter(
    (perawatan: any) =>
      perawatan && perawatan.nm_perawatan.toLowerCase().includes("anastesi")
  );

  const visiteKonsul2 = jnsPerawatanArray.filter(
    (perawatan: any) =>
      perawatan &&
      perawatan.nm_dokter !== mainDoctor &&
      !perawatan.nm_perawatan.toLowerCase().includes("anastesi") &&
      !visiteKonsul1.some(
        (konsul: any) => konsul.nm_dokter === perawatan.nm_dokter
      ) &&
      perawatan.nm_perawatan.toLowerCase() !== "visite dokter" &&
      perawatan.nm_perawatan.toLowerCase().includes("visite dokter")
  );

  const visiteKonsul3 = jnsPerawatanArray.filter(
    (perawatan: any) =>
      perawatan &&
      perawatan.nm_dokter !== mainDoctor &&
      !visiteKonsul1.some(
        (konsul: any) => konsul.nm_dokter === perawatan.nm_dokter
      ) &&
      !visiteKonsul2.some(
        (konsul: any) => konsul.nm_dokter === perawatan.nm_dokter
      ) &&
      perawatan.nm_perawatan.toLowerCase() !== "visite dokter" &&
      perawatan.nm_perawatan.toLowerCase().includes("visite dokter")
  );

  const visiteDokterUmum = jnsPerawatanArray.filter(
    (perawatan: any) =>
      perawatan &&
      perawatan.nm_dokter !== mainDoctor &&
      perawatan.nm_perawatan.toLowerCase() === "visite dokter"
  );

  let finalVisiteKonsul1 = visiteKonsul1;
  let finalVisiteKonsul2 = visiteKonsul2;
  let finalVisiteKonsul3 = visiteKonsul3;

  if (finalVisiteKonsul2.length === 0 && finalVisiteKonsul3.length > 0) {
    finalVisiteKonsul2 = finalVisiteKonsul3;
    finalVisiteKonsul3 = [];
  }

  const totalVisite =
    visiteDpjpUtama +
    visiteKonsul1.length +
    visiteKonsul2.length +
    visiteKonsul3.length +
    visiteDokterUmum.length;

  return {
    visiteDpjpUtama,
    visiteKonsul1,
    visiteKonsul2,
    visiteKonsul3,
    visiteDokterUmum,
    finalVisiteKonsul1,
    finalVisiteKonsul2,
    finalVisiteKonsul3,
    totalVisite,
  };
}

export function calculateRawatInapFinancials(
  input: RawatInapCalculationInput
): RawatInapCalculationResult {
  const {
    tarif,
    total_permintaan_lab,
    total_permintaan_radiologi,
    jns_perawatan,
    nm_dokter,
    tgl_masuk,
    tgl_keluar,
    has_operasi,
  } = input;

  const visiteData = extractRawatInapVisiteData(
    jns_perawatan,
    nm_dokter,
    tgl_masuk,
    tgl_keluar
  );

  const remun_lab = (total_permintaan_lab || 0) * 5000;
  const remun_rad = (total_permintaan_radiologi || 0) * 15000;
  const alokasi = tarif * 0.2 - remun_lab - remun_rad;
  const remun_dokter_umum = (visiteData.visiteDokterUmum.length || 0) * 20000;
  const dpjp_ranap = alokasi - remun_dokter_umum;
  const remun_dpjp_utama =
    (visiteData.visiteDpjpUtama / visiteData.totalVisite) * dpjp_ranap;
  const remun_konsul_anastesi =
    (visiteData.visiteKonsul1.length / visiteData.totalVisite) * dpjp_ranap;
  const remun_konsul_2 =
    (visiteData.visiteKonsul2.length / visiteData.totalVisite) * dpjp_ranap;
  const remun_konsul_3 =
    (visiteData.visiteKonsul3.length / visiteData.totalVisite) * dpjp_ranap;
  const remun_operator = has_operasi ? alokasi * 0.7 * 0.7 : 0;
  const remun_anestesi = has_operasi ? alokasi * 0.7 * 0.3 : 0;

  const yang_terbagi =
    remun_dpjp_utama +
    remun_konsul_anastesi +
    remun_konsul_2 +
    remun_konsul_3 +
    remun_dokter_umum +
    remun_operator +
    remun_anestesi +
    remun_lab +
    remun_rad;
  const percent_dari_klaim =
    tarif > 0 ? Math.floor((yang_terbagi / tarif) * 100) : 0;

  return {
    alokasi,
    dpjp_ranap,
    remun_dpjp_utama,
    remun_konsul_anastesi,
    remun_konsul_2,
    remun_konsul_3,
    remun_dokter_umum,
    remun_lab,
    remun_rad,
    remun_operator,
    remun_anestesi,
    yang_terbagi,
    percent_dari_klaim,
  };
}
