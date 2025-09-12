import { sql, and, gte, lte, eq, inArray } from "drizzle-orm";
import { reg_periksa } from "../db/schema/reg_periksa";
import { bridging_sep } from "../db/schema/bridging_sep";
import { pasien } from "../db/schema/pasien";

export interface FilterInput {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  kd_dokter?: string;
  kd_poli?: string;
  csvSepNumbers?: string[];
}

export function buildFilterConditions(input: FilterInput) {
  const conditions = [];

  if (input.search) {
    conditions.push(
      sql`(${reg_periksa.no_rawat} LIKE ${`%${input.search}%`} OR ${bridging_sep.no_sep} LIKE ${`%${input.search}%`} OR ${reg_periksa.no_rkm_medis} LIKE ${`%${input.search}%`} OR ${pasien.nm_pasien} LIKE ${`%${input.search}%`})`
    );
  }

  if (input.dateFrom) {
    conditions.push(gte(reg_periksa.tgl_registrasi, input.dateFrom));
  }

  if (input.dateTo) {
    conditions.push(lte(reg_periksa.tgl_registrasi, input.dateTo));
  }

  if (input.kd_dokter) {
    conditions.push(eq(reg_periksa.kd_dokter, input.kd_dokter));
  }

  if (input.kd_poli) {
    conditions.push(eq(reg_periksa.kd_poli, input.kd_poli));
  }

  if (input.csvSepNumbers && input.csvSepNumbers.length > 0) {
    conditions.push(inArray(bridging_sep.no_sep, input.csvSepNumbers));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
