import type React from "react";
import { useEffect, useCallback } from "react";

const usePeekOverviewOutsideClickDetector = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  issueId: string
) => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (ref.current && !ref.current.contains(event.target)) {
        // check for the closest element with attribute name data-prevent-outside-click
        const preventOutsideClickElement = event.target.closest("[data-prevent-outside-click]");
        // if the closest element with attribute name data-prevent-outside-click is found
        if (preventOutsideClickElement) {
          // Only prevent the callback if the ref is NOT inside the same prevent-outside-click container.
          // This allows normal outside click detection for elements within the same container
          if (!preventOutsideClickElement.contains(ref.current)) {
            return;
          }
        }
        // check if the click target is the current issue element or its children
        let targetElement: HTMLElement | null = event.target;
        while (targetElement) {
          if (targetElement.id === `issue-${issueId}`) {
            // if the click target is the current issue element, return
            return;
          }
          targetElement = targetElement.parentElement;
        }
        const delayOutsideClickElement = event.target.closest("[data-delay-outside-click]");
        if (delayOutsideClickElement) {
          // if the click target is the closest element with attribute name data-delay-outside-click, delay the callback
          setTimeout(() => {
            callback();
          }, 0);
          return;
        }
        // else, call the callback immediately
        callback();
      }
    },
    [ref, callback, issueId]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [handleClick]);
};

export default usePeekOverviewOutsideClickDetector;
