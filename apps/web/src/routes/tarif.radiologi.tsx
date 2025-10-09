import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tarif/radiologi")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tarif/radiologi"!</div>;
}
