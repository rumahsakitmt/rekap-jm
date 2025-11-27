import { DatePickerField } from "@/components/igd/forms/date-picker-field";
import { MasterPemeriksaanSkala } from "@/components/igd/forms/master-pemeriksaan-skala";
import { SelectField } from "@/components/igd/forms/select-field";
import { TextField } from "@/components/igd/forms/text-field";
import { TextareaField } from "@/components/igd/forms/textarea-field";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export { useFieldContext, useFormContext };

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    DatePickerField,
    MasterPemeriksaanSkala,
  },
  formComponents: {},
});

export type AppFormInstance = ReturnType<typeof useAppForm>;
