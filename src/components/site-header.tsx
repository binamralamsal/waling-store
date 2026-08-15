import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { TopUtilityNav } from "./top-utility-nav";
import { HeaderSearch } from "./header-search";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";
import { UserAvatarMenu } from "#/components/user-avatar-menu";

import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";

import { cn } from "#/lib/utils";
import { site } from "#/config/site";
import { currentUserOptions } from "#/features/auth/auth.queries";
import { Logo } from "#/features/products/components/logo";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { data, isPending } = useQuery(currentUserOptions());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full",
        scrolled &&
          "animate-headerSticky supports-backdrop-filter:bg-background/85 sticky top-0 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.05)] backdrop-blur",
      )}
    >
      <TopUtilityNav />

      <div className="container flex items-center gap-4 py-4">
        <Link to="/" className="text-md shrink-0 font-bold lg:text-2xl">
          <Logo className="w-25" />
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <HeaderSearch />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <CartSheet />

          <div className="hidden md:block">
            {isPending ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : data?.user ? (
              <UserAvatarMenu user={data.user} />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  render={<Link to="/login">Login</Link>}
                  nativeButton={false}
                />
                <Button
                  render={<Link to="/signup">Sign Up</Link>}
                  nativeButton={false}
                />
              </div>
            )}
          </div>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
