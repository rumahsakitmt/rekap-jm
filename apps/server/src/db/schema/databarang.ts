import * as m from "drizzle-orm/mysql-core";

export const databarang = m.mysqlTable("databarang", {
  kode_brng: m.varchar("kode_brng", { length: 15 }).primaryKey().notNull(),
  nama_brng: m.varchar("nama_brng", { length: 80 }),
  kode_satbesar: m.char("kode_satbesar", { length: 4 }).notNull(),
  kode_sat: m.char("kode_sat", { length: 4 }),
  letak_barang: m.varchar("letak_barang", { length: 100 }),
  dasar: m.double("dasar").notNull(),
  h_beli: m.double("h_beli"),
  ralan: m.double("ralan"),
  kelas1: m.double("kelas1"),
  kelas2: m.double("kelas2"),
  kelas3: m.double("kelas3"),
  utama: m.double("utama"),
  vip: m.double("vip"),
  vvip: m.double("vvip"),
  beliluar: m.double("beliluar"),
  jualbebas: m.double("jualbebas"),
  karyawan: m.double("karyawan"),
  stokminimal: m.double("stokminimal"),
  kdjns: m.char("kdjns", { length: 4 }),
  isi: m.double("isi").notNull(),
  kapasitas: m.double("kapasitas").notNull(),
  expire: m.date("expire"),
  status: m.varchar("status", { length: 1 }).notNull(),
  kode_industri: m.char("kode_industri", { length: 5 }),
  kode_kategori: m.char("kode_kategori", { length: 4 }),
  kode_golongan: m.char("kode_golongan", { length: 4 }),
});

export type Databarang = typeof databarang.$inferSelect;
export type NewDatabarang = typeof databarang.$inferInsert;
