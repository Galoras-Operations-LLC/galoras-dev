import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, X, Maximize2, Minimize2 } from "lucide-react";

const STORAGE_KEY = "galoras_founder_video_seen";

// TODO: Replace this placeholder with your actual founder video URL
const FOUNDER_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function FounderVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isThumbnail, setIsThumbnail] = useState(false);
  const [hasSeenBefore, setHasSeenBefore] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hasSeenVideo = localStorage.getItem(STORAGE_KEY);
    if (hasSeenVideo) {
      setHasSeenBefore(true);
    } else {
      setIsOpen(true);
    }
  }, []);

  // Auto-minimize to thumbnail when paused (only in small mode)
  // Set isThumbnail to false immediately when playing
  useEffect(() => {
    if (isPlaying) {
      setIsThumbnail(false);
    } else if (!isExpanded && isOpen) {
      const timer = setTimeout(() => setIsThumbnail(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isExpanded, isOpen]);

  // Track video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };


  const handleVideoEnd = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasSeenBefore(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasSeenBefore(true);
    setIsOpen(false);
  };

  const handleWatchAgain = () => {
    setIsOpen(true);
    setIsThumbnail(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setIsThumbnail(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsThumbnail(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleThumbnailClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsThumbnail(false);
    }
  };

  if (!isOpen && !hasSeenBefore) return null;

  return (
    <>
      {/* Watch Again Button - shown after video is closed */}
      {hasSeenBefore && !isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleWatchAgain}
            size="sm"
            variant="outline"
            className="bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary hover:bg-primary/10 shadow-lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Watch Founder Video
          </Button>
        </div>
      )}

      {/* Floating Video Player */}
      {isOpen && (
        <>
          {/* Backdrop overlay when expanded */}
          {isExpanded && (
            <div 
              className="fixed inset-0 bg-black/50 z-[45] transition-opacity duration-300"
              onClick={handleClose}
            />
          )}
          
          <div
            className={`fixed z-40 bg-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded 
                ? "top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl z-50" 
                : isThumbnail
                  ? "top-24 right-4 w-16 h-16 cursor-pointer hover-scale"
                  : "top-24 right-4 w-64 sm:w-80"
            }`}
            onClick={isThumbnail ? handleThumbnailClick : undefined}
          >
            {/* Thumbnail Mode with Progress Ring */}
            {isThumbnail && !isExpanded && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/90 rounded-lg">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                  {/* Background circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="hsl(var(--primary-foreground) / 0.3)"
                    strokeWidth="3"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="hsl(var(--primary-foreground))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <Play className="h-6 w-6 text-primary-foreground z-10" />
              </div>
            )}

            {/* Control buttons - hidden in thumbnail mode */}
            {!isThumbnail && (
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Button
                  onClick={toggleExpand}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-black/60 hover:bg-black/80 text-white rounded-full"
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-black/60 hover:bg-black/80 text-white rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <video
              ref={videoRef}
              src={FOUNDER_VIDEO_URL}
              controls={!isThumbnail}
              autoPlay
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              className={`w-full aspect-video transition-opacity duration-300 ${
                isThumbnail ? "opacity-0" : "opacity-100"
              }`}
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </>
      )}
    </>
  );
}
