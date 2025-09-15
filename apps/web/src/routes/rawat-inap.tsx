import { trpc } from "@/utils/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DataTable, createColumns } from "@/components/rawat-inap";
import { useFilterStore, useUIState } from "@/stores/filter-store";

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
      <DataTable
        columns={createColumns(copiedItems, handleCopy)}
        data={(data?.data || []).map((item: any) => ({
          ...item,
          jns_perawatan: item.jns_perawatan || [],
        }))}
        pagination={data?.pagination}
      />
    </div>
  );
}
