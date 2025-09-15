import { db } from "../db";
import { kamarInap } from "../db/schema/kamar_inap";
import { reg_periksa } from "../db/schema/reg_periksa";
import { pasien } from "../db/schema/pasien";
import { kamar } from "../db/schema/kamar";
import { bangsal } from "../db/schema/bangsal";
import { penjab } from "../db/schema/penjab";
import { bridging_sep } from "../db/schema/bridging_sep";
import { dokter } from "../db/schema/dokter";
import { permintaan_lab } from "../db/schema/permintaan_lab";
import { permintaan_radiologi } from "../db/schema/permintaan_radiologi";
import { permintaan_pemeriksaan_radiologi } from "../db/schema/permintaan_pemeriksaan_radiologi";
import { jns_perawatan_radiologi } from "../db/schema/jns_perawatan_radiologi";
import { sql, eq, asc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { dpjp_ranap } from "@/db/schema/dpjp_ranap";
import { operasi } from "@/db/schema/operasi";

export function createRawatInapQuery(whereCondition?: SQL) {
  return db
    .select({
      no_rawat: kamarInap.no_rawat,
      no_rkm_medis: reg_periksa.no_rkm_medis,
      nm_pasien: pasien.nm_pasien,
      no_sep: sql<string>`COALESCE(${bridging_sep.no_sep}, '-')`,
      jnspelayanan: sql<string>`IF(${bridging_sep.jnspelayanan}='1','SEP Ranap','SEP Ralan/Umum')`,
      kamar: bangsal.nm_bangsal,
      trf_kamar: kamarInap.trf_kamar,
      diagnosa_awal: kamarInap.diagnosa_awal,
      diagnosa_akhir: kamarInap.diagnosa_akhir,
      tgl_masuk: kamarInap.tgl_masuk,
      tgl_keluar: kamarInap.tgl_keluar,
      stts_pulang: kamarInap.stts_pulang,
      lama: kamarInap.lama,
      nm_dokter: dokter.nm_dokter,
      jns_perawatan: sql<string>`(
        SELECT COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'kd_jenis_prw', jpi.kd_jenis_prw,
              'nm_perawatan', jpi.nm_perawatan,
              'nm_dokter', d.nm_dokter,
              'nm_bangsal', b.nm_bangsal
            )
          ),
          JSON_ARRAY()
        )
        FROM rawat_inap_drpr rid
        INNER JOIN jns_perawatan_inap jpi ON rid.kd_jenis_prw = jpi.kd_jenis_prw 
          AND (jpi.nm_perawatan LIKE '%visite%' OR jpi.nm_perawatan LIKE '%anastensi%')
        INNER JOIN dokter d ON rid.kd_dokter = d.kd_dokter
        INNER JOIN kamar k ON ${kamarInap.kd_kamar} = k.kd_kamar
        INNER JOIN bangsal b ON k.kd_bangsal = b.kd_bangsal
        WHERE rid.no_rawat = ${kamarInap.no_rawat}
      )`,
      jns_perawatan_radiologi: sql<string>`(
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'kd_jenis_prw', jpr.kd_jenis_prw,
            'nm_perawatan', jpr.nm_perawatan,
            'noorder', pr.noorder
          )
        )
        FROM ${permintaan_radiologi} pr
        JOIN ${permintaan_pemeriksaan_radiologi} ppr ON pr.noorder = ppr.noorder
        JOIN ${jns_perawatan_radiologi} jpr ON ppr.kd_jenis_prw = jpr.kd_jenis_prw
        WHERE pr.no_rawat = ${kamarInap.no_rawat}
      )`,
      total_permintaan_radiologi: sql<number>`(
        SELECT COUNT(*) 
        FROM ${permintaan_radiologi} 
        WHERE ${permintaan_radiologi.no_rawat} = ${kamarInap.no_rawat}
      )`,
      total_permintaan_lab: sql<number>`(
        SELECT COUNT(*)
        FROM ${permintaan_lab} 
        WHERE ${permintaan_lab.no_rawat} = ${kamarInap.no_rawat}
      )`,
      has_operasi: sql<boolean>`CASE WHEN ${operasi.no_rawat} IS NOT NULL THEN true ELSE false END`,
      operator: sql<string>`(
        SELECT d.nm_dokter 
        FROM dokter d 
        WHERE d.kd_dokter = ${operasi.operator1}
      )`,
      anestesi: sql<string>`(
        SELECT d.nm_dokter 
        FROM dokter d 
        WHERE d.kd_dokter = ${operasi.dokter_anestesi}
      )`,
    })
    .from(kamarInap)
    .innerJoin(reg_periksa, eq(kamarInap.no_rawat, reg_periksa.no_rawat))
    .innerJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
    .innerJoin(kamar, eq(kamarInap.kd_kamar, kamar.kd_kamar))
    .innerJoin(bangsal, eq(kamar.kd_bangsal, bangsal.kd_bangsal))
    .innerJoin(dpjp_ranap, eq(kamarInap.no_rawat, dpjp_ranap.no_rawat))
    .innerJoin(dokter, eq(dpjp_ranap.kd_dokter, dokter.kd_dokter))
    .innerJoin(penjab, eq(reg_periksa.kd_pj, penjab.kd_pj))
    .leftJoin(bridging_sep, eq(reg_periksa.no_rawat, bridging_sep.no_rawat))
    .leftJoin(operasi, eq(kamarInap.no_rawat, operasi.no_rawat))
    .where(whereCondition)
    .groupBy(kamarInap.no_rawat)
    .orderBy(asc(kamarInap.tgl_masuk));
}

export function createRawatInapSummaryQuery(whereCondition?: SQL) {
  return db
    .select({
      no_rawat: kamarInap.no_rawat,
      kd_dokter: dpjp_ranap.kd_dokter,
      nm_dokter: dokter.nm_dokter,
      jns_perawatan: sql<string>`(
        SELECT COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'kd_jenis_prw', jpi.kd_jenis_prw,
              'nm_perawatan', jpi.nm_perawatan,
              'nm_dokter', d.nm_dokter,
              'nm_bangsal', b.nm_bangsal
            )
          ),
          JSON_ARRAY()
        )
        FROM rawat_inap_drpr rid
        INNER JOIN jns_perawatan_inap jpi ON rid.kd_jenis_prw = jpi.kd_jenis_prw 
          AND (jpi.nm_perawatan LIKE '%visite%' OR jpi.nm_perawatan LIKE '%anastensi%')
        INNER JOIN dokter d ON rid.kd_dokter = d.kd_dokter
        INNER JOIN kamar k ON ${kamarInap.kd_kamar} = k.kd_kamar
        INNER JOIN bangsal b ON k.kd_bangsal = b.kd_bangsal
        WHERE rid.no_rawat = ${kamarInap.no_rawat}
      )`,
      jns_perawatan_radiologi: sql<string>`(
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'kd_jenis_prw', jpr.kd_jenis_prw,
            'nm_perawatan', jpr.nm_perawatan,
            'noorder', pr.noorder
          )
        )
        FROM ${permintaan_radiologi} pr
        JOIN ${permintaan_pemeriksaan_radiologi} ppr ON pr.noorder = ppr.noorder
        JOIN ${jns_perawatan_radiologi} jpr ON ppr.kd_jenis_prw = jpr.kd_jenis_prw
        WHERE pr.no_rawat = ${kamarInap.no_rawat}
      )`,
      total_permintaan_radiologi: sql<number>`(
        SELECT COUNT(*) 
        FROM ${permintaan_radiologi} 
        WHERE ${permintaan_radiologi.no_rawat} = ${kamarInap.no_rawat}
      )`,
      total_permintaan_lab: sql<number>`(
        SELECT COUNT(*)
        FROM ${permintaan_lab} 
        WHERE ${permintaan_lab.no_rawat} = ${kamarInap.no_rawat}
      )`,
      no_sep: bridging_sep.no_sep,
    })
    .from(kamarInap)
    .innerJoin(reg_periksa, eq(kamarInap.no_rawat, reg_periksa.no_rawat))
    .innerJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
    .innerJoin(kamar, eq(kamarInap.kd_kamar, kamar.kd_kamar))
    .innerJoin(bangsal, eq(kamar.kd_bangsal, bangsal.kd_bangsal))
    .innerJoin(dpjp_ranap, eq(kamarInap.no_rawat, dpjp_ranap.no_rawat))
    .innerJoin(dokter, eq(dpjp_ranap.kd_dokter, dokter.kd_dokter))
    .innerJoin(penjab, eq(reg_periksa.kd_pj, penjab.kd_pj))
    .leftJoin(bridging_sep, eq(reg_periksa.no_rawat, bridging_sep.no_rawat))
    .where(whereCondition)
    .groupBy(kamarInap.no_rawat)
    .orderBy(asc(kamarInap.tgl_masuk));
}
