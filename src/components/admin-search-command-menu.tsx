import { useTheme } from "next-themes";
import {
  Circle,
  CircleUserIcon,
  Laptop,
  LogOutIcon,
  Moon,
  SearchIcon,
  Sun,
} from "lucide-react";

import * as React from "react";

import { useNavigate } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { useSidebar } from "./ui/sidebar";
import { sidebarItems } from "./admin-sidebar";
import type { SidebarMenuItem } from "./admin-sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { cn } from "#/lib/utils";
import { currentUserOptions } from "#/features/auth/auth.queries";
import { useServerFn } from "@tanstack/react-start";
import { logoutUserFn } from "#/features/auth/server/functions/user";

export function AdminSearchCommandMenu({ ...props }: any) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const sidebar = useSidebar();
  const isCollapsed = sidebar.state === "collapsed";

  const logoutUserMutation = useMutation({
    mutationFn: useServerFn(logoutUserFn),
    onSettled: () => navigate({ to: "/" }),
  });

  const { data } = useSuspenseQuery(currentUserOptions());
  if (!data) {
    navigate({ to: "/" });
    return null;
  }

  const { user } = data;

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const renderNestedItems = (item: SidebarMenuItem) => {
    const results = [];

    if (item.items && item.items.length > 0) {
      results.push(
        ...item.items.map((subItem) => (
          <CommandItem
            key={subItem.url}
            onSelect={() => runCommand(() => navigate({ to: subItem.url }))}
          >
            {subItem.icon ? (
              <subItem.icon className="mr-2 h-4 w-4" />
            ) : (
              <Circle className="mr-2 h-4 w-4" />
            )}
            {subItem.title}
          </CommandItem>
        )),
      );
    }

    return results;
  };

  return (
    <>
      <button
        className={cn(
          "bg-accent text-accent-foreground border-border hover:bg-muted hover:border-ring relative flex w-full cursor-pointer items-center rounded-md border px-3 py-2 text-left text-sm transition-colors duration-200 dark:shadow",
          isCollapsed && "justify-center px-2",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <SearchIcon className="text-muted-foreground h-4 w-4" />
        {!isCollapsed && (
          <>
            <span className="ml-2">Search...</span>
            <span className="border-border text-muted-foreground absolute top-1/2 right-3 hidden -translate-y-1/2 items-center rounded border px-1.5 py-0.5 font-mono text-xs select-none sm:flex">
              ⌘K
            </span>
          </>
        )}
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Render each sidebar group as a separate command group */}
          {sidebarItems.map((group) => (
            <React.Fragment key={group.label}>
              <CommandGroup heading={group.label}>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  // For parent items without children
                  if (!item.items || item.items.length === 0) {
                    return (
                      <CommandItem
                        key={item.url}
                        onSelect={() =>
                          runCommand(() => navigate({ to: item.url }))
                        }
                      >
                        {<Icon className="mr-2 h-4 w-4" />}
                        {item.title}
                      </CommandItem>
                    );
                  }

                  // For parent items with children, render the children directly
                  return renderNestedItems(item);
                })}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}

          <CommandGroup heading="Account Management">
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigate({
                    to: "/admin/users/$id",
                    params: { id: user.id.toString() },
                  }),
                )
              }
            >
              <CircleUserIcon className="mr-2 h-4 w-4" />
              Account
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => logoutUserMutation.mutateAsync({}))
              }
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              Light {theme === "light" && "(Active)"}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark {theme === "dark" && "(Active)"}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              System {theme === "system" && "(Active)"}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
