import type { FC } from "react";
import { Loader2 } from "lucide-react";
import type { TAttachmentPreviewItem } from "./attachment-preview-list";
import { getAttachmentIcon } from "./helpers";

type TAttachmentPreviewListItemProps = {
  item: TAttachmentPreviewItem;
};

export const AttachmentPreviewListItem: FC<TAttachmentPreviewListItemProps> = ({ item }) => {
  const { extension, name, size, status } = item;
  const Icon = getAttachmentIcon(extension);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-custom-border-200 bg-custom-background-95 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon className="size-6 shrink-0 text-custom-text-400" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-custom-text-200">{name}</span>
          <span className="text-xs text-custom-text-400">{formatBytes(size)}</span>
        </div>
      </div>
      {status === "uploading" && (
        <div className="flex items-center gap-2 text-xs text-custom-text-300">
          <Loader2 className="size-4 animate-spin text-custom-text-400" />
          Uploading
        </div>
      )}
    </div>
  );
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};
