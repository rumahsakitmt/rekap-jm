import { db } from "@/db";
import { publicProcedure, router } from "@/lib/trpc";
import { sql } from "drizzle-orm";
import { z } from "zod";

const dateRangeFields = {
  dateFrom: z.string().date(),
  dateTo: z.string().date(),
};

const dateRangeSchemaBase = z.object(dateRangeFields);

const validDateOrder = ({ dateFrom, dateTo }: z.infer<
  typeof dateRangeSchemaBase
>) => dateFrom <= dateTo;

const dateRangeSchema = dateRangeSchemaBase
  .refine(validDateOrder, {
    message: "Tanggal awal tidak boleh melewati tanggal akhir",
  });

const detailSchema = z
  .object({
    ...dateRangeFields,
    diseaseCode: z.string().min(1).max(15),
  })
  .refine(validDateOrder, {
    message: "Tanggal awal tidak boleh melewati tanggal akhir",
  });

type RawSummaryRow = {
  diseaseCode: string;
  diseaseName: string | null;
  age0To7Days: number | string;
  age8To28Days: number | string;
  ageUnder1Year: number | string;
  age1To4: number | string;
  age5To9: number | string;
  age10To14: number | string;
  age15To19: number | string;
  age20To44: number | string;
  age45To54: number | string;
  age55To59: number | string;
  age60To69: number | string;
  age70Plus: number | string;
  male: number | string;
  female: number | string;
  demographicTotal: number | string;
  totalCases: number | string;
  uniquePatients: number | string;
  deaths: number | string;
};

type RawDetailRow = {
  medicalRecordNumber: string;
  patientName: string | null;
  gender: string | null;
  birthDate: string | Date | null;
  address: string | null;
  phone: string | null;
  visitNumber: string;
  registrationDate: string | Date | null;
  registeredAge: string | null;
  ageUnit: string | null;
  isDeceased: number | string;
};

const asNumber = (value: number | string) => Number(value) || 0;
const asDateString = (value: string | Date | null) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

export const surveilensRawatInapRouter = router({
  summary: publicProcedure.input(dateRangeSchema).query(async ({ input }) => {
    const { dateFrom, dateTo } = input;
    const query = sql`
      SELECT
        cases.kd_penyakit AS diseaseCode,
        cases.nm_penyakit AS diseaseName,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Hr' AND cases.umurdaftar <= 7 THEN 1 ELSE 0 END) AS age0To7Days,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Hr' AND cases.umurdaftar BETWEEN 8 AND 28 THEN 1 ELSE 0 END) AS age8To28Days,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Bl' THEN 1 ELSE 0 END) AS ageUnder1Year,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar <= 4 THEN 1 ELSE 0 END) AS age1To4,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 5 AND 9 THEN 1 ELSE 0 END) AS age5To9,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 10 AND 14 THEN 1 ELSE 0 END) AS age10To14,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 15 AND 19 THEN 1 ELSE 0 END) AS age15To19,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 20 AND 44 THEN 1 ELSE 0 END) AS age20To44,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 45 AND 54 THEN 1 ELSE 0 END) AS age45To54,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 55 AND 59 THEN 1 ELSE 0 END) AS age55To59,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar BETWEEN 60 AND 69 THEN 1 ELSE 0 END) AS age60To69,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.sttsumur = 'Th' AND cases.umurdaftar >= 70 THEN 1 ELSE 0 END) AS age70Plus,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.jk = 'L' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.jk = 'P' THEN 1 ELSE 0 END) AS female,
        SUM(CASE WHEN cases.occurrence_count = 1 AND cases.jk IN ('L', 'P') THEN 1 ELSE 0 END) AS demographicTotal,
        COUNT(*) AS totalCases,
        COUNT(DISTINCT cases.no_rkm_medis) AS uniquePatients,
        SUM(cases.is_deceased) AS deaths
      FROM (
        SELECT
          diagnosa_pasien.kd_penyakit,
          penyakit.nm_penyakit,
          diagnosa_pasien.no_rawat,
          reg_periksa.no_rkm_medis,
          CAST(reg_periksa.umurdaftar AS UNSIGNED) AS umurdaftar,
          reg_periksa.sttsumur,
          pasien.jk,
          occurrences.occurrence_count,
          CASE WHEN deceased.no_rkm_medis IS NULL THEN 0 ELSE 1 END AS is_deceased
        FROM diagnosa_pasien
        INNER JOIN penyakit
          ON penyakit.kd_penyakit = diagnosa_pasien.kd_penyakit
        INNER JOIN reg_periksa
          ON reg_periksa.no_rawat = diagnosa_pasien.no_rawat
        INNER JOIN pasien
          ON pasien.no_rkm_medis = reg_periksa.no_rkm_medis
        INNER JOIN (
          SELECT
            all_diagnoses.kd_penyakit,
            all_registrations.no_rkm_medis,
            COUNT(*) AS occurrence_count
          FROM diagnosa_pasien AS all_diagnoses
          INNER JOIN reg_periksa AS all_registrations
            ON all_registrations.no_rawat = all_diagnoses.no_rawat
          WHERE all_diagnoses.status = 'Ranap'
            AND all_registrations.tgl_registrasi BETWEEN ${dateFrom} AND ${dateTo}
          GROUP BY all_diagnoses.kd_penyakit, all_registrations.no_rkm_medis
        ) AS occurrences
          ON occurrences.kd_penyakit = diagnosa_pasien.kd_penyakit
          AND occurrences.no_rkm_medis = reg_periksa.no_rkm_medis
        LEFT JOIN (
          SELECT DISTINCT no_rkm_medis FROM pasien_mati
        ) AS deceased
          ON deceased.no_rkm_medis = reg_periksa.no_rkm_medis
        WHERE diagnosa_pasien.status = 'Ranap'
          AND diagnosa_pasien.prioritas = 1
          AND diagnosa_pasien.kd_penyakit <> '-'
          AND reg_periksa.tgl_registrasi BETWEEN ${dateFrom} AND ${dateTo}
      ) AS cases
      GROUP BY cases.kd_penyakit, cases.nm_penyakit
      ORDER BY totalCases DESC, cases.kd_penyakit ASC
    `;

    const [rows] = await db.execute(query);
    return (rows as unknown as RawSummaryRow[]).map((row) => ({
      diseaseCode: row.diseaseCode,
      diseaseName: row.diseaseName ?? "Tanpa nama penyakit",
      age0To7Days: asNumber(row.age0To7Days),
      age8To28Days: asNumber(row.age8To28Days),
      ageUnder1Year: asNumber(row.ageUnder1Year),
      age1To4: asNumber(row.age1To4),
      age5To9: asNumber(row.age5To9),
      age10To14: asNumber(row.age10To14),
      age15To19: asNumber(row.age15To19),
      age20To44: asNumber(row.age20To44),
      age45To54: asNumber(row.age45To54),
      age55To59: asNumber(row.age55To59),
      age60To69: asNumber(row.age60To69),
      age70Plus: asNumber(row.age70Plus),
      male: asNumber(row.male),
      female: asNumber(row.female),
      demographicTotal: asNumber(row.demographicTotal),
      totalCases: asNumber(row.totalCases),
      uniquePatients: asNumber(row.uniquePatients),
      deaths: asNumber(row.deaths),
    }));
  }),

  details: publicProcedure.input(detailSchema).query(async ({ input }) => {
    const { dateFrom, dateTo, diseaseCode } = input;
    const query = sql`
      SELECT
        pasien.no_rkm_medis AS medicalRecordNumber,
        pasien.nm_pasien AS patientName,
        pasien.jk AS gender,
        pasien.tgl_lahir AS birthDate,
        pasien.alamat AS address,
        pasien.no_tlp AS phone,
        reg_periksa.no_rawat AS visitNumber,
        reg_periksa.tgl_registrasi AS registrationDate,
        reg_periksa.umurdaftar AS registeredAge,
        reg_periksa.sttsumur AS ageUnit,
        CASE WHEN deceased.no_rkm_medis IS NULL THEN 0 ELSE 1 END AS isDeceased
      FROM diagnosa_pasien
      INNER JOIN reg_periksa
        ON reg_periksa.no_rawat = diagnosa_pasien.no_rawat
      INNER JOIN pasien
        ON pasien.no_rkm_medis = reg_periksa.no_rkm_medis
      LEFT JOIN (
        SELECT DISTINCT no_rkm_medis FROM pasien_mati
      ) AS deceased
        ON deceased.no_rkm_medis = pasien.no_rkm_medis
      WHERE diagnosa_pasien.status = 'Ranap'
        AND diagnosa_pasien.prioritas = 1
        AND diagnosa_pasien.kd_penyakit = ${diseaseCode}
        AND reg_periksa.tgl_registrasi BETWEEN ${dateFrom} AND ${dateTo}
      ORDER BY reg_periksa.tgl_registrasi DESC, pasien.no_rkm_medis ASC
    `;

    const [rows] = await db.execute(query);
    return (rows as unknown as RawDetailRow[]).map((row) => ({
      ...row,
      birthDate: asDateString(row.birthDate),
      registrationDate: asDateString(row.registrationDate),
      isDeceased: Boolean(asNumber(row.isDeceased)),
    }));
  }),
});
