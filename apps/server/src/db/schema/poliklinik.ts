import * as m from "drizzle-orm/mysql-core";

export const poliklinik = m.mysqlTable("poliklinik", {
  kd_poli: m.char("kd_poli", { length: 5 }).primaryKey(),
  nm_poli: m.varchar("nm_poli", { length: 50 }),
  registrasi: m.double("registrasi"),
  registrasilama: m.double("registrasilama"),
  status: m.varchar("status", { length: 2 }),
});
