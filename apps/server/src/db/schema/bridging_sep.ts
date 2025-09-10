import * as m from "drizzle-orm/mysql-core";

export const bridging_sep = m.mysqlTable("bridging_sep", {
  // Primary key
  no_sep: m.varchar("no_sep", { length: 40 }).primaryKey(),

  // Core fields
  no_rawat: m.varchar("no_rawat", { length: 17 }),
  tglsep: m.date("tglsep"),
  tglrujukan: m.date("tglrujukan"),
  no_rujukan: m.varchar("no_rujukan", { length: 40 }),

  // PPK Rujukan
  kdppkrujukan: m.varchar("kdppkrujukan", { length: 12 }),
  nmppkrujukan: m.varchar("nmppkrujukan", { length: 200 }),

  // PPK Pelayanan
  kdppkpelayanan: m.varchar("kdppkpelayanan", { length: 12 }),
  nmppkpelayanan: m.varchar("nmppkpelayanan", { length: 200 }),

  // Service details
  jnspelayanan: m.varchar("jnspelayanan", { length: 1 }),
  catatan: m.varchar("catatan", { length: 100 }),

  // Diagnosis
  diagawal: m.varchar("diagawal", { length: 10 }),
  nmdiagnosaawal: m.varchar("nmdiagnosaawal", { length: 400 }),

  // Poli
  kdpolitujuan: m.varchar("kdpolitujuan", { length: 15 }),
  nmpolitujuan: m.varchar("nmpolitujuan", { length: 50 }),

  // Class and financing
  klsrawat: m.varchar("klsrawat", { length: 1 }),
  klsnaik: m.varchar("klsnaik", { length: 1 }),
  pembiayaan: m.varchar("pembiayaan", { length: 1 }),
  pjnaikkelas: m.varchar("pjnaikkelas", { length: 100 }),

  // Additional flags
  lakalantas: m.varchar("lakalantas", { length: 1 }),

  // User and patient info
  user: m.varchar("user", { length: 25 }),
  nomr: m.varchar("nomr", { length: 15 }),
  nama_pasien: m.varchar("nama_pasien", { length: 100 }),
  tanggal_lahir: m.date("tanggal_lahir"),
  peserta: m.varchar("peserta", { length: 100 }),
  jkel: m.varchar("jkel", { length: 1 }),
  no_kartu: m.varchar("no_kartu", { length: 25 }),
  tglpulang: m.datetime("tglpulang"),

  // Extended fields
  asal_rujukan: m.varchar("asal_rujukan", { length: 20 }),
  eksekutif: m.varchar("eksekutif", { length: 10 }),
  cob: m.varchar("cob", { length: 10 }),
  notelep: m.varchar("notelep", { length: 40 }),
  katarak: m.varchar("katarak", { length: 10 }),
  tglkkl: m.date("tglkkl"),
  keterangankkl: m.varchar("keterangankkl", { length: 100 }),
  suplesi: m.varchar("suplesi", { length: 10 }),
  no_sep_suplesi: m.varchar("no_sep_suplesi", { length: 40 }),

  // Location
  kdprop: m.varchar("kdprop", { length: 10 }),
  nmprop: m.varchar("nmprop", { length: 50 }),
  kdkab: m.varchar("kdkab", { length: 10 }),
  nmkab: m.varchar("nmkab", { length: 50 }),
  kdkec: m.varchar("kdkec", { length: 10 }),
  nmkec: m.varchar("nmkec", { length: 50 }),

  // SKDP and DPJP
  noskdp: m.varchar("noskdp", { length: 40 }),
  kddpjp: m.varchar("kddpjp", { length: 10 }),
  nmdpdjp: m.varchar("nmdpdjp", { length: 100 }),

  // Visit details
  tujuankunjungan: m.varchar("tujuankunjungan", { length: 1 }),
  flagprosedur: m.varchar("flagprosedur", { length: 1 }),
  penunjang: m.varchar("penunjang", { length: 1 }),
  asesmenpelayanan: m.varchar("asesmenpelayanan", { length: 1 }),

  // DPJP Pelayanan
  kddpjplayanan: m.varchar("kddpjplayanan", { length: 10 }),
  nmdpjplayanan: m.varchar("nmdpjplayanan", { length: 100 }),
});
