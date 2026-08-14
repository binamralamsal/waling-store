import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { Button } from "../ui/button";
import { FormError } from "./form-error";
import { FormField } from "./form-field";
import { FormInput } from "./form-input";
import { FormLabel } from "./form-label";
import { FormCheckbox } from "./form-checkbox";
import { FormTextarea } from "./form-textarea";
import { FormPasswordInput } from "./form-password-input";
import { Field, FieldDescription, FieldGroup } from "../ui/field";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    FormField,
    FormLabel,
    FormDescription: FieldDescription,
    FormError,
    FormInput,
    FormPasswordInput,
    FormTextarea,
    FormCheckbox,
  },
  formComponents: {
    FormGroup: FieldGroup,
    FormField: Field,
    FormDescription: FieldDescription,
    FormButton: Button,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext, withForm };
