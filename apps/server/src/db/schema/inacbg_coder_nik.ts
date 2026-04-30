import * as m from "drizzle-orm/mysql-core";

export const inacbg_coder_nik = m.mysqlTable("inacbg_coder_nik", {
  nik: m.varchar("nik", { length: 20 }).primaryKey(),
  no_ik: m.varchar("no_ik", { length: 30 }),
});
