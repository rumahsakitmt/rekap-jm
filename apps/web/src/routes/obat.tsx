import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Package, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/obat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Medicine Management
        </h1>
        <p className="text-muted-foreground">
          Manage medicine inventory, stock levels, and analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link to="/obat/stok">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center space-y-2"
          >
            <BarChart3 className="h-6 w-6" />
            <span>Stock Dashboard</span>
          </Button>
        </Link>

        <Button
          variant="outline"
          className="w-full h-24 flex flex-col items-center justify-center space-y-2"
          disabled
        >
          <Package className="h-6 w-6" />
          <span>Medicine Catalog</span>
        </Button>
      </div>

      <Outlet />
    </div>
  );
}
