import * as m from "drizzle-orm/mysql-core";

export const kelurahan = m.mysqlTable("kelurahan", {
  kd_kel: m.int("kd_kel").primaryKey(),
  nm_kel: m.varchar("nm_kel", { length: 100 }),
  kd_kec: m.int("kd_kec"),
});
