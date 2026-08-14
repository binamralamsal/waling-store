import type { ComponentProps } from "react";

import { Checkbox } from "../ui/checkbox";
import { useFieldContext } from "./hooks";
import { useFormFieldContext } from "./form-store";

export function FormCheckbox(props: ComponentProps<typeof Checkbox>) {
  const field = useFieldContext<boolean>();
  const { id, isInvalid } = useFormFieldContext();

  return (
    <Checkbox
      id={id}
      name={field.name}
      value={field.state.value.toString()}
      onCheckedChange={(value) => field.handleChange(value ? true : false)}
      aria-invalid={isInvalid}
      {...props}
    />
  );
}
