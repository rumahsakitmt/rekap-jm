import * as m from "drizzle-orm/mysql-core";

export const permintaan_radiologi = m.mysqlTable("permintaan_radiologi", {
  noorder: m.varchar("noorder", { length: 20 }).primaryKey(),
  no_rawat: m.varchar("no_rawat", { length: 20 }),
  tgl_permintaan: m.date("tgl_permintaan"),
  jam_permintaan: m.time("jam_permintaan"),
  tgl_sampel: m.date("tgl_sampel"),
  jam_sampel: m.time("jam_sampel"),
  tgl_hasil: m.date("tgl_hasil"),
  jam_hasil: m.time("jam_hasil"),
  dokter_perujuk: m.varchar("dokter_perujuk", { length: 20 }),
  status: m.varchar("status", { length: 1 }),
  informasi_tambahan: m.varchar("informasi_tambahan", { length: 200 }),
  diagnosa_klinis: m.varchar("diagnosa_klinis", { length: 200 }),
});
