import * as m from "drizzle-orm/mysql-core";

export const jns_perawatan_inap = m.mysqlTable("jns_perawatan_inap", {
  kd_jenis_prw: m.varchar("kd_jenis_prw", { length: 15 }).primaryKey(),
  nm_perawatan: m.varchar("nm_perawatan", { length: 80 }),
  kd_kategori: m.char("kd_kategori", { length: 5 }),
  material: m.double("material"),
  bhp: m.double("bhp"),
  tarif_tindakandr: m.double("tarif_tindakandr"),
  tarif_tindakanpr: m.double("tarif_tindakanpr"),
  kso: m.double("kso"),
  menejemen: m.double("menejemen"),
  total_byrdr: m.double("total_byrdr"),
  total_byrpr: m.double("total_byrpr"),
  total_byrdrpr: m.double("total_byrdrpr"),
  kd_pj: m.char("kd_pj", { length: 3 }),
  kd_bangsal: m.char("kd_bangsal", { length: 10 }),
  status: m.varchar("status", { length: 1 }),
  kelas: m.varchar("kelas", { length: 20 }),
});

export type JnsPerawatanInap = typeof jns_perawatan_inap.$inferSelect;
