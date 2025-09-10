import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/calendar";
import { PerawatanList } from "@/components/perawatan-list";
import { Copy, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState<number | undefined>(50);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() =>
    startOfMonth(new Date())
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(() =>
    endOfMonth(new Date())
  );
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

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
    trpc.rawatJalan.getRawatJalan.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
  );

  return (
    <div className="container mx-auto px-4 py-2">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
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
                setDateFrom(startOfMonth(new Date()));
                setDateTo(endOfMonth(new Date()));
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-end py-4">Total data: {rawatJalan.data?.length}</p>
      <Table>
        <TableCaption>Rekap Rawat Jalan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal Perawatan</TableHead>
            <TableHead>No RM</TableHead>
            <TableHead>No Rawat / No Sep</TableHead>
            <TableHead>Nama Pasien</TableHead>
            <TableHead>Dokter</TableHead>
            <TableHead className="text-center">Permintaan Radiologi</TableHead>
            <TableHead className="text-center">Permintaan Lab</TableHead>
            <TableHead className="text-center">Konsul</TableHead>
            <TableHead>Konsul Dokter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rawatJalan.data?.map((rawatJalan, i) => (
            <TableRow
              key={rawatJalan.no_rawat}
              className={cn(i % 2 !== 0 && "bg-muted")}
            >
              <TableCell>
                {format(
                  new Date(rawatJalan.tgl_perawatan as string),
                  "dd/MM/yyyy"
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
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
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
                  <Separator />
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
                </div>
              </TableCell>
              <TableCell>{rawatJalan.nm_pasien}</TableCell>
              <TableCell>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {rawatJalan.kd_dokter}
                  </p>
                  <p className="font-sm">{rawatJalan.nm_dokter}</p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.total_permintaan_radiologi}
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.total_permintaan_lab}
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.konsul_count}
              </TableCell>
              <TableCell>
                <PerawatanList perawatanList={rawatJalan.jns_perawatan || []} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
