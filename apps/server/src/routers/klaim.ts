import { router, publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { diagnosa_pasien, penyakit, prosedur_pasien, icd9 } from "@/db/schema";

type Row = Record<string, unknown>;

async function queryRows(query: ReturnType<typeof sql>) {
  const [rows] = await db.execute(query);
  return rows as unknown as Row[];
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
    .input(z.object({ codes: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { codes } = input;
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

      return results;
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
    .input(z.object({ codes: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { codes } = input;
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

      return results;
    }),

  listKlaimRanap: publicProcedure
    .input(
      z.object({
        dateFrom: z.coerce.date(),
        dateTo: z.coerce.date(),
        keyword: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { dateFrom, dateTo, keyword } = input;
      const dateFromStr = dateFrom.toISOString().slice(0, 10);
      const dateToStr = dateTo.toISOString().slice(0, 10);

      // Simple query - diagnosa/prosedur details available on detail page
      let mainQuery;
      if (keyword) {
        const kw = `%${keyword}%`;
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
            dokter.nm_dokter
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
        `;
      } else {
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
            dokter.nm_dokter
          FROM bridging_sep
          INNER JOIN reg_periksa ON reg_periksa.no_rawat = bridging_sep.no_rawat
          INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
          WHERE bridging_sep.tglsep BETWEEN ${dateFromStr} AND ${dateToStr}
          ORDER BY bridging_sep.tglsep
        `;
      }

      const rows = await queryRows(mainQuery);

      return rows.map((r) => ({
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
      }));
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

      const bsRows = await queryRows(sql`
        SELECT klsnaik, asal_rujukan, klsrawat
        FROM bridging_sep
        WHERE no_rawat = ${noRawat}
        LIMIT 1
      `);
      if (bsRows[0]) {
        klsNaik = (bsRows[0].klsnaik as string) || "";
        asalRujukan = (bsRows[0].asal_rujukan as string) || "";
        klsRawat = (bsRows[0].klsrawat as string) || "";
      } else {
        const bsiRows = await queryRows(sql`
          SELECT klsnaik, asal_rujukan
          FROM bridging_sep_internal
          WHERE no_rawat = ${noRawat}
          LIMIT 1
        `);
        if (bsiRows[0]) {
          klsNaik = (bsiRows[0].klsnaik as string) || "";
          asalRujukan = (bsiRows[0].asal_rujukan as string) || "";
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
        SELECT kd_penyakit
        FROM diagnosa_pasien
        WHERE no_rawat = ${noRawat}
        ORDER BY prioritas ASC
      `);
      const diagnosa = diagRows.map((r) => r.kd_penyakit as string).join("#");

      // 9. Procedures
      const procRows = await queryRows(sql`
        SELECT kode
        FROM prosedur_pasien
        WHERE no_rawat = ${noRawat}
        ORDER BY prioritas ASC
      `);
      const prosedur = procRows.map((r) => r.kode as string).join("#");

      // 10. INACBG Diagnoses (im='0')
      const diagInacbgRows = await db
        .select({ kd_penyakit: diagnosa_pasien.kd_penyakit })
        .from(diagnosa_pasien)
        .innerJoin(penyakit, eq(diagnosa_pasien.kd_penyakit, penyakit.kd_penyakit))
        .where(and(eq(penyakit.im, '0'), eq(diagnosa_pasien.no_rawat, noRawat)))
        .orderBy(asc(diagnosa_pasien.prioritas));

      const diagnosaInacbg = diagInacbgRows
        .map((r) => r.kd_penyakit)
        .join("#");

      // 11. INACBG Procedures (im='0')
      const procInacbgRows = await db
        .select({ kode: prosedur_pasien.kode })
        .from(prosedur_pasien)
        .innerJoin(icd9, eq(prosedur_pasien.kode, icd9.kode))
        .where(and(eq(icd9.im, '0'), eq(prosedur_pasien.no_rawat, noRawat)))
        .orderBy(asc(prosedur_pasien.prioritas));

      const prosedurInacbg = procInacbgRows
        .map((r) => r.kode)
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
      };
    }),
});
