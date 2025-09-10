import * as m from "drizzle-orm/mysql-core";

export const rawat_jl_drpr = m.mysqlTable("rawat_jl_drpr", {
  no_rawat: m.varchar("no_rawat", { length: 20 }).primaryKey(),
  kd_jenis_prw: m.varchar("kd_jenis_prw", { length: 20 }),
  kd_dokter: m.varchar("kd_dokter", { length: 20 }),
  nip: m.varchar("nip", { length: 20 }),
  tgl_perawatan: m.date("tgl_perawatan"),
  jam_rawat: m.time("jam_rawat"),
  material: m.double("material"),
  bhp: m.double("bhp"),
  tarif_tindakandr: m.double("tarif_tindakandr"),
  tarif_tindakanpr: m.double("tarif_tindakanpr"),
  kso: m.double("kso"),
  menejemen: m.double("menejemen"),
  biaya_rawat: m.double("biaya_rawat"),
  stts_bayar: m.varchar("stts_bayar", { length: 10 }),
});
