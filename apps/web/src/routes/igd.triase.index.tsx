import { columns } from "@/components/igd/column";
import { RegistrationTable } from "@/components/igd/data-table";
import { RegistrationFilter } from "@/components/igd/registration-filter";
import { useIgdRegistrationFilterStore } from "@/stores/igd-registration-filter";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/igd/triase/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { dateFrom, dateTo, keyword } = useIgdRegistrationFilterStore();
  const { data, isLoading } = useQuery(
    trpc.igd.getTodayRegistration.queryOptions({
      keyword,
      dateFrom,
      dateTo,
    })
  );

  if (!data) {
    return <div>no data</div>;
  }

  return (
    <div className="p-2 container mx-auto space-y-4">
      <nav className="border-b border-dashed py-2">
        <h3>::[ Registrasi IGD hari ini]::</h3>
      </nav>
      <section className="space-y-4">
        <RegistrationFilter />
        <RegistrationTable columns={columns} data={data} loading={isLoading} />
      </section>
    </div>
  );
}
