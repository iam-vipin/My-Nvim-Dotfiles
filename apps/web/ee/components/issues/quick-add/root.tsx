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
import { observer } from "mobx-react";
import type { UseFormRegister, UseFormSetFocus } from "react-hook-form";
// plane types
import type { TIssue, EIssueLayoutTypes } from "@plane/types";
// hooks
import { QuickAddIssueFormRoot as BaseQuickAddIssueFormRoot } from "@/ce/components/issues/quick-add";
// components
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";
// plane web imports
import { CreateUpdateEpicModal } from "@/plane-web/components/epics/epic-modal";
import { useIssueTypes } from "@/plane-web/hooks/store";

export type TQuickAddIssueFormRoot = {
  isOpen: boolean;
  layout: EIssueLayoutTypes;
  prePopulatedData?: Partial<TIssue>;
  projectId: string;
  hasError?: boolean;
  setFocus: UseFormSetFocus<TIssue>;
  register: UseFormRegister<TIssue>;
  onSubmit: () => void;
  onClose: () => void;
  isEpic?: boolean;
};

export const QuickAddIssueFormRoot = observer(function QuickAddIssueFormRoot(props: TQuickAddIssueFormRoot) {
  const {
    isOpen,
    layout,
    prePopulatedData,
    projectId,
    hasError = false,
    setFocus,
    register,
    onSubmit,
    onClose,
    isEpic = false,
  } = props;
  // store hooks
  const { getProjectDefaultIssueType, getProjectEpicDetails } = useIssueTypes();
  // derived values
  const defaultIssueType = getProjectDefaultIssueType(projectId);
  const projectEpics = getProjectEpicDetails(projectId);
  const activeProperties = isEpic ? projectEpics?.activeProperties : defaultIssueType?.activeProperties;
  const mandatoryFields = activeProperties?.filter((property) => property.is_required) ?? [];

  return (
    <>
      {mandatoryFields.length > 0 ? (
        <>
          {isEpic ? (
            <CreateUpdateEpicModal isOpen={isOpen} onClose={onClose} data={prePopulatedData} />
          ) : (
            <CreateUpdateIssueModal isOpen={isOpen} onClose={onClose} data={prePopulatedData} />
          )}
        </>
      ) : (
        <BaseQuickAddIssueFormRoot
          isOpen={isOpen}
          layout={layout}
          projectId={projectId}
          hasError={hasError}
          setFocus={setFocus}
          register={register}
          onSubmit={onSubmit}
          onClose={onClose}
          isEpic={isEpic}
        />
      )}
    </>
  );
});
