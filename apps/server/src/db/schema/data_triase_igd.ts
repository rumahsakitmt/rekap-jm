import * as m from "drizzle-orm/mysql-core";

export const data_triase_igd = m.mysqlTable("data_triase_igd", {
  no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  tgl_kunjungan: m.datetime("tgl_kunjungan", { mode: "date" }),
  cara_masuk: m.varchar("cara_masuk", { length: 50 }),
  alat_transportasi: m.varchar("alat_transportasi", { length: 50 }),
  alasan_kedatangan: m.varchar("alasan_kedatangan", { length: 50 }),
  keterangan_kedatangan: m.varchar("keterangan_kedatangan", { length: 100 }),
  kode_kasus: m.varchar("kode_kasus", { length: 3 }),
  tekanan_darah: m.varchar("tekanan_darah", { length: 8 }),
  nadi: m.varchar("nadi", { length: 3 }),
  pernapasan: m.varchar("pernapasan", { length: 3 }),
  suhu: m.varchar("suhu", { length: 5 }),
  saturasi_o2: m.varchar("saturasi_o2", { length: 3 }),
  nyeri: m.varchar("nyeri", { length: 5 }),
});
