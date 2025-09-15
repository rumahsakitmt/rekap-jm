import * as m from "drizzle-orm/mysql-core";

export const bangsal = m.mysqlTable("bangsal", {
  kd_bangsal: m.varchar("kd_bangsal", { length: 10 }).primaryKey(),
  nm_bangsal: m.varchar("nm_bangsal", { length: 80 }),
  status: m.varchar("status", { length: 1 }),
});
