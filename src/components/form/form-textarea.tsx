import type { ComponentProps } from "react";

import { Textarea } from "../ui/textarea";
import { useFieldContext } from "./hooks";
import { useFormFieldContext } from "./form-store";

export function FormTextarea(props: ComponentProps<typeof Textarea>) {
  const field = useFieldContext<string>();
  const { id, isInvalid } = useFormFieldContext();

  return (
    <Textarea
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
