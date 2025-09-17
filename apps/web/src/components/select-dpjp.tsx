import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";

const SelectDPJP = ({ from }: { from: "/rawat-inap" | "/" }) => {
  const route = getRouteApi(from);
  const { selectedDoctor } = route.useSearch();
  const navigate = route.useNavigate();
  const doctors = useQuery(
    trpc.dokter.getDoctor.queryOptions({
      limit: 1000,
    })
  );

  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedDoctor: value,
        offset: 0,
        page: 1,
      }),
    });
  };

  const handleClear = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedDoctor: "",
        offset: 0,
        page: 1,
      }),
    });
  };

  return (
    <div className="relative flex items-center gap-2">
      <Select value={selectedDoctor || ""} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih DPJP..." />
        </SelectTrigger>
        <SelectContent>
          {doctors.data?.data?.map((doctor) => (
            <SelectItem key={doctor.kd_dokter} value={doctor.kd_dokter}>
              {doctor.nm_dokter}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDoctor && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClear();
          }}
          className="z-50"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default SelectDPJP;
