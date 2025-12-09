import { File } from "lucide-react";
import { CircularProgressIndicator } from "@plane/ui";
import { ImageToolbarRoot } from "@/plane-web/components/common/image-toolbar";
import { useUploadStatus } from "@/plane-web/components/common/image-toolbar/use-upload-status";
import type { TPiAttachment } from "@/plane-web/types/pi-chat";

type Props = {
  attachment: TPiAttachment;
  isLoading?: boolean;
  loadingPercentage?: number;
  onRemove?: () => void;
};

function formatBytes(bytes: number | undefined | null): string {
  // Handle invalid input gracefully
  if (bytes === undefined || bytes === null || typeof bytes !== "number" || isNaN(bytes)) {
    return "Unknown size";
  }

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(2)} ${units[i]}`;
}

export function TemplatePreview(props: Props) {
  const { attachment, onRemove, isLoading = false, loadingPercentage } = props;
  const displayStatus = useUploadStatus(loadingPercentage ?? 0);
  return (
    <div className="relative group/upload-component flex gap-3 items-center bg-custom-background-90/60 rounded-lg p-2 min-w-[180px] h-[58px]">
      <div className="relative flex-shrink-0 rounded-md p-3 bg-custom-background-80/60">
        {isLoading ? (
          <CircularProgressIndicator size={20} strokeWidth={3} percentage={displayStatus ?? 0} />
        ) : (
          <File className="size-6 text-custom-text-400" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm text-custom-text-100 max-w-[150px] truncate">{attachment.filename}</h3>
        <p className="text-xs text-custom-text-300">{formatBytes(attachment.file_size)}</p>
      </div>

      <ImageToolbarRoot
        downloadSrc={attachment.attachment_url}
        src={attachment.attachment_url}
        onRemove={onRemove}
        isFullScreenable={false}
      />
    </div>
  );
}
