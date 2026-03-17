import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import './css/PlayerBar.css';

const PlayerBar = () => {
    const {
        currentTrack,
        queue,
        currentIndex,
        isPlaying,
        togglePlay,
        currentTime,
        duration,
        seek,
        volume,
        setVolume,
        playNextTrack,
        playPrevTrack
    } = usePlayer();

    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    if (!currentTrack) return null;

    const hasNext = queue.length > 0 && currentIndex < queue.length - 1;
    const hasPrev = queue.length > 0 && (currentIndex > 0 || currentTime > 3);

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        seek(newTime);
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <div className="player-bar-container animate-slide-up">
            <div className="player-bar-content">
                {/* Track Info */}
                <div className="player-track-info">
                    <div className="player-track-details min-w-0">
                        <div className="player-track-title truncate">{currentTrack.title}</div>
                        <div className="player-track-artist truncate">{currentTrack.artist || "Unknown Artist"}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="player-controls-wrapper">
                    <div className="player-main-controls">
                        <button
                            className={`player-control-btn ${!hasPrev ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}`}
                            onClick={playPrevTrack}
                            disabled={!hasPrev}
                        >
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>
                        <button
                            className="player-play-btn"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 fill-current" />
                            ) : (
                                <Play className="w-6 h-6 fill-current translate-x-0.5" />
                            )}
                        </button>
                        <button
                            className={`player-control-btn ${!hasNext ? 'opacity-20 cursor-not-allowed' : 'opacity-50 hover:opacity-100'}`}
                            onClick={playNextTrack}
                            disabled={!hasNext}
                        >
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                    </div>

                    <div className="player-progress-container">
                        <span className="player-time-label">{formatTime(currentTime)}</span>
                        <div className="player-progress-bar-wrapper">
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleProgressChange}
                                className="player-progress-slider"
                            />
                            <div
                                className="player-progress-fill"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                        </div>
                        <span className="player-time-label">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Extra Actions */}
                <div className="player-actions">
                    <div className="player-volume-wrapper">
                        <button
                            className="player-action-btn"
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                        >
                            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        {showVolumeSlider && (
                            <div
                                className="player-volume-slider-popover"
                                onMouseLeave={() => setShowVolumeSlider(false)}
                            >
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="player-volume-slider"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBar;
