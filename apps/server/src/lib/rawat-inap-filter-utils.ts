import { sql, and, gte, lte, eq, inArray, ne } from "drizzle-orm";
import { reg_periksa } from "../db/schema/reg_periksa";
import { bridging_sep } from "../db/schema/bridging_sep";
import { pasien } from "../db/schema/pasien";
import { jns_perawatan_inap } from "../db/schema/jns_perawatan_inap";
import { dpjp_ranap } from "../db/schema/dpjp_ranap";
import { permintaan_lab } from "../db/schema/permintaan_lab";
import { permintaan_radiologi } from "../db/schema/permintaan_radiologi";
import { kamarInap } from "../db/schema/kamar_inap";
import { bangsal } from "../db/schema/bangsal";

export interface RawatInapFilterInput {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  kd_dokter?: string;
  kd_poli?: string;
  csvSepNumbers?: string[];
  kd_bangsal?: string;
  selectedSupport?: string;
}

export function buildRawatInapFilterConditions(input: RawatInapFilterInput) {
  const whereConditions = [];

  if (input.search) {
    whereConditions.push(
      sql`(${reg_periksa.no_rawat} LIKE ${`%${input.search}%`} OR ${bridging_sep.no_sep} LIKE ${`%${input.search}%`} OR ${reg_periksa.no_rkm_medis} LIKE ${`%${input.search}%`} OR ${pasien.nm_pasien} LIKE ${`%${input.search}%`})`
    );
  }

  if (input.dateFrom) {
    whereConditions.push(gte(reg_periksa.tgl_registrasi, input.dateFrom));
  }

  if (input.dateTo) {
    whereConditions.push(lte(reg_periksa.tgl_registrasi, input.dateTo));
  }

  if (input.kd_dokter) {
    whereConditions.push(eq(dpjp_ranap.kd_dokter, input.kd_dokter));
  }

  if (input.kd_poli) {
    whereConditions.push(eq(reg_periksa.kd_poli, input.kd_poli));
  }

  if (input.kd_bangsal) {
    whereConditions.push(eq(bangsal.kd_bangsal, input.kd_bangsal));
  }

  if (input.csvSepNumbers && input.csvSepNumbers.length > 0) {
    whereConditions.push(inArray(bridging_sep.no_sep, input.csvSepNumbers));
  }

  if (input.selectedSupport) {
    if (input.selectedSupport === "lab") {
      whereConditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${permintaan_lab} 
          WHERE ${permintaan_lab.no_rawat} = ${kamarInap.no_rawat}
        ) > 0`
      );
    } else if (input.selectedSupport === "radiologi") {
      whereConditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${permintaan_radiologi} 
          WHERE ${permintaan_radiologi.no_rawat} = ${kamarInap.no_rawat}
        ) > 0`
      );
    }
  }

  return {
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
  };
}
