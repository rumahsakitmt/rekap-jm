import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FileText } from "lucide-react";
import UploadCSVSheet from "@/components/upload-csv-sheet";
import { startOfMonth, endOfMonth, format } from "date-fns";
import TableRawatInap from "@/components/rawat-inap/table";
import { DownloadReport } from "@/components/rawat-inap/download-report";
import { ShareButton } from "@/components/share-button";
import { OGMeta } from "@/components/og-meta";

const defaultDateFrom = startOfMonth(new Date()).toISOString();
const defaultDateTo = endOfMonth(new Date()).toISOString();

const rawatInapSearchSchema = z.object({
  search: z.string().default(""),
  limit: z.number().default(50),
  offset: z.number().default(0),
  page: z.number().default(1),
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
  selectedCsvFile: z.string().default(""),
  selectedDoctor: z.string().default(""),
  selectedSupport: z.string().default(""),
  selectedKamar: z.string().default(""),
  operation: z.boolean().optional(),
  generalDoctor: z.boolean().optional(),
  viisiteAnesthesia: z.boolean().optional(),
  visiteDokterSpesialis: z.boolean().optional(),
});

export const Route = createFileRoute("/rekap/rawat-inap")({
  head: () => ({
    meta: [
      {
        title: "Rekap JM | Rawat Inap",
      },
    ],
  }),
  component: RouteComponent,
  validateSearch: zodValidator(rawatInapSearchSchema),
});

function RouteComponent() {
  const searchParams = Route.useSearch();

  const {
    dateFrom,
    dateTo,
    selectedDoctor,
    selectedCsvFile,
    selectedKamar,
    operation,
  } = searchParams;

  const ogData = {
    title: selectedCsvFile
      ? `Rekap Rawat Inap - ${selectedCsvFile}`
      : "Rekap JM | Rawat Inap",
    subtitle: selectedCsvFile
      ? "Data Rekam Medis Rawat Inap"
      : "Sistem Rekam Medis RSUD Mamuju Tengah",
    type: "rawat-inap" as const,
    dateRange:
      dateFrom && dateTo
        ? `${format(new Date(dateFrom), "dd MMM yyyy")} - ${format(new Date(dateTo), "dd MMM yyyy")}`
        : undefined,
    hospitalName: "RSUD Mamuju Tengah",
  };

  return (
    <div className="py-2">
      <OGMeta
        data={ogData}
        description={
          selectedCsvFile
            ? `Data rekam medis rawat inap periode ${ogData.dateRange}`
            : "Sistem rekam medis untuk rawat inap RSUD Mamuju Tengah"
        }
      />
      <div className="flex justify-end gap-2">
        {selectedCsvFile !== "" && (
          <>
            <ShareButton
              title={ogData.title}
              description={
                selectedCsvFile
                  ? `Data rekam medis rawat inap periode ${ogData.dateRange}`
                  : "Lihat data rekam medis RSUD Mamuju Tengah"
              }
            />
            <Link
              to="/report-rawat-inap"
              search={{
                dateFrom,
                dateTo,
                selectedCsvFile,
                selectedDoctor,
                selectedKamar,
                operation,
              }}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              <FileText />
              Report Rawat Inap
            </Link>
            <DownloadReport />
          </>
        )}
        <UploadCSVSheet />
      </div>
      <TableRawatInap />
    </div>
  );
}
