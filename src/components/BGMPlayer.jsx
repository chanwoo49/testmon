import { useState, useRef, useEffect } from 'react'
import './BGMPlayer.css'

// BGM 파일 import (파일명에 맞게 수정)
import bgmFile from '../assets/audio/bgm.mp3'

function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)  // 기본 볼륨 30%
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.loop = true  // 반복 재생
    }
  }, [volume])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  return (
    <div className="bgm-player">
      <audio ref={audioRef} src={bgmFile} />
      
      <button className="bgm-toggle" onClick={togglePlay}>
        {isPlaying ? '🔊' : '🔇'}
      </button>
      
      {isPlaying && (
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
      )}
    </div>
  )
}

export default BGMPlayer