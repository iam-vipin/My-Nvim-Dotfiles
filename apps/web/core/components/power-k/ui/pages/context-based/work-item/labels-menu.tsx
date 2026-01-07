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
// plane types
import type { IIssueLabel, TIssue } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import { PowerKLabelsMenu } from "@/components/power-k/menus/labels";
// hooks
import { useLabel } from "@/hooks/store/use-label";

type Props = {
  handleSelect: (label: IIssueLabel) => void;
  workItemDetails: TIssue;
};

export const PowerKWorkItemLabelsMenu = observer(function PowerKWorkItemLabelsMenu(props: Props) {
  const { handleSelect, workItemDetails } = props;
  // store hooks
  const { getProjectLabelIds, getLabelById } = useLabel();
  // derived values
  const projectLabelIds = workItemDetails.project_id ? getProjectLabelIds(workItemDetails.project_id) : undefined;
  const labelsList = projectLabelIds ? projectLabelIds.map((labelId) => getLabelById(labelId)) : undefined;
  const filteredLabelsList = labelsList ? labelsList.filter((label) => !!label) : undefined;

  if (!filteredLabelsList) return <Spinner />;

  return <PowerKLabelsMenu labels={filteredLabelsList} onSelect={handleSelect} value={workItemDetails.label_ids} />;
});
