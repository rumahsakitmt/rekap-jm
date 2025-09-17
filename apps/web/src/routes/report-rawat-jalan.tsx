import { PDFViewer } from "@react-pdf/renderer";
import { createFileRoute } from "@tanstack/react-router";
import { SummaryReportPDF } from "@/components/summary-report-pdf";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { endOfMonth, startOfMonth } from "date-fns";
import { zodValidator } from "@tanstack/zod-adapter";

const defaultDateFrom = startOfMonth(new Date()).toISOString();
const defaultDateTo = endOfMonth(new Date()).toISOString();

const reportRawatJalanSearchSchema = z.object({
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
  selectedCsvFile: z.string().default(""),
  selectedDoctor: z.string().default(""),
  selectedPoliklinik: z.string().default(""),
});

export const Route = createFileRoute("/report-rawat-jalan")({
  component: RouteComponent,
  validateSearch: zodValidator(reportRawatJalanSearchSchema),
});

function RouteComponent() {
  const {
    dateFrom,
    dateTo,
    selectedCsvFile,
    selectedDoctor,
    selectedPoliklinik,
  } = Route.useSearch();

  const {
    data: summaryData,
    isLoading,
    error,
  } = useQuery(
    trpc.rawatJalan.getSummaryReport.queryOptions({
      dateFrom,
      dateTo,
      filename: selectedCsvFile || undefined,
      kd_dokter: selectedDoctor || undefined,
      kd_poli: selectedPoliklinik || undefined,
    })
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading PDF...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading PDF
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Show message if no CSV file selected
  if (!selectedCsvFile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Data Selected
          </h2>
          <p className="text-gray-500">
            Please select a CSV file to generate the report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <PDFViewer width="100%" height="100%">
        <SummaryReportPDF
          data={
            summaryData || {
              dpjp: [],
              dpjpTotal: 0,
              konsul: [],
              konsulTotal: 0,
              labTotal: 0,
              radTotal: 0,
            }
          }
          filters={{
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            selectedCsvFile,
            selectedDoctor,
            selectedPoliklinik,
          }}
        />
      </PDFViewer>
    </div>
  );
}
