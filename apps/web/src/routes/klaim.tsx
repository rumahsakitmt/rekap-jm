import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Eye, EyeOff, ShieldAlert, Flower } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";

const klaimSearchSchema = z.object({
  coder_nik: z.string().optional(),
});

export const Route = createFileRoute("/klaim")({
  validateSearch: klaimSearchSchema,
  component: RouteComponent,
});

const CODER_NIK_KEY = "coder_nik";

function useCoderNik() {
  const search = Route.useSearch();

  if (search.coder_nik) {
    sessionStorage.setItem(CODER_NIK_KEY, search.coder_nik);
    return search.coder_nik;
  }

  return sessionStorage.getItem(CODER_NIK_KEY);
}

function maskNik(nik: string | null): string {
  if (!nik || nik.length <= 6) return nik || "-";
  return `${nik.slice(0, 3)}***${nik.slice(-3)}`;
}

function CoderNikGuard({ children }: { children: React.ReactNode }) {
  const coderNik = useCoderNik();
  const hasCoderNik = !!coderNik;

  const { data, isLoading } = useQuery(
    trpc.klaim.validasiCoderNik.queryOptions(
      { coder_nik: coderNik || "" },
      { enabled: hasCoderNik },
    ),
  );

  const isValid = data?.valid;
  const shouldBlock = !hasCoderNik || (!isLoading && !isValid);

  if (shouldBlock) {
    return (
      <div className="flex min-h-svh items-center justify-center relative bg-background">
        <div
          className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background" />
        <Card className="relative z-10 w-full max-w-md border-destructive/50 shadow-xl">
          <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="flex items-center gap-2">
              <Flower className="text-primary size-6" />
              <span className="text-lg font-bold tracking-tight">SMART SIMRS</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-destructive/10 p-4">
                <ShieldAlert className="size-10 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Akses Ditolak</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {!hasCoderNik
                  ? "Silakan login dari SIMRS terlebih dahulu untuk mengakses halaman ini."
                  : "NIK Coder tidak terdaftar. Silakan login dari SIMRS terlebih dahulu."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function handleLogout() {
  sessionStorage.removeItem(CODER_NIK_KEY);
  window.history.replaceState({}, "", window.location.pathname);
  window.location.reload();
}

function RouteComponent() {
  const router = useRouter();
  const path = router.state.location.pathname;
  const isRanap = path.includes("/ranap");
  const isRalan = path.includes("/ralan");
  const coderNik = useCoderNik();
  const [showNik, setShowNik] = useState(false);

  return (
    <CoderNikGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-max">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb className="uppercase">
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/simrs/klaim/ranap">
                      SMART SIMRS
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Proses Klaim</BreadcrumbPage>
                  </BreadcrumbItem>
                  {(isRanap || isRalan) && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {isRanap ? "Rawat Inap" : "Rawat Jalan"}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 px-4">
              <button
                onClick={() => setShowNik((prev) => !prev)}
                className="flex items-center gap-1.5 cursor-pointer"
                title={showNik ? "Sembunyikan NIK" : "Tampilkan NIK"}
              >
                <Badge variant="outline" className="font-mono text-xs">
                  {showNik ? coderNik || "-" : maskNik(coderNik)}
                </Badge>
                {showNik ? (
                  <EyeOff className="size-3.5 text-muted-foreground" />
                ) : (
                  <Eye className="size-3.5 text-muted-foreground" />
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Keluar"
              >
                <LogOut className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </header>
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CoderNikGuard>
  );
}
