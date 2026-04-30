import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/klaim/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/klaim/ranap" search={(prev) => prev} />;
}
