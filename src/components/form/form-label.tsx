import type { ComponentProps } from "react";

import { FieldLabel } from "../ui/field";
import { useFormFieldContext } from "./form-store";

export function FormLabel(props: ComponentProps<typeof FieldLabel>) {
  const { id } = useFormFieldContext();

  return <FieldLabel htmlFor={id} {...props} />;
}
