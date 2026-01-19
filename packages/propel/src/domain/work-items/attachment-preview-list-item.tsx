import type { FC } from "react";
import { Loader2 } from "lucide-react";
import type { TAttachmentPreviewItem } from "./attachment-preview-list";
import { getAttachmentIcon } from "./helpers";

type TAttachmentPreviewListItemProps = {
  item: TAttachmentPreviewItem;
};

export function AttachmentPreviewListItem({ item }: TAttachmentPreviewListItemProps) {
  const { extension, name, size, status } = item;
  const Icon = getAttachmentIcon(extension);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-subtle-1 bg-layer-1 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon className="size-6 shrink-0 text-placeholder" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-13 font-medium text-secondary">{name}</span>
          <span className="text-11 text-placeholder">{formatBytes(size)}</span>
        </div>
      </div>
      {status === "uploading" && (
        <div className="flex items-center gap-2 text-11 text-tertiary">
          <Loader2 className="size-4 animate-spin text-placeholder" />
          Uploading
        </div>
      )}
    </div>
  );
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};
