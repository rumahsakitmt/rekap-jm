import * as m from "drizzle-orm/mysql-core";

export const diagnosa_pasien = m.mysqlTable(
  "diagnosa_pasien",
  {
    no_rawat: m.varchar("no_rawat", { length: 17 }).notNull(),
    kd_penyakit: m.varchar("kd_penyakit", { length: 15 }).notNull(),
    status: m.mysqlEnum("status", ["Ralan", "Ranap"]).notNull(),
    prioritas: m.tinyint("prioritas").notNull(),
    status_penyakit: m.mysqlEnum("status_penyakit", ["Lama", "Baru"]).notNull(),
  },
  (table) => [m.primaryKey({ columns: [table.no_rawat, table.kd_penyakit, table.status] })],
);
