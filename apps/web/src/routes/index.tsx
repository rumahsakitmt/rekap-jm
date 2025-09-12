import { createFileRoute, Link } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { DataTable, createColumns } from "@/components/rawat-jalan";
import { useFilterStore, useUIState } from "@/stores/filter-store";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const {
    search,
    limit,
    offset,
    dateFrom,
    dateTo,
    selectedCsvFile,
    selectedDoctor,
    selectedPoliklinik,
  } = useFilterStore();

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
    trpc.regPeriksa.getRegPeriksa.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      ...(offset > 0 && { offset }),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      includeTotals: true,
      ...(selectedCsvFile && { filename: selectedCsvFile }),
      ...(selectedDoctor && { kd_dokter: selectedDoctor }),
      ...(selectedPoliklinik && { kd_poli: selectedPoliklinik }),
    })
  );

  return (
    <div className="container mx-auto px-4 py-2">
      {selectedCsvFile !== "" && (
        <div className="flex justify-end">
          <Link
            to="/report-rawat-jalan"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <FileText />
            Report Rawat Jalan
          </Link>
        </div>
      )}
      <DataTable
        columns={createColumns(copiedItems, handleCopy, selectedCsvFile !== "")}
        data={rawatJalan.data?.data || []}
        totals={rawatJalan.data?.totals}
        pagination={rawatJalan.data?.pagination}
        isCsvMode={selectedCsvFile !== ""}
      />
    </div>
  );
}
