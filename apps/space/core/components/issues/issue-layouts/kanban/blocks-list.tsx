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

import type { MutableRefObject } from "react";
import { observer } from "mobx-react";
//types
import type { IIssueDisplayProperties } from "@plane/types";
// components
import { KanbanIssueBlock } from "./block";

interface IssueBlocksListProps {
  subGroupId: string;
  groupId: string;
  issueIds: string[];
  displayProperties: IIssueDisplayProperties | undefined;
  scrollableContainerRef?: MutableRefObject<HTMLDivElement | null>;
}

export const KanbanIssueBlocksList = observer(function KanbanIssueBlocksList(props: IssueBlocksListProps) {
  const { subGroupId, groupId, issueIds, displayProperties, scrollableContainerRef } = props;

  return (
    <>
      {issueIds && issueIds.length > 0
        ? issueIds.map((issueId) => {
            if (!issueId) return null;

            let draggableId = issueId;
            if (groupId) draggableId = `${draggableId}__${groupId}`;
            if (subGroupId) draggableId = `${draggableId}__${subGroupId}`;

            return (
              <KanbanIssueBlock
                key={draggableId}
                issueId={issueId}
                groupId={groupId}
                subGroupId={subGroupId}
                displayProperties={displayProperties}
                scrollableContainerRef={scrollableContainerRef}
              />
            );
          })
        : null}
    </>
  );
});
