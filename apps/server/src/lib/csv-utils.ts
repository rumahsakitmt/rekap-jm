import { readFileSync } from "fs";
import { join } from "path";
import { TRPCError } from "@trpc/server";

export interface CsvData {
  no_sep: string;
  tarif: number;
}

export function readCsvFile(filename: string): CsvData[] {
  try {
    const filepath = join(process.cwd(), "uploads", filename);
    const csvContent = readFileSync(filepath, "utf-8");

    const lines = csvContent.split("\n");
    const csvData: CsvData[] = [];

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

    return csvData;
  } catch (error) {
    console.error("Error reading CSV file:", error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to read CSV file",
    });
  }
}

export function createCsvTarifMap(csvData: CsvData[]): Map<string, number> {
  return new Map(csvData.map((item) => [item.no_sep, item.tarif]));
}
