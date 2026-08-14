import iso from "iso-3166-2";

import { getRequestHeader } from "@tanstack/react-start/server";

import { openMaxmind } from "@/lib/maxmind";

const IP_HEADER_PRIORITY = [
  "cf-connecting-ip",
  "x-client-ip",
  "x-forwarded-for",
  "x-real-ip",
  "x-cluster-client-ip",
  "forwarded-for",
  "forwarded",
];

export function getIPAddress() {
  for (const header of IP_HEADER_PRIORITY) {
    const value = getRequestHeader(header);
    if (typeof value === "string") {
      const ip = value.split(",")[0].trim();
      if (ip) return ip;
    }
  }
  return null;
}

function getCountryName(code: string) {
  if (!code) return;
  return iso.country(code.toUpperCase())?.name;
}

function getRegionName(countryCode: string, regionCode?: string) {
  if (!countryCode || !regionCode) return;
  return iso.subdivision(`${countryCode.toUpperCase()}-${regionCode}`)?.name;
}

function extractLocationFromHeaders(
  prefix: string,
  countryKey = "country",
  cityKey = "city",
  regionKey = "region",
  regionIsCode = false,
) {
  const countryCode = getRequestHeader(
    `${prefix}-${countryKey}`,
  )?.toLowerCase();
  if (!countryCode) return null;
  const regionValue = getRequestHeader(`${prefix}-${regionKey}`);
  return {
    country: getCountryName(countryCode),
    city: getRequestHeader(`${prefix}-${cityKey}`),
    region: regionIsCode
      ? getRegionName(countryCode, regionValue)
      : regionValue,
  };
}

export async function getCurrentLocation() {
  let location = extractLocationFromHeaders(
    "cf",
    "ipcountry",
    "ipcity",
    "region-code",
    true,
  );
  if (location?.country && location.city && location.region) return location;

  const vercelLocation = extractLocationFromHeaders(
    "x-vercel-ip",
    "country",
    "city",
    "country-region",
    true,
  );
  location = {
    country: location?.country ?? vercelLocation?.country,
    city: location?.city ?? vercelLocation?.city,
    region: location?.region ?? vercelLocation?.region,
  };

  if (location.country && location.city && location.region) return location;

  const ip = getIPAddress();
  if (ip) {
    const geo = (await openMaxmind()).get(ip);
    if (geo) {
      location.country ??= geo.country?.names.en;
      location.city ??= geo.city?.names.en;
      location.region ??= geo.subdivisions?.[0]?.names.en;
    }
  }

  return location;
}
