import SelectFileSEP from "@/components/rawat-jalan/select-file-sep";
import { ClearFilter } from "@/components/clear-filter";
import SelectPoliklinik from "@/components/rawat-jalan/select-poliklinik";
import { SupportFilter } from "@/components/rawat-jalan/support-filter";
import SearchInput from "@/components/search-input";
import { DateFilter } from "@/components/date-filter";
import SelectDPJP from "@/components/select-dpjp";
import { FilterSwitch } from "@/components/rawat-jalan/filter-switch";

export function DataTableFilters() {
  return (
    <div className="p-2">
      <div className="space-y-2 py-2">
        <SearchInput from="/rekap/rawat-jalan" />
        <div className="grid grid-cols-2 gap-2">
          <DateFilter from="/rekap/rawat-jalan" />
          <SelectFileSEP from="/rekap/rawat-jalan" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SelectDPJP from="/rekap/rawat-jalan" />
          <SelectPoliklinik />
          <SupportFilter from="/rekap/rawat-jalan" />
        </div>
        <div className="py-4">
          <FilterSwitch label="Konsul" searchParam="konsul" />
        </div>
        <div className="flex justify-end">
          <ClearFilter from="/rekap/rawat-jalan" />
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
