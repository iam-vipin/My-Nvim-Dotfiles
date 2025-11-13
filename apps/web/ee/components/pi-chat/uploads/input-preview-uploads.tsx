import { observer } from "mobx-react";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TPiAttachment } from "@/plane-web/types/pi-chat";
import { ImagePreview } from "./image-preview";
import { PreviewUploads } from "./root";
import { TemplatePreview } from "./template-preview";

type Props = {
  chatId: string | undefined;
  attachments: TPiAttachment[];
  setAttachments: (attachments: TPiAttachment[]) => void;
};

export const InputPreviewUploads = observer((props: Props) => {
  const { chatId, attachments, setAttachments } = props;
  const {
    attachmentStore: { getAttachmentsUploadStatusByChatId },
  } = usePiChat();
  const attachmentsUploadStatus = chatId && getAttachmentsUploadStatusByChatId(chatId);

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <PreviewUploads
          attachmentId={attachment.id}
          key={attachment.id}
          onRemove={() => handleRemoveAttachment(attachment.id)}
        />
      ))}
      {attachmentsUploadStatus &&
        attachmentsUploadStatus?.map((attachment) =>
          attachment.file_type.includes("image") ? (
            <ImagePreview
              attachment={attachment}
              loadingPercentage={attachment.progress}
              key={attachment.id}
              isLoading
            />
          ) : (
            <TemplatePreview
              attachment={attachment}
              loadingPercentage={attachment.progress}
              key={attachment.id}
              isLoading
            />
          )
        )}
    </div>
  );
});
