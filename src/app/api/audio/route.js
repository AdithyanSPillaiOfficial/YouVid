import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import ytdl from "@distube/ytdl-core";

// ensure /tmp or another temp dir exists
const TEMP_DIR = "/tmp";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return NextResponse.json({ error: "Invalid or missing YouTube URL" }, { status: 400 });
  }

  console.log("Received Request to Download audio:", videoUrl);

  const videoId = ytdl.getURLVideoID(videoUrl);
  const audioPath = path.join(TEMP_DIR, `temp_${videoId}_audio.mp4`);
  const range = req.headers.get("range");

  // Download audio if not already downloaded
  if (!fs.existsSync(audioPath)) {
    await new Promise((resolve, reject) => {
      ytdl(videoUrl, { quality: "highestaudio" })
        .pipe(fs.createWriteStream(audioPath))
        .on("finish", () => {
          console.log("Audio downloaded");
          resolve();
        })
        .on("error", reject);
    });
  }

  if (!fs.existsSync(audioPath)) {
    return new NextResponse("Audio not found", { status: 500 });
  }

  const stat = fs.statSync(audioPath);
  const fileSize = stat.size;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return new NextResponse("Requested range not satisfiable", { status: 416 });
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(audioPath, { start, end });

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    };

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", chunk => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", err => controller.error(err));
      },
    });

    return new NextResponse(readableStream, { status: 206, headers });
  } else {
    const stream = fs.createReadStream(audioPath);

    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    };

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", chunk => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", err => controller.error(err));
      },
    });

    return new NextResponse(readableStream, { status: 200, headers });
  }
}
