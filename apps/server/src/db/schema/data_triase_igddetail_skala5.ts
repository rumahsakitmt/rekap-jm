import * as m from "drizzle-orm/mysql-core";

export const data_triase_igddetail_skala5 = m.mysqlTable(
  "data_triase_igddetail_skala5",
  {
    kode_skala5: m.varchar("kode_skala5", { length: 3 }),
    no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  }
);
