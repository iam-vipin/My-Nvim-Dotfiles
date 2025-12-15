import { useRef, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil, Star, Trash } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TContextMenuItem } from "@plane/ui";
import { CustomMenu, EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { calculateTimeAgo, cn } from "@plane/utils";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TUserThreads } from "@/plane-web/types";
import { ChatDeleteModal } from "../modals/delete-modal";
import { EditForm } from "../modals/edit-form";

type TProps = {
  thread: TUserThreads;
};

export const PiChatListItem = observer(function PiChatListItem(props: TProps) {
  const { thread } = props;
  // refs
  const parentRef = useRef<HTMLDivElement>(null);
  // router
  const { workspaceSlug } = useParams();
  const { t } = useTranslation();
  // states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // hooks
  const { favoriteChat, unfavoriteChat } = usePiChat();
  const { getWorkspaceBySlug } = useWorkspace();
  // derived
  const workspaceId = getWorkspaceBySlug(workspaceSlug)?.id;

  const handleFavorite = async () => {
    if (thread.is_favorite) {
      await unfavoriteChat(thread.chat_id, workspaceId);
    } else {
      await favoriteChat(thread.chat_id, workspaceId);
    }
    setToast({
      title: thread.is_favorite ? t("favorite_removed_successfully") : t("favorite_created_successfully"),
      type: TOAST_TYPE.SUCCESS,
    });
  };

  const MENU_ITEMS: TContextMenuItem[] = [
    {
      key: "rename",
      title: t("edit"),
      icon: Pencil,
      action: () => setIsEditModalOpen(true),
    },
    {
      key: "favorite",
      action: () => handleFavorite(),
      title: thread.is_favorite ? "Remove from favorites" : "Favorite",
      icon: Star,
      iconClassName: thread.is_favorite ? "fill-yellow-500 stroke-yellow-500" : "",
    },
    {
      key: "delete",
      action: () => setIsDeleteModalOpen(true),
      title: t("delete"),
      icon: Trash,
    },
  ];
  return (
    <>
      <ChatDeleteModal
        chatId={thread.chat_id}
        workspaceSlug={workspaceSlug?.toString()}
        isOpen={isDeleteModalOpen}
        chatTitle={thread.title || ""}
        handleClose={() => setIsDeleteModalOpen(false)}
      />
      <ModalCore
        isOpen={isEditModalOpen}
        handleClose={() => setIsEditModalOpen(false)}
        position={EModalPosition.TOP}
        width={EModalWidth.SM}
      >
        <EditForm
          chatId={thread.chat_id}
          title={thread.title || ""}
          handleModalClose={() => setIsEditModalOpen(false)}
          workspaceId={workspaceId}
        />
      </ModalCore>
      <div className="flex justify-between items-end w-full" ref={parentRef}>
        <Link
          key={`${thread.chat_id}-${thread.last_modified}`}
          href={`/${workspaceSlug}/pi-chat/${thread.chat_id}`}
          className={cn(
            "w-full overflow-hidden py-4 flex-1 flex flex-col items-start gap-1 text-secondary truncate hover:text-secondary hover:bg-layer-1 pointer"
          )}
        >
          <div className="truncate text-14 overflow-hidden"> {thread.title || "No title"}</div>
          <div className="text-13 text-tertiary font-medium"> {calculateTimeAgo(thread.last_modified)}</div>
        </Link>
        <div className="py-4">
          <CustomMenu ellipsis placement="bottom-end" closeOnSelect maxHeight="lg">
            {MENU_ITEMS.map((item) => {
              if (item.shouldRender === false) return null;
              return (
                <CustomMenu.MenuItem
                  key={item.key}
                  onClick={() => {
                    item.action();
                  }}
                  className={cn(
                    "flex items-center gap-2",
                    {
                      "text-placeholder": item.disabled,
                    },
                    item.className
                  )}
                  disabled={item.disabled}
                >
                  {item.icon && <item.icon className={cn("h-3 w-3", item.iconClassName)} />}
                  <div>
                    <h5>{item.title}</h5>
                    {item.description && (
                      <p
                        className={cn("text-tertiary whitespace-pre-line", {
                          "text-placeholder": item.disabled,
                        })}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </CustomMenu.MenuItem>
              );
            })}
          </CustomMenu>
        </div>
      </div>
    </>
  );
});
