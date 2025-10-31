import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Pill, Flower } from "lucide-react";

export const Route = createFileRoute("/obat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-6 space-y-2">
      <div className="flex justify-between items-center gap-6 border-b border-dashed pb-2">
        <div className="flex items-center gap-2">
          <Flower />
          <span>SMART SIMRS</span>
        </div>

        <div className="flex items-center gap-2">
          <Pill size={16} />
          <h1 className="tracking-tight uppercase">FARMASI</h1>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
