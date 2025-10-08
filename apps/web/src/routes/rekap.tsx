import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/rekap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header />
      <div className="border-x border-dashed container mx-auto">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
