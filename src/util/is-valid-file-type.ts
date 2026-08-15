import mime from "mime-types";

import type { AcceptEntry } from "@/types/file-upload";

export function isValidFileType(fileType: string, accept: AcceptEntry[]) {
  if (!fileType || !accept) return false;

  const acceptParts = accept.map((part) => part.trim());
  for (const part of acceptParts) {
    if (part.startsWith(".")) {
      const mimeType = mime.lookup(part);
      if (mimeType && fileType === mimeType) {
        return true;
      }
    } else if (part.endsWith("/*")) {
      const [type] = fileType.split("/");
      const [acceptType] = part.split("/");
      if (type === acceptType) {
        return true;
      }
    } else {
      if (fileType === part) {
        return true;
      }
    }
  }
  return false;
}
