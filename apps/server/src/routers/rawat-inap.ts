import { publicProcedure, router } from "@/lib/trpc";
import { RawatInapDataService } from "@/lib/rawat-inap/data-service";
import { RawatInapReportService } from "@/lib/rawat-inap/report-service";
import { RawatInapXlsxService } from "@/lib/rawat-inap/xlsx-service";
import {
  rawatInapFilterSchema,
  detailedReportSchema,
  csvDownloadSchema,
} from "@/lib/rawat-inap/types";

const dataService = new RawatInapDataService();
const reportService = new RawatInapReportService();
const xlsxService = new RawatInapXlsxService();

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
  downloadXlsx: publicProcedure
    .input(csvDownloadSchema)
    .query(async ({ input }) => {
      const buffer = await xlsxService.generateXlsxDownload(input);
      return { data: Array.from(buffer) };
    }),
});
