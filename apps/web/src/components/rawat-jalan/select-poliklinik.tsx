import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/stores/filter-store";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const SelectPoliklinik = () => {
  const { selectedPoliklinik, setSelectedPoliklinik } = useFilterStore();
  const polikliniks = useQuery(
    trpc.poliklinik.getPoliklinik.queryOptions({
      limit: 1000,
    })
  );

  return (
    <Select value={selectedPoliklinik} onValueChange={setSelectedPoliklinik}>
      <SelectTrigger className="flex-1">
        <SelectValue placeholder="Select poliklinik..." />
      </SelectTrigger>
      <SelectContent>
        {polikliniks.data?.data?.map((poliklinik) => (
          <SelectItem key={poliklinik.kd_poli} value={poliklinik.kd_poli}>
            {poliklinik.nm_poli}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectPoliklinik;
