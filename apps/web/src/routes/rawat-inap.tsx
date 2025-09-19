import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FileText, Share } from "lucide-react";
import UploadCSVSheet from "@/components/upload-csv-sheet";
import { Button } from "@/components/ui/button";
import { startOfMonth, endOfMonth } from "date-fns";
import TableRawatInap from "@/components/rawat-inap/table";
import { DownloadReport } from "@/components/rawat-inap/download-report";

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
});

export const Route = createFileRoute("/rawat-inap")({
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <div className="py-2">
      <div className="flex justify-end gap-2">
        {selectedCsvFile !== "" && (
          <>
            <Button variant="outline" onClick={handleShare}>
              <Share />
              Bagikan
            </Button>
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
