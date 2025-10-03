import { db } from "@/db";
import {
  permintaan_pemeriksaan_radiologi,
  rawat_jl_drpr,
  jns_perawatan,
  dokter,
  bridging_sep,
  permintaan_radiologi,
  permintaan_lab,
  pasien,
  poliklinik,
  jns_perawatan_radiologi,
  reg_periksa,
} from "@/db/schema/";
import { sql, eq, asc, inArray, like, and, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

function getKonsulCountCondition() {
  return sql<number>`(
    SELECT COUNT(DISTINCT CONCAT(rjd.kd_jenis_prw, '-', rjd.kd_dokter))
    FROM ${rawat_jl_drpr} rjd
    JOIN ${jns_perawatan} jp ON rjd.kd_jenis_prw = jp.kd_jenis_prw
    WHERE rjd.no_rawat = ${reg_periksa.no_rawat}
    AND (jp.nm_perawatan LIKE '%konsul%' OR jp.nm_perawatan LIKE '%visite%')
    AND jp.nm_perawatan NOT LIKE '%hp%'
    AND jp.nm_perawatan NOT LIKE '%radiologi%'
    AND jp.nm_perawatan NOT LIKE '%dokter umum%'
    AND jp.nm_perawatan NOT LIKE '%antar spesialis%'
  )`;
}

export function getJenisPerawatanRawatJalan(no_rawat: string[]) {
  return db
    .select({
      no_rawat: rawat_jl_drpr.no_rawat,
      kd_jenis_prw: rawat_jl_drpr.kd_jenis_prw,
      nm_perawatan: jns_perawatan.nm_perawatan,
      kd_dokter: rawat_jl_drpr.kd_dokter,
      nm_dokter: dokter.nm_dokter,
    })
    .from(rawat_jl_drpr)
    .innerJoin(
      jns_perawatan,
      eq(rawat_jl_drpr.kd_jenis_prw, jns_perawatan.kd_jenis_prw)
    )
    .innerJoin(dokter, eq(rawat_jl_drpr.kd_dokter, dokter.kd_dokter))
    .where(
      and(
        inArray(rawat_jl_drpr.no_rawat, no_rawat),
        or(
          like(jns_perawatan.nm_perawatan, "%konsul%"),
          like(jns_perawatan.nm_perawatan, "%visite%")
        ),
        sql`${jns_perawatan.nm_perawatan} NOT LIKE '%hp%'`,
        sql`${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%'`,
        sql`${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%'`,
        sql`${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%'`
      )
    )
    .groupBy(
      rawat_jl_drpr.no_rawat,
      rawat_jl_drpr.kd_jenis_prw,
      rawat_jl_drpr.kd_dokter
    );
}

export function getJenisPerawatanRadiologiRawatJalan(no_rawat: string[]) {
  return db
    .select({
      no_rawat: permintaan_radiologi.no_rawat,
      kd_jenis_prw: jns_perawatan_radiologi.kd_jenis_prw,
      nm_perawatan: jns_perawatan_radiologi.nm_perawatan,
      noorder: permintaan_radiologi.noorder,
    })
    .from(permintaan_radiologi)
    .innerJoin(
      permintaan_pemeriksaan_radiologi,
      eq(permintaan_radiologi.noorder, permintaan_pemeriksaan_radiologi.noorder)
    )
    .innerJoin(
      jns_perawatan_radiologi,
      eq(
        permintaan_pemeriksaan_radiologi.kd_jenis_prw,
        jns_perawatan_radiologi.kd_jenis_prw
      )
    )
    .where(
      and(
        inArray(permintaan_radiologi.no_rawat, no_rawat),
        sql`${permintaan_radiologi.tgl_hasil} != '0000-00-00'`
      )
    );
}

export function createRawatJalanQuery(
  whereCondition?: SQL,
  havingCondition?: SQL
) {
  return db
    .select({
      no_rawat: reg_periksa.no_rawat,
      no_rekam_medis: reg_periksa.no_rkm_medis,
      konsul_count: getKonsulCountCondition(),
      kd_dokter: sql<string>`CASE 
        WHEN ${poliklinik.nm_poli} = 'IGD' AND (
          SELECT COUNT(*) 
          FROM ${rawat_jl_drpr} rjd2
          JOIN ${jns_perawatan} jp2 ON rjd2.kd_jenis_prw = jp2.kd_jenis_prw
          WHERE rjd2.no_rawat = ${reg_periksa.no_rawat}
          AND (jp2.nm_perawatan LIKE '%konsul%' OR jp2.nm_perawatan LIKE '%visite%')
          AND jp2.nm_perawatan NOT LIKE '%hp%'
          AND jp2.nm_perawatan NOT LIKE '%radiologi%'
          AND jp2.nm_perawatan NOT LIKE '%dokter umum%'
          AND jp2.nm_perawatan NOT LIKE '%antar spesialis%'
        ) > 0
        THEN (
          SELECT rjd3.kd_dokter
          FROM ${rawat_jl_drpr} rjd3
          JOIN ${jns_perawatan} jp3 ON rjd3.kd_jenis_prw = jp3.kd_jenis_prw
          WHERE rjd3.no_rawat = ${reg_periksa.no_rawat}
          AND (jp3.nm_perawatan LIKE '%konsul%' OR jp3.nm_perawatan LIKE '%visite%')
          AND jp3.nm_perawatan NOT LIKE '%hp%'
          AND jp3.nm_perawatan NOT LIKE '%radiologi%'
          AND jp3.nm_perawatan NOT LIKE '%dokter umum%'
          AND jp3.nm_perawatan NOT LIKE '%antar spesialis%'
          LIMIT 1
        )
        ELSE COALESCE(
          ${rawat_jl_drpr.kd_dokter},
          ${dokter.kd_dokter},
          'Unknown'
        )
      END`,
      nip: rawat_jl_drpr.nip,
      tgl_perawatan: sql<string>`DATE_FORMAT(${reg_periksa.tgl_registrasi}, '%e %b %Y')`,
      jam_rawat: reg_periksa.jam_reg,
      material: sql<number>`SUM(${rawat_jl_drpr.material})`,
      bhp: sql<number>`SUM(${rawat_jl_drpr.bhp})`,
      tarif_tindakandr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakandr})`,
      tarif_tindakanpr: sql<number>`SUM(${rawat_jl_drpr.tarif_tindakanpr})`,
      kso: sql<number>`SUM(${rawat_jl_drpr.kso})`,
      menejemen: sql<number>`SUM(${rawat_jl_drpr.menejemen})`,
      biaya_rawat: sql<number>`SUM(${rawat_jl_drpr.biaya_rawat})`,
      stts_bayar: reg_periksa.status_bayar,
      no_sep: bridging_sep.no_sep,
      total_permintaan_radiologi: sql<number>`(
        SELECT COUNT(*) 
        FROM ${permintaan_radiologi} 
        WHERE ${permintaan_radiologi.no_rawat} = ${reg_periksa.no_rawat}
        AND ${permintaan_radiologi.tgl_hasil} != '0000-00-00'
      )`,
      total_permintaan_lab: sql<number>`(
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM ${permintaan_lab} 
        WHERE ${permintaan_lab.no_rawat} = ${reg_periksa.no_rawat}
        AND ${permintaan_lab.tgl_hasil} != '0000-00-00'
      )`,
      nm_dokter: sql<string>`CASE 
        WHEN ${poliklinik.nm_poli} = 'IGD' AND (
          SELECT COUNT(*) 
          FROM ${rawat_jl_drpr} rjd2
          JOIN ${jns_perawatan} jp2 ON rjd2.kd_jenis_prw = jp2.kd_jenis_prw
          WHERE rjd2.no_rawat = ${reg_periksa.no_rawat}
          AND (jp2.nm_perawatan LIKE '%konsul%' OR jp2.nm_perawatan LIKE '%visite%')
          AND jp2.nm_perawatan NOT LIKE '%hp%'
          AND jp2.nm_perawatan NOT LIKE '%radiologi%'
          AND jp2.nm_perawatan NOT LIKE '%dokter umum%'
          AND jp2.nm_perawatan NOT LIKE '%antar spesialis%'
        ) > 0
        THEN (
          SELECT d.nm_dokter 
          FROM ${dokter} d 
          WHERE d.kd_dokter = (
            SELECT rjd3.kd_dokter
            FROM ${rawat_jl_drpr} rjd3
            JOIN ${jns_perawatan} jp3 ON rjd3.kd_jenis_prw = jp3.kd_jenis_prw
            WHERE rjd3.no_rawat = ${reg_periksa.no_rawat}
            AND (jp3.nm_perawatan LIKE '%konsul%' OR jp3.nm_perawatan LIKE '%visite%')
            AND jp3.nm_perawatan NOT LIKE '%hp%'
            AND jp3.nm_perawatan NOT LIKE '%radiologi%'
            AND jp3.nm_perawatan NOT LIKE '%dokter umum%'
            AND jp3.nm_perawatan NOT LIKE '%antar spesialis%'
            LIMIT 1
          )
        )
        ELSE COALESCE(
          (
            SELECT d.nm_dokter 
            FROM ${dokter} d 
            WHERE d.kd_dokter = ${rawat_jl_drpr.kd_dokter}
            LIMIT 1
          ),
          ${dokter.nm_dokter},
          'Unknown'
        )
      END`,
      nm_pasien: pasien.nm_pasien,
      no_rkm_medis: pasien.no_rkm_medis,
      jk: pasien.jk,
      tgl_lahir: pasien.tgl_lahir,
      alamat: pasien.alamat,
      nm_poli: poliklinik.nm_poli,
    })
    .from(reg_periksa)
    .leftJoin(dokter, eq(reg_periksa.kd_dokter, dokter.kd_dokter))
    .leftJoin(rawat_jl_drpr, eq(reg_periksa.no_rawat, rawat_jl_drpr.no_rawat))
    .leftJoin(
      jns_perawatan,
      eq(rawat_jl_drpr.kd_jenis_prw, jns_perawatan.kd_jenis_prw)
    )
    .innerJoin(bridging_sep, eq(reg_periksa.no_rawat, bridging_sep.no_rawat))
    .leftJoin(
      permintaan_radiologi,
      eq(reg_periksa.no_rawat, permintaan_radiologi.no_rawat)
    )
    .leftJoin(
      permintaan_pemeriksaan_radiologi,
      eq(permintaan_radiologi.noorder, permintaan_pemeriksaan_radiologi.noorder)
    )
    .leftJoin(
      jns_perawatan_radiologi,
      eq(
        permintaan_pemeriksaan_radiologi.kd_jenis_prw,
        jns_perawatan_radiologi.kd_jenis_prw
      )
    )
    .leftJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
    .leftJoin(poliklinik, eq(reg_periksa.kd_poli, poliklinik.kd_poli))
    .where(whereCondition)
    .groupBy(reg_periksa.no_rawat)
    .having(havingCondition)
    .orderBy(asc(reg_periksa.tgl_registrasi));
}

export const createBaseRawatJalanQuery = (
  whereCondition?: SQL,
  havingCondition?: SQL
) => createRawatJalanQuery(whereCondition, havingCondition);

export const createSummaryReportQuery = (
  whereCondition?: SQL,
  havingCondition?: SQL
) => createRawatJalanQuery(whereCondition, havingCondition);
