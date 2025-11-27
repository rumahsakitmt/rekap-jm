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

interface Props {
  value: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
  errors: undefined[];
}

export const MacamKasusSelect = ({
  value,
  onChange,
  isInvalid,
  errors,
}: Props) => {
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
    <div>
      <Field data-invalid={isInvalid}>
        <FieldLabel>Macam Kasus</FieldLabel>
        <Select value={value} onValueChange={onChange}>
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
        {isInvalid && <FieldError errors={errors} />}
      </Field>
    </div>
  );
};
