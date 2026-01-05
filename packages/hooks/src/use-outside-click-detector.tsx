import type React from "react";
import { useEffect } from "react";

export const useOutsideClickDetector = (
  ref: React.RefObject<HTMLElement> | any,
  callback: () => void,
  useCapture = false
) => {
  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as any)) {
      // check for the closest element with attribute name data-prevent-outside-click
      const preventOutsideClickElement = (event.target as unknown as HTMLElement | undefined)?.closest(
        "[data-prevent-outside-click]"
      );
      // if the closest element with attribute name data-prevent-outside-click is found
      if (preventOutsideClickElement) {
        // Only prevent the callback if the ref is NOT inside the same prevent-outside-click container.
        // This allows normal outside click detection for elements within the same container
        // (e.g., dropdowns inside a floating panel should still close on outside click within that panel)
        if (!preventOutsideClickElement.contains(ref.current)) {
          return;
        }
      }
      // else call the callback
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick, useCapture);
    return () => {
      document.removeEventListener("mousedown", handleClick, useCapture);
    };
  });
};
