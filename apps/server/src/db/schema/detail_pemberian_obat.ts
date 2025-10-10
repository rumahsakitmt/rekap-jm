import {
  mysqlTable,
  varchar,
  date,
  time,
  double,
  char,
} from "drizzle-orm/mysql-core";

export const detail_pemberian_obat = mysqlTable("detail_pemberian_obat", {
  tgl_perawatan: date("tgl_perawatan").notNull(),
  jam: time("jam").notNull(),
  no_rawat: varchar("no_rawat", { length: 17 }).notNull(),
  kode_brng: varchar("kode_brng", { length: 15 }).notNull(),
  h_beli: double("h_beli"),
  biaya_obat: double("biaya_obat"),
  jml: double("jml"),
  embalase: double("embalase"),
  tuslah: double("tuslah"),
  total: double("total"),
  status: varchar("status", { length: 10 }),
  kd_bangsal: char("kd_bangsal", { length: 5 }),
  no_batch: varchar("no_batch", { length: 20 }),
  no_faktur: varchar("no_faktur", { length: 20 }),
});
