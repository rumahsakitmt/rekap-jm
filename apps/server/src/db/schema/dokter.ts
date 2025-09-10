import * as m from "drizzle-orm/mysql-core";

export const dokter = m.mysqlTable("dokter", {
  kd_dokter: m.varchar("kd_dokter", { length: 20 }).primaryKey(),
  nm_dokter: m.varchar("nm_dokter", { length: 50 }),
  jk: m.varchar("jk", { length: 1 }),
  tmp_lahir: m.varchar("tmp_lahir", { length: 20 }),
  gol_drh: m.varchar("gol_drh", { length: 1 }),
  agama: m.varchar("agama", { length: 12 }),
  almt_tgl: m.varchar("almt_tgl", { length: 60 }),
  no_telp: m.varchar("no_telp", { length: 15 }),
  stts_nikah: m.varchar("stts_nikah", { length: 1 }),
  kd_sps: m.varchar("kd_sps", { length: 10 }),
  alumni: m.varchar("alumni", { length: 20 }),
  no_ijin_praktek: m.varchar("no_ijn_praktek", { length: 120 }),
  status: m.varchar("status", { length: 1 }),
});
