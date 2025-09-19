import * as m from "drizzle-orm/mysql-core";

export const petugas = m.mysqlTable("petugas", {
  nip: m.varchar("nip", { length: 20 }).primaryKey(),
  nama: m.varchar("nama", { length: 20 }),
  jk: m.varchar("jk", { length: 2 }),
  tmp_lahir: m.varchar("tmp_lahir", { length: 20 }),
  tgl_lahir: m.date("tgl_lahir"),
  gol_darah: m.varchar("gol_darah", { length: 2 }),
  agama: m.varchar("agama", { length: 20 }),
  stts_nikah: m.varchar("stts_nikah", { length: 20 }),
  alamat: m.varchar("alamat", { length: 200 }),
  kd_jbtn: m.varchar("kd_jbtn", { length: 20 }),
  no_telp: m.varchar("no_telp", { length: 20 }),
  status: m.varchar("status", { length: 2 }),
});
