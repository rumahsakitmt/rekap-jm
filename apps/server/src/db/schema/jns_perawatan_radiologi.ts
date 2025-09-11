import * as m from "drizzle-orm/mysql-core";

export const jns_perawatan_radiologi = m.mysqlTable("jns_perawatan_radiologi", {
  kd_jenis_prw: m.varchar("kd_jenis_prw", { length: 15 }).primaryKey(),
  nm_perawatan: m.varchar("nm_perawatan", { length: 80 }),
  bagian_rs: m.double("bagian_rs"),
  bhp: m.double("bhp"),
  tarif_perujuk: m.double("tarif_perujuk"),
  tarif_tindakan_dokter: m.double("tarif_tindakan_dokter"),
  tarif_tindakan_petugas: m.double("tarif_tindakan_petugas"),
  kso: m.double("kso"),
  menejemen: m.double("menejemen"),
  total_byr: m.double("total_byr"),
  kd_pj: m.char("kd_pj", { length: 3 }),
  status: m.varchar("status", { length: 2 }),
  kelas: m.varchar("kelas", { length: 20 }),
});

export type JnsPerawatanRadiologi = typeof jns_perawatan_radiologi.$inferSelect;
