import { IdCardIcon, LogOut, Menu, Settings, User } from "lucide-react";

import { useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { navLinks, site } from "@/config/site";
import { currentUserOptions } from "#/features/auth/auth.queries";
import { useServerFn } from "@tanstack/react-start";
import { logoutUserFn } from "#/features/auth/server/functions/user";
// import { noRetryForUnauthorized } from "@/util/no-retry-for-unauthorized";

export function MobileNav() {
  const [isSheetOpened, setIsSheetOpened] = useState(false);
  const { data, isPending } = useQuery(currentUserOptions());

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutUserMutation = useMutation({
    mutationFn: useServerFn(logoutUserFn),
    onSettled: async () => {
      await queryClient.invalidateQueries(currentUserOptions());
      navigate({ to: "/login" });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Drawer open={isSheetOpened} onOpenChange={setIsSheetOpened}>
      <DrawerTrigger
        render={
          <Button className="md:hidden" variant="outline" size="icon">
            <Menu />
          </Button>
        }
      />
      <DrawerContent className="gap-0">
        <DrawerHeader>
          <div>
            <DrawerTitle>{site.name}</DrawerTitle>
            <DrawerDescription>{site.description}</DrawerDescription>
          </div>
          {!isPending && data?.user && (
            <div className="bg-muted/50 mt-3 flex items-center gap-3 rounded-lg p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(data.user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm leading-none font-medium">
                  {data.user.name}
                </p>
                <p className="text-muted-foreground mt-1 truncate text-xs leading-none">
                  {data.user.email}
                </p>
              </div>
            </div>
          )}
        </DrawerHeader>
        <Separator />
        <div className="px-4 py-4">
          {isPending ? (
            <div className="mb-4 space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : !data?.user ? (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  render={
                    <Link to="/login" onClick={() => setIsSheetOpened(false)}>
                      Login
                    </Link>
                  }
                />
                <Button
                  render={
                    <Link to="/signup" onClick={() => setIsSheetOpened(false)}>
                      Sign Up
                    </Link>
                  }
                />
              </div>
              <Separator className="mt-4" />
            </div>
          ) : null}
          <ul className="flex flex-col gap-1">
            {navLinks.map((navLink) => (
              <li key={navLink.label}>
                <Link
                  to={navLink.href}
                  className="hover:bg-muted block rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setIsSheetOpened(false)}
                  activeOptions={{ exact: navLink.href === "/" }}
                  activeProps={{
                    className: "text-primary font-medium bg-muted",
                  }}
                >
                  {navLink.label}
                </Link>
              </li>
            ))}
            {data?.user && (
              <>
                <Separator className="my-2" />
                {/* <li>
                  <Link
                    to="/account"
                    className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={() => setIsSheetOpened(false)}
                    activeProps={{
                      className: "text-primary font-medium bg-muted",
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/apply"
                    className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={() => setIsSheetOpened(false)}
                    activeProps={{
                      className: "text-primary font-medium bg-muted",
                    }}
                  >
                    <IdCardIcon className="h-4 w-4" />
                    <span>Apply for Jobs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={() => setIsSheetOpened(false)}
                    activeProps={{
                      className: "text-primary font-medium bg-muted",
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </li> */}
                <li>
                  <button
                    className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={() => {
                      logoutUserMutation.mutateAsync({});
                      setIsSheetOpened(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
