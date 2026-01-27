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

import React, { useState, useEffect } from "react";
import type { IframelyResponse } from "@plane/types";
import { cn } from "../utils";
import { ThumbnailNotFoundDark } from "./icons/thumbnail-not-found-dark";
import { ThumbnailNotFoundLight } from "./icons/thumbnail-not-found-light";

type RichCardProps = {
  iframelyData: IframelyResponse;
  src: string;
  showLoading?: boolean;
  theme: "dark" | "light";
};

export function RichCard({ iframelyData, src, theme, showLoading = true }: RichCardProps) {
  const domain = new URL(iframelyData.meta?.canonical || src).hostname;
  const thumbnail = iframelyData.links?.thumbnail?.[0]?.href;
  const icon = iframelyData.links?.icon?.[0]?.href;
  const [isVisible, setIsVisible] = useState(false);
  const { title, description } = iframelyData.meta || {};
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    if (!showLoading) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [showLoading]);

  return (
    <div
      className={cn(
        "flex bg-layer-2 rounded-lg overflow-hidden my-4 border border-subtle-1",
        "hover:bg-layer-2 hover:border-strong transition-all duration-500",
        isVisible ? "animate-fade-in opacity-100" : showLoading ? "opacity-0 translate-y-2.5" : "opacity-100"
      )}
    >
      {/* Thumbnail */}
      {thumbnail ? (
        <div className="w-[200px] h-[130px] bg-layer-2 flex-shrink-0 border-r border-subtle-1">
          <img src={thumbnail} alt={title || "Thumbnail"} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="w-[200px] h-[130px] bg-layer-2 flex-shrink-0 border-r border-subtle-1 flex items-center justify-center">
          {isDarkTheme ? (
            <ThumbnailNotFoundDark width={120} height={100} />
          ) : (
            <ThumbnailNotFoundLight width={120} height={100} />
          )}
        </div>
      )}

      {/* Link Meta */}
      <div className="flex-1 min-w-[180px] p-4">
        <div className="text-13 leading-5 text-primary font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-2.5">
          {title || domain}
        </div>
        {description && <div className="mt-2.5 text-13 text-secondary line-clamp-2 mb-2.5">{description}</div>}
        <div className="flex items-center gap-1.5">
          {icon && <img src={icon} alt="Site icon" className="w-4 h-4 flex-shrink-0" />}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-13 leading-4 text-secondary hover:text-primary whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200"
          >
            {src}
          </a>
        </div>
      </div>
    </div>
  );
}
