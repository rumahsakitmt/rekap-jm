import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Route } from "@/routes/obat.stok";
import { Label } from "../ui/label";

export const StockBangsalFilter = () => {
  const { data: bangsal } = useQuery(trpc.bangsal.getBangsal.queryOptions());
  const { selectedBangsal } = Route.useSearch();
  const navigate = Route.useNavigate();
  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({ ...prev, selectedBangsal: value }),
    });
  };
  return (
    <div className="space-y-2">
      <Label>Gudang</Label>
      <Select value={selectedBangsal} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Gudang" />
        </SelectTrigger>
        <SelectContent>
          {bangsal?.map((b) => (
            <SelectItem key={b.kd_bangsal} value={b.kd_bangsal}>
              {b.nm_bangsal}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
