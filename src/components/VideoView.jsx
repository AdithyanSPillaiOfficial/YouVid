import React, { useState } from 'react'
import Loading from './Loading';

function VideoView({videoUrl, isVideo, handleFormatOpen, formatOpen}) {
    const [isLoading, setIsLoading] = useState(true);
  return (
    <div className='relative flex flex-col rounded-lg bg-white shadow-sm border border-slate-200 p-5 box-border'>
        {isVideo ? (<video controls autoPlay src={videoUrl} onLoadedData={() => setIsLoading(false)} />) : (<audio controls autoPlay className='w-full' onLoadedData={() => setIsLoading(false)}><source src={videoUrl} type="audio/mpeg" /></audio>)}
        <button type="button" className="mt-5 self-center text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-300 ease-in-out" onClick={handleFormatOpen}>{formatOpen ? "Hide Options" : "Show Options"}</button>

        {isLoading && (<Loading />)}
    </div>
  )
}

export default VideoView