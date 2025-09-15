import {
  mysqlTable,
  varchar,
  date,
  time,
  double,
} from "drizzle-orm/mysql-core";

export const rawatInapDrpr = mysqlTable("rawat_inap_drpr", {
  noRawat: varchar("no_rawat", { length: 17 }).notNull(),
  kdJenisPrw: varchar("kd_jenis_prw", { length: 20 }).notNull(),
  kdDokter: varchar("kd_dokter", { length: 20 }).notNull(),
  nip: varchar("nip", { length: 20 }).notNull(),
  tglPerawatan: date("tgl_perawatan").notNull(),
  jamRawat: time("jam_rawat").notNull(),
  material: double("material"),
  bhp: double("bhp"),
  tarifTindakandr: double("tarif_tindakandr"),
  tarifTindakanpr: double("tarif_tindakanpr"),
  kso: double("kso"),
  menejemen: double("menejemen"),
  biayaRawat: double("biaya_rawat"),
});

export type RawatInapDrpr = typeof rawatInapDrpr.$inferSelect;
export type NewRawatInapDrpr = typeof rawatInapDrpr.$inferInsert;
