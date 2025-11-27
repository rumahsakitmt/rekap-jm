import { useAppForm } from "@/hooks/form";
import { formOpts } from "./shared-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoForm } from "@/components/igd/info-form";
import TriasePrimerForm from "@/components/igd/triase-primer-form";
import TriaseSekunderForm from "@/components/igd/triase-sekunder-form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "../ui/button";
import { Save } from "lucide-react";

export const InputTriaseForm = () => {
  const form = useAppForm(formOpts);
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
            <Tabs defaultValue="primer">
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
