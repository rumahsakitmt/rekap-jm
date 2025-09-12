import { createReadStream } from "fs";
import { join } from "path";
import { TRPCError } from "@trpc/server";
import csv from "csv-parser";

export interface CsvData {
  no_sep: string;
  tarif: number;
}

export function readCsvFile(filename: string): Promise<CsvData[]> {
  return new Promise((resolve, reject) => {
    try {
      const filepath = join(process.cwd(), "uploads", filename);
      const csvData: CsvData[] = [];

      createReadStream(filepath)
        .pipe(csv())
        .on("data", (row) => {
          if (
            row.no_sep?.toLowerCase().includes("no_sep") ||
            row.no_sep?.toLowerCase().includes("sep") ||
            !row.no_sep
          ) {
            return;
          }

          const noSep = row.no_sep?.trim();
          const tarifStr = row.tarif?.trim();

          if (noSep && noSep.length > 0) {
            const tarif = tarifStr ? parseFloat(tarifStr) || 0 : 0;
            csvData.push({ no_sep: noSep, tarif });
          }
        })
        .on("end", () => {
          resolve(csvData);
        })
        .on("error", (error) => {
          console.error("Error reading CSV file:", error);
          reject(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Failed to read CSV file",
            })
          );
        });
    } catch (error) {
      console.error("Error reading CSV file:", error);
      reject(
        new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to read CSV file",
        })
      );
    }
  });
}

export function createCsvTarifMap(csvData: CsvData[]): Map<string, number> {
  return new Map(csvData.map((item) => [item.no_sep, item.tarif]));
}

export interface CsvExportOptions {
  fields?: string[]; // Fields to include (if not provided, includes all)
  fieldLabels?: Record<string, string>; // Custom labels for headers
  formatters?: Record<string, (value: any) => string>; // Custom formatters for specific fields
}

export function convertToCsv(
  data: any[],
  options: CsvExportOptions = {}
): string {
  if (data.length === 0) return "";

  const { fields, fieldLabels = {}, formatters = {} } = options;

  // Determine which fields to include
  const allHeaders = Object.keys(data[0]);
  const headers = fields
    ? fields.filter((field) => allHeaders.includes(field))
    : allHeaders;

  // Create headers with custom labels
  const csvHeaders = headers
    .map((header) => fieldLabels[header] || header)
    .join(",");

  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        let value = row[header];

        // Apply custom formatter if available
        if (formatters[header]) {
          value = formatters[header](value);
        }

        if (value === null || value === undefined) return "";
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}
