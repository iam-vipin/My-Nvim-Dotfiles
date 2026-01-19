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
// types
import type { IIssueDisplayProperties } from "@plane/types";
import { IssueBlock } from "./block";

interface Props {
  issueIds: string[] | undefined;
  groupId: string;
  displayProperties?: IIssueDisplayProperties;
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

export function IssueBlocksList(props: Props) {
  const { issueIds = [], groupId, displayProperties } = props;

  return (
    <div className="relative size-full">
      {issueIds?.map((issueId) => (
        <IssueBlock key={issueId} issueId={issueId} displayProperties={displayProperties} groupId={groupId} />
      ))}
    </div>
  );
}
