import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import useSWR from "swr";
import { EExternalEmbedAttributeNames, ExternalEmbedNodeViewProps, TExternalEmbedBlockAttributes } from "@plane/editor";
import { useUser } from "@/hooks/store/user";
import { liveService } from "@/plane-web/services/live.service";
import { EmbedData } from "./embed-handler";

export const useEmbedDataManager = (externalEmbedNodeView: ExternalEmbedNodeViewProps) => {
  // attributes
  const { src, [EExternalEmbedAttributeNames.EMBED_DATA]: storedEmbedData } = externalEmbedNodeView.node.attrs;
  // derived values
  const { resolvedTheme } = useTheme();
  const { workspaceSlug } = useParams();
  const { data: currentUser } = useUser();
  const isThemeDark = resolvedTheme?.startsWith("dark") ?? false;
  const userId = currentUser?.id;

  // SWR for fetching embed data
  const shouldFetch = src && !storedEmbedData;
  const swrKey = shouldFetch ? [src, isThemeDark, workspaceSlug.toString(), userId || ""] : null;

  const {
    data: iframelyData,
    error,
    isLoading,
  } = useSWR(
    swrKey,
    ([src, isThemeDark, workspaceSlug, userId]: [string, boolean, string, string]) =>
      liveService.getEmbedData(src, isThemeDark, workspaceSlug, userId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
    }
  );

  // Single useEffect for all attribute updates
  useEffect(() => {
    const updates: Partial<TExternalEmbedBlockAttributes> = {};

    // Handle successful data fetch
    if (iframelyData) {
      updates[EExternalEmbedAttributeNames.EMBED_DATA] = JSON.stringify(iframelyData);
      if (iframelyData?.meta?.site) {
        updates[EExternalEmbedAttributeNames.ENTITY_NAME] = iframelyData.meta.site;
      }
    }

    // Handle error state
    if (error) {
      const errorData = error as {
        response?: { data?: { error?: string; code?: string } };
        message?: string;
      };
      const defaultError = {
        error: errorData?.response?.data?.error || errorData?.message || "Failed to load embed",
        code: errorData?.response?.data?.code || "UNKNOWN_ERROR",
      };
      updates[EExternalEmbedAttributeNames.EMBED_DATA] = JSON.stringify(defaultError);
    }

    // Batch all updates in one call
    if (Object.keys(updates).length > 0) {
      externalEmbedNodeView.updateAttributes(updates);
    }
  }, [src, iframelyData, error, externalEmbedNodeView]);

  // Parse and return current embed data with Twitter theme handling
  const currentEmbedData: EmbedData = useMemo(() => {
    let data: EmbedData = null;
    if (storedEmbedData) {
      try {
        data = JSON.parse(storedEmbedData);
      } catch {}
    } else {
      data = iframelyData || null;
    }

    // Apply Twitter theme changes on-the-fly without updating attributes
    if (data && typeof data === "object" && "html" in data && data.html && data.html.includes("twitter-tweet")) {
      let updatedHtml = data.html;

      // Update theme based on current theme setting
      if (isThemeDark) {
        if (updatedHtml.includes('data-theme="light"')) {
          updatedHtml = updatedHtml.replace('data-theme="light"', 'data-theme="dark"');
        } else if (!updatedHtml.includes('data-theme="dark"')) {
          updatedHtml = updatedHtml.replace("twitter-tweet", 'twitter-tweet data-theme="dark"');
        }
      } else {
        if (updatedHtml.includes('data-theme="dark"')) {
          updatedHtml = updatedHtml.replace('data-theme="dark"', 'data-theme="light"');
        } else if (!updatedHtml.includes('data-theme="light"')) {
          updatedHtml = updatedHtml.replace("twitter-tweet", 'twitter-tweet data-theme="light"');
        }
      }

      // Return modified data for rendering (without persisting)
      if (updatedHtml !== data.html) {
        return { ...data, html: updatedHtml };
      }
    }

    return data;
  }, [storedEmbedData, iframelyData, isThemeDark]);

  return {
    isLoading,
    currentEmbedData,
    isThemeDark,
    updateAttributes: externalEmbedNodeView.updateAttributes,
  };
};
