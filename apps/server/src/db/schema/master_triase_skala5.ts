import * as m from "drizzle-orm/mysql-core";

export const master_triase_skala5 = m.mysqlTable("master_triase_skala5", {
  kode_skala5: m.varchar("kode_skala5", { length: 3 }).primaryKey(),
  pengkajian_skala5: m.varchar("pengkajian_skala5", { length: 150 }),
  kode_pemeriksaan: m.varchar("kode_pemeriksaan", { length: 3 }),
});
