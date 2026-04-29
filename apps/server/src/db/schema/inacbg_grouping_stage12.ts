import * as m from "drizzle-orm/mysql-core";

export const inacbg_grouping_stage12 = m.mysqlTable("inacbg_grouping_stage12", {
    no_sep: m.varchar("no_sep", { length: 40 }).primaryKey(),
    code_cbg: m.varchar("code_cbg", { length: 10 }),
    deskripsi: m.varchar("deskripsi", { length: 200 }),
    tarif: m.double("tarif")
});
