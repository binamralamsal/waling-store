import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

import { navLinks, site } from "#/config/site";

export function TopUtilityNav() {
  return (
    <div className="bg-muted/40 hidden border-b md:block">
      <div className="container flex h-9 items-center justify-between text-xs">
        <div className="text-muted-foreground flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {site.addressLocality}, {site.streetAddress}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            {site.telephone}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {navLinks.map((navLink) => (
            <Link
              key={navLink.label}
              to={navLink.href}
              activeOptions={{ exact: navLink.href === "/" }}
              activeProps={{ className: "text-primary font-medium" }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {navLink.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
