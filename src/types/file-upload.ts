import type {
  ARCHIVE_EXTENSIONS,
  ARCHIVE_MIME_TO_EXTENSION,
  AUDIO_EXTENSIONS,
  AUDIO_MIME_TO_EXTENSION,
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MIME_TO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TO_EXTENSIONS,
  VIDEO_EXTENSIONS,
  VIDEO_MIME_TO_EXTENSION,
} from "@/config/constants";

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}
export type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];
export type DocumentExtension = (typeof DOCUMENT_EXTENSIONS)[number];
export type MediaExtension =
  (typeof VIDEO_EXTENSIONS)[number] | (typeof AUDIO_EXTENSIONS)[number];
export type ArchiveExtension = (typeof ARCHIVE_EXTENSIONS)[number];
export type FileExtension =
  ImageExtension | DocumentExtension | MediaExtension | ArchiveExtension;

export type ImageMimeType = keyof typeof IMAGE_MIME_TO_EXTENSIONS;
export type DocumentMimeType = keyof typeof DOCUMENT_MIME_TO_EXTENSIONS;
export type MediaMimeType =
  keyof typeof AUDIO_MIME_TO_EXTENSION | keyof typeof VIDEO_MIME_TO_EXTENSION;
export type ArchiveMimeType = keyof typeof ARCHIVE_MIME_TO_EXTENSION;

export type MimeType =
  ImageMimeType | DocumentMimeType | MediaMimeType | ArchiveMimeType;

export type WildcardMimeType = "image/*" | "audio/*" | "video/*";

export type AcceptEntry =
  FileExtension | MimeType | WildcardMimeType | (string & {});
