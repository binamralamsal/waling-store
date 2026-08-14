import type { ComponentProps } from "react";

import { Input } from "../ui/input";
import { useFieldContext } from "./hooks";
import { useFormFieldContext } from "./form-store";

export function FormInput(props: ComponentProps<typeof Input>) {
  const field = useFieldContext<string>();
  const { id, isInvalid } = useFormFieldContext();

  return (
    <Input
      id={id}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={isInvalid}
      {...props}
    />
  );
}
