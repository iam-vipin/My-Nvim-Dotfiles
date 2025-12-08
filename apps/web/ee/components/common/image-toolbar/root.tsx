import { useState } from "react";
import { CloseIcon } from "@plane/propel/icons";
// plane imports
import { cn } from "@plane/utils";
// local imports
import { ImageDownloadAction } from "./download";
import { ImageFullScreenActionRoot } from "./full-screen";

type Props = {
  aspectRatio?: number;
  downloadSrc: string;
  height?: string;
  src: string;
  width?: string;
  isFullScreenable: boolean;
  onRemove?: () => void;
} & (
  | {
      isFullScreenable: true;
      aspectRatio: number;
      height: string;
      width: string;
    }
  | {
      isFullScreenable: false;
    }
);

export function ImageToolbarRoot(props: Props) {
  const { downloadSrc, onRemove, isFullScreenable } = props;
  // states
  const [shouldShowToolbar, setShouldShowToolbar] = useState(false);
  // derived values

  return (
    <>
      <div
        className={cn(
          "absolute top-1 right-1 h-7 z-20 bg-black/80 rounded flex items-center gap-2 px-2 opacity-0 pointer-events-none group-hover/upload-component:opacity-100 group-hover/upload-component:pointer-events-auto transition-opacity",
          {
            "opacity-100 pointer-events-auto": shouldShowToolbar,
          }
        )}
      >
        <ImageDownloadAction src={downloadSrc} />
        {isFullScreenable && <ImageFullScreenActionRoot image={props} toggleToolbarViewStatus={setShouldShowToolbar} />}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 h-full grid place-items-center text-white/60 hover:text-white transition-colors"
            aria-label="Remove image"
          >
            <CloseIcon className="size-3" />
          </button>
        )}
      </div>
    </>
  );
}
