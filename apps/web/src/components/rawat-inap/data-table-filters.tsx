import SelectFileSEP from "../rawat-jalan/select-file-sep";
import SelectDPJP from "../select-dpjp";
import { SupportFilter } from "../rawat-jalan/support-filter";
import SearchInput from "../search-input";
import { SelectKamar } from "./select-kamar";
import { DateFilter } from "../date-filter";
import { ClearFilter } from "../clear-filter";

export function DataTableFilters() {
  return (
    <div className="p-2">
      <div className="space-y-2 py-2">
        <SearchInput from="/rawat-inap" />
        <div className="grid grid-cols-2 gap-2">
          <DateFilter from="/rawat-inap" />
          <SelectFileSEP from="/rawat-inap" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SelectDPJP from="/rawat-inap" />
          <SelectKamar />
          <SupportFilter from="/rawat-inap" />
        </div>
        <div className="flex justify-end">
          <ClearFilter from="/rawat-inap" />
        </div>
      </div>
    </div>
  );
}
