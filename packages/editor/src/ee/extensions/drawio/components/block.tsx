import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useDrawioAwareness } from "../hooks/use-awareness";
import { useDrawioMessageHandler } from "../hooks/use-drawio-message-handler";
// types
import { EDrawioAttributeNames, EDrawioMode } from "../types";
// constants
import { DRAWIO_DIAGRAM_URL, DRAWIO_BOARD_URL } from "../utils/constants";
// components
import type { DrawioIframeRef } from "./iframe";
import { DrawioIframe } from "./iframe";
import { DrawioInputBlock } from "./input-block";
import { DrawioIframeLoading } from "./loading";
import type { DrawioNodeViewProps } from "./node-view";
import { DrawioDialogWrapper } from "./wrapper";

export const DrawioBlock = memo(function DrawioBlock(props: DrawioNodeViewProps) {
  // props
  const { node, updateAttributes, editor, selected, extension } = props;
  const { getDiagramSrc, getFileContent, isFlagged, onClick, logoSpinner } = extension.options;

  // state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingImageSrc, setIsGettingImageSrc] = useState(false);
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | undefined>(undefined);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasErroredOnFirstLoad, setHasErroredOnFirstLoad] = useState(false);

  // refs
  const iframeRef = useRef<DrawioIframeRef>(null);
  // attribute
  const diagramId = node.attrs[EDrawioAttributeNames.ID];
  const imageSrc = node.attrs[EDrawioAttributeNames.IMAGE_SRC];
  const xmlSrc = node.attrs[EDrawioAttributeNames.XML_SRC];
  const mode = node.attrs[EDrawioAttributeNames.MODE];
  // hooks
  const {
    userEditingThisDiagram,
    setEditingState,
    broadcastDiagramUpdate,
    liveImageData,
    imageKey,
    failedToLoadDiagram,
    clearLiveImageData,
    updateImageKey,
    updateLiveImageData,
    setDiagramError,
    handleBlockedClick,
  } = useDrawioAwareness(editor, diagramId || null);

  // Check if diagram is uploaded (has imageSrc attribute)
  const isUploaded = !!imageSrc;

  // Computed loading states
  const showImageLoader = !(resolvedImageSrc || liveImageData) || !initialLoadComplete || hasErroredOnFirstLoad;

  // Local-first approach: Only resolve backend URL if we don't have local data
  useEffect(() => {
    // If we have live image data from iframe or awareness, don't fetch from backend
    if (liveImageData) {
      setResolvedImageSrc(undefined);
      setDiagramError(false);
      return;
    }

    // Only fetch from backend if we have no local data and have an imageSrc
    if (!imageSrc) {
      setResolvedImageSrc(undefined);
      clearLiveImageData();
      return;
    }

    const getSvgSource = async () => {
      try {
        const url = await getDiagramSrc?.(imageSrc);
        setResolvedImageSrc(url);
        setDiagramError(false);
        setIsGettingImageSrc(false);
      } catch (_error) {
        setDiagramError(true);
        setIsGettingImageSrc(false);
      }
    };
    setIsGettingImageSrc(true);
    getSvgSource();
  }, [imageSrc, getDiagramSrc, imageKey, clearLiveImageData, setDiagramError, liveImageData]);

  // Load XML content for editing
  const loadXmlContent = useCallback(async (): Promise<string> => {
    if (!xmlSrc || !getFileContent) return "";

    try {
      return await getFileContent(xmlSrc);
    } catch (error) {
      console.error("Error loading XML content:", error);
      return "";
    }
  }, [xmlSrc, getFileContent]);

  const handleCloseModal = useCallback(() => {
    setEditingState(false);
    setIsModalOpen(false);
    setIsLoading(false);
  }, [setEditingState]);

  const handleImageLoad = useCallback(() => {
    setInitialLoadComplete(true);
    setHasErroredOnFirstLoad(false);
  }, []);

  // Message handler hook
  const { handleMessage } = useDrawioMessageHandler({
    diagramId: diagramId || undefined,
    imageSrc: imageSrc || undefined,
    xmlSrc: xmlSrc || undefined,
    iframeRef,
    loadXmlContent,
    handleCloseModal,
    setIsLoading,
    updateLiveImageData,
    updateImageKey,
    broadcastDiagramUpdate,
    updateAttributes,
    extension,
  });

  const handleClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      if (!editor.isEditable || isFlagged || userEditingThisDiagram) return;

      // If onClick is provided from extension options, only call that and return early
      if (onClick) {
        onClick();
        return;
      }

      setEditingState(true);
      setIsModalOpen(true);
      setIsLoading(true);
    },
    [editor.isEditable, isFlagged, onClick, setEditingState, userEditingThisDiagram]
  );

  const getClickHandler = useCallback(() => {
    if (userEditingThisDiagram) return handleBlockedClick;
    if (isFlagged) return undefined;
    return handleClick;
  }, [userEditingThisDiagram, handleBlockedClick, isFlagged, handleClick]);

  // If failed to load, show error state
  if (failedToLoadDiagram && isUploaded) {
    return (
      <div className="relative">
        <div className="flex items-center justify-center p-4 border border-red-300 rounded-md bg-red-50">
          <span className="text-red-600">Failed to load diagram</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="relative">
        {/* Editing labels */}
        {userEditingThisDiagram && (
          <div
            className="absolute z-20 rounded px-2 py-1 text-xs font-medium text-black shadow-sm pointer-events-none whitespace-nowrap -top-[28px]"
            style={{
              backgroundColor: userEditingThisDiagram.color,
            }}
          >
            {userEditingThisDiagram.name} is editing
          </div>
        )}

        {userEditingThisDiagram && (
          <div
            className="absolute inset-0 pointer-events-none rounded-md animate-pulse z-[5]"
            style={{
              boxShadow: `0 0 0 2px ${userEditingThisDiagram.color}80, 0 0 8px ${userEditingThisDiagram.color}40`,
            }}
          />
        )}
        {(isUploaded || liveImageData) && (liveImageData || resolvedImageSrc) ? (
          <>
            {showImageLoader && (
              <div className="p-0.5">
                <Loader>
                  <Loader.Item width="100%" height="40px" />
                </Loader>
              </div>
            )}
            <img
              key={imageKey}
              src={liveImageData || `${resolvedImageSrc}`}
              alt="Drawio diagram"
              title="Diagram"
              onLoad={handleImageLoad}
              className={cn(
                "rounded-md shadow-sm border border-custom-border-200 max-w-full h-auto transition-all duration-200",
                {
                  hidden: showImageLoader, // Hide until loaded
                  "opacity-50": userEditingThisDiagram,
                  "cursor-not-allowed": editor.isEditable && userEditingThisDiagram,
                  "cursor-pointer": editor.isEditable && !userEditingThisDiagram,
                  "cursor-default": !editor.isEditable,
                }
              )}
              onClick={getClickHandler()}
            />
          </>
        ) : !isGettingImageSrc && !liveImageData && !imageSrc ? (
          <DrawioInputBlock
            selected={selected}
            isEditable={editor.isEditable}
            handleDrawioButtonClick={handleClick}
            mode={mode}
            isFlagged={isFlagged}
          />
        ) : null}
      </div>

      <DrawioDialogWrapper isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="relative w-full h-full">
          <DrawioIframe
            ref={iframeRef}
            src={mode === EDrawioMode.BOARD ? DRAWIO_BOARD_URL : DRAWIO_DIAGRAM_URL}
            onMessage={handleMessage}
            isVisible={!isLoading}
          />
          {isLoading && <DrawioIframeLoading LoadingComponent={logoSpinner} />}
        </div>
      </DrawioDialogWrapper>
    </>
  );
});
