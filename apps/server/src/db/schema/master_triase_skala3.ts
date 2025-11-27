import * as m from "drizzle-orm/mysql-core";

export const master_triase_skala3 = m.mysqlTable("master_triase_skala3", {
  kode_skala3: m.varchar("kode_skala3", { length: 3 }).primaryKey(),
  pengkajian_skala3: m.varchar("pengkajian_skala3", { length: 150 }),
  kode_pemeriksaan: m.varchar("kode_pemeriksaan", { length: 3 }),
});
