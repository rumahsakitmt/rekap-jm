import * as m from "drizzle-orm/mysql-core";

export const kamar_inap = m.mysqlTable("kamar_inap", {
  no_rawat: m.varchar("no_rawat", { length: 17 }).primaryKey(),
  kd_kamar: m.varchar("kd_kamar", { length: 15 }),
  trf_kamar: m.double("trf_kamar"),
  diagnosa_awal: m.varchar("diagnosa_awal", { length: 100 }),
  diagnosa_akhir: m.varchar("diagnosa_akhir", { length: 100 }),
  tgl_masuk: m.date("tgl_masuk"),
  jam_masuk: m.time("jam_masuk"),
  tgl_keluar: m.date("tgl_keluar"),
  jam_keluar: m.time("jam_keluar"),
  lama: m.double("lama"),
  ttl_biaya: m.double("ttl_biaya"),
  stts_pulang: m.varchar("stts_pulang", { length: 10 }),
});
