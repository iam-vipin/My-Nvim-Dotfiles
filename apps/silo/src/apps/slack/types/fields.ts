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

import type { PlainTextOption } from "@slack/types";
import type { FormField } from "@/types/form/base";

export enum TFormType {
  WORK_ITEM = "WORK_ITEM",
  INTAKE = "INTAKE",
  UNKNOWN = "UNKNOWN",
}

export type SlackBlockValue = string | PlainTextOption | PlainTextOption[] | boolean;

export type TParsedFormResult = TWorkItemFormResult | TIntakeFormResult | TUnknownFormResult;

export type TWorkItemFormResult = {
  type: TFormType.WORK_ITEM;
  success: true;
  data: {
    // Core fields - use actual action IDs
    project: string;
    name: string;
    description_html?: string;
    state?: string;
    priority?: string;
    labels?: string[];
    assignees?: string[];
    start_date?: string;
    due_date?: string;
    enable_thread_sync?: boolean;
    issue_type?: string;

    // Dynamic custom fields
    customFields: Record<string, unknown>;

    // Metadata
    projectId: string;
    formFields: FormField[];
  };
};

export type TIntakeFormResult = {
  type: TFormType.INTAKE;
  success: true;
  data: {
    // Core fields (minimal for intake)
    project: string;
    name: string;
    description_html: string;
    priority?: string;

    // Dynamic custom fields
    customFields: Record<string, unknown>;

    // Metadata
    projectId: string;
    formFields: FormField[];
  };
};

export type TUnknownFormResult = {
  type: TFormType.UNKNOWN;
  success: false;
  error: string;
  callbackId: string;
};

export type TFormParserContext = {
  workspaceSlug: string;
  accessToken: string;
};
