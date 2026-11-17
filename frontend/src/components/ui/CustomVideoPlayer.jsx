import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play,
    Pause,
    Volume2,
    Volume1,
    VolumeX,
    Maximize,
    Minimize,
    RotateCcw,
    RotateCw,
    PictureInPicture2,
    Settings,
    Check,
    Loader2,
    Sparkles,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n) => (n < 10 ? '0' : '') + n;
    if (hrs > 0) {
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const CustomVideoPlayer = ({
    src,
    poster,
    title,
    autoPlay = true,
    onEnded,
    className = '',
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const doubleClickTimeoutRef = useRef(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bufferedEnd, setBufferedEnd] = useState(0);
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('stihub_video_volume');
        return saved !== null ? parseFloat(saved) : 1;
    });
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isPiPActive, setIsPiPActive] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
    const [centerAnimation, setCenterAnimation] = useState(null); // 'play' | 'pause' | '+10' | '-10'
    const [showUnmuteHint, setShowUnmuteHint] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverPosPercent, setHoverPosPercent] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Sync volume to video element
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    // Handle autoPlay and possible browser autoplay policy restrictions
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (autoPlay) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => {
                        // Browser blocked unmuted autoplay -> fall back to muted autoplay with prompt
                        video.muted = true;
                        setIsMuted(true);
                        video.play().then(() => {
                            setIsPlaying(true);
                            setShowUnmuteHint(true);
                        }).catch(() => {
                            setIsPlaying(false);
                        });
                    });
            }
        }
    }, [autoPlay, src]);

    // Trigger center icon animation
    const triggerCenterAnimation = (type) => {
        setCenterAnimation(type);
        setTimeout(() => setCenterAnimation(null), 600);
    };

    // Toggle Play / Pause
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
            triggerCenterAnimation('play');
        } else {
            video.pause();
            setIsPlaying(false);
            triggerCenterAnimation('pause');
        }
    }, []);

    // Handle video load / streaming error
    const handleVideoError = () => {
        setIsBuffering(false);
        setIsPlaying(false);
        setHasError(true);
        setErrorMessage('Video streaming paused or connection dropped. Click retry to resume playback.');
    };

    // Retry playback
    const handleRetry = () => {
        setHasError(false);
        setIsBuffering(true);
        const video = videoRef.current;
        if (video) {
            const savedTime = video.currentTime;
            video.load();
            video.currentTime = savedTime;
            video.play().then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
            }).catch(() => {
                setIsBuffering(false);
            });
        }
    };

    // Skip time (+/- seconds)
    const skipTime = useCallback((seconds) => {
        const video = videoRef.current;
        if (!video) return;
        const newTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
        video.currentTime = newTime;
        triggerCenterAnimation(seconds > 0 ? '+10' : '-10');
    }, []);

    // Change volume
    const handleVolumeChange = (newVol) => {
        const clamped = Math.max(0, Math.min(1, newVol));
        setVolume(clamped);
        setIsMuted(clamped === 0);
        localStorage.setItem('stihub_video_volume', clamped.toString());
        if (videoRef.current) {
            videoRef.current.volume = clamped;
            videoRef.current.muted = clamped === 0;
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false);
            const restore = volume === 0 ? 0.75 : volume;
            setVolume(restore);
            if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = restore;
            }
        } else {
            setIsMuted(true);
            if (videoRef.current) {
                videoRef.current.muted = true;
            }
        }
        setShowUnmuteHint(false);
    };

    // Change playback speed
    const handleSpeedChange = (speed) => {
        setPlaybackRate(speed);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
        setSpeedMenuOpen(false);
    };

    // Fullscreen toggle
    const toggleFullscreen = useCallback(async () => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            try {
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                }
                setIsFullscreen(true);
            } catch (err) {
                console.warn('Fullscreen request failed:', err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            }
            setIsFullscreen(false);
        }
    }, []);

    // Picture in Picture toggle
    const togglePiP = async () => {
        const video = videoRef.current;
        if (!video || !document.pictureInPictureEnabled) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPiPActive(false);
            } else {
                await video.requestPictureInPicture();
                setIsPiPActive(true);
            }
        } catch (err) {
            console.warn('PiP error:', err);
        }
    };

    // Auto-hide controls timer
    const resetControlsTimer = useCallback(() => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
                setSpeedMenuOpen(false);
            }, 2500);
        }
    }, [isPlaying]);

    // Handle mouse move in player
    const handleMouseMove = () => {
        resetControlsTimer();
    };

    // Handle video click (single click toggle play, double click skip)
    const handleVideoClick = (e) => {
        if (doubleClickTimeoutRef.current) {
            clearTimeout(doubleClickTimeoutRef.current);
            doubleClickTimeoutRef.current = null;
            // Double click: check whether left or right half
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                const clickX = e.clientX - rect.left;
                if (clickX < rect.width / 2) {
                    skipTime(-10);
                } else {
                    skipTime(10);
                }
            }
        } else {
            doubleClickTimeoutRef.current = setTimeout(() => {
                doubleClickTimeoutRef.current = null;
                togglePlay();
            }, 240);
        }
    };

    // Scrubber click / drag
    const handleScrub = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = clickPos * (duration || 0);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleScrubHover = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const hoverPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setHoverPosPercent(hoverPos * 100);
        setHoverTime(hoverPos * (duration || 0));
    };

    const handleScrubLeave = () => {
        setHoverTime(null);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Do not capture if user is typing in an input or textarea
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

            switch (e.key) {
                case ' ':
                case 'k':
                case 'K':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                case 'j':
                case 'J':
                    e.preventDefault();
                    skipTime(-10);
                    break;
                case 'ArrowRight':
                case 'l':
                case 'L':
                    e.preventDefault();
                    skipTime(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleVolumeChange(volume + 0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleVolumeChange(volume - 0.1);
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    togglePiP();
                    break;
                default:
                    break;
            }
            resetControlsTimer();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, skipTime, volume, toggleFullscreen, resetControlsTimer]);

    // Fullscreen change listener
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
        };
    }, []);

    // Video events
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);

        // Update buffered progress
        try {
            const buf = videoRef.current.buffered;
            if (buf && buf.length > 0) {
                setBufferedEnd(buf.end(buf.length - 1));
            }
        } catch {
            // ignore
        }
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration || 0);
    };

    const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { if (isPlaying) setControlsVisible(false); }}
            className={`relative bg-black select-none overflow-hidden group flex items-center justify-center ${className}`}
            style={{ minHeight: '320px' }}
        >
            {/* Native Video Element */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                playsInline
                preload="metadata"
                onClick={handleVideoClick}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); if (onEnded) onEnded(); }}
                onError={handleVideoError}
                className="w-full h-full max-h-[85vh] object-contain cursor-pointer"
            />

            {/* Error Overlay with Retry */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-30 p-6 text-center">
                    <div className="p-3 bg-red-500/20 text-red-400 rounded-full mb-3 border border-red-500/30">
                        <AlertTriangle size={32} />
                    </div>
                    <h5 className="text-white text-base font-bold mb-1">Playback Issue</h5>
                    <p className="text-gray-300 text-xs max-w-sm mb-4 leading-relaxed">
                        {errorMessage || 'Unable to stream video. This may be due to low network bandwidth or connection interruption.'}
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            <RefreshCw size={14} /> Retry Playback
                        </button>
                        {src && (
                            <a
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all"
                            >
                                Open Direct Stream
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Centered Buffering Indicator */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-xs z-20">
                    <div className="p-4 rounded-full bg-black/60 shadow-xl border border-white/10 flex items-center gap-2 text-white text-xs font-semibold">
                        <Loader2 size={32} className="animate-spin text-blue-400" />
                    </div>
                </div>
            )}

            {/* Center Play/Pause/Skip Ripple Animation */}
            {centerAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping duration-300">
                    <div className="p-6 rounded-full bg-black/70 backdrop-blur-md text-white shadow-2xl border border-white/20">
                        {centerAnimation === 'play' && <Play size={48} fill="white" />}
                        {centerAnimation === 'pause' && <Pause size={48} fill="white" />}
                        {centerAnimation === '+10' && <span className="text-xl font-black font-mono tracking-wider">+10s</span>}
                        {centerAnimation === '-10' && <span className="text-xl font-black font-mono tracking-wider">-10s</span>}
                    </div>
                </div>
            )}

            {/* Click to Unmute Prompt Banner */}
            {showUnmuteHint && isMuted && (
                <button
                    onClick={toggleMute}
                    className="absolute top-4 left-4 z-40 flex items-center gap-2 px-3.5 py-2 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md transition-transform hover:scale-105 animate-bounce"
                >
                    <VolumeX size={16} />
                    <span>Click to Unmute Audio</span>
                </button>
            )}

            {/* Big Initial Play Button when paused */}
            {!isPlaying && !isBuffering && (
                <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-blue-600/90 hover:bg-blue-600 hover:scale-110 active:scale-95 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all z-20 group/play"
                    title="Play Video"
                >
                    <Play size={36} fill="white" className="ml-1 transition-transform group-hover/play:scale-110" />
                </button>
            )}

            {/* Top Gradient Overlay with Title */}
            <div
                className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent transition-opacity duration-300 pointer-events-none z-20 ${
                    controlsVisible ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {title && (
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-400" />
                        <h4 className="text-white text-sm md:text-base font-bold drop-shadow truncate max-w-xl">
                            {title}
                        </h4>
                    </div>
                )}
            </div>

            {/* Bottom Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 pt-10 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-30 flex flex-col gap-2 ${
                    controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Precision Scrubber Bar */}
                <div
                    onClick={handleScrub}
                    onMouseMove={handleScrubHover}
                    onMouseLeave={handleScrubLeave}
                    className="relative w-full h-3 flex items-center cursor-pointer group/scrub py-1"
                >
                    {/* Timestamp Hover Tooltip */}
                    {hoverTime !== null && (
                        <div
                            className="absolute -top-7 -translate-x-1/2 bg-black/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow pointer-events-none border border-white/20 whitespace-nowrap"
                            style={{ left: `${hoverPosPercent}%` }}
                        >
                            {formatTime(hoverTime)}
                        </div>
                    )}

                    {/* Track Background */}
                    <div className="w-full h-1.5 group-hover/scrub:h-2 bg-white/20 rounded-full overflow-hidden transition-all relative">
                        {/* Buffered progress */}
                        <div
                            className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all duration-200"
                            style={{ width: `${bufferedPercent}%` }}
                        />
                        {/* Played progress */}
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${playedPercent}%` }}
                        />
                    </div>

                    {/* Scrub Head Thumb */}
                    <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-blue-500 -translate-x-1/2 opacity-0 group-hover/scrub:opacity-100 transition-opacity pointer-events-none"
                        style={{ left: `${playedPercent}%` }}
                    />
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-between text-white text-xs gap-2 pt-1">
                    {/* Left controls: Play, Skip, Volume, Time */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                            title={isPlaying ? 'Pause (Space / K)' : 'Play (Space / K)'}
                        >
                            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => skipTime(-10)}
                            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-gray-300 hover:text-white"
                            title="Skip Backward 10s (J / Left Arrow)"
                        >
                            <RotateCcw size={17} />
                        </button>

                        <button
                            type="button"
                            onClick={() => skipTime(10)}
                            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-gray-300 hover:text-white"
                            title="Skip Forward 10s (L / Right Arrow)"
                        >
                            <RotateCw size={17} />
                        </button>

                        {/* Volume slider */}
                        <div className="flex items-center gap-1.5 group/vol">
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-gray-200 hover:text-white"
                                title="Mute / Unmute (M)"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX size={18} className="text-red-400" />
                                ) : volume < 0.5 ? (
                                    <Volume1 size={18} />
                                ) : (
                                    <Volume2 size={18} />
                                )}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500 opacity-80 group-hover/vol:opacity-100 transition-opacity"
                                title="Volume (Up / Down Arrows)"
                            />
                        </div>

                        {/* Time display */}
                        <div className="text-[11px] font-mono text-gray-300 font-semibold tracking-wide ml-1">
                            <span>{formatTime(currentTime)}</span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Right controls: Speed, PiP, Fullscreen */}
                    <div className="flex items-center gap-2 relative">
                        {/* Speed selector menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                                className={`px-2 py-1 rounded text-[11px] font-bold tracking-wider hover:bg-white/15 transition-colors border ${
                                    playbackRate !== 1
                                        ? 'bg-blue-600/80 border-blue-400 text-white'
                                        : 'bg-white/5 border-white/20 text-gray-200'
                                }`}
                                title="Playback Speed"
                            >
                                {playbackRate}x
                            </button>

                            {speedMenuOpen && (
                                <div className="absolute bottom-10 right-0 bg-gray-900/95 border border-white/20 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-50 backdrop-blur-md min-w-[100px]">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Speed</span>
                                    {SPEED_OPTIONS.map((rate) => (
                                        <button
                                            key={rate}
                                            type="button"
                                            onClick={() => handleSpeedChange(rate)}
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                playbackRate === rate
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <span>{rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
                                            {playbackRate === rate && <Check size={13} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Picture-in-Picture */}
                        {document.pictureInPictureEnabled && (
                            <button
                                type="button"
                                onClick={togglePiP}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    isPiPActive ? 'text-blue-400 bg-blue-500/20' : 'text-gray-300 hover:text-white hover:bg-white/15'
                                }`}
                                title="Picture in Picture (P)"
                            >
                                <PictureInPicture2 size={18} />
                            </button>
                        )}

                        {/* Fullscreen */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-gray-200 hover:text-white"
                            title={isFullscreen ? 'Exit Fullscreen (F / Esc)' : 'Fullscreen (F)'}
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
