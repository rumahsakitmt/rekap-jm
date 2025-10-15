import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { StockDataTable } from "@/components/stock/stock-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp, CheckCircle, Flame } from "lucide-react";
import { Package, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

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

export const Route = createFileRoute("/obat/stok")({
  component: RouteComponent,
  validateSearch: zodValidator(stockSearchSchema),
});

function RouteComponent() {
  const { dateFrom, dateTo, leadingTime, selectedBangsal } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: databarang, isLoading } = useQuery(
    trpc.obat.getObat.queryOptions({
      dateFrom,
      dateTo,
      leadingTime,
      selectedBangsal,
    })
  );
  const totalPenggunaan = databarang?.reduce(
    (sum, item) => sum + (item.penggunaan || 0),
    0
  );
  const totalStokAmountSehat = databarang?.filter(
    (item) => item.stockStatus === "sehat"
  ).length;
  const totalStokAmountSedang = databarang?.filter(
    (item) => item.stockStatus === "sedang"
  ).length;
  const totalStokAmountRendah = databarang?.filter(
    (item) => item.stockStatus === "rendah"
  ).length;
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
      <div className="grid grid-cols-3 gap-2">
        <div
          className={cn(
            "bg-green-50 dark:bg-green-950 p-4 rounded-lg flex items-center justify-between cursor-pointer  hover:outline hover:outline-green-600",
            status === "sehat" && "outline outline-green-600"
          )}
          onClick={() => {
            navigate({
              to: "/obat/stok",
              search: (prev) => ({ ...prev, status: "sehat" }),
            });
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              Stok Aman
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {totalStokAmountSehat?.toLocaleString("id-ID")}{" "}
            <span className="font-normal text-sm">item</span>
          </p>
        </div>
        <div
          className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:outline hover:outline-amber-600"
          onClick={() => {
            navigate({
              to: "/obat/stok",
              search: (prev) => ({ ...prev, status: "sedang" }),
            });
          }}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">Pesan</span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {totalStokAmountSedang?.toLocaleString("id-ID")}{" "}
            <span className="font-normal text-sm">item</span>
          </p>
        </div>
        <div
          className="bg-red-50 dark:bg-red-950 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:outline hover:outline-red-600"
          onClick={() => {
            navigate({
              to: "/obat/stok",
              search: (prev) => ({ ...prev, status: "rendah" }),
            });
          }}
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              SegeraPesan
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {totalStokAmountRendah?.toLocaleString("id-ID")}{" "}
            <span className="font-normal text-sm">item</span>
          </p>
        </div>
      </div>
      <StockDataTable data={databarang || []} loading={isLoading} />
    </div>
  );
}
