import { createFileRoute } from "@tanstack/react-router";
import { trpcClient } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { Copy, Check } from "lucide-react";
import { useFilterStore, useUIState } from "@/stores/filter-store";

export const Route = createFileRoute("/bridging")({
  component: RouteComponent,
});

function RouteComponent() {
  // Use filter store
  const {
    search,
    limit,
    dateFrom,
    dateTo,
    setSearch,
    setLimit,
    setDateFrom,
    setDateTo,
  } = useFilterStore();

  const { copiedItems, addCopiedItem, removeCopiedItem } = useUIState();

  const {
    data: bridgingSepData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bridgingSep", { search, limit, dateFrom, dateTo }],
    queryFn: () =>
      trpcClient.bridgingSep.getBridgingSep.query({
        search: search || undefined,
        limit,
        dateFrom,
        dateTo,
      }),
  });

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addCopiedItem(itemId);
      setTimeout(() => {
        removeCopiedItem(itemId);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy");
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy HH:mm");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bridging SEP Data</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by SEP, No Rawat, or No RM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={limit?.toString()}
              onValueChange={(value) =>
                setLimit(value === "all" ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date From</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePicker date={dateFrom} setDate={setDateFrom} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date To</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePicker date={dateTo} setDate={setDateTo} />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Bridging SEP Data ({bridgingSepData?.length || 0} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableCaption>
                Bridging SEP data with patient and treatment information
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>No SEP</TableHead>
                  <TableHead>No Rawat</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date SEP</TableHead>
                  <TableHead>PPK Pelayanan</TableHead>
                  <TableHead>Poli Tujuan</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Kelas Rawat</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bridgingSepData?.map((row) => (
                  <TableRow key={row.no_sep}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        {row.no_sep}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(row.no_sep, `sep-${row.no_sep}`)
                          }
                        >
                          {copiedItems.has(`sep-${row.no_sep}`) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        {row.no_rawat}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              row.no_rawat || "",
                              `rawat-${row.no_rawat}`
                            )
                          }
                        >
                          {copiedItems.has(`rawat-${row.no_rawat}`) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.nama_pasien}</div>
                        <div className="text-sm text-muted-foreground">
                          {row.nomr} |{" "}
                          {row.jkel === "L" ? "Laki-laki" : "Perempuan"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(row.tanggal_lahir)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(row.tglsep)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.nmppkpelayanan}</div>
                        <div className="text-sm text-muted-foreground">
                          {row.kdppkpelayanan}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.nmpolitujuan}</div>
                        <div className="text-sm text-muted-foreground">
                          {row.kdpolitujuan}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.nmdiagnosaawal}</div>
                        <div className="text-sm text-muted-foreground">
                          {row.diagawal}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Kelas {row.klsrawat}</div>
                        {row.klsnaik && (
                          <div className="text-sm text-muted-foreground">
                            Naik ke {row.klsnaik}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
