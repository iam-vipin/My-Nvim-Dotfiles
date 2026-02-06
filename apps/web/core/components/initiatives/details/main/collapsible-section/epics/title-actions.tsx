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
import { useCallback } from "react";
import { cloneDeep } from "lodash-es";
import { observer } from "mobx-react";
import { PlusIcon } from "@plane/propel/icons";
// plane imports
import {
  EIssueFilterType,
  ISSUE_DISPLAY_FILTERS_BY_PAGE,
  SUB_WORK_ITEM_AVAILABLE_FILTERS_FOR_INITIATIVES_PAGE,
} from "@plane/constants";
import type { IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions } from "@plane/types";
// components
import { SubIssueDisplayFilters } from "@/components/issues/issue-detail-widgets/sub-issues";
import { SubIssueFilters } from "@/components/issues/issue-detail-widgets/sub-issues/filters/root";
// hooks
import { useMember } from "@/hooks/store/use-member";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";

type TEpicsTitleActionsProps = {
  disabled: boolean;
  toggleEpicModal: (value?: boolean) => void;
  initiativeId: string;
  workspaceSlug: string;
};

export const EpicsTitleActions = observer(function EpicsTitleActions(props: TEpicsTitleActionsProps) {
  const { disabled, toggleEpicModal, initiativeId, workspaceSlug } = props;

  // store hooks
  const {
    initiative: {
      epics: {
        filters: { getInitiativeEpicsFiltersById, updateEpicsFilters },
      },
    },
  } = useInitiatives();

  const {
    workspace: { getWorkspaceMemberIds },
  } = useMember();

  const memberIds = getWorkspaceMemberIds(workspaceSlug);

  // derived values
  const epicsFilters = getInitiativeEpicsFiltersById(initiativeId);
  const displayProperties = epicsFilters?.displayProperties;
  const displayFilters = epicsFilters?.displayFilters;

  const handleDisplayPropertiesUpdate = (updatedDisplayProperties: Partial<IIssueDisplayProperties>) => {
    updateEpicsFilters(workspaceSlug, EIssueFilterType.DISPLAY_PROPERTIES, updatedDisplayProperties, initiativeId);
  };

  const handleDisplayFiltersUpdate = (updatedDisplayFilters: Partial<IIssueDisplayFilterOptions>) => {
    updateEpicsFilters(workspaceSlug, EIssueFilterType.DISPLAY_FILTERS, updatedDisplayFilters, initiativeId);
  };

  const handleFiltersUpdate = useCallback(
    (key: keyof IIssueFilterOptions, value: string | string[]) => {
      if (!workspaceSlug) return;
      const newValues = cloneDeep(epicsFilters?.filters?.[key]) ?? [];

      if (Array.isArray(value)) {
        // this validation is majorly for the filter start_date, target_date custom
        value.forEach((val) => {
          if (!newValues.includes(val)) newValues.push(val);
          else newValues.splice(newValues.indexOf(val), 1);
        });
      } else {
        if (epicsFilters?.filters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
        else newValues.push(value);
      }
      updateEpicsFilters(workspaceSlug, EIssueFilterType.FILTERS, { [key]: newValues }, initiativeId);
    },
    [workspaceSlug, epicsFilters?.filters, updateEpicsFilters, initiativeId]
  );

  const layoutDisplayFiltersOptions = ISSUE_DISPLAY_FILTERS_BY_PAGE.initiatives.layoutOptions.list;

  const handlePropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 items-center" onClick={handlePropagation}>
      <SubIssueDisplayFilters
        isEpic
        layoutDisplayFiltersOptions={layoutDisplayFiltersOptions}
        displayProperties={displayProperties ?? {}}
        displayFilters={displayFilters ?? {}}
        handleDisplayPropertiesUpdate={handleDisplayPropertiesUpdate}
        handleDisplayFiltersUpdate={handleDisplayFiltersUpdate}
      />
      <SubIssueFilters
        handleFiltersUpdate={handleFiltersUpdate}
        filters={epicsFilters?.filters ?? {}}
        memberIds={memberIds ?? undefined}
        availableFilters={SUB_WORK_ITEM_AVAILABLE_FILTERS_FOR_INITIATIVES_PAGE}
      />
      {!disabled && (
        <div>
          <button type="button" onClick={() => toggleEpicModal()}>
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});
