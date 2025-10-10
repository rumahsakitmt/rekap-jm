import { createFileRoute } from "@tanstack/react-router";
import { StockDashboard } from "@/components/stock/stock-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  DollarSign,
  AlertTriangle,
  Activity,
  Target,
  Bell,
  RefreshCw,
  Calculator,
  FileText,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/obat/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: summary, isLoading: summaryLoading } = useQuery(
    trpc.stock.getStockSummary.queryOptions()
  );
  const { data: topItemsByValue, isLoading: topItemsLoading } = useQuery(
    trpc.stock.getTopItemsByValue.queryOptions()
  );
  const { data: stockByBatch, isLoading: batchLoading } = useQuery(
    trpc.stock.getStockByBatch.queryOptions()
  );
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery(
    trpc.stock.getStockPerformanceMetrics.queryOptions()
  );
  const { data: criticalAlerts, isLoading: alertsLoading } = useQuery(
    trpc.stock.getCriticalAlerts.queryOptions()
  );
  const { data: reorderRecommendations, isLoading: reorderLoading } = useQuery(
    trpc.stock.getReorderRecommendations.queryOptions()
  );
  return (
    <div>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Item</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalItems?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Item aktif dalam inventori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Item Stok Rendah
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Number(summary?.lowStockCount) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Item di bawah stok minimum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Habis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {Number(summary?.outOfStockCount) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Item dengan stok nol
            </p>
          </CardContent>
        </Card>
        {/* Advanced KPI Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kesehatan Stok
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performanceMetrics?.stockHealthPercentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics?.healthyStockCount || 0} dari{" "}
              {performanceMetrics?.totalItems || 0} item sehat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alert</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Number(criticalAlerts?.totalAlerts) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Peringatan yang perlu perhatian
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rekomendasi Reorder
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reorderRecommendations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Item yang perlu di-reorder
            </p>
          </CardContent>
        </Card>
      </div>

      <StockDashboard />
    </div>
  );
}
