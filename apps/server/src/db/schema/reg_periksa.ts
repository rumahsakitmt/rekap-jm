import * as m from "drizzle-orm/mysql-core";

export const reg_periksa = m.mysqlTable("reg_periksa", {
  no_reg: m.varchar("no_reg", { length: 20 }).primaryKey(),
  no_rawat: m.varchar("no_rawat", { length: 20 }),
  tgl_registrasi: m.date("tgl_registrasi"),
  jam_reg: m.time("jam_reg"),
  kd_dokter: m.varchar("kd_dokter", { length: 20 }),
  no_rkm_medis: m.varchar("no_rkm_medis", { length: 20 }),
  kd_poli: m.varchar("kd_poli", { length: 20 }),
  p_jawab: m.varchar("p_jawab", { length: 100 }),
  almt_pj: m.varchar("almt_pj", { length: 200 }),
  hubunganpj: m.varchar("hubunganpj", { length: 20 }),
  biaya_reg: m.double("biaya_reg"),
  stts: m.varchar("stts", { length: 10 }),
  stts_daftar: m.varchar("stts_daftar", { length: 10 }),
  stts_lanjut: m.varchar("stts_lanjut", { length: 10 }),
  kd_pj: m.varchar("kd_pj", { length: 20 }),
  umurdaftar: m.varchar("umurdaftar", { length: 20 }),
  sttsumur: m.varchar("sttsumur", { length: 10 }),
  status_bayar: m.varchar("status_bayar", { length: 10 }),
  status_poli: m.varchar("status_poli", { length: 10 }),
});
