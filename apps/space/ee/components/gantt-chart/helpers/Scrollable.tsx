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

import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { ArrowRight } from "lucide-react";
// plane imports
import { cn } from "@plane/utils";
// constants
import { SIDEBAR_WIDTH } from "../constants";
import type { IGanttBlock } from "../types";

type Props = {
  block: IGanttBlock;
  blockToRender: (data: any) => React.ReactNode;
  ganttContainerRef: React.RefObject<HTMLDivElement>;
};

export const ChartScrollable = observer(function ChartScrollable(props: Props) {
  const { block, blockToRender, ganttContainerRef } = props;
  // states
  const [isHidden, setIsHidden] = useState(true);
  const [scrollLeft, setScrollLeft] = useState(0);
  // refs
  const resizableRef = useRef<HTMLDivElement>(null);
  // chart hook

  // scroll to a hidden block
  const handleScrollToBlock = () => {
    const scrollContainer = document.querySelector("#gantt-container") as HTMLDivElement;
    if (!scrollContainer || !block.position) return;
    // update container's scroll position to the block's position
    scrollContainer.scrollLeft = block.position.marginLeft - 4;
  };
  // check if block is hidden on either side
  const isBlockHiddenOnLeft =
    block.position?.marginLeft &&
    block.position?.width &&
    scrollLeft > block.position.marginLeft + block.position.width;

  useEffect(() => {
    const ganttContainer = ganttContainerRef.current;
    if (!ganttContainer) return;

    const handleScroll = () => setScrollLeft(ganttContainer.scrollLeft);
    ganttContainer.addEventListener("scroll", handleScroll);
    return () => {
      ganttContainer.removeEventListener("scroll", handleScroll);
    };
  }, [ganttContainerRef]);

  useEffect(() => {
    const intersectionRoot = document.querySelector("#gantt-container") as HTMLDivElement;
    const resizableBlock = resizableRef.current;
    if (!resizableBlock || !intersectionRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHidden(!entry.isIntersecting);
        });
      },
      {
        root: intersectionRoot,
        rootMargin: `0px 0px 0px -${SIDEBAR_WIDTH}px`,
      }
    );

    observer.observe(resizableBlock);

    return () => {
      observer.unobserve(resizableBlock);
    };
  }, []);

  return (
    <>
      {/* move to the hidden block */}
      {isHidden && block?.start_date && block?.target_date && (
        <button
          type="button"
          className="sticky z-[1] grid h-8 w-8 translate-y-1.5 cursor-pointer place-items-center rounded-sm border border-subtle-1 bg-layer-1 text-secondary hover:text-primary"
          style={{
            left: `${SIDEBAR_WIDTH + 4}px`,
          }}
          onClick={handleScrollToBlock}
        >
          <ArrowRight
            className={cn("h-3.5 w-3.5", {
              "rotate-180": isBlockHiddenOnLeft,
            })}
          />
        </button>
      )}
      <div
        ref={resizableRef}
        className="group relative inline-flex h-full cursor-pointer items-center font-medium transition-all"
        style={{
          marginLeft: `${block.position?.marginLeft}px`,
          width: `${block.position?.width}px`,
        }}
      >
        <div className={cn("relative z-[2] flex h-8 w-full items-center rounded")}>{blockToRender(block.data)}</div>
      </div>
    </>
  );
});
