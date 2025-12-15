import { DraftingCompass, Presentation } from "lucide-react";
import React from "react";
import { cn } from "@plane/utils";
import { EDrawioMode } from "../types";

type DrawioInputBlockProps = {
  selected: boolean;
  isEditable: boolean;
  handleDrawioButtonClick: (event: React.MouseEvent) => void;
  mode: EDrawioMode;
  isFlagged?: boolean;
};

export function DrawioInputBlock({
  selected,
  isEditable,
  handleDrawioButtonClick,
  mode,
  isFlagged = false,
}: DrawioInputBlockProps) {
  const borderColor =
    selected && isEditable ? "color-mix(in srgb, var(--border-color-accent-strong) 20%, transparent)" : undefined;

  return (
    <div
      className={cn(
        "flex items-center justify-start gap-2 py-3 px-2 my-2 rounded-lg text-tertiary bg-layer-2 border border-dashed transition-all duration-200 ease-in-out cursor-default",
        {
          "border-subtle-1": !(selected && isEditable),
          "hover:text-secondary hover:bg-layer-2-hover cursor-pointer": isEditable,
          "text-accent-secondary bg-accent-primary/10 border-accent-strong-200/10 hover:bg-accent-primary/10 hover:text-accent-secondary":
            selected && isEditable,
        }
      )}
      style={borderColor ? { borderColor } : undefined}
      contentEditable={false}
      role="button"
      onClick={isFlagged ? undefined : handleDrawioButtonClick}
    >
      {mode === EDrawioMode.BOARD ? (
        <Presentation className="size-4 shrink-0" />
      ) : (
        <DraftingCompass className="size-4 shrink-0" />
      )}
      <div className="text-base font-medium">
        {mode === EDrawioMode.BOARD ? "Click to start editing whiteboard" : "Click to start editing diagram"}
      </div>
    </div>
  );
}
