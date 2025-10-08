import SelectFileSEP from "../rawat-jalan/select-file-sep";
import SelectDPJP from "../select-dpjp";
import { SupportFilter } from "../rawat-jalan/support-filter";
import SearchInput from "../search-input";
import { SelectKamar } from "./select-kamar";
import { DateFilter } from "../date-filter";
import { ClearFilter } from "../clear-filter";
import { FilterSwitch } from "./filter-switch";

export function DataTableFilters() {
  return (
    <div className="p-2">
      <div className="space-y-2 py-2">
        <SearchInput from="/rekap/rawat-inap" />
        <div className="grid grid-cols-2 gap-2">
          <DateFilter from="/rekap/rawat-inap" />
          <SelectFileSEP from="/rekap/rawat-inap" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SelectDPJP from="/rekap/rawat-inap" />
          <SelectKamar />
          <SupportFilter from="/rekap/rawat-inap" />
        </div>
        <div className="flex items-center gap-2 py-4">
          <FilterSwitch
            label="Visite Anastesi"
            searchParam="viisiteAnesthesia"
          />
          <FilterSwitch
            label="Visite Antar Dokter Spesialis"
            searchParam="visiteDokterSpesialis"
          />
          <FilterSwitch label="Dokter Umum" searchParam="generalDoctor" />
          <FilterSwitch label="Operasi" searchParam="operation" />
        </div>
        <div className="flex justify-end">
          <ClearFilter from="/rekap/rawat-inap" />
        </div>
      </div>
    </div>
  );
}
