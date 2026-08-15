import type { ComponentProps } from "react";

import { SelectTrigger } from "../ui/select";
import { useFieldContext } from "./hooks";
import { useFormFieldContext } from "./form-store";

export function FormSelectTrigger(props: ComponentProps<typeof SelectTrigger>) {
  const field = useFieldContext<string>();
  const { id, isInvalid } = useFormFieldContext();

  return (
    <SelectTrigger
      id={id}
      name={field.name}
      aria-invalid={isInvalid}
      {...props}
    />
  );
}
