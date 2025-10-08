import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Route } from "@/routes/rekap.rawat-jalan";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const SelectPoliklinik = () => {
  const { selectedPoliklinik } = Route.useSearch();
  const navigate = Route.useNavigate();
  const polikliniks = useQuery(
    trpc.poliklinik.getPoliklinik.queryOptions({
      limit: 1000,
    })
  );

  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedPoliklinik: value,
        offset: 0,
        page: 1,
      }),
    });
  };

  const handleClear = () => {
    navigate({
      search: (prev) => ({ ...prev, selectedPoliklinik: "" }),
    });
  };

  return (
    <div className="relative flex items-center gap-2">
      <Select
        value={selectedPoliklinik || ""}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih poliklinik..." />
        </SelectTrigger>
        <SelectContent>
          {polikliniks.data?.data?.map((poliklinik) => (
            <SelectItem key={poliklinik.kd_poli} value={poliklinik.kd_poli}>
              {poliklinik.nm_poli}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedPoliklinik && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X />
        </Button>
      )}
    </div>
  );
};

export default SelectPoliklinik;
