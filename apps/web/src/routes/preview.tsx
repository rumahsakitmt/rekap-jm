import { OGImagePreview } from "@/components/og-image-preview";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OGImagePreview />;
}
