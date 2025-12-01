import { createFileRoute, Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputTriaseForm } from "@/components/igd/input-triase-form";
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-adapter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";


export const Route = createFileRoute("/igd/triase/$norawat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4 pt-8 space-y-4 pb-64 max-w-3xl mx-auto">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/igd/triase">
            <ChevronLeft className="mr-2 size-4" />
            Kembali
          </Link>
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
