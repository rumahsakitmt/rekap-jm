import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/klaim/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>main</div>;
}
