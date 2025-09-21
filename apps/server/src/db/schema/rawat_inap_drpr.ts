import {
  mysqlTable,
  varchar,
  date,
  time,
  double,
} from "drizzle-orm/mysql-core";

export const rawat_inap_drpr = mysqlTable("rawat_inap_drpr", {
  no_rawat: varchar("no_rawat", { length: 17 }).notNull(),
  kd_jenis_prw: varchar("kd_jenis_prw", { length: 20 }).notNull(),
  kd_dokter: varchar("kd_dokter", { length: 20 }).notNull(),
  nip: varchar("nip", { length: 20 }).notNull(),
  tgl_perawatan: date("tgl_perawatan").notNull(),
  jam_rawat: time("jam_rawat").notNull(),
  material: double("material"),
  bhp: double("bhp"),
  tarif_tindakandr: double("tarif_tindakandr"),
  tarif_tindakanpr: double("tarif_tindakanpr"),
  kso: double("kso"),
  menejemen: double("menejemen"),
  biaya_rawat: double("biaya_rawat"),
});

export type RawatInapDrpr = typeof rawat_inap_drpr.$inferSelect;
export type NewRawatInapDrpr = typeof rawat_inap_drpr.$inferInsert;
