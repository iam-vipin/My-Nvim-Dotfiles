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

import React from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import type { EIssuesStoreType, TIssue } from "@plane/types";
// plane web imports
import { IssueModalProvider } from "@/plane-web/components/issues/issue-modal/provider";
import { CreateUpdateIssueModalBase } from "./base";

export interface IssuesModalProps {
  data?: Partial<TIssue>;
  isOpen: boolean;
  onClose: () => void;
  beforeFormSubmit?: () => Promise<void>;
  onSubmit?: (res: TIssue) => Promise<void>;
  withDraftIssueWrapper?: boolean;
  storeType?: EIssuesStoreType;
  isDraft?: boolean;
  fetchIssueDetails?: boolean;
  moveToIssue?: boolean;
  modalTitle?: string;
  primaryButtonText?: {
    default: string;
    loading: string;
  };
  isProjectSelectionDisabled?: boolean;
  isTypeSelectDisabled?: boolean;
  templateId?: string;
  isConversionOperation?: boolean;
  allowedProjectIds?: string[];
  showActionItemsOnUpdate?: boolean;
}

export const CreateUpdateIssueModal = observer(function CreateUpdateIssueModal(props: IssuesModalProps) {
  // router params
  const { cycleId, moduleId } = useParams();
  // derived values
  const dataForPreload = {
    ...props.data,
    cycle_id: props.data?.cycle_id ? props.data?.cycle_id : cycleId ? cycleId.toString() : null,
    module_ids: props.data?.module_ids ? props.data?.module_ids : moduleId ? [moduleId.toString()] : null,
  };

  if (!props.isOpen) return null;
  return (
    <IssueModalProvider
      templateId={props.templateId}
      dataForPreload={dataForPreload}
      allowedProjectIds={props.allowedProjectIds}
    >
      <CreateUpdateIssueModalBase {...props} />
    </IssueModalProvider>
  );
});
