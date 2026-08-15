import {
  BoxesIcon,
  ChevronRightIcon,
  Contact2Icon,
  FilePlus2Icon,
  HomeIcon,
  IdCardIcon,
  LayoutDashboardIcon,
  ListOrderedIcon,
  NewspaperIcon,
  PackageIcon,
  PackagePlusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { Suspense } from "react";
import type { ReactElement } from "react";

import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";

// import { VisionWishdomLogo } from "./logo";
import { AdminNavUser } from "./admin-nav-user";
import { AdminSearchCommandMenu } from "./admin-search-command-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export interface SidebarMenuItem {
  title: string;
  url: LinkProps["to"] | (string & {});
  isActive?: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: (Omit<SidebarMenuItem, "icon"> & {
    icon?: SidebarMenuItem["icon"];
  })[];
  exact?: boolean;
}

export interface SidebarGroupItem {
  label: string;
  action?: ReactElement;
  items: SidebarMenuItem[];
}

export const sidebarItems: SidebarGroupItem[] = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Home",
        url: "/admin",
        icon: HomeIcon,
      },
      {
        title: "Contact Entries",
        url: "/admin/contact-entries",
        icon: Contact2Icon,
      },
    ],
  },
  {
    label: "User Management",
    action: <Link to="/admin/users/new">+</Link>,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
        icon: UsersIcon,
      },
      { title: "Add New User", url: "/admin/users/new", icon: UserPlusIcon },
    ],
  },
  {
    label: "Products Management",
    items: [
      {
        title: "Product Categories",
        url: "/admin/product-categories",
        icon: BoxesIcon,
        exact: false,
        items: [
          {
            title: "All Categories",
            url: "/admin/product-categories",
            icon: BoxesIcon,
          },
          {
            title: "Add New Category",
            url: "/admin/product-categories/new",
            icon: PackagePlusIcon,
          },
        ],
      },
      {
        title: "Products",
        url: "/admin/products",
        icon: PackageIcon,
        exact: false,
        items: [
          { title: "All Products", url: "/admin/products", icon: PackageIcon },
          {
            title: "Add New Product",
            url: "/admin/products/new",
            icon: PackagePlusIcon,
          },
        ],
      },
      {
        title: "Orders",
        url: "/admin/orders",
        icon: ListOrderedIcon,
      },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        title: "Blog Categories",
        url: "/admin/blog-categories",
        icon: BoxesIcon,
        exact: false,
        items: [
          {
            title: "All Categories",
            url: "/admin/blog-categories",
            icon: BoxesIcon,
          },
          {
            title: "Add New Category",
            url: "/admin/blog-categories/new",
            icon: PackagePlusIcon,
          },
        ],
      },
      {
        title: "Blogs",
        url: "/admin/blogs",
        icon: NewspaperIcon,
        exact: false,
        items: [
          { title: "All Blogs", url: "/admin/blogs", icon: NewspaperIcon },
          {
            title: "Add New Blog",
            url: "/admin/blogs/new",
            icon: FilePlus2Icon,
          },
        ],
      },
    ],
  },
];

export function AdminSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/admin">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <LayoutDashboardIcon className="size" />
                    {/* <VisionWishdomLogo
                      className="size-4"
                      mono
                      monoFillClass="fill-white"
                    />*/}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Waling Store</span>
                    <span className="">v1.0.0</span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
        <AdminSearchCommandMenu />
      </SidebarHeader>
      <SidebarContent>
        {sidebarItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            {group.action ? <SidebarGroupAction render={group.action} /> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <Collapsible
                    key={item.title}
                    defaultOpen={item.isActive}
                    render={
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip={item.title}
                          render={
                            <Link
                              to={item.url}
                              activeProps={{ "data-active": true }}
                              activeOptions={{
                                exact: item.exact ?? true,
                                includeSearch: false,
                              }}
                            >
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          }
                        />
                        {item.items?.length ? (
                          <>
                            <CollapsibleTrigger
                              render={
                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                  <ChevronRightIcon />
                                  <span className="sr-only">Toggle</span>
                                </SidebarMenuAction>
                              }
                            />
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.items.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      render={
                                        <Link
                                          to={subItem.url}
                                          activeProps={{ "data-active": true }}
                                          activeOptions={{
                                            exact: subItem.exact ?? true,
                                            includeSearch: false,
                                          }}
                                        >
                                          <span>{subItem.title}</span>
                                        </Link>
                                      }
                                    />
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </>
                        ) : null}
                      </SidebarMenuItem>
                    }
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<div>Loading</div>}>
          <AdminNavUser />
        </Suspense>
      </SidebarFooter>
      <SidebarFooter />
    </Sidebar>
  );
}
