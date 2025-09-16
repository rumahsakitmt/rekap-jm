import * as m from "drizzle-orm/mysql-core";

export const periksa_lab = m.mysqlTable("periksa_lab", {
  no_rawat: m.varchar("no_rawat", { length: 17 }),
  nip: m.varchar("nip", { length: 20 }),
  kd_jenis_prw: m.varchar("kd_jenis_prw", { length: 15 }),
  tgl_periksa: m.date("tgl_periksa"),
  jam: m.time("jam"),
  dokter_perujuk: m.varchar("dokter_perujuk", { length: 20 }),
  bagian_rs: m.double("bagian_rs"),
  bhp: m.double("bhp"),
  tarif_perujuk: m.double("tarif_perujuk"),
  tarif_tindakan_dokter: m.double("tarif_tindakan_dokter"),
  tarif_tindakan_petugas: m.double("tarif_tindakan_petugas"),
  kso: m.double("kso"),
  menejemen: m.double("menejemen"),
  biaya: m.double("biaya"),
  kd_dokter: m.varchar("kd_dokter", { length: 20 }),
  status: m.varchar("status", { length: 10 }),
  kategori: m.varchar("kategori", { length: 10 }),
});
