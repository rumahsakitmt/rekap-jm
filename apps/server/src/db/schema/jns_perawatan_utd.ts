import { mysqlTable, varchar, double, char } from "drizzle-orm/mysql-core";

export const jns_perawatan_utd = mysqlTable("jns_perawatan_utd", {
  kdJenisPrw: varchar("kd_jenis_prw", { length: 15 }).primaryKey(),
  nmPerawatan: varchar("nm_perawatan", { length: 80 }),
  bagianRs: double("bagian_rs"),
  bhp: double("bhp"),
  tarifPerujuk: double("tarif_perujuk"),
  tarifTindakanDokter: double("tarif_tindakan_dokter"),
  tarifTindakanPetugas: double("tarif_tindakan_petugas"),
  kso: double("kso"),
  manajemen: double("manajemen"),
  totalByr: double("total_byr"),
  kdPj: char("kd_pj", { length: 3 }),
  status: varchar("status", { length: 1 }),
});

export type JnsPerawatanUtd = typeof jns_perawatan_utd.$inferSelect;
export type NewJnsPerawatanUtd = typeof jns_perawatan_utd.$inferInsert;
