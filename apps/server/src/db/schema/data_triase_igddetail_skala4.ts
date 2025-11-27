import * as m from "drizzle-orm/mysql-core";

export const data_triase_igddetail_skala4 = m.mysqlTable(
  "data_triase_igddetail_skala4",
  {
    kode_skala4: m.varchar("kode_skala4", { length: 3 }),
    no_rawat: m.varchar("no_rawat", { length: 17 }),
  }
);
