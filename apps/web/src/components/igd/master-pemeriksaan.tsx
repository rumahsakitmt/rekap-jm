import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withForm } from "@/hooks/form";
import { formOpts } from "./shared-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { useStore } from "@tanstack/react-form";

export const MasterPemeriksaan = withForm({
  ...formOpts,
  props: {
    type: "primer",
  },
  render: ({ form, type }) => {
    const { data } = useQuery({
      ...trpc.triase.getNamaPemeriksaan.queryOptions(),
    });

    const kodePemeriksaan = useStore(
      form.store,
      (state) => state.values.pemeriksaan
    );
    const kp = data
      ? kodePemeriksaan || data[0].kode_pemeriksaan
      : kodePemeriksaan;

    if (!data) {
      return <div>no data</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-secondary">
          <p className="text-center uppercase">Pemeriksaan</p>
          <div className="pl-4 p-2">
            <form.Field
              name="pemeriksaan"
              children={(field) => {
                return (
                  <RadioGroup
                    value={field.state.value || data[0].kode_pemeriksaan}
                    onValueChange={field.handleChange}
                  >
                    {data?.map((pem) => (
                      <Field
                        orientation="horizontal"
                        key={pem.kode_pemeriksaan}
                      >
                        <RadioGroupItem
                          value={pem.kode_pemeriksaan}
                          id={pem.kode_pemeriksaan}
                        />
                        <FieldLabel
                          htmlFor={pem.kode_pemeriksaan}
                          className="font-normal"
                        >
                          {pem.nama_pemeriksaan}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                );
              }}
            />
          </div>
        </div>
        <Tabs defaultValue={type === "primer" ? "skala1" : "skala3"}>
          <TabsList>
            {type === "primer" ? (
              <>
                <TabsTrigger value="skala1">Skala 1</TabsTrigger>
                <TabsTrigger value="skala2">Skala 2</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="skala3">Skala 3</TabsTrigger>
                <TabsTrigger value="skala4">Skala 4</TabsTrigger>
                <TabsTrigger value="skala5">Skala 5</TabsTrigger>
              </>
            )}
          </TabsList>
          {type === "primer" ? (
            <>
              <TabsContent value="skala1">
                {kp && (
                  <form.AppField
                    name="skala1"
                    children={(field) => (
                      <field.MasterPemeriksaanSkala
                        kodePemeriksaan={kp}
                        skala="getTriaseSkala1"
                      />
                    )}
                  />
                )}
              </TabsContent>
              <TabsContent value="skala2">
                {kp && (
                  <form.AppField
                    name="skala2"
                    children={(field) => (
                      <field.MasterPemeriksaanSkala
                        kodePemeriksaan={kp}
                        skala="getTriaseSkala2"
                      />
                    )}
                  />
                )}
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="skala3">
                {kp && (
                  <form.AppField
                    name="skala3"
                    children={(field) => (
                      <field.MasterPemeriksaanSkala
                        kodePemeriksaan={kp}
                        skala="getTriaseSkala3"
                      />
                    )}
                  />
                )}
              </TabsContent>
              <TabsContent value="skala4">
                {kp && (
                  <form.AppField
                    name="skala4"
                    children={(field) => (
                      <field.MasterPemeriksaanSkala
                        kodePemeriksaan={kp}
                        skala="getTriaseSkala4"
                      />
                    )}
                  />
                )}
              </TabsContent>
              <TabsContent value="skala5">
                {kp && (
                  <form.AppField
                    name="skala5"
                    children={(field) => (
                      <field.MasterPemeriksaanSkala
                        kodePemeriksaan={kp}
                        skala="getTriaseSkala5"
                      />
                    )}
                  />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    );
  },
});
