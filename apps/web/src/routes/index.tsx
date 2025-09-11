import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/calendar";
import { UploadCSVSheet } from "@/components/upload-csv-sheet";
import { ImportStatistics } from "@/components/import-statistics";
import { ChevronUp, ChevronDown } from "lucide-react";
import { DataTable, createColumns } from "@/components/rawat-jalan";

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
      <Card className="sticky top-0 z-10">
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
          Pagination Controls
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
        </div>
      </div>
      <DataTable
        columns={createColumns(copiedItems, handleCopy, isCsvMode)}
        data={displayData || []}
        isCsvMode={isCsvMode}
        totals={totals}
      />

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
