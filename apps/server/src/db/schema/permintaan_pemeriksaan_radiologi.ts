import * as m from "drizzle-orm/mysql-core";

export const permintaan_pemeriksaan_radiologi = m.mysqlTable(
  "permintaan_pemeriksaan_radiologi",
  {
    noorder: m.varchar("noorder", { length: 15 }).primaryKey(),
    kd_jenis_prw: m.varchar("kd_jenis_prw", { length: 15 }),
    stts_bayar: m.varchar("stts_bayar", { length: 10 }),
  }
);
