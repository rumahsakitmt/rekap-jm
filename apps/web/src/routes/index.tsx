import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bed,
  Footprints,
  FlaskConical,
  Pill,
  Radiation,
  Flower,
  Stethoscope,
  ClockAlert,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const links = [
    {
      title: "Rekap",
      items: [
        {
          to: "/rekap/rawat-jalan",
          label: "Rawat Jalan",
          Icon: Footprints,
        },
        { to: "/rekap/rawat-inap", label: "Rawat Inap", Icon: Bed },
      ],
    },
    {
      title: "Farmasi",
      items: [
        { to: "/obat/stok", label: "Stok Obat", Icon: Pill },
        {
          to: "/obat/kadaluwarsa",
          label: "Kadaluwarsa",
          Icon: ClockAlert,
        },
      ],
    },
    {
      title: "Tarif",
      items: [
        {
          to: "/tarif/rawat-jalan",
          label: "Rawat Jalan",
          Icon: Footprints,
        },
        { to: "/tarif/rawat-inap", label: "Rawat Inap", Icon: Bed },
        { to: "/tarif/lab", label: "Lab", Icon: FlaskConical },
        { to: "/tarif/radiologi", label: "Radiologi", Icon: Radiation },
        { to: "/tarif/operasi", label: "Operasi", Icon: Stethoscope },
      ],
    },
  ] as const;

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background"></div>
      <div className="text-center   p-4 space-y-8 z-20">
        <div className="flex items-center gap-2 justify-center">
          <Flower className="text-primary animate-spin" />
          <h1 className="text-2xl font-bold">
            SMART SIMRS{" "}
            <span className="text-primary font-normal italic">v1.0.0</span>
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {links.map(({ title, items }) => {
            return (
              <div
                key={title}
                className="border p-4 flex flex-col items-start gap-2 bg-background"
              >
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {title}
                </p>
                {items.map(({ to, label, Icon }) => {
                  return (
                    <Link
                      key={to}
                      to={to}
                      className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2 text-sm"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
