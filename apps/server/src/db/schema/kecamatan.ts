import * as m from "drizzle-orm/mysql-core";

export const kecamatan = m.mysqlTable("kecamatan", {
  kd_kec: m.int("kd_kec").primaryKey(),
  nm_kec: m.varchar("nm_kec", { length: 100 }),
  kd_kab: m.int("kd_kab"),
});
