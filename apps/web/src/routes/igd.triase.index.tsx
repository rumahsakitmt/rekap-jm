import { RegistrationData } from "@/components/igd/registration-data";
import { RegistrationFilter } from "@/components/igd/registration-filter";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/igd/triase/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-2 container mx-auto space-y-4">
      <nav className="border-b border-dashed py-2">
        <h3>::[ Registrasi IGD hari ini]::</h3>
      </nav>
      <section className="space-y-4">
        <RegistrationFilter />
        <RegistrationData />
      </section>
    </div>
  );
}
