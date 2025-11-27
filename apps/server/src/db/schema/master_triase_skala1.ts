import * as m from "drizzle-orm/mysql-core";

export const master_triase_skala1 = m.mysqlTable("master_triase_skala1", {
  kode_skala1: m.varchar("kode_skala1", { length: 3 }).primaryKey(),
  pengkajian_skala1: m.varchar("pengkajian_skala1", { length: 150 }),
  kode_pemeriksaan: m.varchar("kode_pemeriksaan", { length: 3 }),
});
