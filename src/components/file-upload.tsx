import { z } from "zod";
import axios from "axios";
import {
  AudioWaveform,
  DownloadIcon,
  EyeIcon,
  File,
  FileImageIcon,
  FileVideoIcon,
  FolderArchive,
  UploadCloud,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

import { createContext, useContext, useState } from "react";
import type { ChangeEvent, ComponentProps, DragEvent, ReactNode } from "react";

import { Progress } from "./ui/progress";
import { useConfirm } from "./confirm-alert";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { AcceptEntry } from "#/types/file-upload";
import { isValidFileType } from "@/util/is-valid-file-type";
import { getHumanReadableFileTypes } from "#/util/get-human-readable-file-types";
import { cn } from "#/lib/utils";
import { toast } from "./ui/toast";

type UploadingFile = {
  file: File;
  progress: number;
  preview?: string;
  cancelToken?: AbortController;
};

export type UploadedFile = {
  id: number;
  name: string;
  url: string;
  fileType: string;
};

type FileUploadProps = {
  multiple?: boolean;
  maxFilesCount?: number;
  initialFiles?: UploadedFile[];
  maxFileSize?: FileSize;
  accept?: AcceptEntry[];
  onChange?: (files: UploadedFile[]) => void;
  children: ReactNode;
};

type FileSize = `${number}${"mb" | "gb"}`;

const uploadFileSuccessResponseSchema = z.object({
  message: z.string(),
  details: z.object({
    url: z.string(),
    name: z.string(),
    fileType: z.string(),
    id: z.number(),
  }),
});

type FileUploaderContextType = {
  uploadingFiles: UploadingFile[];
  uploadedFiles: UploadedFile[];
  addFiles: (files: File[]) => void;
  cancelUpload: (file: File) => void;
  maxFilesCount?: number;
  deleteFile: (url: string) => void;
  maxFileSize?: FileSize;
  isUploadAllowed: boolean;
  accept?: AcceptEntry[];
  multiple: boolean;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUploader = () => {
  const context = useContext(FileUploaderContext);
  if (!context) {
    throw new Error("useFileUploader must be used within a FileUploader");
  }
  return context;
};

export function FileUploader(props: FileUploadProps) {
  const {
    multiple = true,
    initialFiles = [],
    maxFilesCount,
    maxFileSize,
    accept,
    onChange,
    children,
  } = props;

  // const handleChange = useCallbackRef(onChange);
  const handleChange = onChange;

  if (!multiple && maxFilesCount !== undefined) {
    throw new Error("maxFilesCount cannot be set when multiple is false");
  }

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFile[]>(initialFiles);
  const confirm = useConfirm();

  // useEffect(() => {
  //   if (handleChange) {
  //     handleChange(uploadedFiles);
  //   }
  // }, [uploadedFiles]);

  const hasFiles = uploadingFiles.length > 0 || uploadedFiles.length > 0;

  const humanReadableFileTypes = accept
    ? getHumanReadableFileTypes(accept)
    : [];

  const wildcardTypes = ["images", "videos", "audios"];

  const fileTypesBeVerb =
    humanReadableFileTypes.length === 1
      ? wildcardTypes.includes(humanReadableFileTypes[0])
        ? "are"
        : "is"
      : "is";

  function addFiles(newFiles: File[]) {
    const fileObjects: UploadingFile[] = newFiles.map((file) => ({
      file,
      progress: 0,
      preview: file.type.includes(FileTypes.Image)
        ? URL.createObjectURL(file)
        : undefined,
    }));
    uploadFiles(fileObjects);
  }

  async function uploadFiles(fileObjects: UploadingFile[]) {
    if (!multiple && (fileObjects.length > 1 || hasFiles)) {
      return toast.add({
        type: "error",
        description: "You can't upload more than one file",
      });
    }

    if (
      multiple &&
      maxFilesCount &&
      fileObjects.length + uploadedFiles.length + uploadingFiles.length >
        maxFilesCount
    ) {
      return toast.add({
        type: "error",
        description: `You can't upload more than ${maxFilesCount} files`,
      });
    }

    if (maxFileSize) {
      const filteredFileObjects = fileObjects.filter(
        ({ file }) => file.size <= convertToBytes(maxFileSize),
      );
      if (filteredFileObjects.length === 0)
        return toast.add({
          type: "error",
          description: `You can't upload files more than ${formatFileSize(maxFileSize)}`,
        });
      else if (filteredFileObjects.length !== fileObjects.length) {
        const omittedFilesCount =
          fileObjects.length - filteredFileObjects.length;
        fileObjects = filteredFileObjects;
        toast.add({
          type: "error",
          description: `${omittedFilesCount} file${omittedFilesCount === 1 ? "" : "s"} have been omitted because they were found to have more than ${formatFileSize(maxFileSize)}`,
        });
      }
    }

    if (accept) {
      const filteredFileObjects = fileObjects.filter(({ file }) =>
        isValidFileType(file.type, accept),
      );
      if (filteredFileObjects.length === 0)
        return toast.add({
          type: "error",
          description: `Only ${humanReadableFileTypes.join("; ")} ${fileTypesBeVerb} allowed!`,
        });
      else if (filteredFileObjects.length !== fileObjects.length) {
        const omittedFilesCount =
          fileObjects.length - filteredFileObjects.length;
        fileObjects = filteredFileObjects;
        toast.add({
          type: "error",
          description: `${omittedFilesCount} file${omittedFilesCount === 1 ? "" : "s"} have been omitted because they were found to be of different type other than ${humanReadableFileTypes.join("; ")}`,
        });
      }
    }

    setUploadingFiles((prev) => [...prev, ...fileObjects]);
    const uploadPromises = fileObjects.map(async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const cancelToken = new AbortController();

      setUploadingFiles((prev) =>
        prev.map((f) => (f.file === file ? { ...f, cancelToken } : f)),
      );

      return axios
        .post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (event.lengthComputable) {
              const percent = (event.progress || 0.5) * 100;
              setUploadingFiles((prevFiles) =>
                prevFiles.map((f) =>
                  f.file === file ? { ...f, progress: percent } : f,
                ),
              );
            }
          },
          signal: cancelToken.signal,
        })
        .then((response) => {
          const { data, error } = uploadFileSuccessResponseSchema.safeParse(
            response.data,
          );
          if (error) throw new Error();

          setUploadedFiles((prev) => {
            const newFiles = [
              ...prev,
              {
                id: data.details.id,
                name: data.details.name,
                url: data.details.url,
                fileType: data.details.fileType,
              },
            ];

            if (handleChange) handleChange(newFiles);
            return newFiles;
          });
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            throw new UploadCancelledError();
          }

          let errorMessage = "Unknown error occured!";

          if (axios.isAxiosError(err)) {
            errorMessage = err.response?.data?.message || err.message;
          }

          toast.add({ type: "error", description: errorMessage });
          throw new Error(errorMessage);
        })
        .finally(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
        });
    });

    let successResponses = 0;
    let errorResponses = 0;
    let cancelledResponses = 0;

    const responses = await Promise.allSettled(uploadPromises);
    responses.forEach((response) => {
      if (response.status === "fulfilled") {
        return successResponses++;
      } else {
        if (response.reason instanceof UploadCancelledError)
          return cancelledResponses++;
        return errorResponses++;
      }
    });

    if (successResponses === 0) return;
    else if (successResponses + cancelledResponses === responses.length)
      toast.add({
        type: "success",
        description: `All ${successResponses} ${successResponses === 1 ? "file" : "files"} uploaded successfully.`,
      });
    else
      toast.add({
        type: "error",
        description: `${successResponses} ${successResponses === 1 ? "file" : "files"} uploaded successfully. ${errorResponses} ${errorResponses === 1 ? "file" : "files"} failed to upload.`,
      });
  }

  function cancelUpload(file: File) {
    const fileToCancel = uploadingFiles.find((f) => f.file === file);
    if (!fileToCancel) return;

    fileToCancel.cancelToken?.abort();
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
    // toast.success(`Cancelled uploading for '${fileToCancel.file.name}'`);
  }

  async function deleteFile(url: string) {
    const fileToDelete = uploadedFiles.find((file) => file.url === url);
    if (!fileToDelete) return;

    const choice = await confirm({
      title: `Delete ${fileToDelete.name}`,
      description: "Are you sure you want to delete this file?",
    });

    if (!choice) return;

    setUploadedFiles((prevFiles) => {
      const newFiles = prevFiles.filter((file) => file.url !== url);

      if (handleChange) handleChange(newFiles);
      return newFiles;
    });
    // toast.success(`Deleted '${fileToDelete.name}' file`);
  }

  const isUploadAllowed = multiple
    ? maxFilesCount
      ? uploadingFiles.length + uploadedFiles.length < maxFilesCount
      : true
    : !hasFiles;

  return (
    <FileUploaderContext.Provider
      value={{
        uploadingFiles,
        uploadedFiles,
        isUploadAllowed,
        addFiles,
        cancelUpload,
        deleteFile,
        multiple,
        accept,
        maxFileSize,
        maxFilesCount,
      }}
    >
      {children}
    </FileUploaderContext.Provider>
  );
}

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const {
    isUploadAllowed,
    addFiles,
    multiple,
    accept,
    maxFileSize,
    maxFilesCount,
  } = useFileUploader();

  if (!isUploadAllowed) return null;

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDropOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    // if (!event.dataTransfer) return;

    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  }

  function handleFilesSelect(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);
    addFiles(selectedFiles);
  }

  // Todo: Remove duplicate
  const humanReadableFileTypes = accept
    ? getHumanReadableFileTypes(accept)
    : [];

  const wildcardTypes = ["images", "videos", "audios"];

  const fileTypesBeVerb =
    humanReadableFileTypes.length === 1
      ? wildcardTypes.includes(humanReadableFileTypes[0])
        ? "are"
        : "is"
      : "is";

  return (
    <label
      className={cn(
        "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 py-6 transition-colors hover:bg-muted/50",
        isDragging && "border-primary bg-primary/5",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOver}
    >
      <div className="text-center">
        <div
          className={cn(
            "mx-auto max-w-min rounded-md border p-2 transition",
            isDragging && "border-primary border-dashed",
          )}
        >
          <UploadCloud size={20} />
        </div>

        <p className="mt-2 text-sm font-semibold text-foreground">
          Drag file{multiple ? "s" : ""}
        </p>

        <p className="mx-auto mt-2 max-w-[75%] text-xs text-muted-foreground">
          Click to upload {maxFilesCount ? `upto ${maxFilesCount}` : ""} file
          {multiple ? "s " : " "}
          {maxFileSize
            ? `(files should be under ${formatFileSize(maxFileSize)})`
            : null}
          {accept
            ? ` Only ${humanReadableFileTypes.join("; ")} ${fileTypesBeVerb} allowed.`
            : null}
        </p>
      </div>
      <input
        type="file"
        className="hidden"
        multiple={multiple}
        onChange={handleFilesSelect}
        accept={accept?.join(",")}
      />
    </label>
  );
}

class UploadCancelledError extends Error {
  constructor(message: string = "Upload was cancelled") {
    super(message);
    this.name = "UploadCancelledError";
  }
}

enum FileTypes {
  Image = "image",
  Pdf = "pdf",
  Audio = "audio",
  Video = "video",
  Other = "other",
}

function FilePreviewWithDownload({
  src,
  children,
}: {
  src: string;
  children: ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={src}
              target="_blank"
              download
              className="group relative flex items-center justify-center"
            >
              <div className="p-2">{children}</div>
              <DownloadIcon className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1 text-black opacity-0 transition group-hover:opacity-100" />
            </a>
          }
        ></TooltipTrigger>
        <TooltipContent>Download</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FilePreviewWithIcon({
  name,
  src,
  type,
}: {
  name: string;
  src: string;
  type: "image" | "video" | "audio";
}) {
  const mediaContent =
    type === "image" ? (
      <img
        width={30}
        height={30}
        alt={name}
        src={src}
        className="aspect-square w-full shrink-0 rounded-md object-cover"
      />
    ) : type === "video" ? (
      <video
        src={src}
        className="aspect-square w-full shrink-0 rounded-md object-cover"
      />
    ) : (
      <AudioWaveform
        width="auto"
        height="auto"
        className="text-primary w-full"
      />
    );

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <DialogTrigger
            render={
              <TooltipTrigger
                render={
                  <button
                    className="group relative flex w-full items-center justify-center"
                    type="button"
                  >
                    {mediaContent}
                    <EyeIcon className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1 text-black opacity-0 transition group-hover:opacity-100" />
                  </button>
                }
              />
            }
          />
          <TooltipContent>Preview</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className={"max-h-screen overflow-y-scroll lg:max-w-5xl"}>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        {type === "image" ? (
          <img
            src={src}
            alt={name}
            width={500}
            height={500}
            className="h-auto w-full"
          />
        ) : (
          <video src={src} controls />
        )}
      </DialogContent>
    </Dialog>
  );
}

function getFileIcon(IconComponent: React.ComponentType<LucideProps>) {
  return (
    <div className="p-2">
      <IconComponent
        width="auto"
        height="auto"
        className="text-primary w-full"
      />
    </div>
  );
}

export function FileIcon({
  fileType,
  name,
  preview,
}: {
  fileType: string;
  name: string;
  preview?: string;
}) {
  if (!preview) {
    switch (true) {
      case fileType.includes(FileTypes.Image):
        return getFileIcon(FileImageIcon);
      case fileType.includes(FileTypes.Pdf):
        return getFileIcon(File);
      case fileType.includes(FileTypes.Audio):
        return getFileIcon(AudioWaveform);
      case fileType.includes(FileTypes.Video):
        return getFileIcon(FileVideoIcon);
      default:
        return getFileIcon(FolderArchive);
    }
  }

  switch (true) {
    case fileType.includes(FileTypes.Image):
      return <FilePreviewWithIcon name={name} src={preview} type="image" />;
    case fileType.includes(FileTypes.Pdf):
      return (
        <FilePreviewWithDownload src={preview}>
          {getFileIcon(File)}
        </FilePreviewWithDownload>
      );
    case fileType.includes(FileTypes.Audio):
      return <FilePreviewWithIcon name={name} src={preview} type="audio" />;
    case fileType.includes(FileTypes.Video):
      return <FilePreviewWithIcon name={name} src={preview} type="video" />;
    default:
      return (
        <FilePreviewWithDownload src={preview}>
          {getFileIcon(FolderArchive)}
        </FilePreviewWithDownload>
      );
  }
}

export function FileList(props: ComponentProps<"div">) {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "grid grid-cols-[40px_6fr_1fr] items-center gap-2",
        className,
      )}
      {...rest}
    />
  );
}

export function FileName(props: { name: string; progress?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">
        {props.name.length > 30
          ? `${props.name.substring(0, 30)}...`
          : props.name}
      </span>
      {props.progress ? (
        <Progress value={props.progress} max={100} className="h-2" />
      ) : null}
    </div>
  );
}

function formatFileSize(fileSize: string) {
  const regex = /^(\d+(\.\d+)?)(mb|gb)$/i;
  const match = fileSize.match(regex);

  if (match) {
    const number = match[1];
    const unit = match[3].toUpperCase();
    return `${number} ${unit}`;
  }

  throw new Error("Invalid file size format");
}

function convertToBytes(fileSize: FileSize) {
  const regex = /^(\d+(\.\d+)?)(mb|gb)$/i;
  const match = fileSize.match(regex);

  if (match) {
    const number = parseFloat(match[1]);
    const unit = match[3].toLowerCase();

    if (unit === "mb") {
      return number * 1024 * 1024;
    } else if (unit === "gb") {
      return number * 1024 * 1024 * 1024;
    }
  }

  throw new Error("Invalid file size format");
}
