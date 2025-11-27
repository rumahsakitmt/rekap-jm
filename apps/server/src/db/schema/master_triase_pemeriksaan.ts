import * as m from "drizzle-orm/mysql-core";

export const master_triase_pemeriksaan = m.mysqlTable(
  "master_triase_pemeriksaan",
  {
    kode_pemeriksaan: m.varchar("kode_pemeriksaan", { length: 3 }).primaryKey(),
    nama_pemeriksaan: m.varchar("nama_pemeriksaan", { length: 150 }),
  }
);
