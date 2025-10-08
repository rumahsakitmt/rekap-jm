import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tarif")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
