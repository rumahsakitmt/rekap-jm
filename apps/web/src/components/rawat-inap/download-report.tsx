import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Route } from "@/routes/rawat-inap";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

export const DownloadReport = () => {
  const {
    search,
    dateFrom,
    dateTo,
    selectedCsvFile,
    selectedDoctor,
    selectedKamar,
  } = Route.useSearch();
  const { data: csvData, isLoading: isLoadingCsv } = useQuery({
    ...trpc.rawatInap.downloadCsv.queryOptions({
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      filename: selectedCsvFile,
      kd_dokter: selectedDoctor || undefined,
      kd_bangsal: selectedKamar || undefined,
    }),
    enabled: !!selectedCsvFile,
  });
  const handleDownloadCsv = async () => {
    if (isLoadingCsv) return;
    try {
      const blob = new Blob([csvData || ""], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `rawat-inap-${dateStr}.csv`;
      link.setAttribute("download", filename);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download CSV:", error);
    }
  };
  return (
    <Button onClick={handleDownloadCsv} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Download CSV
    </Button>
  );
};
