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
import type { TPage } from "../page/core";
import type { ETemplateType, TBaseTemplate } from "./base";

export type TPageTemplateData = Pick<TPage, "description_html" | "id" | "logo_props" | "name" | "workspace"> & {
  project: string | undefined;
};

export type TPageTemplate = TBaseTemplate<ETemplateType.PAGE, TPageTemplateData>;

export type TPageTemplateFormData = Pick<TPage, "description_html" | "id" | "logo_props" | "name"> & {
  project: string | undefined;
};

export type TPageTemplateForm = {
  template: Pick<TPageTemplate, "id" | "name" | "short_description">;
  page: TPageTemplateFormData;
};
