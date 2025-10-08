import { Route } from "@/routes/rekap.rawat-inap";
import { useUIState } from "@/stores/filter-store";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { DataTableFilters } from "./data-table-filters";
import { DataTable } from "./data-table";
import { createColumns } from "./column";

const TableRawatInap = () => {
  const searchParams = Route.useSearch();

  const {
    limit,
    offset,
    dateFrom,
    dateTo,
    selectedDoctor,
    selectedKamar,
    selectedCsvFile,
    selectedSupport,
    search,
    operation,
    generalDoctor,
    viisiteAnesthesia,
    visiteDokterSpesialis,
  } = searchParams;

  const { data, isLoading } = useQuery(
    trpc.rawatInap.getRawatInap.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      ...(offset > 0 && { offset }),
      filename: selectedCsvFile || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      kd_dokter: selectedDoctor || undefined,
      kd_bangsal: selectedKamar || undefined,
      includeTotals: true,
      selectedSupport: selectedSupport || undefined,
      operation: operation || undefined,
      generalDoctor: generalDoctor || undefined,
      viisiteAnesthesia: viisiteAnesthesia || undefined,
      visiteDokterSpesialis: visiteDokterSpesialis || undefined,
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
    <>
      <DataTableFilters />
      <DataTable
        columns={createColumns(copiedItems, handleCopy, selectedCsvFile !== "")}
        data={(data?.data || []).map((item: any) => ({
          ...item,
          jns_perawatan: item.jns_perawatan || [],
        }))}
        pagination={data?.pagination}
        totals={data?.totals}
        loading={isLoading}
      />
    </>
  );
};

export default TableRawatInap;
