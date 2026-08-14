import {
  ChevronsUpDown,
  CircleUserIcon,
  ComputerIcon,
  LogOut,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAnimatedThemeSwitcher } from "@/hooks/use-animated-theme-switcher";
import { currentUserOptions } from "#/features/auth/auth.queries";
import { useServerFn } from "@tanstack/react-start";
import { logoutUserFn } from "#/features/auth/server/functions/user";

export function AdminNavUser() {
  const { isMobile } = useSidebar();

  const navigate = useNavigate();

  const logoutUserMutation = useMutation({
    mutationFn: useServerFn(logoutUserFn),
    onSettled: () => {
      navigate({ to: "/login", search: { redirect_url: "/admin" } });
    },
  });

  const { changeTheme, theme } = useAnimatedThemeSwitcher();

  const { data } = useSuspenseQuery(currentUserOptions());
  if (!data) {
    navigate({ to: "/" });
    return null;
  }

  const { user } = data;

  const userIntiail = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={""} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {userIntiail}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={""} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {userIntiail}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <PaletteIcon className="size-4 shrink-0" /> Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={theme === "dark"}
                      onCheckedChange={() => changeTheme("dark")}
                    >
                      <MoonIcon /> Dark
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={theme === "light"}
                      onCheckedChange={() => changeTheme("light")}
                    >
                      <SunIcon /> Light
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={theme === "system"}
                      onCheckedChange={() => changeTheme("system")}
                    >
                      <ComputerIcon /> System
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={
                  <Link
                    to="/admin/users/$id"
                    params={{ id: user.id.toString() }}
                  >
                    <CircleUserIcon />
                    Account
                  </Link>
                }
              />
              <DropdownMenuItem
                onClick={() => logoutUserMutation.mutateAsync()}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
