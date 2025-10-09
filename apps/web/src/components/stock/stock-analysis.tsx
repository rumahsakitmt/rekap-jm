"use client";

import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

export function StockAnalysis() {
  const { data: summary } = useQuery(trpc.stock.getStockSummary.queryOptions());
  const { data: lowStockItems } = useQuery(
    trpc.stock.getLowStockItems.queryOptions()
  );
  const { data: stockByWarehouse } = useQuery(
    trpc.stock.getStockByWarehouse.queryOptions()
  );
  const { data: topItemsByValue } = useQuery(
    trpc.stock.getTopItemsByValue.queryOptions()
  );
  const { data: stockByBatch } = useQuery(
    trpc.stock.getStockByBatch.queryOptions()
  );

  const chartConfig = {
    stock: {
      label: "Stok",
      color: "hsl(var(--chart-1))",
    },
    value: {
      label: "Nilai",
      color: "hsl(var(--chart-2))",
    },
    items: {
      label: "Item",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  // Calculate stock health metrics
  const totalItems = summary?.totalItems || 0;
  const lowStockCount = summary?.lowStockCount || 0;
  const outOfStockCount = summary?.outOfStockCount || 0;
  const healthyStockCount = totalItems - lowStockCount - outOfStockCount;

  const stockHealthData = [
    { name: "Stok Sehat", value: healthyStockCount, color: "#00C49F" },
    { name: "Stok Rendah", value: lowStockCount, color: "#FFBB28" },
    { name: "Stok Habis", value: outOfStockCount, color: "#FF8042" },
  ];

  // Calculate expiry analysis
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoon =
    stockByBatch?.filter(
      (batch) =>
        batch.expire &&
        new Date(batch.expire) <= thirtyDaysFromNow &&
        new Date(batch.expire) > now
    ).length || 0;

  const expired =
    stockByBatch?.filter(
      (batch) => batch.expire && new Date(batch.expire) < now
    ).length || 0;

  const expiryData = [
    {
      name: "Baik",
      value: (stockByBatch?.length || 0) - expiringSoon - expired,
      color: "#00C49F",
    },
    { name: "Akan Kadaluarsa", value: expiringSoon, color: "#FFBB28" },
    { name: "Kadaluarsa", value: expired, color: "#FF8042" },
  ];

  // Calculate top 5 warehouses by value
  const topWarehouses = stockByWarehouse?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kesehatan Stok
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((healthyStockCount / totalItems) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {healthyStockCount} dari {totalItems} item sehat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Kritis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Item yang benar-benar habis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Akan Kadaluarsa
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground">
              Batch kadaluarsa dalam 30 hari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Nilai Item
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (summary?.totalValue || 0) / (summary?.totalItems || 1)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata nilai per item
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Health Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kesehatan Stok</CardTitle>
            <CardDescription>
              Ringkasan tingkat stok di semua item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={stockHealthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Kadaluarsa</CardTitle>
            <CardDescription>Analisis kadaluarsa batch</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={expiryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Warehouses by Value */}
      <Card>
        <CardHeader>
          <CardTitle>Gudang Teratas Berdasarkan Nilai Inventori</CardTitle>
          <CardDescription>
            Gudang dengan nilai inventori tertinggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={topWarehouses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nm_bangsal"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [formatCurrency(Number(value)), "Nilai"]}
              />
              <Bar dataKey="totalValue" fill="var(--color-value)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {(outOfStockCount > 0 || expiringSoon > 0 || expired > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Peringatan Kritis</h3>

          {outOfStockCount > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Item Stok Habis</AlertTitle>
              <AlertDescription>
                {outOfStockCount} item benar-benar habis dan perlu restock
                segera.
              </AlertDescription>
            </Alert>
          )}

          {expiringSoon > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4" />
              <AlertTitle>Item Akan Kadaluarsa</AlertTitle>
              <AlertDescription>
                {expiringSoon} batch akan kadaluarsa dalam 30 hari ke depan.
                Pertimbangkan untuk menggunakan terlebih dahulu atau
                mengembalikan ke supplier.
              </AlertDescription>
            </Alert>
          )}

          {expired > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Item Kadaluarsa</AlertTitle>
              <AlertDescription>
                {expired} batch telah kadaluarsa dan harus segera dikeluarkan
                dari inventori.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Rekomendasi</CardTitle>
          <CardDescription>
            Wawasan yang dapat ditindaklanjuti berdasarkan data stok saat ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowStockItems && lowStockItems.length > 0 && (
            <div className="flex items-start space-x-3">
              <TrendingDown className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Reorder Item Stok Rendah</p>
                <p className="text-sm text-muted-foreground">
                  {lowStockItems.length} item berada di bawah tingkat stok
                  minimum. Pertimbangkan untuk melakukan permintaan reorder
                  untuk mencegah kehabisan stok.
                </p>
              </div>
            </div>
          )}

          {topItemsByValue && topItemsByValue.length > 0 && (
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Item Bernilai Tinggi</p>
                <p className="text-sm text-muted-foreground">
                  Pantau {Math.min(5, topItemsByValue.length)} item dengan nilai
                  tertinggi dengan cermat. Item-item ini mewakili investasi
                  inventori yang signifikan.
                </p>
              </div>
            </div>
          )}

          {stockByWarehouse && stockByWarehouse.length > 1 && (
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Optimasi Gudang</p>
                <p className="text-sm text-muted-foreground">
                  Pertimbangkan untuk mendistribusikan ulang inventori di{" "}
                  {stockByWarehouse.length} gudang untuk mengoptimalkan tingkat
                  stok dan mengurangi biaya penyimpanan.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
