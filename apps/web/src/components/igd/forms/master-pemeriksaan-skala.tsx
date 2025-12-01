import { Route } from "@/routes/igd.triase.$norawat.form";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useFieldContext } from "@/hooks/form";
import { useEffect } from "react";

interface Props {
  kodePemeriksaan: string;
  skala:
    | "getTriaseSkala1"
    | "getTriaseSkala2"
    | "getTriaseSkala3"
    | "getTriaseSkala4"
    | "getTriaseSkala5";
}
export const MasterPemeriksaanSkala = ({ kodePemeriksaan, skala }: Props) => {
  const field = useFieldContext<string[]>();
  const { norawat } = Route.useParams();
  const { data } = useQuery({
    ...trpc.triase[skala].queryOptions({
      kode_pemeriksaan: kodePemeriksaan,
      no_rawat: norawat,
    }),
    enabled: Boolean(kodePemeriksaan),
  });

  useEffect(() => {
    if (data) {
      const validKodeSkala = new Set(data.map((s) => s.kode_skala));
      const seen = new Set<string>();
      const filteredValue = field.state.value.filter((val) => {
        if (!validKodeSkala.has(val) || seen.has(val)) {
          return false;
        }
        seen.add(val);
        return true;
      });
      if (filteredValue.length !== field.state.value.length) {
        field.setValue(filteredValue);
      }
    }
  }, [data, field]);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <>
      {data?.map((s) => (
        <Field
          data-invalid={isInvalid}
          orientation="horizontal"
          key={s.kode_skala}
        >
          <Checkbox
            value={field.state.value.find((v) => s.kode_skala === v)}
            id={s.pengkajian as string}
            onCheckedChange={(checked) => {
              if (checked) {
                if (!field.state.value.includes(s.kode_skala)) {
                  field.pushValue(s.kode_skala);
                }
              } else {
                const id = field.state.value.findIndex(
                  (val) => s.kode_skala === val
                );
                if (id != -1) {
                  field.removeValue(id);
                }
              }
            }}
          />
          <FieldLabel htmlFor={s.pengkajian as string} className="font-normal">
            {s.kode_skala}-{s.pengkajian}
          </FieldLabel>

          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      ))}
    </>
  );
};
