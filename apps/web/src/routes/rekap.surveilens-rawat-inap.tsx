import { DatePicker } from "@/components/date-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { zodValidator } from "@tanstack/zod-adapter";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import type { AppRouter } from "../../../server/src/routers";
import type { inferRouterOutputs } from "@trpc/server";

const today = new Date();
const defaultDateFrom = format(startOfMonth(today), "yyyy-MM-dd");
const defaultDateTo = format(endOfMonth(today), "yyyy-MM-dd");

const searchSchema = z.object({
  dateFrom: z.string().default(defaultDateFrom),
  dateTo: z.string().default(defaultDateTo),
});

export const Route = createFileRoute("/rekap/surveilens-rawat-inap")({
  head: () => ({
    meta: [{ title: "Surveilens Rawat Inap | SMART SIMRS" }],
  }),
  validateSearch: zodValidator(searchSchema),
  component: SurveilensRawatInapPage,
});

type SelectedDisease = {
  code: string;
  name: string;
  totalCases: number;
  uniquePatients: number;
};

const ageColumns = [
  { key: "age0To7Days", label: "0–7 hr" },
  { key: "age8To28Days", label: "8–28 hr" },
  { key: "ageUnder1Year", label: "<1 th" },
  { key: "age1To4", label: "1–4" },
  { key: "age5To9", label: "5–9" },
  { key: "age10To14", label: "10–14" },
  { key: "age15To19", label: "15–19" },
  { key: "age20To44", label: "20–44" },
  { key: "age45To54", label: "45–54" },
  { key: "age55To59", label: "55–59" },
  { key: "age60To69", label: "60–69" },
  { key: "age70Plus", label: "70+" },
] as const;

function SurveilensRawatInapPage() {
  const { dateFrom, dateTo } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedDisease, setSelectedDisease] =
    useState<SelectedDisease | null>(null);

  const summaryQuery = useQuery({
    ...trpc.surveilensRawatInap.summary.queryOptions({ dateFrom, dateTo }),
    placeholderData: keepPreviousData,
  });

  const detailQuery = useQuery({
    ...trpc.surveilensRawatInap.details.queryOptions({
      dateFrom,
      dateTo,
      diseaseCode: selectedDisease?.code ?? "",
    }),
    enabled: selectedDisease !== null,
  });

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("id");
    if (!normalizedKeyword) return summaryQuery.data ?? [];

    return (summaryQuery.data ?? []).filter(
      (row) =>
        row.diseaseCode.toLocaleLowerCase("id").includes(normalizedKeyword) ||
        row.diseaseName.toLocaleLowerCase("id").includes(normalizedKeyword),
    );
  }, [keyword, summaryQuery.data]);

  const totals = useMemo(
    () =>
      (summaryQuery.data ?? []).reduce(
        (result, row) => ({
          cases: result.cases + row.totalCases,
          patients: result.patients + row.uniquePatients,
          deaths: result.deaths + row.deaths,
        }),
        { cases: 0, patients: 0, deaths: 0 },
      ),
    [summaryQuery.data],
  );

  const setDate = (key: "dateFrom" | "dateTo", date?: Date) => {
    if (!date) return;
    navigate({
      search: (previous) => ({
        ...previous,
        [key]: format(date, "yyyy-MM-dd"),
      }),
    });
  };

  return (
    <main className="min-h-[calc(100vh-73px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-primary)/0.08,transparent_28%)] px-3 py-5 sm:px-5 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1800px] space-y-5">
        <section className="relative overflow-hidden border bg-card">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-8">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Activity className="size-4" />
                Epidemiologi rumah sakit
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Surveilens Rawat Inap
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Distribusi diagnosis utama pasien rawat inap berdasarkan usia,
                jenis kelamin, dan status kematian. Klik baris penyakit untuk
                melihat seluruh No. RM dan identitas pasiennya.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3.5" /> Tanggal mulai
                </span>
                <DatePicker
                  date={new Date(dateFrom)}
                  setDate={(date) => setDate("dateFrom", date)}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3.5" /> Tanggal selesai
                </span>
                <DatePicker
                  date={new Date(dateTo)}
                  setDate={(date) => setDate("dateTo", date)}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            icon={HeartPulse}
            label="Total kasus"
            value={totals.cases}
            helper="Diagnosis utama ranap"
          />
          <MetricCard
            icon={UsersRound}
            label="Pasien unik"
            value={totals.patients}
            helper="Dijumlahkan per penyakit"
          />
          <MetricCard
            icon={CircleAlert}
            label="Kasus meninggal"
            value={totals.deaths}
            helper="Tercatat di pasien mati"
            danger
          />
        </section>

        <section className="border bg-card">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Distribusi jenis penyakit</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {summaryQuery.data?.length ?? 0} diagnosis pada periode{" "}
                {format(new Date(dateFrom), "d MMM yyyy", { locale: id })}–
                {format(new Date(dateTo), "d MMM yyyy", { locale: id })}
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Cari kode atau nama penyakit…"
                className="pl-9"
              />
            </div>
          </div>

          {summaryQuery.isLoading ? (
            <TableLoading />
          ) : summaryQuery.isError ? (
            <div className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <CircleAlert className="mx-auto mb-3 size-8 text-destructive" />
                <p className="font-medium">Data surveilens tidak dapat dimuat</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summaryQuery.error.message}
                </p>
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <Stethoscope className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">Tidak ada diagnosis ditemukan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ubah periode atau kata kunci pencarian.
                </p>
              </div>
            </div>
          ) : (
            <SurveilensTable
              rows={filteredRows}
              onSelect={(row) =>
                setSelectedDisease({
                  code: row.diseaseCode,
                  name: row.diseaseName,
                  totalCases: row.totalCases,
                  uniquePatients: row.uniquePatients,
                })
              }
            />
          )}
        </section>
      </div>

      <PatientDetailSheet
        disease={selectedDisease}
        open={selectedDisease !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDisease(null);
        }}
        rows={detailQuery.data ?? []}
        isLoading={detailQuery.isLoading}
      />
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  danger = false,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  helper: string;
  danger?: boolean;
}) {
  return (
    <Card className="rounded-none py-4 shadow-none">
      <CardContent className="flex items-center gap-4 px-4">
        <div
          className={
            danger
              ? "grid size-11 shrink-0 place-items-center bg-destructive/10 text-destructive"
              : "grid size-11 shrink-0 place-items-center bg-primary/10 text-primary"
          }
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {value.toLocaleString("id-ID")}
          </p>
          <p className="truncate text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type RouterOutput = inferRouterOutputs<AppRouter>;
type SummaryRow = RouterOutput["surveilensRawatInap"]["summary"][number];

function SurveilensTable({
  rows,
  onSelect,
}: {
  rows: SummaryRow[];
  onSelect: (row: SummaryRow) => void;
}) {
  const totals = rows.reduce(
    (result, row) => ({
      male: result.male + row.male,
      female: result.female + row.female,
      demographic: result.demographic + row.demographicTotal,
      cases: result.cases + row.totalCases,
      deaths: result.deaths + row.deaths,
    }),
    { male: 0, female: 0, demographic: 0, cases: 0, deaths: 0 },
  );

  return (
    <Table className="min-w-[1720px] text-xs">
      <TableHeader className="bg-muted/45">
        <TableRow>
          <TableHead rowSpan={2} className="w-12 text-center">
            No
          </TableHead>
          <TableHead
            rowSpan={2}
            className="sticky left-0 z-20 min-w-28 border-x bg-muted"
          >
            Kode ICD
          </TableHead>
          <TableHead
            rowSpan={2}
            className="sticky left-28 z-20 min-w-72 border-r bg-muted"
          >
            Jenis penyakit
          </TableHead>
          <TableHead colSpan={12} className="border-r text-center">
            Kelompok usia
          </TableHead>
          <TableHead colSpan={3} className="border-r text-center">
            Jenis kelamin
          </TableHead>
          <TableHead rowSpan={2} className="text-center">
            Kasus
          </TableHead>
          <TableHead rowSpan={2} className="text-center">
            Meninggal
          </TableHead>
          <TableHead rowSpan={2} className="w-10" />
        </TableRow>
        <TableRow>
          {ageColumns.map((column) => (
            <TableHead key={column.key} className="px-2 text-center">
              {column.label}
            </TableHead>
          ))}
          <TableHead className="text-center">L</TableHead>
          <TableHead className="text-center">P</TableHead>
          <TableHead className="border-r text-center">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow
            key={row.diseaseCode}
            tabIndex={0}
            role="button"
            aria-label={"Lihat " + row.totalCases + " pasien untuk " + row.diseaseName}
            className="group cursor-pointer focus-visible:bg-primary/10 focus-visible:outline-none"
            onClick={() => onSelect(row)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onSelect(row);
            }}
          >
            <TableCell className="text-center text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="sticky left-0 z-10 border-x bg-card font-mono font-semibold text-primary group-hover:bg-muted">
              {row.diseaseCode}
            </TableCell>
            <TableCell className="sticky left-28 z-10 max-w-72 truncate border-r bg-card font-medium group-hover:bg-muted">
              {row.diseaseName}
            </TableCell>
            {ageColumns.map((column) => (
              <NumericCell key={column.key} value={row[column.key]} />
            ))}
            <NumericCell value={row.male} />
            <NumericCell value={row.female} />
            <NumericCell value={row.demographicTotal} border />
            <TableCell className="text-center">
              <Badge className="min-w-8 justify-center rounded-none font-mono">
                {row.totalCases}
              </Badge>
            </TableCell>
            <NumericCell value={row.deaths} danger={row.deaths > 0} />
            <TableCell>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell />
          <TableCell className="sticky left-0 z-10 border-x bg-muted" />
          <TableCell className="sticky left-28 z-10 border-r bg-muted font-semibold">
            TOTAL HASIL
          </TableCell>
          <TableCell colSpan={12} />
          <NumericCell value={totals.male} />
          <NumericCell value={totals.female} />
          <NumericCell value={totals.demographic} border />
          <NumericCell value={totals.cases} />
          <NumericCell value={totals.deaths} danger={totals.deaths > 0} />
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function NumericCell({
  value,
  border = false,
  danger = false,
}: {
  value: number;
  border?: boolean;
  danger?: boolean;
}) {
  return (
    <TableCell
      className={cn(
        "text-center font-mono tabular-nums",
        border && "border-r",
        danger && "font-semibold text-destructive",
      )}
    >
      {value}
    </TableCell>
  );
}

type DetailRow = RouterOutput["surveilensRawatInap"]["details"][number];

function PatientDetailSheet({
  disease,
  open,
  onOpenChange,
  rows,
  isLoading,
}: {
  disease: SelectedDisease | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: DetailRow[];
  isLoading: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b bg-muted/35 px-5 py-5 sm:px-7">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="rounded-none font-mono text-primary">
              {disease?.code}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {disease?.totalCases ?? 0} kasus · {disease?.uniquePatients ?? 0}{" "}
              pasien unik
            </span>
          </div>
          <SheetTitle className="pr-8 text-xl leading-snug">
            {disease?.name}
          </SheetTitle>
          <SheetDescription>
            Daftar lengkap No. RM dan informasi pasien untuk diagnosis ini.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-7">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-36 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="grid h-full min-h-64 place-items-center text-center">
              <p className="text-sm text-muted-foreground">
                Tidak ada detail pasien pada periode ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((patient, index) => (
                <article
                  key={patient.visitNumber + "-" + patient.medicalRecordNumber}
                  className="border bg-card transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-3 border-b bg-muted/20 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center bg-primary/10 font-mono text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {patient.patientName ?? "Nama tidak tersedia"}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          No. RM {patient.medicalRecordNumber}
                        </p>
                      </div>
                    </div>
                    {patient.isDeceased ? (
                      <Badge variant="destructive" className="rounded-none">
                        Meninggal
                      </Badge>
                    ) : null}
                  </div>
                  <div className="grid gap-x-6 gap-y-3 px-4 py-4 text-sm sm:grid-cols-2">
                    <PatientInfo
                      icon={Stethoscope}
                      label="No. rawat"
                      value={patient.visitNumber}
                      mono
                    />
                    <PatientInfo
                      icon={CalendarDays}
                      label="Tanggal registrasi"
                      value={
                        patient.registrationDate
                          ? format(
                              new Date(patient.registrationDate),
                              "d MMMM yyyy",
                              { locale: id },
                            )
                          : "—"
                      }
                    />
                    <PatientInfo
                      icon={UserRound}
                      label="Jenis kelamin · umur"
                      value={
                        (patient.gender === "L"
                          ? "Laki-laki"
                          : patient.gender === "P"
                            ? "Perempuan"
                            : "—") +
                        " · " +
                        (patient.registeredAge ?? "—") +
                        " " +
                        formatAgeUnit(patient.ageUnit)
                      }
                    />
                    <PatientInfo
                      icon={CalendarDays}
                      label="Tanggal lahir"
                      value={
                        patient.birthDate
                          ? format(new Date(patient.birthDate), "d MMMM yyyy", {
                              locale: id,
                            })
                          : "—"
                      }
                    />
                    <PatientInfo
                      icon={MapPin}
                      label="Alamat"
                      value={patient.address || "—"}
                      wide
                    />
                    <PatientInfo
                      icon={Phone}
                      label="No. telepon"
                      value={patient.phone || "—"}
                      wide
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PatientInfo({
  icon: Icon,
  label,
  value,
  mono = false,
  wide = false,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-2.5", wide && "sm:col-span-2")}>
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-0.5 leading-5", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}

function formatAgeUnit(unit: string | null) {
  if (unit === "Hr") return "hari";
  if (unit === "Bl") return "bulan";
  if (unit === "Th") return "tahun";
  return unit ?? "";
}

function TableLoading() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-16 w-full" />
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
