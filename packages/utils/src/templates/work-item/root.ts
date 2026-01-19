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
import type {
  TIssuePropertyValues,
  TWorkItemTemplate,
  TWorkItemTemplateForm,
  TWorkItemTemplateFormData,
} from "@plane/types";
import { ETemplateType } from "@plane/types";
// local imports
import { extractTemplateBasicFormData } from "../base";
import type { TSanitizeWorkItemFormDataParams, TWorkItemSanitizationResult } from "./blueprint/sanitize";
import type { TBuildWorkItemTemplateBlueprintBaseParams } from "./build";
import { buildWorkItemTemplateBlueprint } from "./build";
import { extractAndSanitizeWorkItemTemplateFormData } from "./extract";

export type TWorkItemTemplateDataToSanitizedFormDataParams = TSanitizeWorkItemFormDataParams & {
  template: TWorkItemTemplate;
};

/**
 * Converts a work item template to form data structure including invalid ID information
 * @param data - The work item template data
 * @returns The form data and invalid IDs
 */
export const workItemTemplateDataToSanitizedFormData = (
  data: TWorkItemTemplateDataToSanitizedFormDataParams
): { form: TWorkItemTemplateForm; invalidIds: TWorkItemSanitizationResult<TWorkItemTemplateFormData>["invalid"] } => {
  const sanitizationResult = extractAndSanitizeWorkItemTemplateFormData({
    ...data,
    workItemData: data.template.template_data,
  });

  return {
    form: {
      template: extractTemplateBasicFormData(data.template),
      work_item: sanitizationResult.valid,
    },
    invalidIds: sanitizationResult.invalid,
  };
};

/**
 * Parameters for converting form data back to the work item template format
 * @param formData - The form data
 * @param subWorkItemListCustomPropertyValues - The work item list custom property values
 * @param rest - The rest of the parameters
 */
type TWorkItemTemplateFormDataParams = {
  formData: TWorkItemTemplateForm;
  subWorkItemListCustomPropertyValues: Record<string, TIssuePropertyValues>;
} & TBuildWorkItemTemplateBlueprintBaseParams;

/**
 * Converts form data back to the work item template format
 * @param params - The parameters for converting form data back to the work item template format
 * @param params.formData - The form data
 * @param params.subWorkItemListCustomPropertyValues - The work item list custom property values
 * @param params.rest - The rest of the parameters
 * @returns The work item template data
 */
export const workItemTemplateFormDataToTemplate = (
  params: TWorkItemTemplateFormDataParams
): Partial<TWorkItemTemplate> => {
  const { formData, ...rest } = params;
  const { template, work_item } = formData;

  return {
    name: template.name,
    short_description: template.short_description,
    template_type: ETemplateType.WORK_ITEM,
    template_data: buildWorkItemTemplateBlueprint({
      workItem: work_item,
      ...{
        ...rest,
        subWorkItemListCustomPropertyValues: rest.subWorkItemListCustomPropertyValues || {},
      },
    }),
  };
};
