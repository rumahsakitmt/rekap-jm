import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rawat-inap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-2">
      <h1 className="text-3xl font-bold">Rawat Inap</h1>
    </div>
  );
}
