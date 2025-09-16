import { trpc } from "@/utils/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DataTable, createColumns } from "@/components/rawat-inap";
import { useFilterStore, useUIState } from "@/stores/filter-store";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import UploadCSVSheet from "@/components/upload-csv-sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rawat-inap")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    search,
    limit,
    offset,
    dateFrom,
    dateTo,
    selectedDoctor,
    selectedPoliklinik,
    selectedCsvFile,
  } = useFilterStore();

  const { data, isLoading } = useQuery(
    trpc.rawatInap.getRawatInap.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      ...(offset > 0 && { offset }),
      filename: selectedCsvFile || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      kd_dokter: selectedDoctor || undefined,
      kd_poli: selectedPoliklinik || undefined,
      includeTotals: true,
    })
  );

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

  return (
    <div className="py-2">
      <div className="flex justify-end gap-2">
        {selectedCsvFile !== "" && (
          <>
            <Link
              to="/report-rawat-inap-detailed"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              <FileText />
              Report Rawat Inap
            </Link>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </>
        )}
        <UploadCSVSheet />
      </div>
      <DataTable
        columns={createColumns(copiedItems, handleCopy, selectedCsvFile !== "")}
        data={(data?.data || []).map((item: any) => ({
          ...item,
          jns_perawatan: item.jns_perawatan || [],
        }))}
        pagination={data?.pagination}
        totals={data?.totals}
        isCsvMode={selectedCsvFile !== ""}
      />
    </div>
  );
}
