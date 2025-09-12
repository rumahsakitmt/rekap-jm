import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table";
import { DatePicker } from "../date-picker";
import { useFilterStore } from "@/stores/filter-store";
import SelectFileSEP from "./select-file-sep";
import { Button } from "../ui/button";
import SelectDoctor from "./select-doctor";
import SelectPoliklinik from "./select-poliklinik";
import { CsvAnalysis } from "../csv-analysis";

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
  } = useFilterStore();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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
