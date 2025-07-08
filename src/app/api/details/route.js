import { NextResponse } from "next/server";
const ytdl = require("@distube/ytdl-core");


export async function GET(request) {
    const requestUrl = new URL(request.url);
    const params = requestUrl.searchParams;
    const videoUrl = params.get('url');
    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoDetails = videoInfo.videoDetails;
    const videoFormats = videoInfo.formats;

    const formats = [];
    videoFormats.map(format => {
        if(!formats.some(fmt => fmt.quality === format.qualityLabel)){
            formats.push({
                quality : format.qualityLabel,
                itag : format.itag,
                mimetype : format.mimeType.split(';')[0]
            })
        }
    })

    console.log(formats)

    const resDetails = {
        title : videoDetails.title,
        channel : videoDetails.ownerChannelName,
        thumbnail : videoDetails.thumbnails.at(-1),
        formats : formats
    }

    return NextResponse.json({sucess : true, details : resDetails});
}