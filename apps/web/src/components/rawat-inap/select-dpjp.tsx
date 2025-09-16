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
import { Button } from "../ui/button";
import { X } from "lucide-react";

const SelectDPJP = () => {
  const { selectedDoctor, setSelectedDoctor } = useFilterStore();
  const doctors = useQuery(
    trpc.dokter.getDoctor.queryOptions({
      limit: 1000,
    })
  );

  return (
    <div className="relative">
      <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
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
            setSelectedDoctor("");
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
