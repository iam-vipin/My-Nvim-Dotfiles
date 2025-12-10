import { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import useSWR from "swr";
import { v4 as uuidv4 } from "uuid";
import { ArrowUp, Disc, Square } from "lucide-react";
import { E_FEATURE_FLAGS } from "@plane/constants";

import { PiChatEditorWithRef } from "@plane/editor";
import type { TPiChatEditorRefApi } from "@plane/editor";
import { cn, isCommentEmpty, joinUrlPath } from "@plane/utils";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web imports
import { useAppRouter } from "@/hooks/use-app-router";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import useEvent from "@/plane-web/hooks/use-event";
import type { TChatContextData, TFocus, TPiAttachment, TPiLoaders } from "@/plane-web/types";
// local imports
import { WithFeatureFlagHOC } from "../../feature-flags";
import AudioRecorder, { SPEECH_LOADERS } from "../converse/voice-input";
import { formatSearchQuery } from "../helper";
import { InputPreviewUploads } from "../uploads/input-preview-uploads";
import { DndWrapper } from "./dnd-wrapper";
import { FocusFilter } from "./focus-filter";
import { AiMode } from "./mode";
import { AttachmentActionButton } from "./quick-action-button";

type TEditCommands = {
  getHTML: () => string;
  clear: () => void;
};
type TProps = {
  isFullScreen: boolean;
  className?: string;
  activeChatId?: string;
  shouldRedirect?: boolean;
  isProjectLevel?: boolean;
  showProgress?: boolean;
  contextData?: TChatContextData;
};

export const InputBox = observer(function InputBox(props: TProps) {
  const {
    className,
    activeChatId,
    shouldRedirect = true,
    isProjectLevel = false,
    showProgress = false,
    isFullScreen = false,
    contextData,
  } = props;

  // store hooks
  const {
    isPiTyping,
    isLoading: isChatLoading,
    getAnswer,
    searchCallback,
    createNewChat,
    getChatFocus,
    fetchModels,
    abortStream,
    getChatMode,
    attachmentStore: { getAttachmentsUploadStatusByChatId },
  } = usePiChat();
  const { getWorkspaceBySlug } = useWorkspace();
  // router
  const { workspaceSlug, projectId, workItem, chatId: routeChatId } = useParams();
  const router = useRouter();
  const { getProjectByIdentifier } = useProject();
  const routerWithProgress = useAppRouter();
  const pathname = usePathname();
  // derived values
  const workspaceId = getWorkspaceBySlug(workspaceSlug)?.id;
  const [projectIdentifier] = workItem?.split("-") ?? [];
  const projectDetails = getProjectByIdentifier(projectIdentifier);
  const projectIdToUse = projectDetails?.id || projectId || "";
  const chatFocus = getChatFocus(activeChatId);
  const chatMode = getChatMode(activeChatId || "");
  const attachmentsUploadStatus = getAttachmentsUploadStatusByChatId(activeChatId || "");
  // state
  const [focus, setFocus] = useState<TFocus>(
    chatFocus || {
      isInWorkspaceContext: true,
      entityType: projectIdToUse ? "project_id" : "workspace_id",
      entityIdentifier: projectIdToUse?.toString() || workspaceId?.toString() || "",
    }
  );
  const [loader, setLoader] = useState<TPiLoaders>("");
  const [attachments, setAttachments] = useState<TPiAttachment[]>([]);
  const [aiMode, setAiMode] = useState<string>(chatMode);
  const [isEditorReady, setIsEditorReady] = useState(false);
  //ref
  const editorCommands = useRef<TEditCommands | null>(null);
  const editorRef = useRef<TPiChatEditorRefApi>(null);

  useSWR(`PI_MODELS`, () => fetchModels(workspaceId), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    errorRetryCount: 0,
  });

  const setEditorCommands = (command: TEditCommands) => {
    editorCommands.current = command;
  };

  const addContext = useCallback((): void => {
    if (!contextData) return;

    editorRef.current?.addChatContext({
      id: uuidv4(),
      label: contextData.subTitle || contextData.title || "",
      entity_identifier: contextData.id,
      target: contextData.type,
    });
  }, [contextData]);

  const handleSubmit = useEvent(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = editorCommands.current?.getHTML();
    if (
      isPiTyping ||
      loader === "submitting" ||
      ((!query || isCommentEmpty(query)) && !attachments.length) ||
      !workspaceId
    )
      return;
    let chatIdToUse = activeChatId;
    setLoader("submitting");
    if (!chatIdToUse) {
      chatIdToUse = await createNewChat(focus, aiMode, isProjectLevel, workspaceId);
    }
    // Don't redirect if we are in the floating chat window
    if (shouldRedirect && !routeChatId)
      (showProgress ? routerWithProgress : router).push(
        joinUrlPath(workspaceSlug?.toString(), isProjectLevel ? "projects" : "", "pi-chat", chatIdToUse)
      );
    const attachmentIds = attachments.map((attachment) => attachment.id);
    await getAnswer(
      chatIdToUse || "",
      query || "",
      focus,
      isProjectLevel,
      workspaceSlug?.toString(),
      workspaceId,
      pathname,
      attachmentIds,
      aiMode
    );
    editorCommands.current?.clear();
    addContext();
    setLoader("");
    setAttachments([]);
  });

  const handleAbortStream = (e?: React.FormEvent) => {
    e?.preventDefault();
    abortStream(activeChatId || "");
  };

  const getMentionSuggestions = useEvent(async (query) => {
    const response = await searchCallback(workspaceSlug.toString(), query, focus);
    return formatSearchQuery(response);
  });

  useEffect(() => {
    if (chatFocus) {
      const presentFocus = {
        isInWorkspaceContext: chatFocus.isInWorkspaceContext,
        entityType: chatFocus.entityType,
        entityIdentifier: chatFocus.entityIdentifier,
      };
      setFocus(presentFocus);
    }
    if (chatMode) {
      setAiMode(chatMode);
    }
  }, [isChatLoading, chatFocus]);

  // Adding context for the sidecar
  useEffect(() => {
    if (isEditorReady) {
      addContext();
    }
  }, [contextData, isEditorReady, addContext]);

  if (!workspaceId) return;
  return (
    <form
      className={cn(
        "bg-custom-background-100 flex flex-col absolute bottom-0 left-0 px-2 pb-3 md:px-0 rounded-xl w-full",
        className
      )}
    >
      <div className={cn("bg-custom-background-90 rounded-xl transition-[max-height] duration-100")}>
        {/* Audio Recorder Loader */}
        {SPEECH_LOADERS.includes(loader) && (
          <div className="flex gap-2 p-2 items-center">
            <Disc className="size-3 text-red-500" strokeWidth={3} />
            <span className="text-sm text-custom-text-300 font-medium">Recording...</span>
          </div>
        )}
        {/* Input Box */}
        <DndWrapper
          workspaceSlug={workspaceSlug?.toString()}
          workspaceId={workspaceId}
          chatId={activeChatId}
          setAttachments={setAttachments}
          isProjectLevel={isProjectLevel}
          mode={aiMode}
          createNewChat={createNewChat}
          focus={focus}
        >
          {(isUploading: boolean, open: () => void) => (
            <div
              className={cn(
                "bg-custom-background-100 rounded-xl p-3 flex flex-col gap-1 shadow-sm border-[0.5px] border-custom-border-200 justify-between h-fit",
                {
                  "min-h-[120px]": !SPEECH_LOADERS.includes(loader),
                }
              )}
            >
              {/* file input view */}
              {((attachmentsUploadStatus && attachmentsUploadStatus.length > 0) || attachments?.length > 0) && (
                <div className="mb-2">
                  <InputPreviewUploads
                    chatId={activeChatId}
                    attachments={attachments}
                    setAttachments={setAttachments}
                  />
                </div>
              )}
              {/* Focus */}
              {!SPEECH_LOADERS.includes(loader) && (
                <div className="mb-2 w-fit">
                  <FocusFilter
                    workspaceId={workspaceId}
                    projectId={projectIdToUse}
                    focus={focus}
                    setFocus={setFocus}
                    isLoading={isChatLoading && !!activeChatId}
                  />
                </div>
              )}
              {/* editor view */}
              <PiChatEditorWithRef
                setEditorCommand={(command) => {
                  setEditorCommands({ ...command });
                }}
                handleSubmit={handleSubmit}
                searchCallback={getMentionSuggestions}
                className={cn("flex-1  max-h-[250px] min-h-[50px]", {
                  "absolute w-0": SPEECH_LOADERS.includes(loader),
                })}
                onEditorReady={() => setIsEditorReady(true)}
                ref={editorRef}
              />
              <div className="flex w-full gap-3 justify-between">
                {/* Focus */}
                {!SPEECH_LOADERS.includes(loader) && <AiMode aiMode={aiMode} setAiMode={setAiMode} />}
                <div className="flex items-center w-full justify-end gap-2">
                  <div className="flex w-full justify-end">
                    {/* speech recorder */}
                    <WithFeatureFlagHOC
                      workspaceSlug={workspaceSlug?.toString()}
                      flag={E_FEATURE_FLAGS.PI_CONVERSE}
                      fallback={<></>}
                    >
                      <AudioRecorder
                        workspaceId={workspaceId}
                        chatId={activeChatId}
                        editorRef={editorRef}
                        createNewChat={createNewChat}
                        isProjectLevel={isProjectLevel}
                        loader={loader}
                        setLoader={setLoader}
                        isFullScreen={isFullScreen}
                        focus={focus}
                        mode={aiMode}
                      />
                    </WithFeatureFlagHOC>
                    {!SPEECH_LOADERS.includes(loader) && (
                      <WithFeatureFlagHOC
                        workspaceSlug={workspaceSlug?.toString()}
                        flag={E_FEATURE_FLAGS.PI_FILE_UPLOADS}
                        fallback={<></>}
                      >
                        {workspaceId && <AttachmentActionButton open={open} isLoading={isUploading} />}
                      </WithFeatureFlagHOC>
                    )}
                  </div>
                  {!SPEECH_LOADERS.includes(loader) && (
                    <button
                      className={cn(
                        "rounded-full bg-pi-700 text-white size-8 flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        {
                          "bg-custom-background-80": isPiTyping || loader === "submitting",
                        }
                      )}
                      type="submit"
                      onClick={isPiTyping ? handleAbortStream : handleSubmit}
                      disabled={loader === "submitting"}
                    >
                      {!isPiTyping || loader === "submitting" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <Square size={16} className={cn("fill-custom-text-200 transition-all")} stroke={"0"} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DndWrapper>
      </div>
    </form>
  );
});
