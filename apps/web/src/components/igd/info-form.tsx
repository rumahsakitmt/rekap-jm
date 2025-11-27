import { MacamKasusSelect } from "./macam-kasus-select";
import { formOpts } from "./shared-form";
import { withForm } from "@/hooks/form";

export const InfoForm = withForm({
  ...formOpts,
  render: ({ form }) => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <form.AppField
            name="tanggalKunjugan"
            children={(field) => (
              <field.DatePickerField label="Tanggal Kunjungan" />
            )}
          />
          <div className="grid grid-cols-2 gap-2">
            <form.AppField
              name="caraMasuk"
              children={(field) => (
                <field.SelectField
                  label="Cara Masuk"
                  placeholder="Cara masuk"
                  data={["jalan", "brankar", "kursi roda", "digendong"]}
                />
              )}
            />
            <form.AppField
              name="alasanKedatangan"
              children={(field) => (
                <field.SelectField
                  label="Alasan Kedatangan"
                  placeholder="Alasan Kedatangan"
                  data={[
                    "-",
                    "datang sendiri",
                    "polisi",
                    "rujukan",
                    "bidan",
                    "puskesmas",
                    "rumah sakit",
                    "poliklinik",
                    "faskes lain",
                  ]}
                />
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <form.Field
            name="macamKasus"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <MacamKasusSelect
                  isInvalid={isInvalid}
                  errors={field.state.meta.errors}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              );
            }}
          />
          <form.AppField
            name="keterangan"
            children={(field) => <field.TextField label="Keterangan" />}
          />
        </div>
      </>
    );
  },
});
