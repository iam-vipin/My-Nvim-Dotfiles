import { useState } from "react";
import { observer } from "mobx-react";
import { useParams, useRouter } from "next/navigation";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore } from "@plane/ui";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";

interface IChatDelete {
  chatId: string;
  workspaceSlug: string;
  chatTitle: string;
  isOpen: boolean;
  handleClose: () => void;
}

export const ChatDeleteModal = observer(function ChatDeleteModal(props: IChatDelete) {
  const { chatId, workspaceSlug, isOpen, chatTitle, handleClose } = props;

  // states
  const [loader, setLoader] = useState(false);
  // hooks
  const { deleteChat } = usePiChat();
  const { chatId: activeChatId } = useParams();
  const router = useRouter();

  const formSubmit = async () => {
    setLoader(true);
    try {
      await deleteChat(chatId, workspaceSlug);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success!",
        message: "Chat deleted successfully.",
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Warning!",
        message: "Something went wrong please try again later.",
      });
    }
    if (activeChatId === chatId) {
      router.push(`/${workspaceSlug}/pi-chat`);
    }
    setLoader(false);
    handleClose();
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={formSubmit}
      isSubmitting={loader}
      isOpen={isOpen}
      title="Delete chat"
      content={
        <>
          Are you sure you want to delete the chat{' "'}
          <span className="break-words font-medium text-primary">{chatTitle}</span>
          {'"'}? All of the data related to the chat will be permanently removed. This action cannot be undone.
        </>
      }
    />
  );
});
