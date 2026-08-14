import { createContext, use, useId } from "react";

import { useSelector } from "@tanstack/react-form";

import { useFieldContext } from "./hooks";

type FormItemContextValue = {
  id: string;
  isInvalid: boolean;
};

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

export function useFormFieldContext() {
  const data = use(FormItemContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!data) {
    throw new Error("useFieldContext must be used within a field.FormField");
  }

  return data;
}

export function FormItemContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const field = useFieldContext();
  const id = useId();

  const isBlurred = useSelector(field.store, (store) => store.meta.isBlurred);
  const isValid = useSelector(field.store, (store) => store.meta.isValid);
  const submissionAttempts = useSelector(
    field.form.store,
    (store) => store.submissionAttempts,
  );

  const isInvalid = (isBlurred || submissionAttempts > 0) && !isValid;

  return (
    <FormItemContext.Provider value={{ id, isInvalid }}>
      {children}
    </FormItemContext.Provider>
  );
}
