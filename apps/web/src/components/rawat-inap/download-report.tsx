import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Route } from "@/routes/rekap.rawat-inap";
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
  const { data: xlsxData, isLoading: isLoadingXlsx } = useQuery({
    ...trpc.rawatInap.downloadXlsx.queryOptions({
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      filename: selectedCsvFile,
      kd_dokter: selectedDoctor || undefined,
      kd_bangsal: selectedKamar || undefined,
    }),
    enabled: !!selectedCsvFile,
  });
  const handleDownloadXlsx = async () => {
    if (!xlsxData) return;
    try {
      const buffer = new Uint8Array(xlsxData.data);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `rawat-inap-${dateStr}.xlsx`;
      link.setAttribute("download", filename);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download XLSX:", error);
    }
  };
  return (
    <Button
      onClick={handleDownloadXlsx}
      variant="outline"
      disabled={isLoadingXlsx}
    >
      <Download className="h-4 w-4 mr-2" />
      {isLoadingXlsx ? "Loading" : "Download"}
    </Button>
  );
};
