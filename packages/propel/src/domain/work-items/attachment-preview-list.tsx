import type { FC } from "react";
import { AttachmentPreviewListItem } from "./attachment-preview-list-item";

export type TAttachmentPreviewStatus = "uploading" | "uploaded";

export type TAttachmentPreviewItem = {
  id: string;
  name: string;
  size: number;
  extension: string;
  status: TAttachmentPreviewStatus;
  assetId?: string;
};

type TAttachmentPreviewListProps = {
  items: TAttachmentPreviewItem[];
};

export function AttachmentPreviewList({ items }: TAttachmentPreviewListProps) {
  if (!items.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => (
        <AttachmentPreviewListItem key={item.id} item={item} />
      ))}
    </div>
  );
}
