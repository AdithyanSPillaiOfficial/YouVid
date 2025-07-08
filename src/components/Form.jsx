"use client";
import React, { useState } from 'react'
import SelectQuality from './SelectQuality'
import VideoView from './VideoView';
import Loading from './Loading';


function Form() {

    const [formatOpen, setFormatOpen] = useState(false);
    const [formats, setFormats] = useState([]);
    const [videoDetails, setVideoDetails] = useState([]);
    const [urlInput, setUrlInput] = useState('');
    const [error, setError] = useState(null);
    const [videoViewOpen, setVideoViewOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [isVideo, setIsVideo] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    async function handleView(format) {
        setFormatOpen(false);
        setVideoViewOpen(false);
        if(format.mimetype.includes("audio")){
            setVideoUrl(`${process.env.NEXT_PUBLIC_SERVER_BASE}/audio?url=${urlInput}`)
            setIsVideo(false)
        }
        else {
            setVideoUrl(`${process.env.NEXT_PUBLIC_SERVER_BASE}/download?url=${urlInput}&itag=${format.itag}`)
            setIsVideo(true)
        }
        setVideoViewOpen(true);
    }

    async function handleSubmit() {
        setIsLoading(true);
        setVideoViewOpen(false);
        if (urlInput.length < 28) {
            setError("Please enter a valid Youtube video URL")
        }
        else {
            const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE}/details?url=${urlInput}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (result.ok) {
                const res = await result.json();
                if (res.sucess) {
                    setFormats(res.details.formats)
                    setVideoDetails(res.details);
                    setFormatOpen(true);
                } else {
                    setError(res.error);
                }
            }
            else {
                setError("Something went wrong.")
            }
            //setFormats(['1080p','4K','360p','480p','mp3'])
            setIsLoading(false);
        }

    }

    function handleToggleFormat() {
        setFormatOpen(!formatOpen);
    }

    return (
        <div className='p-10 border-red-500 shadow-2xl rounded-2xl md:max-w-1/3 flex flex-col'>
            <span className='font-bold text-3xl'>Enter Youtube URL</span>

            <label htmlFor="helper-text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
            <input type="email" id="helper-text" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="https://youtu.be/QhmSybD" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <button type="button" className="mt-5 self-center text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-300 ease-in-out" onClick={handleSubmit}>Submit</button>
            {error && (<p className='text-red-500'>{error}</p>)}
            <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">We’ll never share your details. Read our <a href="#" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Privacy Policy</a>.</p>
            {formatOpen && (
                <SelectQuality formats={formats} details={videoDetails} handleView={handleView} />
            )}

            {videoViewOpen && (
                <VideoView videoUrl={videoUrl} isVideo={isVideo} formatOpen={formatOpen} handleFormatOpen={handleToggleFormat} />
            )}

            {isLoading && (<Loading />)}
        </div>
    )
}

export default Form