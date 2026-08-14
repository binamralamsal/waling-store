import { useStore } from "@tanstack/react-form";
import { useBlocker } from "@tanstack/react-router";

import { Button } from "./ui/button";
import { useFormContext } from "./form/hooks";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (isPrimitive(a) || isPrimitive(b)) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a) as (keyof T)[];
    const keysB = Object.keys(b) as (keyof T)[];

    if (keysA.length !== keysB.length) return false;

    return keysA.every(
      (key) => keysB.includes(key) && deepEqual(a[key], b[key]),
    );
  }

  return false;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(
  value: unknown,
): value is string | number | boolean | null | undefined {
  return (
    value === null || (typeof value !== "object" && typeof value !== "function")
  );
}

export function FormNavigationBlocker() {
  const form = useFormContext();

  const values = useStore(form.store, (state) => state.values);
  const isSubmitSuccessful = useStore(
    form.store,
    (state) => state.isSubmitSuccessful,
  );

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => {
      return true;
    },
    disabled:
      isSubmitSuccessful || deepEqual(values, form.options.defaultValues),
    withResolver: true,
  });

  if (isSubmitSuccessful && proceed) {
    proceed();
    return null;
  }

  return (
    <AlertDialog open={status === "blocked"} onOpenChange={reset}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
          <AlertDialogDescription>
            Leaving this page will discard your changes. Are you sure you want
            to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={reset} variant="outline">
            No
          </Button>
          <Button onClick={proceed}>Yes</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
