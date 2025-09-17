import { Button } from "./ui/button";
import { getRouteApi } from "@tanstack/react-router";
import { startOfMonth, endOfMonth } from "date-fns";

export const ClearFilter = ({ from }: { from: "/rawat-inap" | "/" }) => {
  const route = getRouteApi(from);
  const navigate = route.useNavigate();

  const defaultDateFrom = startOfMonth(new Date()).toISOString();
  const defaultDateTo = endOfMonth(new Date()).toISOString();
  const handleClear = () => {
    navigate({
      search: () => ({
        dateFrom: defaultDateFrom,
        dateTo: defaultDateTo,
        selectedCsvFile: "",
        selectedDoctor: "",
        selectedKamar: "",
        selectedSupport: "",
        search: "",
        limit: 50,
        offset: 0,
        page: 1,
        selectedPoliklinik: "",
      }),
    });
  };
  return <Button onClick={handleClear}>Hapus filter</Button>;
};
