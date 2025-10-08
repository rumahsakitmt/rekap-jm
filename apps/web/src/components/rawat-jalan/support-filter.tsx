import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const SupportFilter = ({
  from,
}: {
  from: "/rekap/rawat-inap" | "/rekap/rawat-jalan";
}) => {
  const route = getRouteApi(from);
  const { selectedSupport } = route.useSearch();
  const navigate = route.useNavigate();

  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedSupport: value,
        offset: 0,
        page: 1,
      }),
    });
  };

  const handleClear = () => {
    navigate({
      search: (prev) => ({ ...prev, selectedSupport: "" }),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedSupport || ""} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ruangan Penunjang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lab">Laboratorium</SelectItem>
          <SelectItem value="radiologi">Radiologi</SelectItem>
        </SelectContent>
      </Select>
      {selectedSupport && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X />
        </Button>
      )}
    </div>
  );
};
