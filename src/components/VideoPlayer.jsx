'use client'

import { useRef, useState, useEffect } from 'react'
import { FaPlay, FaPause, FaDownload, FaExpand, FaCompress, FaRecycle, FaLock, FaLockOpen } from 'react-icons/fa'

export default function VideoPlayer({src, autoPlay, onLoadedData}) {
  if(!src) {
    return (
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <p>No Source for Video Specified</p>
      </div>
    )
  }
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const lastTap = useRef([])
  const pinchState = useRef({ initialDistance: null })
  const dragStart = useRef(null)
  const isDragging = useRef(false)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pauseLock, setPauseLock] = useState(false);

  const togglePlayPause = () => {
    const video = videoRef.current
    if(pauseLock) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging.current = false

      const now = Date.now()
      lastTap.current.push(now)
      if (lastTap.current.length > 3) lastTap.current.shift()

      const touchX = e.touches[0]?.clientX || 0
      const width = videoRef.current?.clientWidth || 0

      if (
        lastTap.current.length === 3 &&
        lastTap.current[2] - lastTap.current[0] < 600
      ) {
        if (touchX < width / 2) {
          videoRef.current.currentTime -= 10
        } else {
          videoRef.current.currentTime += 10
        }
        lastTap.current = []
      } else {
        setTimeout(() => {
          if (!isDragging.current && lastTap.current.length === 1) {
            togglePlayPause()
          }
          lastTap.current = []
        }, 200)
      }

      if (zoom > 1) {
        const touch = e.touches[0]
        dragStart.current = {
          x: touch.clientX - offset.x,
          y: touch.clientY - offset.y,
        }
      }
    }

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchState.current.initialDistance = Math.hypot(dx, dy)
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.hypot(dx, dy)

      const initial = pinchState.current.initialDistance
      if (initial) {
        const scale = distance / initial
        const newZoom = Math.min(Math.max(zoom * scale, 1), 10)
        setZoom(newZoom)
        pinchState.current.initialDistance = distance
      }
    }

    if (zoom > 1 && e.touches.length === 1 && dragStart.current) {
      isDragging.current = true
      const touch = e.touches[0]
      const newX = touch.clientX - dragStart.current.x
      const newY = touch.clientY - dragStart.current.y
      setOffset({ x: newX, y: newY })
    }
  }

  const handleTouchEnd = () => {
    pinchState.current.initialDistance = null
    dragStart.current = null
    isDragging.current = false
  }

  const handleSliderChange = (e) => {
    const time = parseFloat(e.target.value)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const video = videoRef.current
    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    autoPlay && togglePlayPause();

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current
      if (!video) return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'arrowleft':
          video.currentTime -= 10
          break
        case 'arrowright':
          video.currentTime += 10
          break
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.1, 10))
          break
        case '-':
          setZoom((z) => Math.max(z - 0.1, 1))
          break
        case 'arrowup':
          setOffset((o) => ({ ...o, y: o.y - 10 }))
          break
        case 'arrowdown':
          setOffset((o) => ({ ...o, y: o.y + 10 }))
          break
        case 'f':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', () =>
      setIsFullscreen(Boolean(document.fullscreenElement))
    )

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const formatTime = (t) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }


  const resetView = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }
  

  

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto p-4 bg-black text-white rounded-md"
    >
      <div className="relative overflow-hidden bg-black rounded-md">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto"
          style={{
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            transformOrigin: 'center center',
            touchAction: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          controls={false}
          //autoPlay={autoPlay ? true : false}
          onLoadedData={onLoadedData}
        />
      </div>

      {/* Controls */}
      <div className="mt-2">
        <div className="flex items-center justify-between space-x-4 mb-2 text-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-green-400"
              title="Play/Pause"
            >
              {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-yellow-400"
              title="Fullscreen"
            >
              {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
            </button>

            <a
              href={src}
              download
              className="text-white hover:text-blue-400"
              title="Download"
            >
              <FaDownload size={16} />
            </a>

            <button 
              onClick={resetView}
              className='text-white hover:text-yellow-400'
              title='Reset View'>
                <FaRecycle size={15} />
              </button>
            <button
              onClick={()=> setPauseLock(!pauseLock)}
              className='text-white hover:text-yellow-400 md:hidden'
              title='Pause Lock'
            >
                {pauseLock ? (<FaLock size={15} />) : (<FaLockOpen size={16} />)}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-48 h-1 accent-white"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
