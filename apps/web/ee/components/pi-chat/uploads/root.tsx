import { observer } from "mobx-react";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { ImagePreview } from "./image-preview";
import { TemplatePreview } from "./template-preview";

type Props = {
  attachmentId: string;
  onRemove?: (id: string) => void;
};

export const PreviewUploads = observer((props: Props) => {
  const { attachmentId, onRemove } = props;
  const {
    attachmentStore: { getAttachmentById },
  } = usePiChat();
  const attachment = getAttachmentById(attachmentId);
  if (!attachment) return null;
  if (attachment.file_type.includes("image"))
    return <ImagePreview attachment={attachment} onRemove={onRemove ? () => onRemove(attachmentId) : undefined} />;
  return <TemplatePreview attachment={attachment} onRemove={onRemove ? () => onRemove(attachmentId) : undefined} />;
});
