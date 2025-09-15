import * as m from "drizzle-orm/mysql-core";

export const penjab = m.mysqlTable("penjab", {
  kd_pj: m.varchar("kd_pj", { length: 3 }).primaryKey(),
  png_jawab: m.varchar("png_jawab", { length: 100 }),
  nama_perusahaan: m.varchar("nama_perusahaan", { length: 100 }),
  alamat_asuransi: m.varchar("alamat_asuransi", { length: 200 }),
  no_telp: m.varchar("no_telp", { length: 40 }),
  attn: m.varchar("attn", { length: 100 }),
});
