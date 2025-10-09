import * as m from "drizzle-orm/mysql-core";

export const gudangbarang = m.mysqlTable("gudangbarang", {
  kode_brng: m.varchar("kode_brng", { length: 15 }).notNull(),
  kd_bangsal: m.char("kd_bangsal", { length: 5 }).notNull(),
  stok: m.double("stok").notNull(),
  no_batch: m.varchar("no_batch", { length: 20 }).notNull(),
  no_faktur: m.varchar("no_faktur", { length: 20 }).notNull(),
});

export type Gudangbarang = typeof gudangbarang.$inferSelect;
export type NewGudangbarang = typeof gudangbarang.$inferInsert;
