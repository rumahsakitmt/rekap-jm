import { SurveilensPage } from "./rekap.surveilens-rawat-inap";
import { zodValidator } from "@tanstack/zod-adapter";
import { createFileRoute } from "@tanstack/react-router";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { z } from "zod";

const today = new Date();
const defaultDateFrom = format(startOfMonth(today), "yyyy-MM-dd");
const defaultDateTo = format(endOfMonth(today), "yyyy-MM-dd");

const searchSchema = z.object({
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
});

export const Route = createFileRoute("/rekap/surveilens-rawat-jalan")({
  head: () => ({
    meta: [{ title: "Surveilens Rawat Jalan | SMART SIMRS" }],
  }),
  validateSearch: zodValidator(searchSchema),
  component: SurveilensRawatJalanPage,
});

function SurveilensRawatJalanPage() {
  const { dateFrom, dateTo } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <SurveilensPage
      careType="Ralan"
      careLabel="rawat jalan"
      title="Surveilens Rawat Jalan"
      dateFrom={dateFrom}
      dateTo={dateTo}
      onDateChange={(key, date) => {
        navigate({
          search: (previous) => ({
            ...previous,
            [key]: format(date, "yyyy-MM-dd"),
          }),
        });
      }}
    />
  );
}
