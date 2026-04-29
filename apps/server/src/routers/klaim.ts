import { router, publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { diagnosa_pasien, penyakit, prosedur_pasien, icd9, inacbg_grouping_stage12 } from "@/db/schema";
import {
  EKLAIM_CONFIG,
  BuatKlaimBaru2,
  EditUlangKlaim,
  MenghapusKlaim,
  UpdateDataKlaim2,
  UpdateDataKlaim3,
} from "../lib/e-klaim";

type Row = Record<string, unknown>;

async function queryRows(query: ReturnType<typeof sql>) {
  const [rows] = await db.execute(query);
  return rows as unknown as Row[];
}

async function syncDiagnosaProsedurDb(
  no_rawat: string,
  diagnosa: string | undefined,
  procedure: string | undefined
) {
  const diagCodes = diagnosa ? diagnosa.split("#").filter(Boolean) : [];
  const procCodes = procedure ? procedure.split("#").filter(Boolean) : [];

  // Delete ALL rows for this no_rawat regardless of status to avoid duplication
  await db
    .delete(diagnosa_pasien)
    .where(eq(diagnosa_pasien.no_rawat, no_rawat));
  if (diagCodes.length > 0) {
    await db.insert(diagnosa_pasien).values(
      diagCodes.map((code, idx) => ({
        no_rawat,
        kd_penyakit: code,
        status: "Ranap" as const,
        prioritas: idx + 1,
        status_penyakit: "Baru" as const,
      }))
    );
  }

  await db
    .delete(prosedur_pasien)
    .where(eq(prosedur_pasien.no_rawat, no_rawat));
  if (procCodes.length > 0) {
    await db.insert(prosedur_pasien).values(
      procCodes.map((code, idx) => ({
        no_rawat,
        kode: code,
        status: "Ranap" as const,
        prioritas: idx + 1,
      }))
    );
  }
}

export const klaimRouter = router({
  // Search for ICD-10 diagnoses (penyakit)
  searchPenyakit: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        inacbgOnly: z.boolean().optional(), // filter im='0' for INACBG
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const { query, inacbgOnly, limit } = input;
      const searchTerm = `%${query}%`;

      let conditions = or(
        like(penyakit.kd_penyakit, searchTerm),
        like(penyakit.nm_penyakit, searchTerm)
      );

      if (inacbgOnly) {
        conditions = and(conditions, eq(penyakit.im, "0"));
      }

      const results = await db
        .select({
          kode: penyakit.kd_penyakit,
          nama: penyakit.nm_penyakit,
          vc: penyakit.validcode,
          ap: penyakit.accpdx,
        })
        .from(penyakit)
        .where(conditions)
        .limit(limit);

      return results;
    }),

  // Get penyakit by codes (for displaying names of selected items)
  getPenyakitByCodes: publicProcedure
    .input(z.object({ codes: z.array(z.string()), noRawat: z.string().optional() }))
    .query(async ({ input }) => {
      const { codes, noRawat } = input;
      if (codes.length === 0) return [];

      const results = await db
        .select({
          kode: penyakit.kd_penyakit,
          nama: penyakit.nm_penyakit,
          vc: penyakit.validcode,
          ap: penyakit.accpdx,
        })
        .from(penyakit)
        .where(sql`${penyakit.kd_penyakit} IN (${sql.join(codes.map(c => sql`${c}`), sql`, `)})`);

      if (noRawat) {
        const statusRows = await db
          .select({ kd_penyakit: diagnosa_pasien.kd_penyakit, status: diagnosa_pasien.status })
          .from(diagnosa_pasien)
          .where(eq(diagnosa_pasien.no_rawat, noRawat));
        const statusMap = new Map(statusRows.map(r => [r.kd_penyakit, r.status]));
        return results.map(r => ({ ...r, status: statusMap.get(r.kode) || null }));
      }

      return results.map(r => ({ ...r, status: null }));
    }),

  // Search for ICD-9 procedures
  searchIcd9: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        inacbgOnly: z.boolean().optional(), // filter im='0' for INACBG
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const { query, inacbgOnly, limit } = input;
      const searchTerm = `%${query}%`;

      let conditions = or(
        like(icd9.kode, searchTerm),
        like(icd9.deskripsi_panjang, searchTerm),
        like(icd9.deskripsi_pendek, searchTerm)
      );

      if (inacbgOnly) {
        conditions = and(conditions, eq(icd9.im, "0"));
      }

      const results = await db
        .select({
          kode: icd9.kode,
          nama: icd9.deskripsi_panjang,
          vc: icd9.validcode,
          ap: icd9.accpdx,
        })
        .from(icd9)
        .where(conditions)
        .limit(limit);

      return results;
    }),

  // Get ICD9 by codes (for displaying names of selected items)
  getIcd9ByCodes: publicProcedure
    .input(z.object({ codes: z.array(z.string()), noRawat: z.string().optional() }))
    .query(async ({ input }) => {
      const { codes, noRawat } = input;
      if (codes.length === 0) return [];

      const results = await db
        .select({
          kode: icd9.kode,
          nama: icd9.deskripsi_panjang,
          vc: icd9.validcode,
          ap: icd9.accpdx,
        })
        .from(icd9)
        .where(sql`${icd9.kode} IN (${sql.join(codes.map(c => sql`${c}`), sql`, `)})`);

      if (noRawat) {
        const statusRows = await db
          .select({ kode: prosedur_pasien.kode, status: prosedur_pasien.status })
          .from(prosedur_pasien)
          .where(eq(prosedur_pasien.no_rawat, noRawat));
        const statusMap = new Map(statusRows.map(r => [r.kode, r.status]));
        return results.map(r => ({ ...r, status: statusMap.get(r.kode) || null }));
      }

      return results.map(r => ({ ...r, status: null }));
    }),

  listKlaimRanap: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date(),
        dateTo: z.coerce.date(),
        keyword: z.string().optional(),
        limit: z.number().optional().default(50),
        page: z.number().optional().default(1),
      }),
    )
    .query(async ({ input }) => {
      const { dateFrom, dateTo, keyword, limit, page } = input;
      const dateFromStr = dateFrom.toISOString().slice(0, 10);
      const dateToStr = dateTo.toISOString().slice(0, 10);

      const limitVal = limit || 50;
      const offsetVal = (page - 1) * limitVal;

      let mainQuery;
      let countQuery;
      if (keyword) {
        const kw = `%${keyword}%`;
        countQuery = sql`
          SELECT COUNT(*) as total
          FROM bridging_sep
          INNER JOIN reg_periksa ON reg_periksa.no_rawat = bridging_sep.no_rawat
          INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
          WHERE bridging_sep.tglsep BETWEEN ${dateFromStr} AND ${dateToStr}
            AND (
              bridging_sep.no_sep LIKE ${kw}
              OR bridging_sep.nomr LIKE ${kw}
              OR bridging_sep.nama_pasien LIKE ${kw}
              OR bridging_sep.no_rawat LIKE ${kw}
              OR bridging_sep.no_kartu LIKE ${kw}
            )
        `;
        mainQuery = sql`
          SELECT
            bridging_sep.no_sep,
            bridging_sep.no_rawat,
            bridging_sep.nomr,
            bridging_sep.nama_pasien,
            bridging_sep.tglsep,
            bridging_sep.no_kartu,
            bridging_sep.jnspelayanan,
            bridging_sep.nmpolitujuan,
            bridging_sep.diagawal,
            bridging_sep.nmdiagnosaawal,
            bridging_sep.klsrawat,
            bridging_sep.tglpulang,
            dokter.nm_dokter,
            (SELECT GROUP_CONCAT(kd_penyakit ORDER BY prioritas ASC SEPARATOR ', ') FROM diagnosa_pasien WHERE no_rawat = bridging_sep.no_rawat) as all_diagnosa,
            (SELECT GROUP_CONCAT(kode ORDER BY prioritas ASC SEPARATOR ', ') FROM prosedur_pasien WHERE no_rawat = bridging_sep.no_rawat) as all_prosedur
          FROM bridging_sep
          INNER JOIN reg_periksa ON reg_periksa.no_rawat = bridging_sep.no_rawat
          INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
          WHERE bridging_sep.tglsep BETWEEN ${dateFromStr} AND ${dateToStr}
            AND (
              bridging_sep.no_sep LIKE ${kw}
              OR bridging_sep.nomr LIKE ${kw}
              OR bridging_sep.nama_pasien LIKE ${kw}
              OR bridging_sep.no_rawat LIKE ${kw}
              OR bridging_sep.no_kartu LIKE ${kw}
            )
          ORDER BY bridging_sep.tglsep
          LIMIT ${limitVal} OFFSET ${offsetVal}
        `;
      } else {
        countQuery = sql`
          SELECT COUNT(*) as total
          FROM bridging_sep
          INNER JOIN reg_periksa ON reg_periksa.no_rawat = bridging_sep.no_rawat
          INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
          WHERE bridging_sep.tglsep BETWEEN ${dateFromStr} AND ${dateToStr}
        `;
        mainQuery = sql`
          SELECT
            bridging_sep.no_sep,
            bridging_sep.no_rawat,
            bridging_sep.nomr,
            bridging_sep.nama_pasien,
            bridging_sep.tglsep,
            bridging_sep.no_kartu,
            bridging_sep.jnspelayanan,
            bridging_sep.nmpolitujuan,
            bridging_sep.diagawal,
            bridging_sep.nmdiagnosaawal,
            bridging_sep.klsrawat,
            bridging_sep.tglpulang,
            dokter.nm_dokter,
            (SELECT GROUP_CONCAT(kd_penyakit ORDER BY prioritas ASC SEPARATOR ', ') FROM diagnosa_pasien WHERE no_rawat = bridging_sep.no_rawat) as all_diagnosa,
            (SELECT GROUP_CONCAT(kode ORDER BY prioritas ASC SEPARATOR ', ') FROM prosedur_pasien WHERE no_rawat = bridging_sep.no_rawat) as all_prosedur
          FROM bridging_sep
          INNER JOIN reg_periksa ON reg_periksa.no_rawat = bridging_sep.no_rawat
          INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
          WHERE bridging_sep.tglsep BETWEEN ${dateFromStr} AND ${dateToStr}
          ORDER BY bridging_sep.tglsep
          LIMIT ${limitVal} OFFSET ${offsetVal}
        `;
      }

      const rows = await queryRows(mainQuery);
      const countResult = await queryRows(countQuery);
      const total = Number(countResult[0]?.total || 0);

      const seps = rows.map((r) => r.no_sep as string).filter(Boolean);
      const klaimedSet = new Set<string>();
      if (seps.length > 0) {
        const klaimedRows = await db
          .select({ no_sep: inacbg_grouping_stage12.no_sep })
          .from(inacbg_grouping_stage12)
          .where(sql`${inacbg_grouping_stage12.no_sep} IN (${sql.join(seps.map((s) => sql`${s}`), sql`, `)})`);
        for (const kr of klaimedRows) {
          klaimedSet.add(kr.no_sep);
        }
      }

      const data = rows.map((r) => ({
        noSep: r.no_sep as string,
        noRawat: r.no_rawat as string,
        nomr: r.nomr as string,
        namaPasien: r.nama_pasien as string,
        tglSep: r.tglsep as string,
        noKartu: (r.no_kartu as string) || "",
        jnsPelayanan: r.jnspelayanan as string,
        nmPolitujuan: (r.nmpolitujuan as string) || "",
        diagAwal: (r.diagawal as string) || "",
        nmDiagnosaAwal: (r.nmdiagnosaawal as string) || "",
        klsRawat: (r.klsrawat as string) || "",
        tglPulang: r.tglpulang as string | null,
        nmDokter: (r.nm_dokter as string) || "",
        allDiagnosa: (r.all_diagnosa as string) || "",
        allProsedur: (r.all_prosedur as string) || "",
        isKlaimed: klaimedSet.has(r.no_sep as string),
      }));

      return {
        data,
        pagination: {
          total,
          limit: limitVal,
          offset: offsetVal,
          page,
          totalPages: Math.ceil(total / limitVal),
        },
      };
    }),

  getKlaimRanap: publicProcedure
    .input(z.object({ noRawat: z.string() }))
    .query(async ({ input }) => {
      const { noRawat } = input;

      const regRows = await queryRows(sql`
        SELECT
          reg_periksa.no_reg,
          reg_periksa.no_rawat,
          reg_periksa.tgl_registrasi,
          reg_periksa.jam_reg,
          reg_periksa.kd_dokter,
          dokter.nm_dokter,
          reg_periksa.no_rkm_medis,
          pasien.nm_pasien,
          pasien.jk,
          pasien.umur,
          pasien.tgl_lahir,
          pasien.no_peserta,
          poliklinik.nm_poli,
          reg_periksa.status_lanjut,
          reg_periksa.umurdaftar,
          reg_periksa.sttsumur,
          reg_periksa.p_jawab,
          reg_periksa.almt_pj,
          reg_periksa.hubunganpj,
          reg_periksa.biaya_reg,
          reg_periksa.stts_daftar,
          penjab.png_jawab
        FROM reg_periksa
        INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
        INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
        INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
        INNER JOIN penjab ON reg_periksa.kd_pj = penjab.kd_pj
        WHERE reg_periksa.no_rawat = ${noRawat}
      `);

      const reg = regRows[0];
      if (!reg) return null;

      const noRkmMedis = reg.no_rkm_medis as string;
      const statusLanjut = reg.status_lanjut as string;

      // 2. DPJP doctors
      const dpjpRows = await queryRows(sql`
        SELECT dokter.nm_dokter
        FROM dpjp_ranap
        INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
        WHERE dpjp_ranap.no_rawat = ${noRawat}
      `);
      const dpjpDoctors = dpjpRows.map((r) => r.nm_dokter as string);
      const nmDokter =
        dpjpDoctors.length > 0
          ? dpjpDoctors.join("#")
          : (reg.nm_dokter as string);

      // 3. Blood pressure (tensi)
      let sistole = "120";
      let diastole = "90";
      if (statusLanjut === "Ranap") {
        const tensiRows = await queryRows(sql`
          SELECT pemeriksaan_ranap.tensi
          FROM pemeriksaan_ranap
          WHERE pemeriksaan_ranap.no_rawat = ${noRawat}
          ORDER BY pemeriksaan_ranap.tgl_perawatan DESC, pemeriksaan_ranap.jam_rawat DESC
          LIMIT 1
        `);
        if (tensiRows[0]?.tensi) {
          const parts = (tensiRows[0].tensi as string).split("/");
          if (parts[0]) sistole = parts[0];
          if (parts[1]) diastole = parts[1];
        }
      } else {
        const tensiRows = await queryRows(sql`
          SELECT pemeriksaan_ralan.tensi
          FROM pemeriksaan_ralan
          WHERE pemeriksaan_ralan.no_rawat = ${noRawat}
          ORDER BY pemeriksaan_ralan.tgl_perawatan DESC, pemeriksaan_ralan.jam_rawat DESC
          LIMIT 1
        `);
        if (tensiRows[0]?.tensi) {
          const parts = (tensiRows[0].tensi as string).split("/");
          if (parts[0]) sistole = parts[0];
          if (parts[1]) diastole = parts[1];
        }
      }

      // 4. SEP number
      let nosep = "";
      const sepRows1 = await queryRows(sql`
        SELECT no_sep FROM bridging_sep WHERE no_rawat = ${noRawat} LIMIT 1
      `);
      if (sepRows1[0]?.no_sep) {
        nosep = sepRows1[0].no_sep as string;
      } else {
        const sepRows2 = await queryRows(sql`
          SELECT no_sep FROM bridging_sep_internal WHERE no_rawat = ${noRawat} LIMIT 1
        `);
        if (sepRows2[0]?.no_sep) nosep = sepRows2[0].no_sep as string;
      }

      // 5. No kartu (no_peserta)
      const noKartu = (reg.no_peserta as string) || "";

      // 6. Kelas naik & asal rujukan from bridging_sep
      let klsNaik = "";
      let asalRujukan = "";
      let klsRawat = "";
      let diagAwal = "";

      const bsRows = await queryRows(sql`
        SELECT klsnaik, asal_rujukan, klsrawat, diagawal
        FROM bridging_sep
        WHERE no_rawat = ${noRawat}
        LIMIT 1
      `);
      if (bsRows[0]) {
        klsNaik = (bsRows[0].klsnaik as string) || "";
        asalRujukan = (bsRows[0].asal_rujukan as string) || "";
        klsRawat = (bsRows[0].klsrawat as string) || "";
        diagAwal = (bsRows[0].diagawal as string) || "";
      } else {
        const bsiRows = await queryRows(sql`
          SELECT klsnaik, asal_rujukan, diagawal
          FROM bridging_sep_internal
          WHERE no_rawat = ${noRawat}
          LIMIT 1
        `);
        if (bsiRows[0]) {
          klsNaik = (bsiRows[0].klsnaik as string) || "";
          asalRujukan = (bsiRows[0].asal_rujukan as string) || "";
          diagAwal = (bsiRows[0].diagawal as string) || "";
        }
      }

      // Map asal rujukan
      let caraMasuk = "other";
      if (asalRujukan === "1. Faskes 1") caraMasuk = "gp";
      else if (asalRujukan === "2. Faskes 2(RS)") caraMasuk = "hosp-trans";

      // Map kelas naik
      let upgradeClassInd = "0";
      let upgradeClassClass = "";
      if (klsNaik) {
        upgradeClassInd = "1";
        if (klsNaik === "1") upgradeClassClass = "vvip";
        else if (klsNaik === "2") upgradeClassClass = "vip";
        else if (klsNaik === "3") upgradeClassClass = "kelas_1";
        else if (klsNaik === "4") upgradeClassClass = "kelas_2";
      }

      // 7. Discharge date
      let tglKeluar = `${reg.tgl_registrasi} ${reg.jam_reg}`;
      if (statusLanjut === "Ranap") {
        const keluarRows = await queryRows(sql`
          SELECT CONCAT(tgl_keluar, ' ', jam_keluar) as keluar
          FROM kamar_inap
          WHERE no_rawat = ${noRawat}
          ORDER BY tgl_keluar DESC
          LIMIT 1
        `);
        if (
          keluarRows[0]?.keluar &&
          keluarRows[0].keluar !== "0000-00-00 00:00:00" &&
          keluarRows[0].keluar !== "null null"
        ) {
          tglKeluar = keluarRows[0].keluar as string;
        }
      }

      // 8. Diagnoses
      const diagRows = await queryRows(sql`
        SELECT kd_penyakit, status
        FROM diagnosa_pasien
        WHERE no_rawat = ${noRawat}
        ORDER BY prioritas ASC
      `);
      let diagnosa = diagRows.map((r) => r.kd_penyakit as string).join("#");
      const diagnosaStatus = diagRows.map((r) => r.status as string).join("#");
      if (!diagnosa && diagAwal) {
        diagnosa = diagAwal;
      }

      // 9. Procedures
      const procRows = await queryRows(sql`
        SELECT kode, status
        FROM prosedur_pasien
        WHERE no_rawat = ${noRawat}
        ORDER BY prioritas ASC
      `);
      const prosedur = procRows.map((r) => r.kode as string).join("#");
      const prosedurStatus = procRows.map((r) => r.status as string).join("#");

      // 10. INACBG Diagnoses (im='0')
      const diagInacbgRows = await db
        .select({ kd_penyakit: diagnosa_pasien.kd_penyakit, status: diagnosa_pasien.status })
        .from(diagnosa_pasien)
        .innerJoin(penyakit, eq(diagnosa_pasien.kd_penyakit, penyakit.kd_penyakit))
        .where(and(eq(penyakit.im, '0'), eq(diagnosa_pasien.no_rawat, noRawat)))
        .orderBy(asc(diagnosa_pasien.prioritas));

      const diagnosaInacbg = diagInacbgRows
        .map((r) => r.kd_penyakit)
        .join("#");
      const diagnosaInacbgStatus = diagInacbgRows
        .map((r) => r.status)
        .join("#");

      // 11. INACBG Procedures (im='0')
      const procInacbgRows = await db
        .select({ kode: prosedur_pasien.kode, status: prosedur_pasien.status })
        .from(prosedur_pasien)
        .innerJoin(icd9, eq(prosedur_pasien.kode, icd9.kode))
        .where(and(eq(icd9.im, '0'), eq(prosedur_pasien.no_rawat, noRawat)))
        .orderBy(asc(prosedur_pasien.prioritas));

      const prosedurInacbg = procInacbgRows
        .map((r) => r.kode)
        .join("#");
      const prosedurInacbgStatus = procInacbgRows
        .map((r) => r.status)
        .join("#");

      // 12. Billing costs
      const getBillingSum = async (
        status: string,
        likeFilter?: string,
        notLike?: string,
      ) => {
        let query;
        if (likeFilter && notLike) {
          query = sql`SELECT IFNULL(SUM(totalbiaya), 0) as total FROM billing WHERE no_rawat = ${noRawat} AND status = ${status} AND nm_perawatan LIKE ${likeFilter} AND nm_perawatan NOT LIKE ${notLike}`;
        } else if (likeFilter) {
          query = sql`SELECT IFNULL(SUM(totalbiaya), 0) as total FROM billing WHERE no_rawat = ${noRawat} AND status = ${status} AND nm_perawatan LIKE ${likeFilter}`;
        } else if (notLike) {
          query = sql`SELECT IFNULL(SUM(totalbiaya), 0) as total FROM billing WHERE no_rawat = ${noRawat} AND status = ${status} AND nm_perawatan NOT LIKE ${notLike}`;
        } else {
          query = sql`SELECT IFNULL(SUM(totalbiaya), 0) as total FROM billing WHERE no_rawat = ${noRawat} AND status = ${status}`;
        }
        const rows = await queryRows(query);
        return Number(rows[0]?.total) || 0;
      };

      const prosedurNonBedahRalan = await getBillingSum(
        "Ralan Dokter Paramedis",
        undefined,
        "%terapi%",
      );
      const prosedurNonBedahRanap = await getBillingSum(
        "Ranap Dokter Paramedis",
        undefined,
        "%terapi%",
      );
      const prosedurNonBedah = prosedurNonBedahRalan + prosedurNonBedahRanap;

      const prosedurBedah = await getBillingSum("Operasi");

      const konsultasiRanap = await getBillingSum("Ranap Dokter");
      const konsultasiRalan = await getBillingSum("Ralan Dokter");
      const konsultasi = konsultasiRanap + konsultasiRalan;

      const keperawatanRanap = await getBillingSum("Ranap Paramedis");
      const keperawatanRalan = await getBillingSum("Ralan Paramedis");
      const keperawatan = keperawatanRanap + keperawatanRalan;

      const radiologi = await getBillingSum("Radiologi");
      const laboratorium = await getBillingSum("Laborat");

      const biayaRegRows = await queryRows(sql`
        SELECT biaya_reg FROM reg_periksa WHERE no_rawat = ${noRawat}
      `);
      const biayaReg = Number(biayaRegRows[0]?.biaya_reg) || 0;
      const kamarBilling = (await getBillingSum("Kamar")) + biayaReg;

      const obatKronis = await getBillingSum("Obat", "%kronis%");
      const obatKemoterapi = await getBillingSum("Obat", "%kemo%");
      const obatTotal = await getBillingSum("Obat");
      const returObat = await getBillingSum("Retur Obat");
      const resepPulang = await getBillingSum("Resep Pulang");
      const obat =
        obatTotal + returObat + resepPulang - obatKronis - obatKemoterapi;

      const bmhp = await getBillingSum("Tambahan");

      const sewaAlatHarian = await getBillingSum("Harian");
      const sewaAlatService = await getBillingSum("Service");
      const sewaAlat = sewaAlatHarian + sewaAlatService;

      const rehabilitasiRalan = await getBillingSum(
        "Ralan Dokter Paramedis",
        "%terapi%",
      );
      const rehabilitasiRanap = await getBillingSum(
        "Ranap Dokter Paramedis",
        "%terapi%",
      );
      const rehabilitasi = rehabilitasiRalan + rehabilitasiRanap;

      // 13. Baby birth weight
      const babyRows = await queryRows(sql`
        SELECT berat_badan FROM pasien_bayi WHERE no_rkm_medis = ${noRkmMedis}
      `);
      const birthWeight = (babyRows[0]?.berat_badan as string) || "";

      // 14. Discharge status
      let dischargeStatus = "1";
      const getKamarInapCount = async (sttsPulang: string) => {
        const rows = await queryRows(sql`
          SELECT COUNT(*) as cnt FROM kamar_inap WHERE stts_pulang = ${sttsPulang} AND no_rawat = ${noRawat}
        `);
        return Number(rows[0]?.cnt) || 0;
      };

      if ((await getKamarInapCount("Sembuh")) > 0) dischargeStatus = "1";
      else if ((await getKamarInapCount("Sehat")) > 0) dischargeStatus = "1";
      else if ((await getKamarInapCount("Rujuk")) > 0) dischargeStatus = "2";
      else if ((await getKamarInapCount("APS")) > 0) dischargeStatus = "3";
      else if ((await getKamarInapCount("Pulang Paksa")) > 0)
        dischargeStatus = "3";
      else if ((await getKamarInapCount("Meninggal")) > 0)
        dischargeStatus = "4";
      else if ((await getKamarInapCount("+")) > 0) dischargeStatus = "4";
      else if ((await getKamarInapCount("Atas Persetujuan Dokter")) > 0)
        dischargeStatus = "1";
      else if ((await getKamarInapCount("Atas Permintaan Sendiri")) > 0)
        dischargeStatus = "3";
      else if ((await getKamarInapCount("Lain-lain")) > 0)
        dischargeStatus = "5";

      const dischargeStatusMap: Record<string, string> = {
        "1": "Atas persetujuan dokter",
        "2": "Dirujuk",
        "3": "Atas permintaan sendiri",
        "4": "Meninggal",
        "5": "Lain-lain",
      };

      // 15. Doctors list
      const allDokterRows = await queryRows(sql`
        SELECT nm_dokter FROM dokter ORDER BY nm_dokter ASC
      `);
      const allDokter = allDokterRows.map((r) => r.nm_dokter as string);

      // 16. Check if already klaim-ed
      let isKlaimed = false;
      if (nosep) {
        const klaimedRows = await db
          .select({ no_sep: inacbg_grouping_stage12.no_sep })
          .from(inacbg_grouping_stage12)
          .where(eq(inacbg_grouping_stage12.no_sep, nosep));
        isKlaimed = klaimedRows.length > 0;
      }

      return {
        // Patient info
        noRawat: reg.no_rawat as string,
        noRkmMedis: noRkmMedis,
        nmPasien: reg.nm_pasien as string,
        umurdaftar: reg.umurdaftar as string,
        sttsumur: reg.sttsumur as string,
        jk: reg.jk as string,
        tglLahir: reg.tgl_lahir as string,
        almtPj: reg.almt_pj as string,
        tglRegistrasi: `${reg.tgl_registrasi} ${reg.jam_reg}`,
        nmPoli: reg.nm_poli as string,
        nmDokter: nmDokter,
        statusLanjut: statusLanjut,
        pngJawab: reg.png_jawab as string,

        // SEP & Insurance
        nosep,
        noKartu,

        // Admission details
        caraMasuk,
        asalRujukan,
        tglKeluar,
        klsRawat,
        upgradeClassInd,
        upgradeClassClass,
        jnsRawat: statusLanjut === "Ranap" ? "1" : "2",

        // Vitals
        sistole,
        diastole,

        // Diagnoses & Procedures
        diagnosa,
        prosedur,
        diagnosaInacbg,
        prosedurInacbg,
        diagnosaStatus,
        prosedurStatus,
        diagnosaInacbgStatus,
        prosedurInacbgStatus,

        // Billing
        billing: {
          prosedurNonBedah,
          prosedurBedah,
          konsultasi,
          tenagaAhli: 0,
          keperawatan,
          penunjang: 0,
          radiologi,
          laboratorium,
          pelayananDarah: 0,
          rehabilitasi,
          kamar: kamarBilling,
          rawatIntensif: 0,
          obat,
          obatKronis,
          obatKemoterapi,
          alkes: 0,
          bmhp,
          sewaAlat,
          tarifPoliEks: 0,
        },

        // Discharge
        dischargeStatus,
        dischargeStatusLabel: dischargeStatusMap[dischargeStatus] || "",

        // Baby
        birthWeight,

        // Doctors list for dropdown
        allDokter,

        // Klaim status
        isKlaimed,
      };
    }),

  simpanKlaim: publicProcedure
    .input(z.object({
      no_rawat: z.string().optional(),
      tgl_registrasi: z.string().optional(),
      codernik: z.string().optional(),
      nosep: z.string().optional(),
      nokartu: z.string().optional(),
      nm_pasien: z.string().optional(),
      keluar: z.string().optional(),
      kelas_rawat: z.string().optional(),
      cara_masuk: z.string().optional(),
      adl_sub_acute: z.string().optional(),
      adl_chronic: z.string().optional(),
      icu_indikator: z.string().optional(),
      icu_los: z.string().optional(),
      ventilator_hour: z.string().optional(),
      upgrade_class_ind: z.string().optional(),
      upgrade_class_class: z.string().optional(),
      upgrade_class_los: z.string().optional(),
      add_payment_pct: z.string().optional(),
      birth_weight: z.string().optional(),
      discharge_status: z.string().optional(),
      diagnosa: z.string().optional(),
      procedure: z.string().optional(),
      diagnosainacbg: z.string().optional(),
      procedureinacbg: z.string().optional(),
      prosedur_non_bedah: z.string().optional(),
      prosedur_bedah: z.string().optional(),
      konsultasi: z.string().optional(),
      tenaga_ahli: z.string().optional(),
      keperawatan: z.string().optional(),
      penunjang: z.string().optional(),
      radiologi: z.string().optional(),
      laboratorium: z.string().optional(),
      pelayanan_darah: z.string().optional(),
      rehabilitasi: z.string().optional(),
      kamar: z.string().optional(),
      rawat_intensif: z.string().optional(),
      obat: z.string().optional(),
      obat_kronis: z.string().optional(),
      obat_kemoterapi: z.string().optional(),
      alkes: z.string().optional(),
      bmhp: z.string().optional(),
      sewa_alat: z.string().optional(),
      tarif_poli_eks: z.string().optional(),
      nama_dokter: z.string().optional(),
      jk: z.string().optional(),
      tgl_lahir: z.string().optional(),
      jnsrawat: z.string().optional(),
      sistole: z.string().optional(),
      diastole: z.string().optional(),
      carabayar: z.string().optional(),
      statuskirim: z.string().optional(),
      corona: z.string().optional(),
      no_rkm_medis: z.string().optional(),
      pemulasaraan_jenazah: z.string().optional(),
      kantong_jenazah: z.string().optional(),
      peti_jenazah: z.string().optional(),
      plastik_erat: z.string().optional(),
      desinfektan_jenazah: z.string().optional(),
      mobil_jenazah: z.string().optional(),
      desinfektan_mobil_jenazah: z.string().optional(),
      covid19_status_cd: z.string().optional(),
      nomor_kartu_t: z.string().optional(),
      episodes1: z.string().optional(),
      episodes2: z.string().optional(),
      episodes3: z.string().optional(),
      episodes4: z.string().optional(),
      episodes5: z.string().optional(),
      episodes6: z.string().optional(),
      covid19_cc_ind: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const {
        no_rawat,
        nosep,
        nokartu,
        nm_pasien,
        corona,
        jk,
        tgl_lahir,
        codernik,
        nomor_kartu_t,
        no_rkm_medis,
        tgl_registrasi,
        keluar,
        jnsrawat,
        kelas_rawat,
        adl_sub_acute,
        adl_chronic,
        icu_indikator,
        icu_los,
        ventilator_hour,
        upgrade_class_ind,
        upgrade_class_class,
        upgrade_class_los,
        add_payment_pct,
        birth_weight,
        discharge_status,
        diagnosa,
        procedure,
        diagnosainacbg,
        procedureinacbg,
        tarif_poli_eks,
        nama_dokter,
        prosedur_non_bedah,
        prosedur_bedah,
        konsultasi,
        tenaga_ahli,
        keperawatan,
        penunjang,
        radiologi,
        laboratorium,
        pelayanan_darah,
        rehabilitasi,
        kamar,
        rawat_intensif,
        obat,
        obat_kronis,
        obat_kemoterapi,
        alkes,
        bmhp,
        sewa_alat,
        pemulasaraan_jenazah,
        kantong_jenazah,
        peti_jenazah,
        plastik_erat,
        desinfektan_jenazah,
        mobil_jenazah,
        desinfektan_mobil_jenazah,
        covid19_status_cd,
        covid19_cc_ind,
        sistole,
        diastole,
        cara_masuk,
      } = input;

      let gender = "2";
      if (jk === "L") {
        gender = "1";
      }

      if (corona === "PasienCorona") {
        const episodesArr = [];
        if (input.episodes1 && input.episodes1 !== "0") episodesArr.push(`1;${input.episodes1}`);
        if (input.episodes2 && input.episodes2 !== "0") episodesArr.push(`2;${input.episodes2}`);
        if (input.episodes3 && input.episodes3 !== "0") episodesArr.push(`3;${input.episodes3}`);
        if (input.episodes4 && input.episodes4 !== "0") episodesArr.push(`4;${input.episodes4}`);
        if (input.episodes5 && input.episodes5 !== "0") episodesArr.push(`5;${input.episodes5}`);
        if (input.episodes6 && input.episodes6 !== "0") episodesArr.push(`6;${input.episodes6}`);
        const episodes = episodesArr.join("#");

        if (no_rawat && nosep && nokartu && nomor_kartu_t) {
          await MenghapusKlaim(nosep, codernik || "");
          await BuatKlaimBaru2(nokartu, nosep, no_rkm_medis || "", nm_pasien || "", `${tgl_lahir} 00:00:00`, gender, no_rawat);
          await EditUlangKlaim(nosep);

          const klaimData = {
            nomor_sep: nosep,
            nomor_kartu: nokartu,
            tgl_masuk: tgl_registrasi,
            tgl_pulang: keluar,
            jenis_rawat: jnsrawat,
            kelas_rawat: kelas_rawat,
            adl_sub_acute: adl_sub_acute,
            adl_chronic: adl_chronic,
            icu_indikator: icu_indikator,
            icu_los: icu_los,
            ventilator_hour: ventilator_hour,
            upgrade_class_ind: upgrade_class_ind,
            upgrade_class_class: upgrade_class_class,
            upgrade_class_los: upgrade_class_los,
            add_payment_pct: add_payment_pct,
            birth_weight: birth_weight,
            discharge_status: discharge_status,
            diagnosa: diagnosa,
            procedure: procedure,
            diagnosa_inagrouper: diagnosainacbg,
            procedure_inagrouper: procedureinacbg,
            tarif_poli_eks: tarif_poli_eks,
            nama_dokter: nama_dokter,
            kode_tarif: EKLAIM_CONFIG.KELAS_RS,
            payor_id: "71",
            payor_cd: "COVID-19",
            cob_cd: "#",
            coder_nik: codernik,
            tarif_rs: {
              prosedur_non_bedah: prosedur_non_bedah,
              prosedur_bedah: prosedur_bedah,
              konsultasi: konsultasi,
              tenaga_ahli: tenaga_ahli,
              keperawatan: keperawatan,
              penunjang: penunjang,
              radiologi: radiologi,
              laboratorium: laboratorium,
              pelayanan_darah: pelayanan_darah,
              rehabilitasi: rehabilitasi,
              kamar: kamar,
              rawat_intensif: rawat_intensif,
              obat: obat,
              obat_kronis: obat_kronis,
              obat_kemoterapi: obat_kemoterapi,
              alkes: alkes,
              bmhp: bmhp,
              sewa_alat: sewa_alat,
            },
            pemulasaraan_jenazah: pemulasaraan_jenazah,
            kantong_jenazah: kantong_jenazah,
            peti_jenazah: peti_jenazah,
            plastik_erat: plastik_erat,
            desinfektan_jenazah: desinfektan_jenazah,
            mobil_jenazah: mobil_jenazah,
            desinfektan_mobil_jenazah: desinfektan_mobil_jenazah,
            covid19_status_cd: covid19_status_cd,
            nomor_kartu_t: nomor_kartu_t,
            episodes: episodes,
            covid19_cc_ind: covid19_cc_ind,
            sistole: sistole,
            diastole: diastole,
            cara_masuk: cara_masuk,
          };

          const res = await UpdateDataKlaim3(klaimData);
          if (res.respon === "Berhasil") {
            await syncDiagnosaProsedurDb(no_rawat, diagnosa, procedure);
            return { success: true, message: "Berhasil" };
          } else {
            return { success: false, message: res.msg?.metadata?.message || "Gagal Update Data Klaim" };
          }
        } else {
          return { success: false, message: "Semua field harus isi..!!!" };
        }
      } else {
        if (no_rawat && nosep && nokartu) {
          await BuatKlaimBaru2(nokartu, nosep, no_rkm_medis || "", nm_pasien || "", `${tgl_lahir} 00:00:00`, gender, no_rawat);
          await EditUlangKlaim(nosep);

          const klaimData = {
            nomor_sep: nosep,
            nomor_kartu: nokartu,
            tgl_masuk: tgl_registrasi,
            tgl_pulang: keluar,
            jenis_rawat: jnsrawat,
            kelas_rawat: kelas_rawat,
            adl_sub_acute: adl_sub_acute,
            adl_chronic: adl_chronic,
            icu_indikator: icu_indikator,
            icu_los: icu_los,
            ventilator_hour: ventilator_hour,
            upgrade_class_ind: upgrade_class_ind,
            upgrade_class_class: upgrade_class_class,
            upgrade_class_los: upgrade_class_los,
            add_payment_pct: add_payment_pct,
            birth_weight: birth_weight,
            discharge_status: discharge_status,
            diagnosa: diagnosa,
            procedure: procedure,
            diagnosa_inagrouper: diagnosainacbg,
            procedure_inagrouper: procedureinacbg,
            tarif_poli_eks: tarif_poli_eks,
            nama_dokter: nama_dokter,
            kode_tarif: EKLAIM_CONFIG.KELAS_RS,
            payor_id: "3",
            payor_cd: "JKN",
            cob_cd: "#",
            coder_nik: codernik,
            tarif_rs: {
              prosedur_non_bedah: prosedur_non_bedah,
              prosedur_bedah: prosedur_bedah,
              konsultasi: konsultasi,
              tenaga_ahli: tenaga_ahli,
              keperawatan: keperawatan,
              penunjang: penunjang,
              radiologi: radiologi,
              laboratorium: laboratorium,
              pelayanan_darah: pelayanan_darah,
              rehabilitasi: rehabilitasi,
              kamar: kamar,
              rawat_intensif: rawat_intensif,
              obat: obat,
              obat_kronis: obat_kronis,
              obat_kemoterapi: obat_kemoterapi,
              alkes: alkes,
              bmhp: bmhp,
              sewa_alat: sewa_alat,
            },
            sistole: sistole,
            diastole: diastole,
            cara_masuk: cara_masuk,
          };

          const res = await UpdateDataKlaim2(klaimData);
          if (res.respon === "Berhasil") {
            await syncDiagnosaProsedurDb(no_rawat, diagnosa, procedure);
            return { success: true, message: "Berhasil" };
          } else {
            return { success: false, message: res.msg?.metadata?.message || "Gagal Update Data Klaim" };
          }
        } else {
          return { success: false, message: "Semua field harus isi..!!!" };
        }
      }
    }),

  hapusKlaim: publicProcedure
    .input(
      z.object({
        no_sep: z.string(),
        coder_nik: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { no_sep, coder_nik } = input;
      // Un-finalize the claim before attempting deletion
      await EditUlangKlaim(no_sep);
      const msg = await MenghapusKlaim(no_sep, coder_nik);
      if (msg?.metadata?.message === "Ok") {
        await db.delete(inacbg_grouping_stage12).where(eq(inacbg_grouping_stage12.no_sep, no_sep));
        return { success: true, message: "Klaim berhasil dihapus" };
      }
      return { success: false, message: msg?.metadata?.message || "Gagal menghapus klaim" };
    }),
});
