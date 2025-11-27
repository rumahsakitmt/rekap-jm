import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputTriaseForm } from "@/components/igd/input-triase-form";
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-adapter";


export const Route = createFileRoute("/igd/triase/$norawat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4 pt-8 space-y-4 pb-64 max-w-3xl mx-auto">
      <section className="border p-4 pt-8 relative">
        <div className="absolute -top-4 left-2 px-2 py-1 border bg-background">
          <h3 className="text-sm">::[ Data triase IGD]::</h3>
        </div>
        <InputTriaseForm />
      </section>
    </div>
  );
}
