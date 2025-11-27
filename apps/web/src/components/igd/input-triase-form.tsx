import { useAppForm } from "@/hooks/form";
import { formOpts } from "./shared-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoForm } from "@/components/igd/info-form";
import TriasePrimerForm from "@/components/igd/triase-primer-form";
import TriaseSekunderForm from "@/components/igd/triase-sekunder-form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "../ui/button";
import { Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Route } from "@/routes/igd.triase.$norawat";

export const InputTriaseForm = () => {
  const { norawat } = Route.useParams();
  const { type } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data } = useQuery({
    ...trpc.igd.getUserRegistration.queryOptions({
      norawat,
    }),
    enabled: !!norawat,
  });

  const form = useAppForm({
    ...formOpts,
    defaultValues: {
      ...formOpts.defaultValues,
      norawat: norawat || "",
      norm: data?.no_rkm_medis || "",
      nama: data?.nm_pasien || "",
      tanggalKunjugan: data?.tgl_registrasi ? new Date(data?.tgl_registrasi) : new Date(),
      tanggalTriase: data?.tgl_registrasi ? new Date(data?.tgl_registrasi) : new Date()
    }
  });

  const handleTriaseTab = (type: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        type: type || "primer",
        skala: type === "primer" ? "skala1" : "skala3"
      })
    })
  }


  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <form.AppField
                name="norawat"
                children={(field) => <field.TextField label="No Rawat" />}
              />
              <form.AppField
                name="norm"
                children={(field) => <field.TextField label="No RM" />}
              />
              <form.AppField
                name="nama"
                children={(field) => <field.TextField label="Nama" />}
              />
              <form.AppField
                name="transportasi"
                children={(field) => (
                  <field.SelectField
                    label="Transportasi"
                    data={["-", "agd", "sendiri", "swasta"]}
                  />
                )}
              />
            </div>
            <InfoForm form={form} />
            <Tabs value={type || "primer"} onValueChange={handleTriaseTab}>
              <TabsList>
                <TabsTrigger value="primer">Triase Primer</TabsTrigger>
                <TabsTrigger value="skunder">Triase Skunder</TabsTrigger>
              </TabsList>
              <TabsContent value="primer">
                <TriasePrimerForm form={form} />
              </TabsContent>
              <TabsContent value="skunder">
                <TriaseSekunderForm form={form} />
              </TabsContent>
            </Tabs>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                <Save className="mr-2" />
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </form.AppForm>
  );
};
