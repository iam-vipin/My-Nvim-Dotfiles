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
// plane imports
import type { TLoader } from "@plane/types";
// components
import { LogoSpinner } from "@/components/common/logo-spinner";

interface Props {
  children: string | React.ReactNode | React.ReactNode[];
  getGroupIssueCount: (
    groupId: string | undefined,
    subGroupId: string | undefined,
    isSubGroupCumulative: boolean
  ) => number | undefined;
  getIssueLoader: (groupId?: string, subGroupId?: string) => TLoader;
}

export const IssueLayoutHOC = observer(function IssueLayoutHOC(props: Props) {
  const { getIssueLoader, getGroupIssueCount } = props;

  const issueCount = getGroupIssueCount(undefined, undefined, false);

  if (getIssueLoader() === "init-loader" || issueCount === undefined) {
    return (
      <div className="relative size-full grid place-items-center">
        <LogoSpinner />
      </div>
    );
  }

  if (getGroupIssueCount(undefined, undefined, false) === 0) {
    return <div className="size-full grid place-items-center text-secondary">No work items found</div>;
  }

  return <>{props.children}</>;
});
