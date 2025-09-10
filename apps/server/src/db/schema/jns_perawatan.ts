import * as m from "drizzle-orm/mysql-core";

export const jns_perawatan = m.mysqlTable("jns_perawatan", {
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
  kd_poli: m.char("kd_poli", { length: 5 }),
  status: m.varchar("status", { length: 1 }),
});

export type JnsPerawatan = typeof jns_perawatan.$inferSelect;
