import { publicProcedure, router } from "@/lib/trpc";
import { RawatInapDataService } from "@/lib/rawat-inap/data-service";
import { RawatInapReportService } from "@/lib/rawat-inap/report-service";
import { RawatInapCsvService } from "@/lib/rawat-inap/csv-service";
import {
  rawatInapFilterSchema,
  detailedReportSchema,
  csvDownloadSchema,
} from "@/lib/rawat-inap/types";

const dataService = new RawatInapDataService();
const reportService = new RawatInapReportService();
const csvService = new RawatInapCsvService();

export const rawatInapRouter = router({
  getRawatInap: publicProcedure
    .input(rawatInapFilterSchema.optional())
    .query(async ({ input }) => {
      return await dataService.getRawatInapData(input || {});
    }),
  getDetailedMonthlyReport: publicProcedure
    .input(detailedReportSchema)
    .query(async ({ input }) => {
      return await reportService.generateDetailedMonthlyReport(input);
    }),
  downloadCsv: publicProcedure
    .input(csvDownloadSchema)
    .query(async ({ input }) => {
      const result = await csvService.generateCsvDownload(input);
      return result.csv;
    }),
});
