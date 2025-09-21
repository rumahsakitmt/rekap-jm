import { db } from "@/db";
import {
  kamar_inap,
  reg_periksa,
  pasien,
  kamar,
  bangsal,
  penjab,
  bridging_sep,
  dokter,
  permintaan_lab,
  periksa_lab,
  permintaan_radiologi,
  periksa_radiologi,
  permintaan_pemeriksaan_radiologi,
  jns_perawatan_radiologi,
  jns_perawatan,
  dpjp_ranap,
  operasi,
  jns_perawatan_inap,
  rawat_inap_drpr,
} from "@/db/schema/";
import { sql, eq, asc, inArray, like, and, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export async function getRadiologiData(noRawatList: string[]) {
  return await db
    .select({
      no_rawat: permintaan_radiologi.no_rawat,
      kd_jenis_prw: jns_perawatan_radiologi.kd_jenis_prw,
      nm_perawatan: jns_perawatan_radiologi.nm_perawatan,
      noorder: permintaan_radiologi.noorder,
      kd_dokter: periksa_radiologi.kd_dokter,
      nm_dokter: dokter.nm_dokter,
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
    .leftJoin(
      periksa_radiologi,
      sql`${permintaan_radiologi.no_rawat} = ${periksa_radiologi.no_rawat} AND ${permintaan_pemeriksaan_radiologi.kd_jenis_prw} = ${periksa_radiologi.kd_jenis_prw}`
    )
    .leftJoin(dokter, eq(periksa_radiologi.kd_dokter, dokter.kd_dokter))
    .where(inArray(permintaan_radiologi.no_rawat, noRawatList));
}

export async function getLabData(noRawatList: string[]) {
  return await db
    .select({
      no_rawat: periksa_lab.no_rawat,
      kd_jenis_prw: jns_perawatan.kd_jenis_prw,
      nm_perawatan: jns_perawatan.nm_perawatan,
      kd_dokter: periksa_lab.kd_dokter,
      nm_dokter: dokter.nm_dokter,
      tgl_periksa: periksa_lab.tgl_periksa,
    })
    .from(periksa_lab)
    .leftJoin(
      jns_perawatan,
      eq(periksa_lab.kd_jenis_prw, jns_perawatan.kd_jenis_prw)
    )
    .leftJoin(dokter, eq(periksa_lab.kd_dokter, dokter.kd_dokter))
    .where(inArray(periksa_lab.no_rawat, noRawatList));
}

export function getJenisPerwatanRawatInap(no_rawat: string[]) {
  return db
    .select({
      no_rawat: rawat_inap_drpr.no_rawat,
      kd_jenis_prw: rawat_inap_drpr.kd_jenis_prw,
      nm_perawatan: jns_perawatan_inap.nm_perawatan,
      kd_dokter: rawat_inap_drpr.kd_dokter,
      nm_dokter: dokter.nm_dokter,
      nm_bangsal: bangsal.nm_bangsal,
    })
    .from(rawat_inap_drpr)
    .innerJoin(
      jns_perawatan_inap,
      eq(rawat_inap_drpr.kd_jenis_prw, jns_perawatan_inap.kd_jenis_prw)
    )
    .innerJoin(dokter, eq(rawat_inap_drpr.kd_dokter, dokter.kd_dokter))
    .innerJoin(kamar_inap, eq(rawat_inap_drpr.no_rawat, kamar_inap.no_rawat))
    .innerJoin(kamar, eq(kamar_inap.kd_kamar, kamar.kd_kamar))
    .innerJoin(bangsal, eq(kamar.kd_bangsal, bangsal.kd_bangsal))
    .where(
      and(
        inArray(rawat_inap_drpr.no_rawat, no_rawat),
        or(
          like(jns_perawatan_inap.nm_perawatan, "%visite%"),
          like(jns_perawatan_inap.nm_perawatan, "%anastensi%")
        )
      )
    );
}

export function createRawatInapQuery(whereCondition?: SQL) {
  return db
    .select({
      no_rawat: kamar_inap.no_rawat,
      no_rkm_medis: reg_periksa.no_rkm_medis,
      nm_pasien: pasien.nm_pasien,
      no_sep: sql<string>`COALESCE(${bridging_sep.no_sep}, '-')`,
      jnspelayanan: sql<string>`IF(${bridging_sep.jnspelayanan}='1','SEP Ranap','SEP Ralan/Umum')`,
      kamar: bangsal.nm_bangsal,
      trf_kamar: kamar_inap.trf_kamar,
      diagnosa_awal: kamar_inap.diagnosa_awal,
      diagnosa_akhir: kamar_inap.diagnosa_akhir,
      tgl_masuk: kamar_inap.tgl_masuk,
      tgl_keluar: kamar_inap.tgl_keluar,
      stts_pulang: kamar_inap.stts_pulang,
      lama: kamar_inap.lama,
      kd_dokter: dpjp_ranap.kd_dokter,
      nm_dokter: sql<string>`COALESCE(${dokter.nm_dokter}, '-')`,
      total_permintaan_radiologi: sql<number>`(
        SELECT COUNT(*) 
        FROM ${permintaan_radiologi} 
        WHERE ${permintaan_radiologi.no_rawat} = ${kamar_inap.no_rawat}
        AND ${permintaan_radiologi.tgl_hasil} != '0000-00-00'
      )`,
      total_permintaan_lab: sql<number>`(
        SELECT COUNT(*)
        FROM ${permintaan_lab} 
        WHERE ${permintaan_lab.no_rawat} = ${kamar_inap.no_rawat}
        AND ${permintaan_lab.tgl_hasil} != '0000-00-00'
      )`,
      has_operasi: sql<boolean>`CASE WHEN ${operasi.no_rawat} IS NOT NULL THEN true ELSE false END`,
      operator: sql<string>`(
        SELECT d.nm_dokter 
        FROM dokter d 
        WHERE d.kd_dokter = ${operasi.operator1}
      )`,
      anestesi: sql<string>`(
        SELECT CASE 
          WHEN ${operasi.dokter_anestesi} != '-' THEN
            (SELECT d.nm_dokter FROM dokter d WHERE d.kd_dokter = ${operasi.dokter_anestesi})
          WHEN ${operasi.asisten_anestesi} IS NOT NULL AND ${operasi.asisten_anestesi} != '-' THEN
            CASE 
              WHEN ${operasi.asisten_anestesi} LIKE 'GANTI-%' THEN
                CONCAT(
                  COALESCE((SELECT d.nm_dokter FROM dokter d WHERE d.kd_dokter = TRIM(SUBSTRING(${operasi.asisten_anestesi}, 7))), ''),
                  CASE 
                    WHEN (SELECT p.nama FROM petugas p WHERE p.nip = ${operasi.asisten_anestesi}) IS NOT NULL 
                    THEN CONCAT(':', (SELECT p.nama FROM petugas p WHERE p.nip = ${operasi.asisten_anestesi}))
                    ELSE ''
                  END
                )
              ELSE ${operasi.asisten_anestesi}
            END
          ELSE NULL
        END
      )`,
    })
    .from(kamar_inap)
    .innerJoin(reg_periksa, eq(kamar_inap.no_rawat, reg_periksa.no_rawat))
    .innerJoin(pasien, eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis))
    .innerJoin(kamar, eq(kamar_inap.kd_kamar, kamar.kd_kamar))
    .innerJoin(bangsal, eq(kamar.kd_bangsal, bangsal.kd_bangsal))
    .leftJoin(dpjp_ranap, eq(kamar_inap.no_rawat, dpjp_ranap.no_rawat))
    .leftJoin(dokter, eq(dpjp_ranap.kd_dokter, dokter.kd_dokter))
    .innerJoin(penjab, eq(reg_periksa.kd_pj, penjab.kd_pj))
    .leftJoin(bridging_sep, eq(reg_periksa.no_rawat, bridging_sep.no_rawat))
    .leftJoin(operasi, eq(kamar_inap.no_rawat, operasi.no_rawat))
    .where(whereCondition)
    .groupBy(kamar_inap.no_rawat)
    .orderBy(asc(kamar_inap.tgl_masuk));
}
