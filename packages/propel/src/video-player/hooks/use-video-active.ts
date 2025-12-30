import { useEffect, useState } from "react";
import { useOutsideClickDetector } from "@plane/hooks";

type UseVideoActiveProps = {
  selected?: boolean;
  onBlur?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const useVideoActive = ({ selected, onBlur, containerRef }: UseVideoActiveProps) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (selected) {
      setIsActive(true);
      onBlur?.();
    }
  }, [selected, onBlur]);

  useOutsideClickDetector(containerRef, () => {
    if (isActive) {
      setIsActive(false);
    }
  });

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsActive(true);
    onBlur?.();
  };

  return {
    isActive,
    setIsActive,
    handleContainerClick,
  };
};
