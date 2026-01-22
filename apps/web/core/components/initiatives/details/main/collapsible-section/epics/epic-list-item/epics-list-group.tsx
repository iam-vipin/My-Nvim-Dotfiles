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

import type { FC } from "react";
import { useState } from "react";
import { observer } from "mobx-react";
import { CircleDashed } from "lucide-react";
import { ALL_ISSUES } from "@plane/constants";
import { ChevronRightIcon } from "@plane/propel/icons";
import type { IGroupByColumn } from "@plane/types";
import { Collapsible } from "@plane/ui";
import { cn } from "@plane/utils";
import { EpicListItem } from "./root";

interface TEpicsGroupProps {
  epicIds: string[];
  workspaceSlug: string;
  group: IGroupByColumn;
  disabled: boolean;
  initiativeId: string;
}

export const EpicsGroup = observer(function EpicsGroup(props: TEpicsGroupProps) {
  const { group, disabled, initiativeId, workspaceSlug, epicIds } = props;

  const isAllIssues = group.id === ALL_ISSUES;

  // states
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(isAllIssues);

  if (!epicIds.length) return null;

  return (
    <>
      <Collapsible
        isOpen={isCollapsibleOpen}
        onToggle={() => setIsCollapsibleOpen(!isCollapsibleOpen)}
        title={
          !isAllIssues && (
            <div className="flex items-center gap-2 p-3">
              <ChevronRightIcon
                className={cn("size-3.5 transition-all text-placeholder", {
                  "rotate-90": isCollapsibleOpen,
                })}
                strokeWidth={2.5}
              />
              <div className="flex-shrink-0 grid place-items-center overflow-hidden">
                {group.icon ?? <CircleDashed className="size-3.5" strokeWidth={2} />}
              </div>
              <span className="text-13 text-primary font-medium">{group.name}</span>
              <span className="text-13 text-placeholder">{epicIds.length}</span>
            </div>
          )
        }
        buttonClassName={cn("hidden", !isAllIssues && "block")}
      >
        {/* Epics list */}
        <div className="pl-2">
          {epicIds?.map((epicId) => (
            <EpicListItem
              key={epicId}
              workspaceSlug={workspaceSlug}
              epicId={epicId}
              initiativeId={initiativeId}
              disabled={disabled}
            />
          ))}
        </div>
      </Collapsible>
    </>
  );
});
