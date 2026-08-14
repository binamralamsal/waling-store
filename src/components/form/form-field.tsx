import type { ComponentProps } from "react";

import { Field } from "../ui/field";
import { FormItemContextProvider, useFormFieldContext } from "./form-store";

export function FormField(props: ComponentProps<typeof Field>) {
  return (
    <FormItemContextProvider>
      <CustomField {...props} />
    </FormItemContextProvider>
  );
}

function CustomField(props: ComponentProps<typeof Field>) {
  const { isInvalid } = useFormFieldContext();

  return (
    <FormItemContextProvider>
      <Field data-invalid={isInvalid} {...props} />
    </FormItemContextProvider>
  );
}
