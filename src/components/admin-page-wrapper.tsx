import { Fragment } from "react";
import type { ReactNode } from "react";

import type { LinkProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export type BreadcrumbItem = {
  label: string;
  href: LinkProps["to"];
};

export function AdminPageWrapper({
  children,
  breadcrumbs,
  pageTitle,
  rightSideContent,
}: {
  children: ReactNode;
  pageTitle: string;
  breadcrumbs?: BreadcrumbItem[];
  rightSideContent?: ReactNode;
}) {
  return (
    <>
      <header className="bg-background supports-backdrop-filter:bg-background/85 sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 p-0 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] backdrop-blur dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)]">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" type="button" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs?.map((breadcrumb) => (
                <Fragment key={breadcrumb.href}>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator className="hidden md:block" />
                </Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="hidden items-center justify-center gap-2 md:flex">
          {rightSideContent}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
    </>
  );
}
