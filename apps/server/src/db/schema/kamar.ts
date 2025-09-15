import * as m from "drizzle-orm/mysql-core";

export const kamar = m.mysqlTable("kamar", {
  kd_kamar: m.varchar("kd_kamar", { length: 15 }).primaryKey(),
  kd_bangsal: m.varchar("kd_bangsal", { length: 10 }),
  trf_kamar: m.double("trf_kamar"),
  status: m.varchar("status", { length: 1 }),
  kelas: m.varchar("kelas", { length: 10 }),
  fasilitas: m.text("fasilitas"),
});
