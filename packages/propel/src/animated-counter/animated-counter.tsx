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

import { useState, useEffect } from "react";
import { cn } from "../utils";

export interface AnimatedCounterProps {
  count: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-11",
  md: "text-13",
  lg: "text-14",
};

export function AnimatedCounter({ count, className, size = "md" }: AnimatedCounterProps) {
  // states
  const [displayCount, setDisplayCount] = useState(count);
  const [prevCount, setPrevCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (count !== prevCount) {
      setDirection(count > prevCount ? "up" : "down");
      setIsAnimating(true);
      setAnimationKey((prev) => prev + 1);

      // Update the display count immediately, animation will show the transition
      setDisplayCount(count);

      // End animation after CSS transition
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
        setPrevCount(count);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  const sizeClass = sizeClasses[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center overflow-hidden min-w-2", sizeClass)}>
      {/* Previous number sliding out */}
      {isAnimating && (
        <span
          key={`prev-${animationKey}`}
          className={cn(
            "absolute inset-0 flex items-center justify-center font-medium",
            "animate-slide-out",
            direction === "up" && "[--slide-out-dir:-100%]",
            direction === "down" && "[--slide-out-dir:100%]",
            sizeClass,
            {
              "animate-slide-out animate-fade-out": isAnimating && direction === "up",
              "animate-slide-out-down animate-fade-out": isAnimating && direction === "down",
            }
          )}
        >
          {prevCount}
        </span>
      )}

      {/* New number sliding in */}
      <span
        key={`current-${animationKey}`}
        className={cn(
          "flex items-center justify-center font-medium",
          !isAnimating && "opacity-100",
          sizeClass,
          {
            "animate-slide-in-from-bottom": isAnimating && direction === "up",
            "animate-slide-in-from-top": isAnimating && direction === "down",
          },
          className
        )}
      >
        {displayCount}
      </span>
    </div>
  );
}
