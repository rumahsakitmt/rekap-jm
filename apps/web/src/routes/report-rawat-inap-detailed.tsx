import { PDFViewer } from "@react-pdf/renderer";
import { createFileRoute } from "@tanstack/react-router";
import { RawatInapDetailedMonthlyReportPDF } from "@/components/rawat-inap-detailed-monthly-report-pdf";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { startOfMonth, endOfMonth } from "date-fns";

const defaultDateFrom = startOfMonth(new Date()).toISOString();
const defaultDateTo = endOfMonth(new Date()).toISOString();

const rawatInapSearchSchema = z.object({
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
  selectedCsvFile: z.string().default(""),
  selectedDoctor: z.string().default(""),
  selectedKamar: z.string().default(""),
});

export const Route = createFileRoute("/report-rawat-inap-detailed")({
  component: RouteComponent,
  validateSearch: zodValidator(rawatInapSearchSchema),
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  const { dateFrom, dateTo, selectedCsvFile, selectedDoctor, selectedKamar } =
    searchParams;

  const {
    data: detailedReportData,
    isLoading,
    error,
  } = useQuery(
    trpc.rawatInap.getDetailedMonthlyReport.queryOptions({
      dateFrom: new Date(dateFrom),
      dateTo,
      filename: selectedCsvFile || undefined,
      kd_dokter: selectedDoctor || undefined,
      kd_bangsal: selectedKamar || undefined,
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Detailed Report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Detailed Report
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!selectedCsvFile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Data Selected
          </h2>
          <p className="text-gray-500">
            Please select a CSV file to generate the detailed report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <PDFViewer width="100%" height="100%">
        <RawatInapDetailedMonthlyReportPDF
          data={
            detailedReportData || {
              dpjp: [],
              dpjpTotal: 0,
              konsul: [],
              konsulTotal: 0,
              dokterUmum: [],
              dokterUmumTotal: 0,
              operator: [],
              operatorTotal: 0,
              penunjang: [],
              penunjangTotal: 0,
              labTotal: 0,
              radTotal: 0,
              rekapBulanan: [],
              grandTotal: 0,
              konsulAnastesi: [],
              konsulAnastesiTotal: 0,
              anestesi: [],
              anestesiTotal: 0,
            }
          }
          filters={{
            dateFrom: new Date(dateFrom)?.toISOString(),
            dateTo: new Date(dateTo)?.toISOString(),
            selectedCsvFile,
            selectedDoctor,
            selectedKamar,
          }}
        />
      </PDFViewer>
    </div>
  );
}
