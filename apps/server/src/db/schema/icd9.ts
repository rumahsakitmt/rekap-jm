import * as m from "drizzle-orm/mysql-core";

export const icd9 = m.mysqlTable("icd9", {
  kode: m.varchar("kode", { length: 10 }).primaryKey(),
  deskripsi_panjang: m.varchar("deskripsi_panjang", { length: 255 }),
  deskripsi_pendek: m.varchar("deskripsi_pendek", { length: 255 }),
  validcode: m.mysqlEnum("validcode", ["0", "1"]),
  accpdx: m.mysqlEnum("accpdx", ["Y", "N"]),
  im: m.varchar("im", { length: 1 }),
});
