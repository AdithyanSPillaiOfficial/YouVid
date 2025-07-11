import React, { useState } from 'react'
import Loading from './Loading';
import VideoPlayer from './VideoPlayer';

function VideoView({ videoUrl, isVideo, handleFormatOpen, formatOpen }) {
  const [isLoading, setIsLoading] = useState(true);
  const [useLegacyPlayer, setLegacyPlayer] = useState(true);

  return (
    <div className='relative flex flex-col rounded-lg bg-white shadow-sm border border-slate-200 p-5 box-border'>
      {/* {isVideo ? (<video controls autoPlay src={videoUrl} onLoadedData={() => setIsLoading(false)} />) : (<audio controls autoPlay className='w-full' onLoadedData={() => setIsLoading(false)}><source src={videoUrl} type="audio/mpeg" /></audio>)} */}
      {isVideo ? useLegacyPlayer ? (<video controls autoPlay src={videoUrl} onLoadedData={() => setIsLoading(false)} />) : (<VideoPlayer autoPlay={true} src={videoUrl} onLoadedData={() => setIsLoading(false)} />) : (<audio controls autoPlay className='w-full' onLoadedData={() => setIsLoading(false)}><source src={videoUrl} type="audio/mpeg" /></audio>)}
      <label className="inline-flex items-center cursor-pointer m-5">
        <input type="checkbox" checked={useLegacyPlayer} onChange={(e) => setLegacyPlayer(!useLegacyPlayer)} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-black">Use Legacy Player</span>
      </label>


      <button type="button" className="mt-5 self-center text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-300 ease-in-out" onClick={handleFormatOpen}>{formatOpen ? "Hide Options" : "Show Options"}</button>

      {isLoading && (<Loading />)}
    </div>
  )
}

export default VideoView