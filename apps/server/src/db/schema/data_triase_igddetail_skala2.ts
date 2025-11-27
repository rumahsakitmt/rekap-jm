import * as m from "drizzle-orm/mysql-core";

export const data_triase_igddetail_skala2 = m.mysqlTable(
  "data_triase_igddetail_skala2",
  {
    kode_skala2: m.varchar("kode_skala2", { length: 3 }),
    no_rawat: m.varchar("no_rawat", { length: 17 }),
  }
);
