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
import { Templates } from "../conversation/new-conversation";

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
  onlyInput?: boolean;
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
    onlyInput = false,
  } = props;

  // store hooks
  const {
    isPiTyping,
    isLoading: isChatLoading,
    isNewChat,
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
  const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString() || "")?.id;
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

  const handleSubmit = useEvent(async (e?: React.FormEvent, queryArg?: string) => {
    e?.preventDefault();
    const query = queryArg || editorCommands.current?.getHTML();
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
    void getAnswer(
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

  const getMentionSuggestions = useEvent(async (query: string) => {
    const response = await searchCallback(workspaceSlug?.toString() || "", query, focus);
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
  }, [isChatLoading, chatFocus, chatMode]);

  // Adding context for the sidecar
  useEffect(() => {
    if (isEditorReady) {
      addContext();
    }
  }, [contextData, isEditorReady, addContext]);

  if (!workspaceId) return;
  return (
    <>
      <form
        className={cn(
          "bg-surface-1 flex flex-col px-2 md:px-0 rounded-xl w-full my-auto",
          {
            "absolute bottom-[32px] left-0": !isNewChat,
          },
          className
        )}
      >
        {isNewChat && !onlyInput && (
          <div className="flex flex-col gap-2.5 mb-6">
            <div className={cn("text-center text-h2-medium text-tertiary", { "text-h3-semibold": !isFullScreen })}>
              What can I do for you?
            </div>
          </div>
        )}
        <div className={cn("bg-layer-1 rounded-xl transition-[max-height] duration-100")}>
          {/* Audio Recorder Loader */}
          {SPEECH_LOADERS.includes(loader) && (
            <div className="flex gap-2 p-2 items-center">
              <Disc className="size-3 text-red-500" strokeWidth={3} />
              <span className="text-caption-md-medium text-secondary">Recording...</span>
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
            showBg={isNewChat && !onlyInput}
          >
            {(isUploading: boolean, open: () => void) => (
              <div
                className={cn(
                  "bg-surface-1 rounded-xl p-3 flex flex-col gap-1 shadow-raised-100 border-[0.5px] border-subtle-1 justify-between h-fit",
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
                  setEditorCommand={(command: TEditCommands) => {
                    setEditorCommands({ ...command });
                  }}
                  handleSubmit={() => void handleSubmit()}
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
                          "rounded-full bg-accent-primary text-on-color size-8 flex items-center justify-center flex-shrink-0 transition-all duration-300 disabled:bg-layer-1 disabled:text-icon-secondary",
                          {
                            "bg-layer-1 text-icon-secondary": isPiTyping || loader === "submitting",
                          }
                        )}
                        type="submit"
                        onClick={isPiTyping ? void handleAbortStream : void handleSubmit}
                        disabled={loader === "submitting"}
                      >
                        {!isPiTyping || loader === "submitting" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <Square
                            size={16}
                            className={cn("text-icon-secondary transition-all")}
                            fill="currentColor"
                            strokeWidth={0}
                          />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DndWrapper>
        </div>
        {isNewChat && !onlyInput && (
          <Templates
            onClick={(query: string) => {
              const formattedQuery = `<p>${query}</p>`;
              editorRef.current?.clearEditor();
              editorRef.current?.setEditorValue(formattedQuery);
              void handleSubmit(undefined, formattedQuery);
            }}
          />
        )}
      </form>
      <div
        className={cn("w-full text-caption-sm-regular text-disabled pt-2 text-center bg-surface-1 h-[32px]", {
          "absolute bottom-0 left-[50%] translate-x-[-50%]": !onlyInput,
        })}
      >
        <div className="mx-auto max-w-[400px]">Plane AI can make mistakes, please double-check responses. </div>
      </div>
    </>
  );
});
