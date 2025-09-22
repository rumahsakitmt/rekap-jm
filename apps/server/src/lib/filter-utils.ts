import {
  sql,
  and,
  gte,
  lte,
  eq,
  inArray,
  gt,
  lt,
  gte as gteOp,
  lte as lteOp,
  ne,
} from "drizzle-orm";
import { reg_periksa } from "../db/schema/reg_periksa";
import { bridging_sep } from "../db/schema/bridging_sep";
import { pasien } from "../db/schema/pasien";
import { jns_perawatan } from "@/db/schema/jns_perawatan";
import { permintaan_lab } from "../db/schema/permintaan_lab";
import { permintaan_radiologi } from "../db/schema/permintaan_radiologi";

export interface KonsulFilter {
  field: string;
  operator: string;
  value: string;
}

export interface FilterInput {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  kd_dokter?: string;
  kd_poli?: string;
  csvSepNumbers?: string[];
  konsulFilters?: KonsulFilter[];
  selectedSupport?: string;
  konsul?: boolean;
}

export function buildFilterConditions(input: FilterInput) {
  const whereConditions = [];
  const havingConditions = [];

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
    whereConditions.push(eq(reg_periksa.kd_dokter, input.kd_dokter));
  }

  if (input.kd_poli) {
    whereConditions.push(eq(reg_periksa.kd_poli, input.kd_poli));
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
          WHERE ${permintaan_lab.no_rawat} = ${reg_periksa.no_rawat}
        ) > 0`
      );
    } else if (input.selectedSupport === "radiologi") {
      whereConditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${permintaan_radiologi} 
          WHERE ${permintaan_radiologi.no_rawat} = ${reg_periksa.no_rawat}
        ) > 0`
      );
    }
  }

  if (input.konsul === true) {
    const konsulCountExpr = sql<number>`SUM(CASE WHEN (${jns_perawatan.nm_perawatan} LIKE '%konsul%' OR ${jns_perawatan.nm_perawatan} LIKE '%visite%') AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%' THEN 1 ELSE 0 END)`;
    havingConditions.push(gt(konsulCountExpr, 1));
  }

  if (input.konsulFilters && input.konsulFilters.length > 0) {
    for (const filter of input.konsulFilters) {
      if (!filter.value) continue;

      const numericValue = parseFloat(filter.value);
      if (isNaN(numericValue)) continue;

      let condition;

      if (filter.field === "konsul_count") {
        const konsulCountExpr = sql<number>`SUM(CASE WHEN ${jns_perawatan.nm_perawatan} LIKE '%konsul%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%' THEN 1 ELSE 0 END)`;

        switch (filter.operator) {
          case "=":
            condition = eq(konsulCountExpr, numericValue);
            break;
          case "<>":
            condition = ne(konsulCountExpr, numericValue);
            break;
          case ">":
            condition = gt(konsulCountExpr, numericValue);
            break;
          case "<":
            condition = lt(konsulCountExpr, numericValue);
            break;
          case ">=":
            condition = gteOp(konsulCountExpr, numericValue);
            break;
          case "<=":
            condition = lteOp(konsulCountExpr, numericValue);
            break;
          default:
            continue;
        }

        if (condition) {
          havingConditions.push(condition);
        }
      } else {
        switch (filter.operator) {
          case "=":
            condition = eq(sql`${filter.field}`, numericValue);
            break;
          case "<>":
            condition = ne(sql`${filter.field}`, numericValue);
            break;
          case ">":
            condition = gt(sql`${filter.field}`, numericValue);
            break;
          case "<":
            condition = lt(sql`${filter.field}`, numericValue);
            break;
          case ">=":
            condition = gteOp(sql`${filter.field}`, numericValue);
            break;
          case "<=":
            condition = lteOp(sql`${filter.field}`, numericValue);
            break;
          default:
            continue;
        }

        if (condition) {
          whereConditions.push(condition);
        }
      }
    }
  }

  return {
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    having: havingConditions.length > 0 ? and(...havingConditions) : undefined,
  };
}
