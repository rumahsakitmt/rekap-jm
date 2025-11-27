import { Input } from "@/components/ui/input";
import { DatePicker } from "../date-picker";
import { useIgdRegistrationFilterStore } from "@/stores/igd-registration-filter";

export const RegistrationFilter = () => {
  const keyword = useIgdRegistrationFilterStore((state) => state.keyword);
  const dateFrom = useIgdRegistrationFilterStore((state) => state.dateFrom);
  const dateTo = useIgdRegistrationFilterStore((state) => state.dateTo);
  const setKeyword = useIgdRegistrationFilterStore((state) => state.setKeyword);
  const setDateFrom = useIgdRegistrationFilterStore(
    (state) => state.setDateFrom
  );
  const setDateTo = useIgdRegistrationFilterStore((state) => state.setDateTo);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          date={dateFrom}
          setDate={(date) => setDateFrom(date ?? undefined)}
        />
        <DatePicker
          date={dateTo}
          setDate={(date) => setDateTo(date ?? undefined)}
        />
      </div>
    </div>
  );
};
