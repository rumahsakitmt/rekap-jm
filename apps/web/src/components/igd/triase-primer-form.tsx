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

const TriasePrimerForm = withForm({
  ...formOpts,
  render: ({ form }) => {
    return (
      <>
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <form.AppField
              name="keluhanUtama"
              children={(field) => (
                <field.TextareaField label="Keluhan Utama" />
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <form.AppField
                name="suhu"
                children={(field) => <field.TextField label="Suhu" />}
              />
              <form.AppField
                name="nyeri"
                children={(field) => <field.TextField label="Nyeri" />}
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
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <form.AppField
              name="saturasi"
              children={(field) => <field.TextField label="Saturasi" />}
            />
            <form.AppField
              name="respirasi"
              children={(field) => <field.TextField label="Respirasi" />}
            />
            <form.AppField
              name="kebutuhanKhusus"
              children={(field) => (
                <field.SelectField
                  label="Kebutuhan Khusus"
                  data={["-", "UPPA", "Airborne", "Dekontaminan"]}
                />
              )}
            />
          </div>
          <MasterPemeriksaan form={form} type="primer" />
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
                        <RadioGroupItem
                          value="Ruang Resusitasi"
                          id="ruang-resustansi"
                        />
                        <FieldLabel
                          htmlFor="ruang-resustansi"
                          className="font-normal"
                        >
                          Ruang Resustansi
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem
                          value="Ruang Kritis"
                          id="ruang-kritis"
                        />
                        <FieldLabel
                          htmlFor="ruang-kritis"
                          className="font-normal"
                        >
                          Ruang Kritis
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

export default TriasePrimerForm;
