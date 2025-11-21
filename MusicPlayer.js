import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:5001';

function MusicPlayer({ song, playlist, onSongChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);

  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [song]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value / 100);
  };

  const playNext = () => {
    const currentIndex = playlist.findIndex(s => s._id === song._id);
    if (currentIndex < playlist.length - 1) {
      onSongChange(playlist[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = playlist.findIndex(s => s._id === song._id);
    if (currentIndex > 0) {
      onSongChange(playlist[currentIndex - 1]);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      >
        <source src={`${API_URL}${song.filePath}`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="player-info">
        <div className="song-details">
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
        </div>
      </div>

      <div className="player-controls">
        <button onClick={playPrevious} className="control-btn">
          ⏮️
        </button>
        <button onClick={togglePlayPause} className="play-pause-btn">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={playNext} className="control-btn">
          ⏭️
        </button>
      </div>

      <div className="player-progress">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercentage}
          onChange={handleSeek}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="player-volume">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
}

export default MusicPlayer;
