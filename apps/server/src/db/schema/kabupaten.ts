import * as m from "drizzle-orm/mysql-core";

export const kabupaten = m.mysqlTable("kabupaten", {
  kd_kab: m.int("kd_kab").primaryKey(),
  nm_kab: m.varchar("nm_kab", { length: 100 }),
  kd_prop: m.int("kd_prop"),
});
