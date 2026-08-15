import { z } from "zod";

export function coerceToNumberSchema<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return undefined;
      }

      const number = Number(trimmed);

      if (!Number.isNaN(number)) {
        return number;
      }
    }

    return value;
  }, schema);
}
