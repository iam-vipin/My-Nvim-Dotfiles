/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
// ui
import type { TContextMenuItem } from "@plane/ui";
import { ContextMenu, CustomMenu } from "@plane/ui";
// helpers
import { cn } from "@plane/utils";

export interface Props {
  parentRef: React.RefObject<HTMLElement>;
  MENU_ITEMS: TContextMenuItem[];
}

export const WorkspaceDraftIssueQuickActions = observer(function WorkspaceDraftIssueQuickActions(props: Props) {
  const { parentRef, MENU_ITEMS } = props;

  const { t } = useTranslation();

  return (
    <>
      <ContextMenu parentRef={parentRef} items={MENU_ITEMS} />
      <CustomMenu
        ellipsis
        placement="bottom-end"
        menuItemsClassName="z-[14]"
        maxHeight="lg"
        useCaptureForOutsideClick
        closeOnSelect
      >
        {MENU_ITEMS.map((item) => (
          <CustomMenu.MenuItem
            key={item.key}
            onClick={() => {
              item.action();
            }}
            className={cn(
              "flex items-center gap-2",
              {
                "text-placeholder": item.disabled,
              },
              item.className
            )}
            disabled={item.disabled}
          >
            {item.icon && <item.icon className={cn("h-3 w-3", item.iconClassName)} />}
            <div>
              <h5>{t(item.title || "")}</h5>
              {item.description && (
                <p
                  className={cn("text-tertiary whitespace-pre-line", {
                    "text-placeholder": item.disabled,
                  })}
                >
                  {item.description}
                </p>
              )}
            </div>
          </CustomMenu.MenuItem>
        ))}
      </CustomMenu>
    </>
  );
});
