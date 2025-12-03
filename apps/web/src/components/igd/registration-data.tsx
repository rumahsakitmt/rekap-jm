import { useIgdRegistrationFilterStore } from "@/stores/igd-registration-filter";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { RegistrationTable } from "./data-table";
import { columns } from "./column";

export const RegistrationData = () => {
  const { dateFrom, dateTo, keyword } = useIgdRegistrationFilterStore();
  const { data, isLoading } = useQuery(
    trpc.igd.getTodayRegistration.queryOptions({
      keyword,
      dateFrom,
      dateTo,
    })
  );

  return (
    <RegistrationTable
      columns={columns}
      data={data ?? []}
      loading={isLoading}
    />
  );
};
