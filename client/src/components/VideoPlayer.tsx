import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";

interface VideoPlayerProps {
  contentId: string;
  videoUrl: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  className?: string;
}

export function VideoPlayer({
  contentId,
  videoUrl,
  title,
  description,
  duration,
  thumbnailUrl,
  className
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Load saved progress
  const { data: progress } = useQuery({
    queryKey: ['/api/videos', contentId, 'progress'],
    enabled: !!contentId,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ currentTime, completionPercentage }: { currentTime: number; completionPercentage: number }) => {
      return apiRequest("PUT", `/api/videos/${contentId}/progress`, {
        currentTime,
        completionPercentage
      });
    },
  });

  // Set initial progress when loaded
  useEffect(() => {
    if (progress && videoRef.current && videoDuration > 0) {
      const savedTime = progress.currentTime || 0;
      if (savedTime > 0 && savedTime < videoDuration) {
        videoRef.current.currentTime = savedTime;
        setCurrentTime(savedTime);
      }
    }
  }, [progress, videoDuration]);

  // Update progress periodically
  useEffect(() => {
    if (!isPlaying || !videoDuration) return;

    const interval = setInterval(() => {
      if (videoRef.current) {
        const current = videoRef.current.currentTime;
        const completion = Math.round((current / videoDuration) * 100);
        
        setCurrentTime(current);
        
        // Update progress every 10 seconds or when video completes
        if (current % 10 < 1 || completion >= 80) {
          updateProgressMutation.mutate({
            currentTime: current,
            completionPercentage: completion
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, videoDuration, updateProgressMutation]);

  const handlePlayPause = () => {
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
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <Card className={`w-full ${className}`} data-testid="video-player-card">
      <CardContent className="p-0">
        <div className="relative group">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl}
            className="w-full aspect-video bg-black"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            data-testid="video-element"
          />
          
          {/* Video Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            data-testid="video-controls"
          >
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={videoDuration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                data-testid="video-progress-slider"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span data-testid="current-time">{formatTime(currentTime)}</span>
                <span data-testid="total-duration">{formatTime(videoDuration)}</span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                  data-testid="play-pause-button"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restart}
                  className="text-white hover:bg-white/20"
                  data-testid="restart-button"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                    data-testid="mute-button"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    data-testid="volume-slider"
                  />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
                data-testid="fullscreen-button"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Video Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2" data-testid="video-title">{title}</h3>
          {description && (
            <p className="text-gray-600 text-sm mb-3" data-testid="video-description">{description}</p>
          )}
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium" data-testid="completion-percentage">
                {Math.round(completionPercentage)}% Complete
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" data-testid="progress-bar" />
            {completionPercentage >= 80 && (
              <div className="flex items-center text-green-600 text-sm">
                <span className="mr-1">✓</span>
                <span data-testid="completion-badge">Video Completed!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}