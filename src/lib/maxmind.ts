import path from "node:path";
import type { CityResponse } from "maxmind";
import maxmind from "maxmind";

export const openMaxmind = () =>
  maxmind.open<CityResponse>(
    path.join(process.cwd(), ".maxmind", "GeoLite2-City.mmdb"),
  );
