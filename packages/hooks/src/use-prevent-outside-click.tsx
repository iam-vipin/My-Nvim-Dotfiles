/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { useEffect } from "react";

export const usePreventOutsideClick = (
  ref: React.RefObject<HTMLElement> | any,
  callback: (clickedElement: HTMLAnchorElement | null) => void,
  excludeIds: string[] = [],
  useCapture = true
) => {
  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as any)) {
      // Exclude the ids from the excludeIds array
      let targetElement = event.target as HTMLElement | null;
      while (targetElement) {
        if (excludeIds.includes(targetElement.id)) {
          // if the click target is the current issue element, return
          return;
        }
        targetElement = targetElement.parentElement;
      }
      const clickedElement = event.target as HTMLElement;
      // Find nearest anchor element (self or parent) and prevent default and stop propagation
      const linkElement = clickedElement.closest("a");
      if (linkElement instanceof HTMLAnchorElement) {
        event.preventDefault();
        event.stopPropagation();
      }
      // check for the closest element with attribute name data-prevent-outside-click
      const preventOutsideClickElement = clickedElement?.closest("[data-prevent-outside-click]");
      // if the closest element with attribute name data-prevent-outside-click is found
      if (preventOutsideClickElement) {
        // Only prevent the callback if the ref is NOT inside the same prevent-outside-click container.
        // This allows normal outside click detection for elements within the same container
        if (!preventOutsideClickElement.contains(ref.current)) {
          return;
        }
      }
      // pass the linkElement to the callback
      callback(linkElement);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, useCapture);
    return () => {
      document.removeEventListener("click", handleClick, useCapture);
    };
  }, []);
};
