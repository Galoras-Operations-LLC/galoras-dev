import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const STORAGE_KEY = "galoras_founder_video_seen";

// TODO: Replace this placeholder with your actual founder video URL
const FOUNDER_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function FounderVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenBefore, setHasSeenBefore] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hasSeenVideo = localStorage.getItem(STORAGE_KEY);
    if (hasSeenVideo) {
      setHasSeenBefore(true);
    } else {
      setIsOpen(true);
    }
  }, []);

  const handleVideoEnd = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasSeenBefore(true);
    setIsOpen(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem(STORAGE_KEY, "true");
      setHasSeenBefore(true);
      setIsOpen(false);
    }
  };

  const handleWatchAgain = () => {
    setIsOpen(true);
  };

  return (
    <>
      {hasSeenBefore && (
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
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Welcome to Galoras</DialogTitle>
          </DialogHeader>
          <video
            ref={videoRef}
            src={FOUNDER_VIDEO_URL}
            controls
            onEnded={handleVideoEnd}
            className="w-full aspect-video"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
}
