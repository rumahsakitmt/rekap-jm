import * as m from "drizzle-orm/mysql-core";

export const dpjp_ranap = m.mysqlTable("dpjp_ranap", {
  no_rawat: m.varchar("no_rawat", { length: 17 }).primaryKey(),
  kd_dokter: m.varchar("kd_dokter", { length: 20 }),
});
