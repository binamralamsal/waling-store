import { EyeIcon, EyeOffIcon } from "lucide-react";

import type { ComponentProps } from "react";
import { useState } from "react";

import { useFieldContext } from "./hooks";
import { useFormFieldContext } from "./form-store";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

export function FormPasswordInput(
  props: Omit<ComponentProps<typeof InputGroupInput>, "type">,
) {
  const [isVisible, setIsVisible] = useState(false);
  const { id, isInvalid } = useFormFieldContext();
  const field = useFieldContext<string>();

  return (
    <InputGroup>
      <InputGroupInput
        type={isVisible ? "text" : "password"}
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />

      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={isVisible ? "Hide Password" : "Show Password"}
          title={isVisible ? "Hide Password" : "Show Password"}
          size="icon-xs"
          onClick={() => setIsVisible((prev) => !prev)}
          type="button"
        >
          {!isVisible ? <EyeIcon /> : <EyeOffIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
