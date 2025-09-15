import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table";
import { DatePicker } from "../date-picker";
import { useFilterStore } from "@/stores/filter-store";
import SelectFileSEP from "../rawat-jalan/select-file-sep";
import { Button } from "../ui/button";
import SelectDoctor from "../rawat-jalan/select-doctor";
import SelectPoliklinik from "../rawat-jalan/select-poliklinik";

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
  } = useFilterStore();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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
        <div className="grid grid-cols-2 gap-2">
          <SelectDoctor />
          <SelectPoliklinik />
        </div>
        <div className="flex justify-end">
          <Button onClick={clearFilters}>Hapus filter</Button>
        </div>
      </div>
    </div>
  );
}
