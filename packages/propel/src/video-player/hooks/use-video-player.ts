import { useCallback, useState } from "react";
import type { TPlaybackSpeed } from "../utils";

type UseVideoPlayerProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  onLoadedMetadata?: () => void;
  isDragging?: boolean;
};

export const useVideoPlayer = ({ videoRef, onLoadedMetadata, isDragging }: UseVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<TPlaybackSpeed>(1);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onLoadedMetadata?.();
    }
  }, [videoRef, onLoadedMetadata]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && (!isDragging || isDragging === undefined)) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [videoRef, isDragging]);

  const handleProgress = useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  }, [videoRef]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleEnded = useCallback(() => setIsPlaying(false), []);

  return {
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    playbackSpeed,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setBuffered,
    setVolume,
    setIsMuted,
    setPlaybackSpeed,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleProgress,
    handlePlay,
    handlePause,
    handleEnded,
  };
};
