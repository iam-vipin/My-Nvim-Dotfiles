// components/WorkspaceAppSwitcher.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, Grip } from "lucide-react";
import { CustomMenu } from "@plane/ui";
import { cn } from "@plane/utils";
import type { AppSidebarItemData } from "@/components/sidebar/sidebar-item";
import { useAppRailVisibility } from "@/lib/app-rail/context";
import { withDockItems } from "../app-rail";

type Props = {
  dockItems: (AppSidebarItemData & { shouldRender: boolean })[];
};

const Component = ({ dockItems }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggleAppRail } = useAppRailVisibility();
  const router = useRouter();

  return (
    <CustomMenu
      customButton={
        <button
          type="button"
          className={cn(
            "flex items-center justify-center size-7 rounded bg-custom-background-90 hover:bg-custom-background-80 outline-none",
            {
              "bg-custom-background-80": isMenuOpen,
            }
          )}
        >
          <Grip className="size-5 text-custom-sidebar-text-300" />
        </button>
      }
      menuButtonOnClick={() => !isMenuOpen && setIsMenuOpen(true)}
      onMenuClose={() => setIsMenuOpen(false)}
      placement="bottom-start"
      closeOnSelect
      optionsClassName="min-w-48 rounded-lg"
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-0.5 pb-1">
          {dockItems
            .filter((item) => item.shouldRender)
            .map((item) => (
              <CustomMenu.MenuItem
                key={item.label}
                onClick={() => item.href && router.push(item.href)}
                className={cn(
                  "group flex items-center justify-between gap-2 rounded-md hover:bg-custom-background-90",
                  {
                    "text-custom-text-200": item.isActive,
                  }
                )}
              >
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <div
                      className={cn("flex items-center justify-center size-8 rounded-md", {
                        "bg-custom-primary-100/20 text-custom-primary-100": item.isActive,
                        "bg-custom-background-80": !item.isActive,
                      })}
                    >
                      <span
                        className={cn("size-5", {
                          "text-custom-primary-100": item.isActive,
                          "text-custom-text-300": !item.isActive,
                        })}
                      >
                        {item.icon}
                      </span>
                    </div>
                  )}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {/* check icon */}
                {item.isActive && (
                  <span className="flex items-center justify-center px-2">
                    <CheckIcon className="size-4 text-custom-text-300" />
                  </span>
                )}
              </CustomMenu.MenuItem>
            ))}
        </div>
        <div className="border-t border-custom-border-200 pt-1">
          <CustomMenu.MenuItem onClick={toggleAppRail}>
            <span className="text-xs">Dock App Rail</span>
          </CustomMenu.MenuItem>
        </div>
      </div>
    </CustomMenu>
  );
};

export const WorkspaceAppSwitcher = withDockItems(Component);
