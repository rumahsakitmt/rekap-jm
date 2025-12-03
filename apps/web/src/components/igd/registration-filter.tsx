import { Input } from "@/components/ui/input";
import { DatePicker } from "../date-picker";
import { useIgdRegistrationFilterStore } from "@/stores/igd-registration-filter";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export const RegistrationFilter = () => {
  const keyword = useIgdRegistrationFilterStore((state) => state.keyword);
  const dateFrom = useIgdRegistrationFilterStore((state) => state.dateFrom);
  const dateTo = useIgdRegistrationFilterStore((state) => state.dateTo);
  const setKeyword = useIgdRegistrationFilterStore((state) => state.setKeyword);
  const setDateFrom = useIgdRegistrationFilterStore(
    (state) => state.setDateFrom
  );
  const setDateTo = useIgdRegistrationFilterStore((state) => state.setDateTo);

  const [inputValue, setInputValue] = useState(keyword);

  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue !== keyword) {
        setKeyword(inputValue);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [inputValue, keyword, setKeyword]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-8"
        />
        {inputValue && (
          <button
            onClick={() => setInputValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 group"
          >
            <X
              size={16}
              className="text-muted-foreground group-hover:text-foreground"
            />
          </button>
        )}
      </div>
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
