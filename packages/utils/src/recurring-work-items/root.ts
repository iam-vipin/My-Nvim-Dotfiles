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

// plane imports
import type { TRecurringWorkItem, TRecurringWorkItemForm, TWorkItemBlueprintFormData } from "@plane/types";
import { ERecurringWorkItemIntervalType } from "@plane/types";
// local imports
import { joinUrlPath } from "../string";
import type { TBuildWorkItemBlueprintBaseParams } from "../templates/work-item/blueprint/build";
import { buildWorkItemBlueprint } from "../templates/work-item/blueprint/build";
import type {
  TSanitizeWorkItemFormDataParams,
  TWorkItemSanitizationResult,
} from "../templates/work-item/blueprint/sanitize";
import { extractAndSanitizeRecurringWorkItemFormData } from "./extract";

/**
 * Settings path
 */

export type TRecurringWorkItemSettingsPathProps = {
  workspaceSlug: string;
  projectId: string;
};

/**
 * Gets the base path for the recurring work item settings page
 * @params workspaceSlug - The slug of the workspace
 * @params projectId - The ID of the project
 * @returns The base path for the recurring work item settings page
 */
export const getRecurringWorkItemSettingsPath = (props: TRecurringWorkItemSettingsPathProps) =>
  joinUrlPath(props.workspaceSlug, "settings", "projects", props.projectId, "recurring-work-items");

type TCreateUpdateRecurringWorkItemSettingsPathProps = TRecurringWorkItemSettingsPathProps & {
  recurringWorkItemId?: string;
};

/**
 * Gets the path for the create/update recurring work item settings page
 * @param workspaceSlug - The slug of the workspace
 * @param projectId - The ID of the project
 * @returns The path for the create/update recurring work item settings page
 */
export const getCreateUpdateRecurringWorkItemSettingsPath = (props: TCreateUpdateRecurringWorkItemSettingsPathProps) =>
  props.recurringWorkItemId
    ? joinUrlPath(getRecurringWorkItemSettingsPath(props), props.recurringWorkItemId, "update")
    : joinUrlPath(getRecurringWorkItemSettingsPath(props), "create");

/**
 * Gets the label for the recurring work item interval type
 * @param intervalType - The interval type
 * @param intervalCount - The interval count (default 1)
 * @returns The label for the recurring work item interval type
 */
export const getRecurringWorkItemIntervalTypeLabel = (
  intervalType: ERecurringWorkItemIntervalType,
  intervalCount: number = 1
) => {
  const plural = intervalCount > 1;
  switch (intervalType) {
    case ERecurringWorkItemIntervalType.DAILY:
      return plural ? "days" : "day";
    case ERecurringWorkItemIntervalType.WEEKLY:
      return plural ? "weeks" : "week";
    case ERecurringWorkItemIntervalType.MONTHLY:
      return plural ? "months" : "month";
    case ERecurringWorkItemIntervalType.YEARLY:
      return plural ? "years" : "year";
  }
};

/**
 * Data conversion helpers
 */

export type TRecurringWorkItemDataToSanitizedFormDataParams = TSanitizeWorkItemFormDataParams & {
  recurringWorkItem: TRecurringWorkItem;
};

/**
 * Converts a recurring work item to form data structure including invalid ID information
 * @param data - The recurring work item data
 * @returns The form data and invalid IDs
 */
export const recurringWorkItemDataToSanitizedFormData = (
  data: TRecurringWorkItemDataToSanitizedFormDataParams
): { form: TRecurringWorkItemForm; invalidIds: TWorkItemSanitizationResult<TWorkItemBlueprintFormData>["invalid"] } => {
  const sanitizationResult = extractAndSanitizeRecurringWorkItemFormData({
    ...data,
    recurringWorkItemData: data.recurringWorkItem.workitem_blueprint,
  });

  return {
    form: {
      id: data.recurringWorkItem.id,
      enabled: data.recurringWorkItem.enabled,
      start_at: data.recurringWorkItem.start_at,
      end_at: data.recurringWorkItem.end_at,
      interval_type: data.recurringWorkItem.interval_type,
      interval_count: data.recurringWorkItem.interval_count,
      workitem_blueprint: sanitizationResult.valid,
    },
    invalidIds: sanitizationResult.invalid,
  };
};

/**
 * Parameters for converting form data back to the recurring work item format
 * @param formData - The form data
 * @param rest - The rest of the parameters
 */
type TRecurringWorkItemFormDataParams = {
  formData: TRecurringWorkItemForm;
} & TBuildWorkItemBlueprintBaseParams;

/**
 * Converts form data back to the recurring work item format
 * @param params - The parameters for converting form data back to the recurring work item format
 * @param params.formData - The form data
 * @param params.rest - The rest of the parameters
 * @returns The recurring work item data
 */
export const recurringWorkItemFormDataToRecurringWorkItem = (
  params: TRecurringWorkItemFormDataParams
): Partial<TRecurringWorkItem> => {
  const { formData, ...rest } = params;

  return {
    ...formData,
    workitem_blueprint: buildWorkItemBlueprint({
      workItem: formData.workitem_blueprint,
      ...rest,
    }),
  };
};
