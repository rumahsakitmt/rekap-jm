import { useIgdRegistrationFilterStore } from "@/stores/igd-registration-filter";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { RegistrationTable } from "./data-table";
import { columns, type IGDRegistration } from "./column";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Calendar, FileText, Stethoscope } from "lucide-react";

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
      renderMobileItem={(item: IGDRegistration) => (
        <div
          className={cn(
            "p-4 space-y-3",
            item.triase_type === "sekunder" &&
              "bg-yellow-400/10 border-l-4 border-l-yellow-600",
            item.triase_type === "primer" &&
              "bg-red-400/10 border-l-4 border-l-red-600"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-lg">{item.nm_pasien}</h4>
              <Link
                to="/igd/triase/$norawat"
                params={{
                  norawat: item.no_rawat as string,
                }}
                search={{
                  triase_type: item.has_triase
                    ? (item.triase_type as string)
                    : undefined,
                }}
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                {item.no_rawat}
              </Link>
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {item.no_rkm_medis}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {format(
                  new Date(item.tgl_registrasi || new Date()),
                  "dd/MM/yyyy"
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="truncate">{item.nm_dokter}</span>
            </div>
          </div>
        </div>
      )}
    />
  );
};
