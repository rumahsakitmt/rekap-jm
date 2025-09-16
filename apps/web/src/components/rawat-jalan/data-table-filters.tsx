import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table";
import { DatePicker } from "../date-picker";
import { useFilterStore, type KonsulFilter } from "@/stores/filter-store";
import SelectFileSEP from "./select-file-sep";
import { Button } from "../ui/button";
import SelectDoctor from "./select-doctor";
import SelectPoliklinik from "./select-poliklinik";
import { CsvAnalysis } from "../csv-analysis";
import { KonsulFilterComponent } from "./konsul-filter";
import { Plus } from "lucide-react";
import { SupportFilter } from "./support-filter";

interface DataTableFiltersProps {
  table: any;
}

export function DataTableFilters({ table }: DataTableFiltersProps) {
  const {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearFilters,
    search,
    setSearch,
    selectedCsvFile,
    konsulFilters,
    addKonsulFilter,
    updateKonsulFilter,
    removeKonsulFilter,
  } = useFilterStore();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleAddKonsulFilter = () => {
    const newFilter: KonsulFilter = {
      field: "konsul_count",
      operator: "=",
      value: "",
    };
    addKonsulFilter(newFilter);
  };

  return (
    <div className="p-2">
      <div className="space-y-2 py-2">
        <Input
          placeholder="Cari berdasarkan nama pasien/no rm/no rawat/sep..."
          value={search}
          onChange={handleSearch}
          className="w-full"
        />
        <div className="grid grid-cols-3 gap-2">
          <DatePicker date={dateFrom} setDate={setDateFrom} />
          <DatePicker date={dateTo} setDate={setDateTo} />
          <SelectFileSEP />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SelectDoctor />
          <SelectPoliklinik />
          <SupportFilter />
        </div>
        <div className="flex justify-end">
          <Button onClick={clearFilters}>Hapus filter</Button>
        </div>
        {/* <DataTableViewOptions table={table} /> */}
      </div>

      {/* TODO: Add konsul filter */}
      {/* <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Konsul Filters:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddKonsulFilter}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Filter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {konsulFilters.map((filter, index) => (
            <KonsulFilterComponent
              key={index}
              filter={filter}
              onFilterChange={(updatedFilter) =>
                updateKonsulFilter(index, updatedFilter)
              }
              onRemove={() => removeKonsulFilter(index)}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}
