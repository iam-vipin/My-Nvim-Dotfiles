import { useCallback, useEffect, useRef, useState } from "react";

type UseVideoProgressProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
};

export const useVideoProgress = ({ videoRef, duration, setCurrentTime }: UseVideoProgressProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const calculateSeekPercent = useCallback((clientX: number) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handleProgressHover = useCallback(
    (e: React.MouseEvent) => {
      if (!progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = percent * duration;

      setHoverTime(time);
      setHoverX(e.clientX - rect.left);
    },
    [duration]
  );

  const handleProgressLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      const percent = calculateSeekPercent(e.clientX);
      setCurrentTime(percent * duration);
    },
    [calculateSeekPercent, duration, setCurrentTime]
  );

  const handleProgressTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      if (e.touches.length > 0) {
        const percent = calculateSeekPercent(e.touches[0].clientX);
        setCurrentTime(percent * duration);
      }
    },
    [calculateSeekPercent, duration, setCurrentTime]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const percent = calculateSeekPercent(e.clientX);
      setCurrentTime(percent * duration);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const percent = calculateSeekPercent(e.touches[0].clientX);
        setCurrentTime(percent * duration);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (videoRef.current) {
        const percent = calculateSeekPercent(e.clientX);
        videoRef.current.currentTime = percent * duration;
      }
      setIsDragging(false);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (videoRef.current && e.changedTouches.length > 0) {
        const percent = calculateSeekPercent(e.changedTouches[0].clientX);
        videoRef.current.currentTime = percent * duration;
      }
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, duration, calculateSeekPercent, setCurrentTime, videoRef]);

  return {
    progressRef,
    isDragging,
    hoverTime,
    hoverX,
    handleProgressHover,
    handleProgressLeave,
    handleProgressMouseDown,
    handleProgressTouchStart,
  };
};
