import fs from "node:fs";
import path from "node:path";
import mime from "mime-types";

import { json } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { _splat: pathname } = params;
        if (!pathname)
          return json(
            { status: "ERROR", message: "NOT FOUND" },
            { status: 404 },
          );

        const filePath = path.join(
          process.cwd(),
          "public",
          decodeURI(pathname),
        );
        const mimeType = mime.lookup(filePath);

        try {
          const stats = await fs.promises.stat(filePath);
          const range = request.headers.get("range");

          if (mimeType && mimeType.startsWith("video/") && range) {
            const [start, end] = range.replace(/bytes=/, "").split("-");
            const startNum = parseInt(start, 10);
            const endNum = end ? parseInt(end, 10) : stats.size - 1;
            const chunkSize = endNum - startNum + 1;

            const videoStream = fs.createReadStream(filePath, {
              start: startNum,
              end: endNum,
            });

            return new Response(nodeToWebReadable(videoStream), {
              status: 206,
              headers: {
                "Content-Range": `bytes ${startNum}-${endNum}/${stats.size}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize.toString(),
                "Content-Type": mimeType,
              },
            });
          } else {
            const fileStream = fs.createReadStream(filePath);
            return new Response(nodeToWebReadable(fileStream), {
              status: 200,
              headers: {
                "Content-Type": mimeType || "application/octet-stream",
                "Content-Length": stats.size.toString(),
              },
            });
          }
        } catch (error) {
          if (
            error instanceof Error &&
            (error as NodeJS.ErrnoException).code === "ENOENT"
          )
            return json({ error: "NOT FOUND" }, { status: 404 });

          return json({ error: "Failed to read file" }, { status: 500 });
        }
      },
    },
  },
});

function nodeToWebReadable(nodeReadable: fs.ReadStream) {
  const reader = nodeReadable[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    cancel() {
      nodeReadable.destroy();
    },
  });
}
