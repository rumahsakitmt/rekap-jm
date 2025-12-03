import { formOpts } from "./shared-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { MasterPemeriksaan } from "./master-pemeriksaan";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { PetugasCombobox } from "./petugas-combobox";
import { withForm } from "@/hooks/form";

const TriaseSekunderForm = withForm({
  ...formOpts,
  render: ({ form }) => {
    return (
      <>
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="col-span-2">
              <form.AppField
                name="keluhanUtama"
                children={(field) => (
                  <field.TextareaField label="Amnesa Singkat" />
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <form.AppField
                name="suhu"
                children={(field) => <field.TextField label="Suhu" />}
              />
              <form.AppField
                name="nyeri"
                children={(field) => <field.TextField label="Nyeri" />}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <form.AppField
              name="saturasi"
              children={(field) => <field.TextField label="Saturasi" />}
            />
            <form.AppField
              name="respirasi"
              children={(field) => <field.TextField label="Respirasi" />}
            />
            <form.AppField
              name="tensi"
              children={(field) => <field.TextField label="Tensi" />}
            />
            <form.AppField
              name="nadi"
              children={(field) => <field.TextField label="Nadi" />}
            />
          </div>
          <MasterPemeriksaan form={form} type="sekunder" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <form.AppField
              name="catatan"
              children={(field) => <field.TextareaField label="Catatan" />}
            />
            <form.Field
              name="keputusan"
              children={(field) => {
                return (
                  <FieldSet>
                    <FieldLabel>Plan/Keputusan</FieldLabel>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      className="grid-cols-2"
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem value="Zona Kuning" id="Zona Kuning" />
                        <FieldLabel
                          htmlFor="Zona Kuning"
                          className="font-normal"
                        >
                          Zona Kuning
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value="Zona Hijau" id="Zona Hijau" />
                        <FieldLabel
                          htmlFor="Zona Hijau"
                          className="font-normal"
                        >
                          Zona Hijau
                        </FieldLabel>
                      </Field>
                    </RadioGroup>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldSet>
                );
              }}
            />
            <form.AppField
              name="tanggalTriase"
              children={(field) => (
                <field.DatePickerField label="Tanggal Triase" />
              )}
            />

            <PetugasCombobox form={form} />
          </div>
        </FieldGroup>
      </>
    );
  },
});

export default TriaseSekunderForm;
