import { DatePicker } from "../date-picker";
import { getRouteApi } from "@tanstack/react-router";
import { Label } from "../ui/label";

export const StockDateFilter = () => {
  const route = getRouteApi("/obat/stok");
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
      <div className="space-y-2">
        <Label>Tanggal Awal</Label>
        <DatePicker
          date={dateFrom ? new Date(dateFrom) : undefined}
          setDate={handleDateFromChange}
        />
      </div>
      <div className="space-y-2">
        <Label>Tanggal Akhir</Label>
        <DatePicker
          date={dateTo ? new Date(dateTo) : undefined}
          setDate={handleDateToChange}
        />
      </div>
    </div>
  );
};
