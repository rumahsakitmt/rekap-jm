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

const SelectDoctor = () => {
  const { selectedDoctor, setSelectedDoctor } = useFilterStore();
  const doctors = useQuery(
    trpc.dokter.getDoctor.queryOptions({
      limit: 1000,
    })
  );

  return (
    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
      <SelectTrigger className="flex-1">
        <SelectValue placeholder="Select doctor..." />
      </SelectTrigger>
      <SelectContent>
        {doctors.data?.data?.map((doctor) => (
          <SelectItem key={doctor.kd_dokter} value={doctor.kd_dokter}>
            {doctor.nm_dokter}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectDoctor;
