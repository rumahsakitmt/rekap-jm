import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { InputTriaseForm } from "@/components/igd/input-triase-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/igd/triase/$norawat/form")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  return (
    <div className="p-4 pt-8 space-y-4 pb-64 max-w-3xl mx-auto">
      <div>
        <Button
          onClick={() => router.history.back()}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="mr-2 size-4" />
          Kembali
        </Button>
      </div>
      <section className="border p-4 pt-8 relative">
        <div className="absolute -top-4 left-2 px-2 py-1 border bg-background">
          <h3 className="text-sm">::[ Data triase IGD]::</h3>
        </div>
        <InputTriaseForm />
      </section>
    </div>
  );
}
