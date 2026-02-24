import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { withForm } from "@/hooks/form";
import { formOpts } from "./shared-form";

export const MacamKasusSelect = withForm({
  ...formOpts,
  render: function MacamKasusSelectRender({ form }) {
    const { data: macamKasus } = useQuery(
      trpc.triase.getMacamKasus.queryOptions()
    );

    if (!macamKasus) {
      return (
        <Select>
          <SelectTrigger>
            <Loader className="animate-spin" />
          </SelectTrigger>
        </Select>
      );
    }

    return (
      <form.Field
        name="macamKasus"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>Macam Kasus</FieldLabel>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Macam Kasus" />
                </SelectTrigger>
                <SelectContent>
                  {macamKasus.map((mk) => (
                    <SelectItem value={mk.kode_kasus} key={mk.kode_kasus}>
                      {mk.kode_kasus} {mk.macam_kasus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>

          )
        }}
      />
    );

  }
})
