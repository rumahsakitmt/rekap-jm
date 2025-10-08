import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const links = [
    { to: "/rekap/rawat-jalan", label: "Rekap Rawat Jalan" },
    { to: "/rekap/rawat-inap", label: "Rekap Rawat Inap" },
    { to: "/tarif/rawat-jalan", label: "Tarif Rawat Jalan" },
    { to: "/tarif/rawat-inap", label: "Tarif Rawat Inap" },
  ] as const;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center border shadow rounded p-4">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="flex flex-col gap-2">
          {links.map(({ to, label }) => {
            return (
              <div key={to} className="border p-4 rounded">
                <Link to={to} className="text-blue-500 hover:underline">
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
