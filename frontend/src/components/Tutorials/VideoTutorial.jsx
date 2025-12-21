import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  X,
  Settings
} from "lucide-react";
import { useAccessibility } from "../../hooks/useAccessibility";

const VideoTutorial = ({
  isOpen,
  onClose,
  tutorial,
  onComplete,
  autoPlay = false
}) => {
  const { settings } = useAccessibility();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (videoRef.current && autoPlay && isOpen) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay, isOpen]);

  useEffect(() => {
    // Load transcript for accessibility
    if (tutorial?.transcript) {
      setTranscript(tutorial.transcript);
    }
  }, [tutorial]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(tutorial.id);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    handleComplete();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
          settings.seniorMode ? "senior-mode" : ""
        } ${settings.largeTouchTargets ? "large-touch-targets" : ""}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <div className='flex-1'>
            <h2 className='text-xl font-semibold text-gray-900'>
              {tutorial.title}
            </h2>
            <p className='text-sm text-gray-600 mt-1'>{tutorial.description}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Close tutorial'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Video Container */}
        <div
          className='relative bg-black group'
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            className='w-full h-auto'
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnd}
            poster={tutorial.thumbnail}
          >
            <source src={tutorial.videoUrl} type='video/mp4' />
            {captionsEnabled && tutorial.captions && (
              <track
                kind='captions'
                src={tutorial.captions}
                srcLang='en'
                label='English'
                default
              />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Video Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div className='mb-4'>
              <input
                type='range'
                min='0'
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className='w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer'
                style={{
                  background: `linear-gradient(to right, #369936 0%, #369936 ${
                    (currentTime / duration) * 100
                  }%, #d1d5db ${(currentTime / duration) * 100}%, #d1d5db 100%)`
                }}
              />
              <div className='flex justify-between text-xs text-white mt-1'>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className='w-6 h-6 text-white' />
                  ) : (
                    <Play className='w-6 h-6 text-white' />
                  )}
                </button>

                {/* Skip Back */}
                <button
                  onClick={() => skip(-10)}
                  className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
                  aria-label='Skip back 10 seconds'
                >
                  <SkipBack className='w-5 h-5 text-white' />
                </button>

                {/* Skip Forward */}
                <button
                  onClick={() => skip(10)}
                  className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
                  aria-label='Skip forward 10 seconds'
                >
                  <SkipForward className='w-5 h-5 text-white' />
                </button>

                {/* Volume */}
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={toggleMute}
                    className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className='w-5 h-5 text-white' />
                    ) : (
                      <Volume2 className='w-5 h-5 text-white' />
                    )}
                  </button>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.1'
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className='w-20 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                {/* Settings */}
                <div className='relative'>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
                    aria-label='Video settings'
                  >
                    <Settings className='w-5 h-5 text-white' />
                  </button>

                  {/* Settings Menu */}
                  {showSettings && (
                    <div className='absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 min-w-48'>
                      <div className='mb-3'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Playback Speed
                        </label>
                        <select
                          value={playbackRate}
                          onChange={(e) =>
                            changePlaybackRate(parseFloat(e.target.value))
                          }
                          className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                        >
                          <option value={0.5}>0.5x (Slow)</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x (Normal)</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x (Fast)</option>
                        </select>
                      </div>

                      <div className='mb-3'>
                        <label className='flex items-center'>
                          <input
                            type='checkbox'
                            checked={captionsEnabled}
                            onChange={(e) =>
                              setCaptionsEnabled(e.target.checked)
                            }
                            className='mr-2'
                          />
                          <span className='text-sm'>Enable Captions</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
                  aria-label='Fullscreen'
                >
                  <Maximize className='w-5 h-5 text-white' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Information */}
        <div className='p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                What you'll learn:
              </h3>
              <ul className='space-y-1 text-sm text-gray-600'>
                {tutorial.objectives?.map((objective, index) => (
                  <li key={index} className='flex items-start'>
                    <span className='text-green-600 mr-2'>•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Duration: {tutorial.duration}
              </h3>
              <div className='flex flex-wrap gap-2'>
                {tutorial.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Transcript Section for Accessibility */}
          {transcript && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Video Transcript
              </h3>
              <div className='bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto'>
                <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                  {transcript}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end space-x-3 p-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            Close
          </button>
          <button
            onClick={handleComplete}
            className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          >
            Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;
