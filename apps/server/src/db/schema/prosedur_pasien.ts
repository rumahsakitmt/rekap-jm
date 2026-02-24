import * as m from "drizzle-orm/mysql-core";

export const prosedur_pasien = m.mysqlTable(
  "prosedur_pasien",
  {
    no_rawat: m.varchar("no_rawat", { length: 17 }).notNull(),
    kode: m.varchar("kode", { length: 8 }).notNull(),
    status: m.mysqlEnum("status", ["Ralan", "Ranap"]).notNull(),
    prioritas: m.tinyint("prioritas", { unsigned: false }).notNull(),
  },
  (table) => [
    m.primaryKey({ columns: [table.no_rawat, table.kode, table.status] }),
  ],
);
