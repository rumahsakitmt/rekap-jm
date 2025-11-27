import * as m from "drizzle-orm/mysql-core";

export const data_triase_igdprimer = m.mysqlTable("data_triase_igdprimer", {
  no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  keluhan_utama: m.varchar("keluhan_utama", { length: 400 }),
  kebutuhan_khusus: m.varchar("kebutuhan_khusus", { length: 50 }),
  catatan: m.varchar("catatan", { length: 100 }),
  plan: m.varchar("plan", { length: 50 }),
  tanggaltriase: m.datetime("tanggaltriase", { mode: "date" }),
  nik: m.varchar("nik", { length: 50 }),
});
