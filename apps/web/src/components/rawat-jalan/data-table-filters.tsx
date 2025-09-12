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
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter by patient name..."
          value={search}
          onChange={handleSearch}
          className="w-[200px]"
        />
        <DatePicker date={dateFrom} setDate={setDateFrom} />
        <DatePicker date={dateTo} setDate={setDateTo} />
        <SelectFileSEP />
        <SelectDoctor />
        <SelectPoliklinik />
        <Button onClick={clearFilters}>Clear Filters</Button>
        <DataTableViewOptions table={table} />
      </div>

      {/* Konsul Filters */}
      <div className="mb-4">
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
      </div>

      {selectedCsvFile && (
        <div className="mb-6">
          <CsvAnalysis
            filename={selectedCsvFile}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </div>
      )}
    </div>
  );
}
