import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { MobileNav } from "./mobile-nav";
import { DesktopNav } from "./desktop-nav";

import { cn } from "#/lib/utils";
import { site } from "#/config/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        return setScrolled(true);
      }

      return setScrolled(false);
    };

    document.addEventListener("scroll", handleScroll);

    return () => document.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full py-6",
        scrolled &&
          "animate-headerSticky supports-backdrop-filter:bg-background/85 sticky top-0 z-50 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] backdrop-blur",
      )}
    >
      <div className="container flex items-center justify-between">
        <Link
          to="/"
          className="text-md flex items-center gap-2 font-bold lg:text-2xl"
        >
          {/* <VisionWishdomLogo className="size-8" /> */}
          <span>{site.name}</span>
        </Link>

        <DesktopNav />
        <MobileNav />
      </div>
    </header>
  );
}
