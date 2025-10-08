import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Route } from "@/routes/rekap.rawat-inap";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export const SelectKamar = () => {
  const { selectedKamar } = Route.useSearch();
  const navigate = Route.useNavigate();
  const kamar = useQuery(trpc.kamar.getKamar.queryOptions());

  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedKamar: value,
        offset: 0,
        page: 1,
      }),
    });
  };

  const handleClear = () => {
    navigate({
      search: (prev) => ({ ...prev, selectedKamar: "" }),
    });
  };

  return (
    <div className="relative flex items-center gap-2">
      <Select value={selectedKamar || ""} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih kamar..." />
        </SelectTrigger>
        <SelectContent>
          {kamar.data?.map((kamar) => (
            <SelectItem
              key={kamar.kd_bangsal}
              value={kamar.kd_bangsal}
              className="uppercase"
            >
              {kamar.nm_bangsal}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedKamar && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X />
        </Button>
      )}
    </div>
  );
};
