import * as m from "drizzle-orm/mysql-core";

export const inacbg_klaim_baru2 = m.mysqlTable("inacbg_klaim_baru2", {
    no_rawat: m.varchar("no_rawat", { length: 17 }).primaryKey(),
    no_sep: m.varchar("no_sep", { length: 40 }).notNull().unique(),
    patient_id: m.varchar("patient_id", { length: 30 }),
    admission_id: m.varchar("admission_id", { length: 30 }),
    hospital_admission_id: m.varchar("hospital_admission_id", { length: 30 }),
});
