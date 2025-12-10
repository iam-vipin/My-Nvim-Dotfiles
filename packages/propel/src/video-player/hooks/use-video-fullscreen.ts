import { useCallback, useEffect, useState } from "react";

interface UseVideoFullscreenProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useVideoFullscreen = ({ videoRef, containerRef }: UseVideoFullscreenProps) => {
  const [isPiP, setIsPiP] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (isPiP) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  }, [videoRef, isPiP]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
        containerRef.current.focus();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [containerRef, isFullscreen]);

  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiP(document.pictureInPictureElement === videoRef.current);
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("enterpictureinpicture", handlePiPChange);
    document.addEventListener("leavepictureinpicture", handlePiPChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("enterpictureinpicture", handlePiPChange);
      document.removeEventListener("leavepictureinpicture", handlePiPChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [videoRef]);

  return {
    isPiP,
    isFullscreen,
    togglePiP,
    toggleFullscreen,
  };
};
