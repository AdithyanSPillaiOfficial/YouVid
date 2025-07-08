import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

// Basic cache
const downloaded = new Set();

const QUALITY_ITAGS = {
  "144p": 160,
  "240p": 133,
  "360p": 134,
  "480p": 135,
  "720p": 136,
  "1080p": 137,
  "1440p": 271,
  "2160p": 313,
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const quality = searchParams.get("quality");
  const itag = searchParams.get("itag");

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "Invalid or missing YouTube URL" }, { status: 400 });
  }

  const videoId = ytdl.getURLVideoID(url);
  const videoPath = `/tmp/temp_${videoId}_${itag || quality}_video.mp4`;
  const audioPath = `/tmp/temp_${videoId}_audio.mp4`;
  const outputPath = `/tmp/output_${videoId}_${itag || quality}.mp4`;

  if (downloaded.has(`${videoId}_${itag || quality}`) && fs.existsSync(outputPath)) {
    return streamVideo(req, outputPath);
  }

  try {
    // Download video
    await new Promise((resolve, reject) => {
      ytdl(url, {
        quality: itag || QUALITY_ITAGS[quality || "360p"],
      })
        .pipe(fs.createWriteStream(videoPath))
        .on("finish", resolve)
        .on("error", reject);
    });

    // Download audio
    await new Promise((resolve, reject) => {
      ytdl(url, { quality: "highestaudio" })
        .pipe(fs.createWriteStream(audioPath))
        .on("finish", resolve)
        .on("error", reject);
    });

    // Merge audio and video
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions(["-c:v copy", "-c:a aac", "-shortest"])
        .save(outputPath)
        .on("end", () => {resolve(); console.log("Merge Finished")})
        .on("error", reject);
    });
    

    downloaded.add(`${videoId}_${itag || quality}`);

    return streamVideo(req, outputPath, () => {
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
    });
  } catch (err) {
    console.error("Download or Merge Error:", err);
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 });
  }
}

function streamVideo(req, filePath, cleanup) {
  const range = req.headers.get("range");

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return new NextResponse("Requested range not satisfiable", { status: 416 });
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", chunk => controller.enqueue(chunk));
        stream.on("end", () => {
          controller.close();
          cleanup?.();
        });
        stream.on("error", err => controller.error(err));
      },
    });

    return new NextResponse(readableStream, { status: 206, headers });
  } else {
    const stream = fs.createReadStream(filePath);

    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", chunk => controller.enqueue(chunk));
        stream.on("end", () => {
          controller.close();
          cleanup?.();
        });
        stream.on("error", err => controller.error(err));
      },
    });

    return new NextResponse(readableStream, { status: 200, headers });
  }
}
