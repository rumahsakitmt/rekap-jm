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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Warehouse,
  Activity,
  ShoppingCart,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Bell,
  RefreshCw,
  Calculator,
  FileText,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StockAnalysis } from "./stock-analysis";
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

export function StockDashboard() {
  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery(
    trpc.stock.getLowStockItems.queryOptions()
  );
  const { data: stockByWarehouse, isLoading: warehouseLoading } = useQuery(
    trpc.stock.getStockByWarehouse.queryOptions()
  );

  const { data: stockByCategory, isLoading: categoryLoading } = useQuery(
    trpc.stock.getStockByCategory.queryOptions()
  );

  const { data: inventoryTurnover, isLoading: turnoverLoading } = useQuery(
    trpc.stock.getInventoryTurnover.queryOptions()
  );
  const { data: abcAnalysis, isLoading: abcLoading } = useQuery(
    trpc.stock.getABCAnalysis.queryOptions()
  );
  const { data: reorderRecommendations, isLoading: reorderLoading } = useQuery(
    trpc.stock.getReorderRecommendations.queryOptions()
  );
  const { data: criticalAlerts, isLoading: alertsLoading } = useQuery(
    trpc.stock.getCriticalAlerts.queryOptions()
  );
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery(
    trpc.stock.getStockPerformanceMetrics.queryOptions()
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

  const pieChartConfig = {
    stock: {
      label: "Stok",
      color: "hsl(var(--chart-1))",
    },
    value: {
      label: "Nilai",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Peringatan Stok Rendah</AlertTitle>
          <AlertDescription>
            {lowStockItems.length} item berada di bawah tingkat stok minimum.
            Pertimbangkan untuk melakukan reorder untuk menghindari kehabisan
            stok.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="analysis">Analisis</TabsTrigger>
          <TabsTrigger value="financial">Finansial</TabsTrigger>
          <TabsTrigger value="operations">Operasi</TabsTrigger>
          <TabsTrigger value="alerts">Alert</TabsTrigger>
          <TabsTrigger value="warehouse">Gudang</TabsTrigger>
          <TabsTrigger value="category">Kategori</TabsTrigger>
          <TabsTrigger value="abc-analysis">ABC</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="">
            {/* Stock Distribution by Warehouse */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Stok per Gudang</CardTitle>
                <CardDescription>
                  Tingkat stok saat ini di semua gudang
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <BarChart data={stockByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nm_bangsal"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="totalStok" fill="var(--color-stock)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <StockAnalysis />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Analisis Turnover Inventori</CardTitle>
                <CardDescription>
                  Item dengan rasio turnover tertinggi dan terendah
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={inventoryTurnover?.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nama_brng"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="turnoverRatio" fill="var(--color-stock)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Nilai Inventori</CardTitle>
                <CardDescription>
                  Analisis nilai inventori per item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={inventoryTurnover?.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nama_brng, totalValue }) =>
                        `${nama_brng.slice(0, 15)}...: ${formatCurrency(Number(totalValue) || 0)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalValue"
                    >
                      {inventoryTurnover?.slice(0, 8).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Item Berdasarkan Turnover</CardTitle>
              <CardDescription>
                Item dengan performa turnover terbaik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Nilai Total</TableHead>
                    <TableHead>Turnover Ratio</TableHead>
                    <TableHead>Harga Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryTurnover?.slice(0, 10).map((item) => (
                    <TableRow key={item.kode_brng}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {item.nama_brng}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.kode_brng}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.totalStok?.toLocaleString()} {item.kode_sat}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(item.totalValue) || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.turnoverRatio > 2
                              ? "default"
                              : item.turnoverRatio > 1
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {item.turnoverRatio?.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(item.h_beli) || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Reorder</CardTitle>
              <CardDescription>
                Item yang memerlukan reorder berdasarkan analisis stok
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Stok Saat Ini</TableHead>
                    <TableHead>Stok Minimum</TableHead>
                    <TableHead>Defisit</TableHead>
                    <TableHead>Rekomendasi Reorder</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Nilai Reorder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reorderRecommendations?.map((item) => (
                    <TableRow key={item.kode_brng}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {item.nama_brng}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.kode_brng}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.totalStok?.toLocaleString()} {item.kode_sat}
                      </TableCell>
                      <TableCell>
                        {item.stokMinimal?.toLocaleString()} {item.kode_sat}
                      </TableCell>
                      <TableCell
                        className={
                          item.deficit && item.deficit < 0 ? "text-red-600" : ""
                        }
                      >
                        {item.deficit?.toLocaleString()} {item.kode_sat}
                      </TableCell>
                      <TableCell>
                        {item.suggestedReorder?.toLocaleString()}{" "}
                        {item.kode_sat}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.priority === "CRITICAL"
                              ? "destructive"
                              : item.priority === "HIGH"
                                ? "default"
                                : item.priority === "MEDIUM"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          (item.suggestedReorder || 0) * (item.h_beli || 0)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {criticalAlerts?.outOfStock &&
              criticalAlerts.outOfStock.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    Stok Habis ({criticalAlerts.outOfStock.length})
                  </AlertTitle>
                  <AlertDescription>
                    {criticalAlerts.outOfStock
                      .slice(0, 3)
                      .map((item) => item.nama_brng)
                      .join(", ")}
                    {criticalAlerts.outOfStock.length > 3 &&
                      ` dan ${criticalAlerts.outOfStock.length - 3} item lainnya`}
                  </AlertDescription>
                </Alert>
              )}

            {criticalAlerts?.lowStock && criticalAlerts.lowStock.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  Stok Rendah ({criticalAlerts.lowStock.length})
                </AlertTitle>
                <AlertDescription>
                  {criticalAlerts.lowStock
                    .slice(0, 3)
                    .map((item) => item.nama_brng)
                    .join(", ")}
                  {criticalAlerts.lowStock.length > 3 &&
                    ` dan ${criticalAlerts.lowStock.length - 3} item lainnya`}
                </AlertDescription>
              </Alert>
            )}

            {criticalAlerts?.expiringSoon &&
              criticalAlerts.expiringSoon.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4" />
                  <AlertTitle>
                    Akan Kadaluarsa ({criticalAlerts.expiringSoon.length})
                  </AlertTitle>
                  <AlertDescription>
                    {criticalAlerts.expiringSoon
                      .slice(0, 3)
                      .map((item) => item.nama_brng)
                      .join(", ")}
                    {criticalAlerts.expiringSoon.length > 3 &&
                      ` dan ${criticalAlerts.expiringSoon.length - 3} item lainnya`}
                  </AlertDescription>
                </Alert>
              )}

            {criticalAlerts?.expired && criticalAlerts.expired.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  Kadaluarsa ({criticalAlerts.expired.length})
                </AlertTitle>
                <AlertDescription>
                  {criticalAlerts.expired
                    .slice(0, 3)
                    .map((item) => item.nama_brng)
                    .join(", ")}
                  {criticalAlerts.expired.length > 3 &&
                    ` dan ${criticalAlerts.expired.length - 3} item lainnya`}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Alert</CardTitle>
              <CardDescription>
                Rincian semua peringatan yang perlu perhatian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="out-of-stock" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="out-of-stock">Stok Habis</TabsTrigger>
                  <TabsTrigger value="low-stock">Stok Rendah</TabsTrigger>
                  <TabsTrigger value="expiring">Akan Kadaluarsa</TabsTrigger>
                  <TabsTrigger value="expired">Kadaluarsa</TabsTrigger>
                </TabsList>

                <TabsContent value="out-of-stock">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Prioritas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalAlerts?.outOfStock?.map((item) => (
                        <TableRow key={item.kode_brng}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {item.nama_brng}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.kode_brng}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-red-600 font-bold">
                            0
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">CRITICAL</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="low-stock">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Stok Saat Ini</TableHead>
                        <TableHead>Stok Minimum</TableHead>
                        <TableHead>Prioritas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalAlerts?.lowStock?.map((item) => (
                        <TableRow key={item.kode_brng}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {item.nama_brng}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.kode_brng}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.totalStok?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {item.stokMinimal?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">HIGH</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="expiring">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Tanggal Kadaluarsa</TableHead>
                        <TableHead>Prioritas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalAlerts?.expiringSoon?.map((item, index) => (
                        <TableRow
                          key={`${item.kode_brng}-${item.no_batch}-${index}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {item.nama_brng}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.kode_brng}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.no_batch}</TableCell>
                          <TableCell>{item.stok?.toLocaleString()}</TableCell>
                          <TableCell>
                            {item.expire
                              ? new Date(item.expire).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">MEDIUM</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="expired">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Tanggal Kadaluarsa</TableHead>
                        <TableHead>Prioritas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalAlerts?.expired?.map((item, index) => (
                        <TableRow
                          key={`${item.kode_brng}-${item.no_batch}-${index}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {item.nama_brng}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.kode_brng}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.no_batch}</TableCell>
                          <TableCell>{item.stok?.toLocaleString()}</TableCell>
                          <TableCell className="text-red-600">
                            {item.expire
                              ? new Date(item.expire).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">CRITICAL</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Stok Gudang</CardTitle>
              <CardDescription>Rincian detail per gudang</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gudang</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Total Stok</TableHead>
                    <TableHead>Total Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockByWarehouse?.map((warehouse) => (
                    <TableRow key={warehouse.kd_bangsal}>
                      <TableCell className="font-medium">
                        {warehouse.nm_bangsal || warehouse.kd_bangsal}
                      </TableCell>
                      <TableCell>
                        {warehouse.totalItems?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {warehouse.totalStok?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(warehouse.totalValue) || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stok per Kategori</CardTitle>
                <CardDescription>Item dan stok per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={stockByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="kode_kategori" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="totalItems" fill="var(--color-items)" />
                    <Bar dataKey="totalStok" fill="var(--color-stock)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nilai per Kategori</CardTitle>
                <CardDescription>Nilai inventori per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={stockByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="kode_kategori" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      stroke="var(--color-value)"
                      fill="var(--color-value)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abc-analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ABC Analysis - Distribusi Klasifikasi</CardTitle>
                <CardDescription>
                  Klasifikasi item berdasarkan nilai inventori (80/20 rule)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Kelas A (80%)",
                          value:
                            abcAnalysis?.filter(
                              (item) => item.classification === "A"
                            ).length || 0,
                          color: "#FF6B6B",
                        },
                        {
                          name: "Kelas B (15%)",
                          value:
                            abcAnalysis?.filter(
                              (item) => item.classification === "B"
                            ).length || 0,
                          color: "#4ECDC4",
                        },
                        {
                          name: "Kelas C (5%)",
                          value:
                            abcAnalysis?.filter(
                              (item) => item.classification === "C"
                            ).length || 0,
                          color: "#45B7D1",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        {
                          name: "Kelas A (80%)",
                          value:
                            abcAnalysis?.filter(
                              (item) => item.classification === "A"
                            ).length || 0,
                          color: "#FF6B6B",
                        },
                        {
                          name: "Kelas B (15%)",
                          value:
                            abcAnalysis?.filter(
                              (item) => item.classification === "B"
                            ).length || 0,
                          color: "#4ECDC4",
                        },
                        {
                          name: "Kelas C (5%)",
                          value:
                            abcAnalysis?.filter(
                              (item) => item.classification === "C"
                            ).length || 0,
                          color: "#45B7D1",
                        },
                      ].map((entry, index) => (
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
                <CardTitle>ABC Analysis - Nilai Kumulatif</CardTitle>
                <CardDescription>
                  Persentase kumulatif nilai inventori per klasifikasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart
                    data={[
                      {
                        classification: "Kelas A",
                        value:
                          abcAnalysis
                            ?.filter((item) => item.classification === "A")
                            .reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 0,
                        percentage:
                          ((abcAnalysis
                            ?.filter((item) => item.classification === "A")
                            ?.reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 0) /
                            (abcAnalysis?.reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 1)) *
                          100,
                      },
                      {
                        classification: "Kelas B",
                        value:
                          abcAnalysis
                            ?.filter((item) => item.classification === "B")
                            .reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 0,
                        percentage:
                          ((abcAnalysis
                            ?.filter((item) => item.classification === "B")
                            ?.reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 0) /
                            (abcAnalysis?.reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 1)) *
                          100,
                      },
                      {
                        classification: "Kelas C",
                        value:
                          abcAnalysis
                            ?.filter((item) => item.classification === "C")
                            .reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 0,
                        percentage:
                          ((abcAnalysis
                            ?.filter((item) => item.classification === "C")
                            ?.reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 0) /
                            (abcAnalysis?.reduce(
                              (sum, item) =>
                                sum + (Number(item.totalValue) || 0),
                              0
                            ) || 1)) *
                          100,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="classification" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        "Nilai",
                      ]}
                    />
                    <Bar dataKey="value" fill="var(--color-value)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail ABC Analysis</CardTitle>
              <CardDescription>
                Rincian klasifikasi semua item berdasarkan nilai inventori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="class-a" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="class-a">Kelas A (Kritis)</TabsTrigger>
                  <TabsTrigger value="class-b">Kelas B (Penting)</TabsTrigger>
                  <TabsTrigger value="class-c">Kelas C (Biasa)</TabsTrigger>
                </TabsList>

                <TabsContent value="class-a">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Nilai Total</TableHead>
                        <TableHead>Persentase Kumulatif</TableHead>
                        <TableHead>Klasifikasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abcAnalysis
                        ?.filter((item) => item.classification === "A")
                        .map((item) => (
                          <TableRow key={item.kode_brng}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {item.nama_brng}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.kode_brng}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.totalStok?.toLocaleString()} {item.kode_sat}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(Number(item.totalValue) || 0)}
                            </TableCell>
                            <TableCell>
                              {item.cumulativePercentage?.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">A - KRITIS</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="class-b">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Nilai Total</TableHead>
                        <TableHead>Persentase Kumulatif</TableHead>
                        <TableHead>Klasifikasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abcAnalysis
                        ?.filter((item) => item.classification === "B")
                        .map((item) => (
                          <TableRow key={item.kode_brng}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {item.nama_brng}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.kode_brng}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.totalStok?.toLocaleString()} {item.kode_sat}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(Number(item.totalValue) || 0)}
                            </TableCell>
                            <TableCell>
                              {item.cumulativePercentage?.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">B - PENTING</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="class-c">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Nilai Total</TableHead>
                        <TableHead>Persentase Kumulatif</TableHead>
                        <TableHead>Klasifikasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abcAnalysis
                        ?.filter((item) => item.classification === "C")
                        .map((item) => (
                          <TableRow key={item.kode_brng}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {item.nama_brng}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.kode_brng}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.totalStok?.toLocaleString()} {item.kode_sat}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(Number(item.totalValue) || 0)}
                            </TableCell>
                            <TableCell>
                              {item.cumulativePercentage?.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">C - BIASA</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
