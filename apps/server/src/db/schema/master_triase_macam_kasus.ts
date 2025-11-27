import * as m from "drizzle-orm/mysql-core";

export const master_triase_macam_kasus = m.mysqlTable(
  "master_triase_macam_kasus",
  {
    kode_kasus: m.varchar("kode_kasus", { length: 3 }).primaryKey(),
    macam_kasus: m.varchar("macam_kasus", { length: 150 }),
  }
);
