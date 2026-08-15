import { type ReactNode, createContext, useContext, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      setConfirmState(options);
      setResolver(() => resolve);
    });
  }

  function handleClose(result: boolean) {
    setConfirmState(null);
    if (resolver) {
      resolver(result);
      setResolver(null);
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState && (
        <AlertDialog open={!!confirmState}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmState.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleClose(false)}>
                {confirmState.cancelLabel || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleClose(true)}>
                {confirmState.confirmLabel || "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
