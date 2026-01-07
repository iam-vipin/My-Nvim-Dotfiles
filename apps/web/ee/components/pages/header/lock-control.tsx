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

import { useState, useEffect, useRef, useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { LockKeyhole, LockKeyholeOpen, FolderLock, FolderOpen } from "lucide-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
import { IconButton } from "@plane/propel/icon-button";
import { Button } from "@plane/propel/button";
// utils
import { cn } from "@plane/utils";
// hooks
import { usePageOperations } from "@/hooks/use-page-operations";
// store
import type { EPageStoreType } from "@/plane-web/hooks/store";
import { usePageStore } from "@/plane-web/hooks/store";
import type { TPageInstance } from "@/store/pages/base-page";

type LockDisplayState = "neutral" | "locked" | "unlocked";

type Props = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageLockControl = observer(function PageLockControl({ page, storeType }: Props) {
  // Initial state: if locked, then "locked", otherwise default to "neutral"
  const [displayState, setDisplayState] = useState<LockDisplayState>(page.is_locked ? "locked" : "neutral");
  // Show lock options popup state (Restored)
  const [showLockOptions, setShowLockOptions] = useState(false);
  // Hover state for the locked button
  const [isHoveringLocked, setIsHoveringLocked] = useState(false);
  // State to track if lock animation is in progress
  const [isAnimatingLock, setIsAnimatingLock] = useState(false);
  // Track mouse left and came back after locking
  const [mouseReEntered, setMouseReEntered] = useState(false);
  // Track if we just locked the page (for animations)
  const [justLocked, setJustLocked] = useState(false);
  // derived values
  const { canCurrentUserLockPage, is_locked } = page;
  // Ref for the transition timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Animation timer ref
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Just locked timer ref
  const justLockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to store the previous value of isLocked for detecting transitions
  const prevLockedRef = useRef(is_locked);
  // Lock options ref to detect outside clicks (Restored)
  const lockOptionsRef = useRef<HTMLDivElement>(null);
  // page operations
  const {
    pageOperations: { toggleLock },
  } = usePageOperations({
    page,
  });

  const { workspaceSlug } = useParams();

  const { isNestedPagesEnabled } = usePageStore(storeType);
  const hasSubpages = page.sub_pages_count !== undefined && page.sub_pages_count > 0;

  const canShowRecursiveOptions = isNestedPagesEnabled(workspaceSlug.toString()) && hasSubpages;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (justLockedTimerRef.current) clearTimeout(justLockedTimerRef.current);
    },
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lockOptionsRef.current && !lockOptionsRef.current.contains(event.target as Node)) {
        setShowLockOptions(false);
      }
    };

    if (showLockOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLockOptions]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (justLockedTimerRef.current) {
      clearTimeout(justLockedTimerRef.current);
      justLockedTimerRef.current = null;
    }

    if (is_locked && !prevLockedRef.current) {
      // Just changed from unlocked to locked
      setJustLocked(true);
      justLockedTimerRef.current = setTimeout(() => {
        setJustLocked(false);
        justLockedTimerRef.current = null;
      }, 1000); // Animation duration plus some buffer
    }

    if (is_locked) {
      setDisplayState("locked");
      setIsAnimatingLock(true);
      setMouseReEntered(false);
      // Animation duration for lock icon is typically 300-500ms
      animationTimerRef.current = setTimeout(() => {
        setIsAnimatingLock(false);
        animationTimerRef.current = null;
      }, 600);
    } else if (prevLockedRef.current === true) {
      setDisplayState("unlocked");
      timerRef.current = setTimeout(() => {
        setDisplayState("neutral");
        timerRef.current = null;
      }, 600);
    } else {
      setDisplayState("neutral");
    }

    prevLockedRef.current = is_locked;
  }, [is_locked]);

  const handleButtonClick = useCallback(() => {
    if (canShowRecursiveOptions) {
      setShowLockOptions((prev) => !prev);
    } else {
      toggleLock({ recursive: false });
      setShowLockOptions(false);
    }
  }, [canShowRecursiveOptions, toggleLock]);

  const handleLockOption = useCallback(
    (recursive: boolean) => {
      toggleLock({ recursive });
      setShowLockOptions(false);
    },
    [toggleLock]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHoveringLocked(true);
    if (!isAnimatingLock) {
      setMouseReEntered(true);
    }
  }, [isAnimatingLock]);

  const handleMouseLeave = useCallback(() => {
    setIsHoveringLocked(false);
  }, []);

  // Common button/text styles to ensure consistent sizing
  const textBaseClass = "text-caption-sm-medium leading-none flex items-center relative top-[1px]";

  if (is_locked && !canCurrentUserLockPage) {
    return (
      <Tooltip tooltipContent="You don't have the permission to unlock this page" position="bottom">
        <Button variant="tertiary" size="sm" prependIcon={<LockKeyhole />} disabled>
          Locked
        </Button>
      </Tooltip>
    );
  }

  if (!is_locked && !canCurrentUserLockPage) return null;

  const actionText = is_locked ? "Unlock" : "Lock";

  const shouldShowHoverEffect = isHoveringLocked && !isAnimatingLock && mouseReEntered;

  return (
    <div className="relative">
      {/* Render the correct button based on display state, inlined */}
      {displayState === "neutral" && (
        <Tooltip tooltipContent="Lock page" position="bottom" disabled={canShowRecursiveOptions && showLockOptions}>
          <IconButton
            variant={canShowRecursiveOptions && showLockOptions ? "tertiary" : "ghost"}
            size="lg"
            icon={LockKeyhole}
            onClick={handleButtonClick}
            aria-label="Lock"
          />
        </Tooltip>
      )}
      {displayState === "locked" && (
        <Button
          variant="secondary"
          size="lg"
          onClick={handleButtonClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          // className={cn("text-accent-primary bg-accent-primary/20 hover:bg-accent-primary/30", {
          //   "bg-accent-primary/30": canShowRecursiveOptions && showLockOptions,
          // })}
          prependIcon={
            shouldShowHoverEffect || (canShowRecursiveOptions && showLockOptions) ? (
              <LockKeyholeOpen />
            ) : (
              <LockKeyhole />
            )
          }
          aria-label={shouldShowHoverEffect ? "Unlock" : "Locked"}
        >
          <span
            className={cn(
              textBaseClass,
              !shouldShowHoverEffect && !canShowRecursiveOptions && justLocked && "animate-text-slide-in"
            )}
          >
            {shouldShowHoverEffect || (canShowRecursiveOptions && showLockOptions) ? "Unlock" : "Locked"}
          </span>
        </Button>
      )}
      {displayState === "unlocked" && (
        <Button
          variant="ghost"
          size="lg"
          className="text-secondary animate-fade-out"
          prependIcon={<LockKeyholeOpen />}
          aria-label="Unlocked"
          disabled
        >
          <span className={cn(textBaseClass, "animate-text-slide-in animate-text-fade-out")}>Unlocked</span>
        </Button>
      )}

      {canShowRecursiveOptions && showLockOptions && (
        <div ref={lockOptionsRef} className="absolute top-full right-0 mt-1 z-10 animate-slide-up">
          <div className="my-1 overflow-hidden rounded-md border-[0.5px] border-subtle bg-surface-1 px-2 py-2.5 shadow-raised-200 focus:outline-hidden min-w-[180px]">
            {(() => {
              const LockIcon = is_locked ? LockKeyholeOpen : LockKeyhole;
              const menuItemClasses =
                "w-full select-none truncate rounded-xs px-1 py-1.5 text-left text-secondary hover:bg-layer-1-hover hover:text-primary focus:outline-hidden flex items-center gap-2 transition-colors";

              return (
                <>
                  <button type="button" onClick={() => handleLockOption(false)} className={menuItemClasses}>
                    <LockIcon className="size-3.5 shrink-0" />
                    <span className="text-caption-sm-regular leading-none flex items-center">{`Just ${actionText.toLowerCase()} this page`}</span>
                  </button>
                  {hasSubpages && (
                    <button type="button" onClick={() => handleLockOption(true)} className={menuItemClasses}>
                      {is_locked ? (
                        <FolderOpen className="size-3.5 shrink-0" />
                      ) : (
                        <FolderLock className="size-3.5 shrink-0" />
                      )}
                      <span className="text-caption-sm-regular leading-none flex items-center">{`${actionText} page and all subpages`}</span>
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
});
