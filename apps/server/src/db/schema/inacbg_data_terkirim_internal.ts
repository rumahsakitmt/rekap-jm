import * as m from "drizzle-orm/mysql-core";

export const inacbg_data_terkirim_internal = m.mysqlTable("inacbg_data_terkirim_internal", {
    no_sep: m.varchar("no_sep", { length: 40 }).primaryKey(),
    nik: m.varchar("nik", { length: 30 })
});
