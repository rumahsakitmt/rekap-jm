import { PDFViewer } from "@react-pdf/renderer";
import { createFileRoute } from "@tanstack/react-router";
import { SummaryReportPDF } from "@/components/summary-report-pdf";
import { useFilterStore } from "@/stores/filter-store";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/report-rawat-jalan")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    dateFrom,
    dateTo,
    selectedCsvFile,
    selectedDoctor,
    selectedPoliklinik,
  } = useFilterStore();

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
            dateFrom: dateFrom?.toISOString(),
            dateTo: dateTo?.toISOString(),
            selectedCsvFile,
            selectedDoctor,
            selectedPoliklinik,
          }}
        />
      </PDFViewer>
    </div>
  );
}
