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

// local imports
import type { ETemplateType, TBaseTemplate } from "./base";
import type { TWorkItemBlueprint, TWorkItemBlueprintFormData } from "./blueprint/work-item";

export type TWorkItemTemplateData = TWorkItemBlueprint & {
  sub_workitems: TWorkItemBlueprint[];
};

export type TWorkItemTemplate = TBaseTemplate<ETemplateType.WORK_ITEM, TWorkItemTemplateData>;

export type TWorkItemTemplateFormData = TWorkItemBlueprintFormData & {
  sub_workitems: TWorkItemBlueprintFormData[];
};

export type TWorkItemTemplateForm = {
  template: Pick<TWorkItemTemplate, "id" | "name" | "short_description">;
  work_item: TWorkItemTemplateFormData;
};
