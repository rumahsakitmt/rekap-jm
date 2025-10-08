import { DatePicker } from "./date-picker";
import { getRouteApi } from "@tanstack/react-router";

export const DateFilter = ({
  from,
}: {
  from: "/rekap/rawat-inap" | "/rekap/rawat-jalan";
}) => {
  const route = getRouteApi(from);
  const { dateFrom, dateTo } = route.useSearch();
  const navigate = route.useNavigate();
  const handleDateFromChange = (date: Date | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        dateFrom: date?.toISOString(),
        offset: 0,
        page: 1,
      }),
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        dateTo: date?.toISOString(),
        offset: 0,
        page: 1,
      }),
    });
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePicker
        date={dateFrom ? new Date(dateFrom) : undefined}
        setDate={handleDateFromChange}
      />
      <DatePicker
        date={dateTo ? new Date(dateTo) : undefined}
        setDate={handleDateToChange}
      />
    </div>
  );
};
