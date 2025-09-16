import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const links = [
    { to: "/", label: "Rawat Jalan" },
    { to: "/rawat-inap", label: "Rawat Inap" },
  ] as const;

  const reportLinks = [
    { to: "/report-rawat-jalan", label: "Laporan Rawat Jalan" },
    { to: "/report-rawat-inap-detailed", label: "Laporan Detail Rawat Inap" },
  ] as const;

  return (
    <div className="w-full border-y border-dashed">
      <div className="flex flex-row items-center justify-between px-2 py-4 container mx-auto border-x border-dashed">
        <nav className="flex gap-4">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <nav className="flex gap-4">
          {reportLinks.map(({ to, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
