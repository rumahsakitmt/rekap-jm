import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldSelectProps {
  isInvalid: boolean;
  label: string;
  placeholder: string;
  data: string[];
  value: string;
  errors: undefined[];
  onChange: (value: string) => void;
}

export function FieldSelect({
  label,
  placeholder,
  data,
  value,
  isInvalid,
  onChange,
  errors,
}: FieldSelectProps) {
  return (
    <div className="w-full max-w-md">
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {data.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isInvalid && <FieldError errors={errors} />}
      </Field>
    </div>
  );
}
