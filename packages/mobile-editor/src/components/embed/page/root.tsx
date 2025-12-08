import { FileText } from "lucide-react";
import { observer } from "mobx-react";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ArchiveIcon, EmptyPageIcon, RestrictedPageIcon } from "@plane/propel/icons";
// ui
import { Loader, Logo } from "@plane/ui";
// utils
import { cn } from "@plane/utils";
// components
import { Badge } from "@/components/common";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { getPageName, callNative } from "@/helpers";
// store
import { usePages } from "@/hooks/store";

type Props = {
  pageId: string;
  workspaceSlug: string;
  projectId?: string;
  currentUserId: string;
  isNestedPagesEnabled: boolean;
  onPageDrop?: (droppedPageId: string) => void;
};

type PageDisplayState = {
  logo?: React.ReactNode;
  badge?: React.ReactNode;
  text: string;
};

export const PageEmbedCardRoot = observer(function PageEmbedCardRoot(props: Props) {
  const { workspaceSlug, pageId, projectId, isNestedPagesEnabled } = props;
  // store hooks
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getSubPageById, fetchPageDetails } = usePages();
  // computed values
  const page = getSubPageById(pageId);

  // Touch handling state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const [displayState, setDisplayState] = useState<PageDisplayState>({
    text: getPageName(page?.name),
  });

  const canCurrentUserAccessPage = useMemo(() => page?.canCurrentUserAccessPage(), [page]);

  const fetchPageEmbed = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchPageDetails({
        workspaceSlug: workspaceSlug,
        pageId: pageId,
        projectId: projectId,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceSlug, pageId, projectId, fetchPageDetails]);

  useEffect(() => {
    if (!pageId || !workspaceSlug) return;
    if (!page) fetchPageEmbed();
  }, [pageId, projectId, workspaceSlug, page, fetchPageEmbed]);

  useEffect(() => {
    const getDisplayState = (): PageDisplayState => {
      if (!isNestedPagesEnabled) {
        return {
          text: "Upgrade your plan to view this nested page",
          logo: <RestrictedPageIcon className="size-4" />,
        };
      } else if (page?.archivedAt && canCurrentUserAccessPage) {
        return {
          text: getPageName(page?.name),
          badge: <Badge text="Archived" icon={<ArchiveIcon className="size-2.5 text-custom-text-300" />} />,
        };
      } else if (!canCurrentUserAccessPage && page?.id) {
        return {
          logo: <RestrictedPageIcon className="size-4" />,
          text: "Restricted Page",
        };
      }
      return {
        text: getPageName(page?.name),
      };
    };

    setDisplayState(getDisplayState());
  }, [
    page?.name,
    page?.archivedAt,
    canCurrentUserAccessPage,
    page?.id,
    page?.isDescriptionEmpty,
    isNestedPagesEnabled,
  ]);

  // Function to determine the appropriate logo to display
  const pageEmbedLogo = useMemo(() => {
    let logo;
    if (displayState.logo) {
      logo = displayState.logo;
    } else if (page?.logoProps?.in_use) {
      logo = <Logo logo={page?.logoProps} size={16} type="lucide" />;
    } else if (!page?.isDescriptionEmpty) {
      logo = <FileText size={16} type="lucide" />;
    } else {
      logo = <EmptyPageIcon className="size-4" />;
    }
    return logo;
  }, [displayState, page?.logoProps, page?.isDescriptionEmpty]);

  // Handle the actual click/tap action
  const handlePageEmbedClick = useCallback(() => {
    if (!isNestedPagesEnabled) return;
    callNative(
      CallbackHandlerStrings.onPageEmbedClick,
      JSON.stringify({
        pageId: pageId,
        projectId: projectId,
        pageTitle: page?.name,
      })
    );
  }, [pageId, projectId, page?.name, isNestedPagesEnabled]);

  if (page?.name == null) {
    return (
      <Loader className="not-prose relative h-10 page-embed cursor-pointer rounded-md py-2 px-2 my-1.5 transition-colors flex items-center gap-1.5 !no-underline hover:bg-custom-background-80 w-full bg-custom-background-80">
        <Loader.Item className="h-9" />
      </Loader>
    );
  }

  if (!page && isLoading)
    return (
      <div className="rounded-md my-4">
        <Loader>
          <Loader.Item height="30px" />
          <div className="mt-3 space-y-2">
            <Loader.Item height="15px" width="70%" />
          </div>
        </Loader>
      </div>
    );

  if (!page && !isLoading)
    return (
      <div className="flex items-center justify-start gap-2 py-3 px-2 rounded-lg text-red-500 bg-red-500/10 border border-dashed border-red-500/20 transition-all duration-200 ease-in-out cursor-default">
        Error loading page
      </div>
    );

  return (
    <div
      className={cn(
        "not-prose relative page-embed cursor-pointer rounded-md py-2 px-2 my-1.5 transition-colors flex items-center gap-1.5 !no-underline hover:bg-custom-background-90"
      )}
      onTouchStart={(event) => {
        // Record touch start position and time
        const touch = event.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        event.preventDefault();
        event.stopPropagation();
      }}
      onTouchEnd={(event) => {
        // Check if this is a valid tap
        if (!touchStartRef.current) return;

        const touch = event.changedTouches[0];
        const timeDiff = Date.now() - touchStartRef.current.time;
        const distance = Math.sqrt(
          Math.pow(touch.clientX - touchStartRef.current.x, 2) + Math.pow(touch.clientY - touchStartRef.current.y, 2)
        );

        // Valid tap: quick touch (< 500ms) and minimal movement (< 10px)
        if (timeDiff < 500 && distance < 10) {
          event.preventDefault();
          event.stopPropagation();
          handlePageEmbedClick();
        }

        // Reset touch state
        touchStartRef.current = null;
      }}
      onTouchMove={(event) => {
        // If user moves finger too much, cancel the tap
        if (!touchStartRef.current) return;

        const touch = event.touches[0];
        const distance = Math.sqrt(
          Math.pow(touch.clientX - touchStartRef.current.x, 2) + Math.pow(touch.clientY - touchStartRef.current.y, 2)
        );

        // If moved more than 10px, cancel the tap
        if (distance > 10) {
          touchStartRef.current = null;
        }
      }}
    >
      <div className="flex-shrink-0">{pageEmbedLogo}</div>
      <div className="flex items-center gap-3 truncate">
        <p className="not-prose text-base font-medium break truncate underline decoration-custom-text-300 underline-offset-4">
          {displayState.text}
        </p>
        <div className="flex-shrink-0">{displayState?.badge}</div>
      </div>
    </div>
  );
});
