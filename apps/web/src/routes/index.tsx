import { createFileRoute } from "@tanstack/react-router";
import { trpc, trpcClient } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/calendar";
import { PerawatanList } from "@/components/perawatan-list";
import { UploadCSVSheet } from "@/components/upload-csv-sheet";
import { ImportStatistics } from "@/components/import-statistics";
import { Copy, Check, ChevronUp, ChevronDown, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState<number | undefined>(50);
  const [offset, setOffset] = useState(0);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() =>
    startOfMonth(new Date())
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(() =>
    endOfMonth(new Date())
  );
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvStatistics, setCsvStatistics] = useState<{
    totalRequested: number;
    found: number;
    notFound: number;
    notFoundValues: string[];
  } | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const rawatJalan = useQuery(
    trpc.regPeriksa.getRegPeriksa.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      ...(offset > 0 && { offset }),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      includeTotals: true,
    })
  );

  const mutation = useMutation({
    ...trpc.regPeriksa.importCsv.mutationOptions(),
    onSuccess: (response) => {
      setCsvData(response.data);
      setCsvStatistics(response.statistics);
      setIsCsvMode(true);
      setIsImporting(false);
    },
    onError: (error) => {
      console.error("Import failed:", error);
      setIsImporting(false);
    },
  });

  const handleCsvImport = async (
    csvData: { no_sep: string; tarif: number }[]
  ) => {
    setIsImporting(true);
    try {
      mutation.mutateAsync({
        csvData,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: limit || undefined,
      });
    } catch (error) {
      console.error("Import failed:", error);
      setIsImporting(false);
    }
  };

  const handleClearCsv = () => {
    setCsvData([]);
    setCsvStatistics(null);
    setIsCsvMode(false);
  };

  const downloadCsv = () => {
    if (!displayData || displayData.length === 0) return;

    const headers = [
      "Tanggal Perawatan",
      "No RM",
      "No Rawat",
      "No SEP",
      "Nama Pasien",
      "Kode Dokter",
      "Nama Dokter",
      "Poli",
      "Permintaan Radiologi",
      "Permintaan Lab",
      "Konsul",
      "Konsul Dokter",
    ];

    if (isCsvMode) {
      headers.push(
        "Total Tarif",
        "Alokasi",
        "DPJP Utama",
        "Laboratorium",
        "Radiologi",
        "Yang Terbagi",
        "% Dari Klaim"
      );
    }

    const csvContent = [
      headers.join(","),
      ...displayData.map((row) => {
        const baseData = [
          format(new Date(row.tgl_perawatan as string), "dd/MM/yyyy"),
          row.no_rekam_medis,
          row.no_rawat,
          row.no_sep,
          `"${row.nm_pasien}"`,
          row.kd_dokter,
          `"${row.nm_dokter}"`,
          `"${row.nm_poli}"`,
          row.total_permintaan_radiologi || 0,
          row.total_permintaan_lab || 0,
          row.konsul_count || 0,
          `"${(row.jns_perawatan || []).map((p: any) => p.nm_dokter).join(", ")}"`,
        ];

        if (isCsvMode) {
          baseData.push(
            row.tarif_from_csv || 0,
            row.alokasi || 0,
            row.dpjp_utama || 0,
            row.konsul || 0,
            row.laboratorium || 0,
            row.radiologi || 0,
            row.yang_terbagi || 0,
            row.percent_dari_klaim || 0
          );
        }

        return baseData.join(",");
      }),
    ];

    if (isCsvMode) {
      const totalsRow = [
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        displayData.reduce(
          (sum, row) => sum + Number(row.total_permintaan_radiologi || 0),
          0
        ),
        displayData.reduce(
          (sum, row) => sum + Number(row.total_permintaan_lab || 0),
          0
        ),
        displayData.reduce(
          (sum, row) => sum + Number(row.konsul_count || 0),
          0
        ),
        "",
        totals.totalTarif,
        totals.totalAlokasi,
        totals.totalDpjpUtama,
        totals.totalKonsul,
        totals.totalLaboratorium,
        totals.totalRadiologi,
        totals.totalYangTerbagi,
        averagePercentDariKlaim,
      ];
      csvContent.push(totalsRow.join(","));
    }

    const blob = new Blob([csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    const dateRange =
      dateFrom && dateTo
        ? `_${format(dateFrom, "yyyy-MM-dd")}_to_${format(dateTo, "yyyy-MM-dd")}`
        : "";
    const mode = isCsvMode ? "_csv_mode" : "";

    link.setAttribute("download", `rekap_rawat_jalan${mode}${dateRange}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollButtons(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayData = isCsvMode ? mutation.data?.data : rawatJalan.data?.data;
  const serverTotals = rawatJalan.data?.totals;
  const csvServerTotals = mutation.data?.totals;

  const totals = isCsvMode ? csvServerTotals : serverTotals;
  const averagePercentDariKlaim = totals?.averagePercentDariKlaim || 0;

  return (
    <div className="container mx-auto px-4 py-2">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Filter & Search</CardTitle>
          <UploadCSVSheet onImport={handleCsvImport} isLoading={isImporting} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search (No Rawat/SEP)</label>
            <Input
              placeholder="Search by no_rawat or no_sep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Date From</label>
              <DatePicker date={dateFrom} setDate={setDateFrom} />
            </div>
            <div>
              <label className="text-sm font-medium">Date To</label>
              <DatePicker date={dateTo} setDate={setDateTo} />
            </div>
            <div>
              <label className="text-sm font-medium">Limit</label>
              <Select
                value={limit?.toString() || "no-limit"}
                onValueChange={(value) =>
                  setLimit(value === "no-limit" ? undefined : Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="no-limit">No Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="self-end"
              onClick={() => {
                setSearch("");
                setLimit(50);
                setOffset(0);
                setDateFrom(startOfMonth(new Date()));
                setDateTo(endOfMonth(new Date()));
                handleClearCsv();
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>

          {/* Pagination Controls */}
          {!isCsvMode && limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {Math.floor(offset / limit) + 1} • Showing {offset + 1}-
                  {Math.min(offset + limit, totals?.count || 0)} of{" "}
                  {totals?.count || 0}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={!totals || offset + limit >= totals.count}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isCsvMode && csvStatistics && (
        <ImportStatistics statistics={csvStatistics} />
      )}

      <div className="flex justify-between items-center py-4">
        <div className="flex items-center gap-4">
          {isCsvMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                CSV Import Mode
              </span>
              <Button variant="outline" size="sm" onClick={handleClearCsv}>
                Back to Normal View
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-end">Total data: {displayData?.length || 0}</p>
          {displayData && displayData.length > 0 && (
            <Button
              onClick={downloadCsv}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          )}
        </div>
      </div>
      <Table>
        <TableCaption>Rekap Rawat Jalan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal Perawatan</TableHead>
            <TableHead className="text-center">No RM</TableHead>
            <TableHead className="text-center">No Sep</TableHead>
            <TableHead className="text-center">No Rawat</TableHead>
            <TableHead>Nama Pasien</TableHead>
            <TableHead>Dokter</TableHead>
            <TableHead className="text-center">Poli</TableHead>
            <TableHead className="text-center">Permintaan Radiologi</TableHead>
            <TableHead className="text-center">Permintaan Lab</TableHead>
            <TableHead className="text-center">Konsul</TableHead>
            {isCsvMode && (
              <>
                <TableHead className="text-right">Total Tarif</TableHead>
                <TableHead className="text-right">Alokasi</TableHead>
                <TableHead className="text-right">DPJP Utama</TableHead>
                <TableHead className="text-right">Konsul</TableHead>
                <TableHead className="text-right">Laboratorium</TableHead>
                <TableHead className="text-right">Radiologi</TableHead>
                <TableHead className="text-right">Yang Terbagi</TableHead>
                <TableHead className="text-center">% Dari Klaim</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData?.map((rawatJalan, i) => (
            <TableRow
              key={rawatJalan.no_rawat}
              className={cn(i % 2 !== 0 && "bg-muted")}
            >
              <TableCell>
                {format(
                  new Date(rawatJalan.tgl_perawatan as string),
                  "dd MMM yyyy"
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleCopy(
                      rawatJalan.no_rekam_medis as string,
                      `rekam-medis-${rawatJalan.no_rekam_medis}`
                    );
                  }}
                >
                  {rawatJalan.no_rekam_medis}
                  {copiedItems.has(
                    `rekam-medis-${rawatJalan.no_rekam_medis}`
                  ) ? (
                    <Check size={8} className="ml-1 " />
                  ) : (
                    <Copy size={8} className="ml-1" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(rawatJalan.no_sep, `sep-${rawatJalan.no_sep}`)
                  }
                >
                  {rawatJalan.no_sep}
                  {copiedItems.has(`sep-${rawatJalan.no_sep}`) ? (
                    <Check size={8} className="ml-1 " />
                  ) : (
                    <Copy size={8} className="ml-1" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      rawatJalan.no_rawat,
                      `rawat-${rawatJalan.no_rawat}`
                    )
                  }
                >
                  {rawatJalan.no_rawat}
                  {copiedItems.has(`rawat-${rawatJalan.no_rawat}`) ? (
                    <Check size={8} className="ml-1 " />
                  ) : (
                    <Copy size={8} className="ml-1" />
                  )}
                </Button>
              </TableCell>
              <TableCell>{rawatJalan.nm_pasien}</TableCell>
              <TableCell>
                <p className="font-sm">{rawatJalan.nm_dokter}</p>
              </TableCell>
              <TableCell className="uppercase">{rawatJalan.nm_poli}</TableCell>
              <TableCell className="text-center">
                {rawatJalan.total_permintaan_radiologi > 0 ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <Button variant="ghost" size="sm">
                        {rawatJalan.total_permintaan_radiologi}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {Object.entries(
                        rawatJalan.jns_perawatan_radiologi
                          .filter((item) => item.noorder)
                          .reduce(
                            (acc: any, item: any) => {
                              if (!acc[item.noorder]) {
                                acc[item.noorder] = [];
                              }
                              acc[item.noorder].push(item);
                              return acc;
                            },
                            {} as { [key: string]: any[] }
                          )
                      ).map(([noorder, items]) => (
                        <div key={noorder} className="mb-2">
                          <p className="font-semibold">{noorder}</p>
                          {items.map((item: any) => (
                            <p key={item.kd_jenis_prw} className="ml-2 text-sm">
                              {item.nm_perawatan}
                            </p>
                          ))}
                        </div>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="ghost" size="sm">
                    {rawatJalan.total_permintaan_radiologi}
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.total_permintaan_lab}
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.konsul_count > 0 ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <Button variant="ghost" size="sm">
                        {rawatJalan.konsul_count}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <PerawatanList
                        perawatanList={rawatJalan.jns_perawatan || []}
                      />
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="ghost" size="sm">
                    {rawatJalan.konsul_count}
                  </Button>
                )}
              </TableCell>

              {isCsvMode && (
                <>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.tarif_from_csv > 0
                      ? formatCurrency(rawatJalan.tarif_from_csv)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.alokasi > 0
                      ? formatCurrency(rawatJalan.alokasi)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.dpjp_utama > 0
                      ? formatCurrency(rawatJalan.dpjp_utama)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.konsul > 0
                      ? formatCurrency(rawatJalan.konsul)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.laboratorium > 0
                      ? formatCurrency(rawatJalan.laboratorium)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.radiologi > 0
                      ? formatCurrency(rawatJalan.radiologi)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.yang_terbagi > 0
                      ? formatCurrency(rawatJalan.yang_terbagi)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rawatJalan.percent_dari_klaim !== undefined
                      ? `${rawatJalan.percent_dari_klaim}%`
                      : "-"}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          {isCsvMode && (
            <TableRow className="bg-emerald-100 dark:bg-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-600 font-semibold">
              <TableCell colSpan={7} className="text-center font-bold">
                TOTAL
              </TableCell>
              <TableCell className="text-center font-mono">
                {displayData?.reduce(
                  (sum, row) =>
                    sum + Number(row.total_permintaan_radiologi || 0),
                  0
                )}
              </TableCell>
              <TableCell className="text-center font-mono">
                {displayData?.reduce(
                  (sum, row) => sum + Number(row.total_permintaan_lab || 0),
                  0
                )}
              </TableCell>
              <TableCell className="text-center font-mono">
                {displayData?.reduce(
                  (sum, row) => sum + Number(row.konsul_count || 0),
                  0
                )}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(totals?.totalTarif || 0)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(totals?.totalAlokasi || 0)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(totals?.totalDpjpUtama || 0)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {totals?.totalKonsul > 0
                  ? formatCurrency(totals?.totalKonsul || 0)
                  : "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {totals?.totalLaboratorium > 0
                  ? formatCurrency(totals?.totalLaboratorium || 0)
                  : "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {totals?.totalRadiologi > 0
                  ? formatCurrency(totals?.totalRadiologi || 0)
                  : "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {totals?.totalYangTerbagi > 0
                  ? formatCurrency(totals?.totalYangTerbagi || 0)
                  : "-"}
              </TableCell>
              <TableCell className="text-center font-mono">
                {averagePercentDariKlaim}%
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showScrollButtons && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <Button
            onClick={scrollToTop}
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg"
            variant="outline"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg"
            variant="outline"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
