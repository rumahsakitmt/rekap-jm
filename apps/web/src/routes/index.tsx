import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bed,
  FileText,
  Footprints,
  FlaskConical,
  Pill,
  Radiation,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const links = [
    { to: "/rekap/rawat-jalan", label: "Rekap Rawat Jalan", Icon: Footprints },
    { to: "/rekap/rawat-inap", label: "Rekap Rawat Inap", Icon: Bed },
    { to: "/obat/stok", label: "Stok Obat", Icon: Pill },
    { to: "/tarif/rawat-jalan", label: "Tarif Rawat Jalan", Icon: FileText },
    { to: "/tarif/rawat-inap", label: "Tarif Rawat Inap", Icon: FileText },
    { to: "/tarif/lab", label: "Tarif Lab", Icon: FlaskConical },
    { to: "/tarif/radiologi", label: "Tarif Radiologi", Icon: Radiation },
  ] as const;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center border shadow rounded p-4">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="grid grid-cols-5 gap-2">
          {links.map(({ to, label, Icon }) => {
            return (
              <div
                key={to}
                className="border p-4 rounded flex items-center gap-2"
              >
                <Link to={to} className="text-blue-500 hover:underline">
                  <Icon className="h-6 w-6" />
                  {label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
