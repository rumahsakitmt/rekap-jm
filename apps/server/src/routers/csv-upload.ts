import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { TRPCError } from "@trpc/server";
import { readFileSync } from "fs";
import { join } from "path";

const csvUploadSchema = z.object({
  filename: z.string(),
});

const fileUploadSchema = z.object({
  filename: z.string(),
  content: z.string(), // base64 encoded file content
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
});
