import { Route } from "@/routes/igd.triase.$norawat";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useFieldContext } from "@/hooks/form";

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
                field.pushValue(s.kode_skala);
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
            {s.pengkajian}
          </FieldLabel>

          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      ))}
    </>
  );
};
