import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Footprints, Bed, FlaskConical, Radiation, Flower } from "lucide-react";

export const Route = createFileRoute("/tarif")({
  component: RouteComponent,
});

function RouteComponent() {
  const links = [
    { to: "/tarif/rawat-jalan", label: "Rawat Jalan", Icon: Footprints },
    { to: "/tarif/rawat-inap", label: "Rawat Inap", Icon: Bed },
    { to: "/tarif/lab", label: "Lab", Icon: FlaskConical },
    { to: "/tarif/radiologi", label: "Radiologi", Icon: Radiation },
  ] as const;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <Flower />
          <span>SMART SIMRS</span>
        </Link>
        <div className="flex items-center gap-4">
          {links.map(({ to, label, Icon }) => {
            return (
              <Link
                key={to}
                to={to}
                className="text-muted-foreground hover:text-primary hover:underline underline-offset-2 flex items-center gap-2"
                activeProps={{ className: "text-primary underline" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
