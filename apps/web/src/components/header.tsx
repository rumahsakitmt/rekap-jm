import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/rekap/rawat-jalan", label: "Rawat Jalan" },
  { to: "/rekap/rawat-inap", label: "Rawat Inap" },
  { to: "/rekap/surveilens-rawat-inap", label: "Surveilens Rawat Inap" },
  { to: "/rekap/surveilens-rawat-jalan", label: "Surveilens Rawat Jalan" },
] as const;

export default function Header() {
  return (
    <div className="w-full border-y border-dashed">
      <div className="flex flex-row items-center justify-between gap-4 px-2 py-4 container mx-auto border-x border-dashed">
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map(({ to, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="text-muted-foreground"
                activeProps={{ className: "text-primary font-bold" }}
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
