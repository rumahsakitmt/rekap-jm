import * as m from "drizzle-orm/mysql-core";

export const data_triase_igddetail_skala3 = m.mysqlTable(
  "data_triase_igddetail_skala3",
  {
    kode_skala3: m.varchar("kode_skala3", { length: 3 }),
    no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  }
);
