import * as m from "drizzle-orm/mysql-core";

export const inacbg_klaim_baru_internal = m.mysqlTable("inacbg_klaim_baru_internal", {
    no_sep: m.varchar("no_sep", { length: 40 }).primaryKey(),
    patient_id: m.varchar("patient_id", { length: 30 }),
    admission_id: m.varchar("admission_id", { length: 30 }),
    hospital_admission_id: m.varchar("hospital_admission_id", { length: 30 })
});
