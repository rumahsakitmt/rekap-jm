import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp, CheckCircle, Flame } from "lucide-react";
import { Package, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { KadaluwarsaDataTable } from "@/components/stock/kadaluwarsa-data-table";
import { ExpirePieChart } from "@/components/stock/expire-pie-chart";
import { ExpireBarChart } from "@/components/stock/expire-bar-chart";

const defaultDateFrom = startOfMonth(new Date()).toISOString();
const defaultDateTo = endOfMonth(new Date()).toISOString();
const stockSearchSchema = z.object({
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
  leadingTime: z.string().default("6"),
  status: z.string().optional(),
  pageSize: z.string().optional(),
  selectedBangsal: z.string().optional(),
});

export const Route = createFileRoute("/obat/kadaluwarsa")({
  component: RouteComponent,
  validateSearch: zodValidator(stockSearchSchema),
});

function RouteComponent() {
  const { leadingTime, selectedBangsal } = Route.useSearch();
  const { data: databarang, isLoading } = useQuery(
    trpc.obat.getObat.queryOptions({
      leadingTime,
      selectedBangsal,
    })
  );
  const totalExpireByStatus = (databarang || []).reduce(
    (sum, item) => {
      const status = (item as any).expireStatus as string;
      if (status === "hijau" || status === "kuning" || status === "merah") {
        sum[status] += 1;
      }
      return sum;
    },
    { hijau: 0, kuning: 0, merah: 0 }
  );
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-2">
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
    <div className="container mx-auto py-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">
              {"Exp. > 12 Bln"}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {totalExpireByStatus.hijau}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">
              Exp. 6-12 bln
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {totalExpireByStatus.kuning}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              {"Exp. <6 Bln"}
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {totalExpireByStatus.merah}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ExpireBarChart
          data={[
            {
              status: "hijau",
              count: totalExpireByStatus.hijau,
              fill: "var(--color-hijau)",
            },
            {
              status: "kuning",
              count: totalExpireByStatus.kuning,
              fill: "var(--color-kuning)",
            },
            {
              status: "merah",
              count: totalExpireByStatus.merah,
              fill: "var(--color-merah)",
            },
          ]}
        />
        <ExpirePieChart
          data={[
            {
              status: "hijau",
              count: Math.floor(
                (totalExpireByStatus.hijau /
                  (databarang ? databarang.length : 0)) *
                  100
              ),
              fill: "var(--color-hijau)",
            },
            {
              status: "kuning",
              count: Math.floor(
                (totalExpireByStatus.kuning /
                  (databarang ? databarang.length : 0)) *
                  100
              ),
              fill: "var(--color-kuning)",
            },
            {
              status: "merah",
              count: Math.floor(
                (totalExpireByStatus.merah /
                  (databarang ? databarang.length : 0)) *
                  100
              ),
              fill: "var(--color-merah)",
            },
          ]}
        />
      </div>
      <KadaluwarsaDataTable data={databarang || []} loading={isLoading} />
    </div>
  );
}
