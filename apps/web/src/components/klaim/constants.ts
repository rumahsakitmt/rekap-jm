export const caraMasukLabels: Record<string, string> = {
  gp: "Rujukan FKTP",
  "hosp-trans": "Rujukan FKRTL",
  mp: "Rujukan Spesialis",
  outp: "Dari Rawat Jalan",
  inp: "Dari Rawat Inap",
  emd: "Dari Rawat Darurat",
  born: "Lahir Di RS",
  nursing: "Rujukan Panti Jompo",
  psych: "Rujukan Dari RS Jiwa",
  rehab: "Rujukan Fasilitas Rehab",
  other: "Lain-lain",
};

export const upgradeClassLabels: Record<string, string> = {
  kelas_1: "Kelas 1",
  kelas_2: "Kelas 2",
  vip: "Kelas VIP",
  vvip: "Kelas VVIP",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}
