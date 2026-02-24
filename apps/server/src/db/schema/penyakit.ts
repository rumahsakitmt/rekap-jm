import * as m from "drizzle-orm/mysql-core";

export const penyakit = m.mysqlTable("penyakit", {
  kd_penyakit: m.varchar("kd_penyakit", { length: 15 }).primaryKey(),
  nm_penyakit: m.varchar("nm_penyakit", { length: 100 }),
  ciri_ciri: m.text("ciri_ciri"),
  keterangan: m.varchar("keterangan", { length: 60 }),
  kd_ktg: m.varchar("kd_ktg", { length: 8 }),
  status: m.mysqlEnum("status", ["Menular", "Tidak Menular"]),
  im: m.varchar("im", { length: 1 }),
  accpdx: m.varchar("accpdx", { length: 1 }),
  asterik: m.varchar("asterik", { length: 1 }),
  validcode: m.varchar("validcode", { length: 1 }),
});
