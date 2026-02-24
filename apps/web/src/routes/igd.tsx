import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/igd")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
