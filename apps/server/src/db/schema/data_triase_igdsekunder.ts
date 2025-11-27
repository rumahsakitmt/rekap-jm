import * as m from "drizzle-orm/mysql-core";

export const data_triase_igdsekunder = m.mysqlTable("data_triase_igdsekunder", {
  no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  anamnesa_singkat: m.varchar("anamnesa_singkat", { length: 400 }),
  catatan: m.varchar("catatan", { length: 100 }),
  plan: m.varchar("plan", { length: 50 }),
  tanggaltriase: m.datetime("tanggaltriase", { mode: "date" }),
  nik: m.varchar("nik", { length: 50 }),
});
