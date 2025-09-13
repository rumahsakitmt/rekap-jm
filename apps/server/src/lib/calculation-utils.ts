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
  totalDpjpUtama: number;
  totalKonsul: number;
  totalLaboratorium: number;
  totalRadiologi: number;
  totalYangTerbagi: number;
  totalPercentDariKlaim: number;
  count: number;
}

export function createEmptyTotals(): TotalsAccumulator {
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

export function accumulateTotals(
  acc: TotalsAccumulator,
  tarif: number,
  calculation: CalculationResult
): TotalsAccumulator {
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
