import { db } from "../db";
import { reg_periksa } from "../db/schema/reg_periksa";
import { rawat_jl_drpr } from "../db/schema/rawat_jl_drpr";
import { bridging_sep } from "../db/schema/bridging_sep";
import { permintaan_radiologi } from "../db/schema/permintaan_radiologi";
import { permintaan_lab } from "../db/schema/permintaan_lab";
import { dokter } from "../db/schema/dokter";
import { jns_perawatan } from "../db/schema/jns_perawatan";
import { pasien } from "../db/schema/pasien";
import { poliklinik } from "../db/schema/poliklinik";
import { jns_perawatan_radiologi } from "../db/schema/jns_perawatan_radiologi";
import { permintaan_pemeriksaan_radiologi } from "../db/schema/permintaan_pemeriksaan_radiologi";
import { sql, eq, asc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export function createBaseRegPeriksaQuery(
  whereCondition?: SQL,
  havingCondition?: SQL
) {
  return db
    .select({
      no_rawat: reg_periksa.no_rawat,
      no_rekam_medis: reg_periksa.no_rkm_medis,
      jns_perawatan: sql<string>`JSON_ARRAYAGG(
        CASE 
          WHEN (${jns_perawatan.nm_perawatan} LIKE '%konsul%' OR ${jns_perawatan.nm_perawatan} LIKE '%visite%')
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%'
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%'
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%'
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%'
          THEN JSON_OBJECT(
            'kd_jenis_prw', ${jns_perawatan.kd_jenis_prw},
            'nm_perawatan', ${jns_perawatan.nm_perawatan},
            'kd_dokter', ${rawat_jl_drpr.kd_dokter},
            'nm_dokter', (
              SELECT d.nm_dokter 
              FROM ${dokter} d 
              WHERE d.kd_dokter = ${rawat_jl_drpr.kd_dokter}
            ),
            'is_konsul', true
          )
          ELSE NULL
        END
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
        WHERE pr.no_rawat = ${reg_periksa.no_rawat}
      )`,
      konsul_count: sql<number>`SUM(CASE WHEN (${jns_perawatan.nm_perawatan} LIKE '%konsul%' OR ${jns_perawatan.nm_perawatan} LIKE '%visite%') AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%' THEN 1 ELSE 0 END)`,
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
      )`,
      total_permintaan_lab: sql<number>`(
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM ${permintaan_lab} 
        WHERE ${permintaan_lab.no_rawat} = ${reg_periksa.no_rawat}
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

export function createSummaryReportQuery(
  whereCondition?: SQL,
  havingCondition?: SQL
) {
  return db
    .select({
      no_rawat: reg_periksa.no_rawat,
      no_rekam_medis: reg_periksa.no_rkm_medis,
      jns_perawatan: sql<string>`JSON_ARRAYAGG(
        CASE 
          WHEN (${jns_perawatan.nm_perawatan} LIKE '%konsul%' OR ${jns_perawatan.nm_perawatan} LIKE '%visite%')
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%'
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%'
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%'
          AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%'
          THEN JSON_OBJECT(
            'kd_jenis_prw', ${jns_perawatan.kd_jenis_prw},
            'nm_perawatan', ${jns_perawatan.nm_perawatan},
            'kd_dokter', ${rawat_jl_drpr.kd_dokter},
            'nm_dokter', (
              SELECT d.nm_dokter 
              FROM ${dokter} d 
              WHERE d.kd_dokter = ${rawat_jl_drpr.kd_dokter}
            ),
            'is_konsul', true
          )
          ELSE NULL
        END
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
        WHERE pr.no_rawat = ${reg_periksa.no_rawat}
      )`,
      konsul_count: sql<number>`SUM(CASE WHEN (${jns_perawatan.nm_perawatan} LIKE '%konsul%' OR ${jns_perawatan.nm_perawatan} LIKE '%visite%') AND ${jns_perawatan.nm_perawatan} NOT LIKE '%hp%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%radiologi%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%dokter umum%' AND ${jns_perawatan.nm_perawatan} NOT LIKE '%antar spesialis%' THEN 1 ELSE 0 END)`,
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
      )`,
      total_permintaan_lab: sql<number>`(
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM ${permintaan_lab} 
        WHERE ${permintaan_lab.no_rawat} = ${reg_periksa.no_rawat}
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
