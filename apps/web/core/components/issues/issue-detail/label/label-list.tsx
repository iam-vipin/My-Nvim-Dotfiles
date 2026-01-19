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
// components
import { LabelListItem } from "./label-list-item";
// types
import type { TLabelOperations } from "./root";

type TLabelList = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  values: string[];
  labelOperations: TLabelOperations;
  disabled: boolean;
};

export const LabelList = observer(function LabelList(props: TLabelList) {
  const { workspaceSlug, projectId, issueId, values, labelOperations, disabled } = props;
  const issueLabels = values || undefined;

  if (!issueId || !issueLabels) return <></>;
  return (
    <>
      {issueLabels.map((labelId) => (
        <LabelListItem
          key={labelId}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          issueId={issueId}
          labelId={labelId}
          values={issueLabels}
          labelOperations={labelOperations}
          disabled={disabled}
        />
      ))}
    </>
  );
});
