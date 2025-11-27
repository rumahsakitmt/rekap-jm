import * as m from "drizzle-orm/mysql-core";

export const master_triase_skala4 = m.mysqlTable("master_triase_skala4", {
  kode_skala4: m.varchar("kode_skala4", { length: 3 }).primaryKey(),
  pengkajian_skala4: m.varchar("pengkajian_skala4", { length: 150 }),
  kode_pemeriksaan: m.varchar("kode_pemeriksaan", { length: 3 }),
});
