import * as m from "drizzle-orm/mysql-core";

export const master_triase_skala2 = m.mysqlTable("master_triase_skala2", {
  kode_skala2: m.varchar("kode_skala2", { length: 3 }).primaryKey(),
  pengkajian_skala2: m.varchar("pengkajian_skala2", { length: 150 }),
  kode_pemeriksaan: m.varchar("kode_pemeriksaan", { length: 3 }),
});
