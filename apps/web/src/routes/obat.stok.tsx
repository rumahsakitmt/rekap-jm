import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { StockDataTable } from "@/components/stock/stock-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Package } from "lucide-react";

const defaultDateFrom = startOfMonth(new Date()).toISOString();
const defaultDateTo = endOfMonth(new Date()).toISOString();
const stockSearchSchema = z.object({
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
  leadingTime: z.string().default("6"),
  status: z.string().optional(),
  pageSize: z.string().optional(),
});

export const Route = createFileRoute("/obat/stok")({
  component: RouteComponent,
  validateSearch: zodValidator(stockSearchSchema),
});

function RouteComponent() {
  const { dateFrom, dateTo, leadingTime, status } = Route.useSearch();
  const { data: databarang, isLoading } = useQuery(
    trpc.obat.getObat.queryOptions({
      dateFrom,
      dateTo,
      leadingTime,
    })
  );
  const totalPenggunaan = databarang?.reduce(
    (sum, item) => sum + (item.penggunaan || 0),
    0
  );
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Total Obat
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {databarang?.length}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">
              Total Penggunaan
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {totalPenggunaan?.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      <StockDataTable data={databarang || []} loading={isLoading} />
    </div>
  );
}
