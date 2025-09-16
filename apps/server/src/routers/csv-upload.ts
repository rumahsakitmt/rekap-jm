import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { TRPCError } from "@trpc/server";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../db";
import { bridging_sep } from "../db/schema/bridging_sep";
import { rawatInapDrpr } from "../db/schema/rawat_inap_drpr";
import { reg_periksa } from "../db/schema/reg_periksa";
import { inArray, notInArray, and, gte, lte, eq } from "drizzle-orm";
import { pasien } from "../db/schema/pasien";

const csvUploadSchema = z.object({
  filename: z.string(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

const fileUploadSchema = z.object({
  filename: z.string(),
  content: z.string(),
});

export const csvUploadRouter = router({
  uploadFile: publicProcedure
    .input(fileUploadSchema)
    .mutation(async ({ input }) => {
      try {
        const { filename, content } = input;

        if (!filename.toLowerCase().endsWith(".csv")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only CSV files are allowed",
          });
        }

        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${filename}`;
        const filepath = join(process.cwd(), "uploads", uniqueFilename);

        const buffer = Buffer.from(content, "base64");
        await Bun.write(filepath, buffer);

        return {
          success: true,
          filename: uniqueFilename,
          filepath: `/uploads/${uniqueFilename}`,
          size: buffer.length,
        };
      } catch (error) {
        console.error("File upload error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Upload failed",
        });
      }
    }),

  uploadCsv: publicProcedure
    .input(csvUploadSchema)
    .mutation(async ({ input }) => {
      try {
        const filepath = join(process.cwd(), "uploads", input.filename);

        const csvContent = readFileSync(filepath, "utf-8");

        const lines = csvContent.split("\n");
        const csvData: { no_sep: string; tarif: number }[] = [];

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            if (
              trimmedLine.toLowerCase().includes("no_sep") ||
              trimmedLine.toLowerCase().includes("sep")
            ) {
              continue;
            }

            const columns = trimmedLine.split(",");
            const noSep = columns[0]?.trim();
            const tarifStr = columns[1]?.trim();

            if (noSep && noSep.length > 0) {
              const tarif = tarifStr ? parseFloat(tarifStr) || 0 : 0;
              csvData.push({ no_sep: noSep, tarif });
            }
          }
        }

        return {
          success: true,
          data: csvData,
          count: csvData.length,
          filename: input.filename,
        };
      } catch (error) {
        console.error("CSV processing error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process CSV file",
        });
      }
    }),

  getUploadedFiles: publicProcedure.query(async () => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      const uploadsDir = path.join(process.cwd(), "uploads");

      try {
        const files = await fs.readdir(uploadsDir);
        const csvFiles = files
          .filter((file) => file.toLowerCase().endsWith(".csv"))
          .map((file) => ({
            filename: file,
            filepath: `/uploads/${file}`,
          }));

        return csvFiles;
      } catch (error) {
        return [];
      }
    } catch (error) {
      console.error("Error reading uploads directory:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to read uploaded files",
      });
    }
  }),

  analyzeCsv: publicProcedure
    .input(csvUploadSchema)
    .query(async ({ input }) => {
      try {
        const filepath = join(process.cwd(), "uploads", input.filename);
        const csvContent = readFileSync(filepath, "utf-8");

        const lines = csvContent.split("\n");
        const csvData: { no_sep: string; tarif: number }[] = [];

        // Parse CSV data
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            // Skip header row
            if (
              trimmedLine.toLowerCase().includes("no_sep") ||
              trimmedLine.toLowerCase().includes("sep")
            ) {
              continue;
            }

            const columns = trimmedLine.split(",");
            const noSep = columns[0]?.trim();
            const tarifStr = columns[1]?.trim();

            if (noSep && noSep.length > 0) {
              const tarif = tarifStr ? parseFloat(tarifStr) || 0 : 0;
              csvData.push({ no_sep: noSep, tarif });
            }
          }
        }

        const csvSepNumbers = csvData.map((item) => item.no_sep);

        // Build date range conditions
        const conditions = [];
        if (input.dateFrom) {
          conditions.push(gte(bridging_sep.tglsep, input.dateFrom));
        }
        if (input.dateTo) {
          conditions.push(lte(bridging_sep.tglsep, input.dateTo));
        }

        // Get SEPs from database that match CSV
        const foundInDb = await db
          .select({
            no_sep: bridging_sep.no_sep,
            nama_pasien: bridging_sep.nama_pasien,
            tglsep: bridging_sep.tglsep,
            nmppkpelayanan: bridging_sep.nmppkpelayanan,
          })
          .from(bridging_sep)
          .where(
            conditions.length > 0
              ? and(inArray(bridging_sep.no_sep, csvSepNumbers), ...conditions)
              : inArray(bridging_sep.no_sep, csvSepNumbers)
          );

        // Get SEPs from database that are NOT in CSV
        const notInCsv = await db
          .select({
            no_sep: bridging_sep.no_sep,
            nama_pasien: bridging_sep.nama_pasien,
            tglsep: bridging_sep.tglsep,
            nmppkpelayanan: bridging_sep.nmppkpelayanan,
          })
          .from(bridging_sep)
          .where(
            conditions.length > 0
              ? and(
                  notInArray(bridging_sep.no_sep, csvSepNumbers),
                  ...conditions
                )
              : notInArray(bridging_sep.no_sep, csvSepNumbers)
          );

        // Find SEPs in CSV that are NOT in database
        const foundInDbNumbers = new Set(foundInDb.map((item) => item.no_sep));
        const notFoundInDb = csvData.filter(
          (item) => !foundInDbNumbers.has(item.no_sep)
        );

        // Calculate statistics
        const stats = {
          totalCsvRecords: csvData.length,
          totalFoundInDb: foundInDb.length,
          totalNotFoundInDb: notFoundInDb.length,
          totalInDbNotInCsv: notInCsv.length,
          totalTarifInCsv: csvData.reduce((sum, item) => sum + item.tarif, 0),
          averageTarifInCsv:
            csvData.length > 0
              ? csvData.reduce((sum, item) => sum + item.tarif, 0) /
                csvData.length
              : 0,
        };

        return {
          success: true,
          filename: input.filename,
          stats,
          notFoundInDb: notFoundInDb.map((item) => ({
            no_sep: item.no_sep,
            tarif: item.tarif,
          })),
          foundInDb: foundInDb,
          notInCsv: notInCsv,
        };
      } catch (error) {
        console.error("CSV analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze CSV file",
        });
      }
    }),

  analyzeCsvRawatInap: publicProcedure
    .input(csvUploadSchema)
    .query(async ({ input }) => {
      try {
        const filepath = join(process.cwd(), "uploads", input.filename);
        const csvContent = readFileSync(filepath, "utf-8");

        const lines = csvContent.split("\n");
        const csvData: { no_sep: string; tarif: number }[] = [];

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            if (
              trimmedLine.toLowerCase().includes("no_sep") ||
              trimmedLine.toLowerCase().includes("rawat")
            ) {
              continue;
            }

            const columns = trimmedLine.split(",");
            const noSep = columns[0]?.trim();
            const tarifStr = columns[1]?.trim();

            if (noSep && noSep.length > 0) {
              const tarif = tarifStr ? parseFloat(tarifStr) || 0 : 0;
              csvData.push({ no_sep: noSep, tarif });
            }
          }
        }

        const csvNoSepNumbers = [
          ...new Set(csvData.map((item) => item.no_sep)),
        ];

        const conditions = [];
        if (input.dateFrom) {
          conditions.push(gte(bridging_sep.tglsep, input.dateFrom));
        }
        if (input.dateTo) {
          conditions.push(lte(bridging_sep.tglsep, input.dateTo));
        }

        const foundInDb = await db
          .select({
            noSep: bridging_sep.no_sep,
            nama_pasien: bridging_sep.nama_pasien,
            tglsep: bridging_sep.tglsep,
            nmppkpelayanan: bridging_sep.nmppkpelayanan,
          })
          .from(bridging_sep)
          .where(
            conditions.length > 0
              ? and(
                  inArray(bridging_sep.no_sep, csvNoSepNumbers),
                  ...conditions
                )
              : inArray(bridging_sep.no_sep, csvNoSepNumbers)
          );

        const notInCsv = await db
          .select({
            noSep: bridging_sep.no_sep,
            nama_pasien: bridging_sep.nama_pasien,
            tglsep: bridging_sep.tglsep,
            nmppkpelayanan: bridging_sep.nmppkpelayanan,
          })
          .from(bridging_sep)
          .where(
            conditions.length > 0
              ? and(
                  notInArray(bridging_sep.no_sep, csvNoSepNumbers),
                  ...conditions
                )
              : notInArray(bridging_sep.no_sep, csvNoSepNumbers)
          );

        const foundInDbNumbers = new Set(foundInDb.map((item) => item.noSep));
        const notFoundInDb = csvData.filter(
          (item) => !foundInDbNumbers.has(item.no_sep)
        );

        const foundNoSepNumbers = foundInDb.map((item) => item.noSep);
        const registrationInfo =
          foundNoSepNumbers.length > 0
            ? await db
                .select({
                  no_sep: bridging_sep.no_sep,
                  no_rkm_medis: reg_periksa.no_rkm_medis,
                  nm_pasien: pasien.nm_pasien,
                  tgl_registrasi: reg_periksa.tgl_registrasi,
                  kd_dokter: reg_periksa.kd_dokter,
                  kd_poli: reg_periksa.kd_poli,
                  status_lanjut: reg_periksa.status_lanjut,
                })
                .from(reg_periksa)
                .innerJoin(
                  bridging_sep,
                  eq(reg_periksa.no_rawat, bridging_sep.no_rawat)
                )
                .leftJoin(
                  pasien,
                  eq(reg_periksa.no_rkm_medis, pasien.no_rkm_medis)
                )
                .where(inArray(bridging_sep.no_sep, foundNoSepNumbers))
            : [];

        const stats = {
          totalCsvRecords: csvData.length,
          uniqueSepNumbers: csvNoSepNumbers.length,
          totalFoundInDb: foundInDb.length,
          totalNotFoundInDb: notFoundInDb.length,
          totalInDbNotInCsv: notInCsv.length,
          totalTarifInCsv: csvData.reduce((sum, item) => sum + item.tarif, 0),
          averageTarifInCsv:
            csvData.length > 0
              ? csvData.reduce((sum, item) => sum + item.tarif, 0) /
                csvData.length
              : 0,
          totalRegistrationRecords: registrationInfo.length,
        };

        return {
          success: true,
          filename: input.filename,
          stats,
          notFoundInDb: notFoundInDb.map((item) => ({
            no_sep: item.no_sep,
            tarif: item.tarif,
          })),
          foundInDb: foundInDb,
          notInCsv: notInCsv,
          registrationInfo,
        };
      } catch (error) {
        console.error("CSV rawat inap analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze rawat inap CSV file",
        });
      }
    }),
});
