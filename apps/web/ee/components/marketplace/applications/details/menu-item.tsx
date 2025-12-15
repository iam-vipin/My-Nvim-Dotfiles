import type { FC } from "react";
import { observer } from "mobx-react";
// components
import { cn } from "@plane/utils";
import type { TPopoverMenuOptions } from "@/plane-web/components/marketplace";
// helpers

export const ApplicationTileMenuItem = observer(function ApplicationTileMenuItem(props: TPopoverMenuOptions) {
  const { type, label = "", isActive, prependIcon, appendIcon, onClick, isDanger } = props;

  if (!isActive) {
    return <></>;
  }

  if (type === "menu-item")
    return (
      <div
        className={cn(
          "flex items-center gap-2 cursor-pointer mx-2 px-2 p-1 transition-all rounded-sm hover:bg-layer-1",
          isDanger ? " text-red-500" : " text-secondary"
        )}
        onClick={() => onClick && onClick()}
      >
        {prependIcon && prependIcon}
        <div
          className={cn(
            "whitespace-nowrap text-body-xs-regular text-secondary",
            isDanger ? "text-red-500" : "text-secondary"
          )}
        >
          {label}
        </div>
        {appendIcon && <div className="ml-auto">{appendIcon}</div>}
      </div>
    );

  return <div className="border-b border-subtle" />;
});
