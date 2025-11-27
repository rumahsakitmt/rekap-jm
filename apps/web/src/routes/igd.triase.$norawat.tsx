import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputTriaseForm } from "@/components/igd/input-triase-form";

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
        <Tabs defaultValue="input">
          <TabsList>
            <TabsTrigger value="input">Input Triase</TabsTrigger>
            <TabsTrigger value="data">Data Triase</TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <InputTriaseForm />
          </TabsContent>
          <TabsContent value="data">Change your password here.</TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
