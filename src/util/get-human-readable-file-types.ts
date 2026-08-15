import type { AcceptEntry } from "@/types/file-upload";
import {
  ARCHIVE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  MIME_TO_EXTENSION,
  VIDEO_EXTENSIONS,
} from "@/config/constants";

function isImageExt(ext: string): boolean {
  // @ts-expect-error -- both are string so it doesn't matter
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase());
}

function isVideoExt(ext: string): boolean {
  // @ts-expect-error -- both are string so it doesn't matter
  return VIDEO_EXTENSIONS.includes(ext.toLowerCase());
}

function isAudioExt(ext: string): boolean {
  // @ts-expect-error -- both are string so it doesn't matter
  return AUDIO_EXTENSIONS.includes(ext.toLowerCase());
}

function isDocExt(ext: string): boolean {
  // @ts-expect-error -- both are string so it doesn't matter
  return DOCUMENT_EXTENSIONS.includes(ext.toLowerCase());
}

function isArchiveExt(ext: string): boolean {
  // @ts-expect-error -- both are string so it doesn't matter
  return ARCHIVE_EXTENSIONS.includes(ext.toLowerCase());
}

function formatExtensions(exts: Set<string>, type: string): string {
  if (exts.size === 0) return "";
  const sortedExts = [...exts].sort();
  if (sortedExts.length === 1) return `${type} of ${sortedExts[0]}`;
  if (sortedExts.length === 2)
    return `${type}s of ${sortedExts[0]} and ${sortedExts[1]}`;
  return `${type}s of ${sortedExts.slice(0, -1).join(", ")}, and ${sortedExts[sortedExts.length - 1]}`;
}

export function getHumanReadableFileTypes(accepts: AcceptEntry[]): string[] {
  const hasImageWildcard = accepts.some(
    (accept) => accept.toLowerCase() === "image/*",
  );
  const hasVideoWildcard = accepts.some(
    (accept) => accept.toLowerCase() === "video/*",
  );
  const hasAudioWildcard = accepts.some(
    (accept) => accept.toLowerCase() === "audio/*",
  );

  const types = new Set<string>();
  const imageExts = new Set<string>();
  const videoExts = new Set<string>();
  const audioExts = new Set<string>();
  const docExts = new Set<string>();
  const archiveExts = new Set<string>();
  const unknownExts = new Set<string>();

  if (hasImageWildcard) types.add("images");
  if (hasVideoWildcard) types.add("videos");
  if (hasAudioWildcard) types.add("audios");

  for (const accept of accepts) {
    const acceptLower = accept.toLowerCase();

    if (
      hasImageWildcard &&
      (isImageExt(acceptLower) || acceptLower.startsWith("image/"))
    )
      continue;
    if (
      hasVideoWildcard &&
      (isVideoExt(acceptLower) || acceptLower.startsWith("video/"))
    )
      continue;
    if (
      hasAudioWildcard &&
      (isAudioExt(acceptLower) || acceptLower.startsWith("audio/"))
    )
      continue;

    if (acceptLower in MIME_TO_EXTENSION) {
      const ext = MIME_TO_EXTENSION[acceptLower];
      if (isDocExt(ext)) {
        docExts.add(ext);
      } else if (isArchiveExt(ext)) {
        archiveExts.add(ext);
      } else if (!hasImageWildcard && isImageExt(ext)) {
        imageExts.add(ext);
      } else if (!hasVideoWildcard && isVideoExt(ext)) {
        videoExts.add(ext);
      } else if (!hasAudioWildcard && isAudioExt(ext)) {
        audioExts.add(ext);
      }
    }

    if (accept.startsWith(".")) {
      if (!hasImageWildcard && isImageExt(accept)) {
        imageExts.add(accept);
      } else if (!hasVideoWildcard && isVideoExt(accept)) {
        videoExts.add(accept);
      } else if (!hasAudioWildcard && isAudioExt(accept)) {
        audioExts.add(accept);
      } else if (isDocExt(accept)) {
        docExts.add(accept);
      } else if (isArchiveExt(accept)) {
        archiveExts.add(accept);
      } else {
        unknownExts.add(accept);
      }
    }
  }

  const result: string[] = [...types];

  if (!hasImageWildcard && imageExts.size > 0) {
    result.push(formatExtensions(imageExts, "image"));
  }
  if (!hasVideoWildcard && videoExts.size > 0) {
    result.push(formatExtensions(videoExts, "video"));
  }
  if (!hasAudioWildcard && audioExts.size > 0) {
    result.push(formatExtensions(audioExts, "audio"));
  }
  if (docExts.size > 0) {
    result.push(formatExtensions(docExts, "document"));
  }
  if (archiveExts.size > 0) {
    result.push(formatExtensions(archiveExts, "archive"));
  }
  if (unknownExts.size > 0) {
    result.push(formatExtensions(unknownExts, "file"));
  }

  return result;
}
