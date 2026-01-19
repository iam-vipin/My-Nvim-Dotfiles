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

import type { FormField } from "@/types/form/base/fields";
import type { CreateIntakeFormFieldsMetadata } from "@/types/form/intake-form";
import { StaticFormFieldsService } from "./static-fields";

export const getCreateIntakeFormFields = async (
  slug: string,
  projectId: string
): Promise<CreateIntakeFormFieldsMetadata> => {
  const staticFieldsService = new StaticFormFieldsService();

  const titleField = staticFieldsService.getTitleField(1);
  const descriptionField = staticFieldsService.getDescriptionField(2);
  const priorityField = staticFieldsService.getPriorityField(3);

  const fields: FormField[] = [titleField, descriptionField, priorityField];

  return {
    slug,
    fields,
    projectId,
  };
};
