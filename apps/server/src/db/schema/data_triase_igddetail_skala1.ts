import * as m from "drizzle-orm/mysql-core";

export const data_triase_igddetail_skala1 = m.mysqlTable(
  "data_triase_igddetail_skala1",
  {
    kode_skala1: m.varchar("kode_skala1", { length: 3 }),
    no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  }
);
