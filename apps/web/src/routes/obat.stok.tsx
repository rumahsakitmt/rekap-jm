import { createFileRoute } from "@tanstack/react-router";
import { StockDashboard } from "@/components/stock/stock-dashboard";

export const Route = createFileRoute("/obat/stok")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Stock Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive view of inventory stock levels and analytics
        </p>
      </div>
      <StockDashboard />
    </div>
  );
}
