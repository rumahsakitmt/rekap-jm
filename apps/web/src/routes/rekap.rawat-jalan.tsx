import { createFileRoute, Link } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { DataTable, createColumns } from "@/components/rawat-jalan";
import { useUIState } from "@/stores/filter-store";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import UploadCSVSheet from "@/components/upload-csv-sheet";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ShareButton } from "@/components/share-button";
import { OGMeta } from "@/components/og-meta";
import DownloadReport from "@/components/rawat-jalan/download-report";

const defaultDateFrom = startOfMonth(new Date()).toISOString();
const defaultDateTo = endOfMonth(new Date()).toISOString();

const rawatInapSearchSchema = z.object({
  limit: z.number().default(50),
  offset: z.number().default(0),
  page: z.number().default(1),
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
  search: z.string().default(""),
  selectedCsvFile: z.string().default(""),
  selectedDoctor: z.string().default(""),
  selectedPoliklinik: z.string().default(""),
  selectedSupport: z.string().default(""),
  konsul: z.boolean().optional(),
});

export const Route = createFileRoute("/rekap/rawat-jalan")({
  head: () => ({
    meta: [
      {
        title: "Rekap JM | Rawat Jalan",
      },
    ],
  }),
  component: RawatJalanComponent,
  validateSearch: zodValidator(rawatInapSearchSchema),
});

function RawatJalanComponent() {
  const {
    search,
    limit,
    offset,
    dateFrom,
    dateTo,
    selectedCsvFile,
    selectedDoctor,
    selectedPoliklinik,
    selectedSupport,
    konsul,
  } = Route.useSearch();
  const { copiedItems, addCopiedItem, removeCopiedItem } = useUIState();

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addCopiedItem(id);
      setTimeout(() => {
        removeCopiedItem(id);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const rawatJalan = useQuery(
    trpc.rawatJalan.getRegPeriksa.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      ...(offset > 0 && { offset }),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      includeTotals: true,
      ...(konsul && { konsul }),
      ...(selectedCsvFile && { filename: selectedCsvFile }),
      ...(selectedDoctor && { kd_dokter: selectedDoctor }),
      ...(selectedPoliklinik && { kd_poli: selectedPoliklinik }),
      ...(selectedSupport && { selectedSupport }),
    })
  );

  const ogData = {
    title: selectedCsvFile
      ? `Rekap Rawat Jalan - ${selectedCsvFile}`
      : "Rekap JM | Rawat Jalan",
    subtitle: selectedCsvFile
      ? "Data Rekam Medis Rawat Jalan"
      : "Sistem Rekam Medis RSUD Mamuju Tengah",
    type: "rawat-jalan" as const,
    dateRange:
      dateFrom && dateTo
        ? `${format(new Date(dateFrom), "dd MMM yyyy")} - ${format(new Date(dateTo), "dd MMM yyyy")}`
        : undefined,
    totalRecords: rawatJalan.data?.totals?.count,
    hospitalName: "RSUD Mamuju Tengah",
  };

  return (
    <div className="py-2">
      <OGMeta
        data={ogData}
        description={
          selectedCsvFile
            ? `Data rekam medis rawat jalan periode ${ogData.dateRange}`
            : "Sistem rekam medis untuk rawat jalan RSUD Mamuju Tengah"
        }
      />
      <div className="flex justify-end gap-2">
        {selectedCsvFile !== "" && (
          <>
            <ShareButton
              title={ogData.title}
              description={
                selectedCsvFile
                  ? `Data rekam medis rawat jalan periode ${ogData.dateRange}`
                  : "Lihat data rekam medis RSUD Mamuju Tengah"
              }
            />
            <Link
              to="/report-rawat-jalan"
              className={cn(buttonVariants({ variant: "default" }))}
              search={{
                dateFrom,
                dateTo,
                selectedCsvFile,
                selectedDoctor,
                selectedPoliklinik,
              }}
            >
              <FileText />
              Report Rawat Jalan
            </Link>
            <DownloadReport />
          </>
        )}
        <UploadCSVSheet />
      </div>
      <DataTable
        columns={createColumns(copiedItems, handleCopy, selectedCsvFile !== "")}
        data={rawatJalan.data?.data || []}
        totals={rawatJalan.data?.totals}
        pagination={rawatJalan.data?.pagination}
        isCsvMode={selectedCsvFile !== ""}
        loading={rawatJalan.isLoading}
      />
    </div>
  );
}
