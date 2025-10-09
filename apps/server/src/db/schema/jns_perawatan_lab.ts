import { mysqlTable, varchar, double, char } from "drizzle-orm/mysql-core";

export const jns_perawatan_lab = mysqlTable("jns_perawatan_lab", {
  kdJenisPrw: varchar("kd_jenis_prw", { length: 15 }).primaryKey(),
  nmPerawatan: varchar("nm_perawatan", { length: 80 }),
  bagianRs: double("bagian_rs"),
  bhp: double("bhp"),
  tarifPerujuk: double("tarif_perujuk"),
  tarifTindakanDokter: double("tarif_tindakan_dokter"),
  tarifTindakanPetugas: double("tarif_tindakan_petugas"),
  kso: double("kso"),
  menejemen: double("menejemen"),
  totalByr: double("total_byr"),
  kdPj: char("kd_pj", { length: 3 }),
  status: varchar("status", { length: 1 }),
  kelas: varchar("kelas", { length: 20 }),
  kategori: varchar("kategori", { length: 2 }),
});

export type JnsPerawatanLab = typeof jns_perawatan_lab.$inferSelect;
export type NewJnsPerawatanLab = typeof jns_perawatan_lab.$inferInsert;
