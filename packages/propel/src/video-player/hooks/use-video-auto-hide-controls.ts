import { useCallback, useEffect, useRef, useState } from "react";

type UseVideoAutoHideControlsProps = {
  isPlaying: boolean;
  isDragging: boolean;
  showSpeedMenu: boolean;
};

export const useVideoAutoHideControls = ({ isPlaying, isDragging, showSpeedMenu }: UseVideoAutoHideControlsProps) => {
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showControls, setShowControls] = useState(true);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying && !isDragging && !showSpeedMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isDragging, showSpeedMenu]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  return {
    showControls,
    setShowControls,
    resetControlsTimeout,
  };
};
