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

type UseVideoKeyboardProps = {
  isActive: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  seekForward: () => void;
  seekBackward: () => void;
  setIsActive: (active: boolean) => void;
  onFocus?: () => void;
  onHandleKeyDown?: (event: KeyboardEvent) => boolean;
};

export const useVideoKeyboard = ({
  isActive,
  togglePlay,
  toggleMute,
  toggleFullscreen,
  seekForward,
  seekBackward,
  setIsActive,
  onFocus,
  onHandleKeyDown,
}: UseVideoKeyboardProps) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "arrowright":
          e.preventDefault();
          seekForward();
          break;
        case "arrowleft":
          e.preventDefault();
          seekBackward();
          break;
        case "arrowup":
        case "arrowdown":
        case "escape":
        case "backspace":
        case "delete":
        case "enter": {
          e.preventDefault();
          setIsActive(false);
          onFocus?.();
          onHandleKeyDown?.(e);
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isActive,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekForward,
    seekBackward,
    setIsActive,
    onFocus,
    onHandleKeyDown,
  ]);
};
