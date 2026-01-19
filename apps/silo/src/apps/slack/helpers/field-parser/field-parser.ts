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

import { getCreateIntakeFormFields, getCreateWorkItemFormFields } from "@/services/form-fields";
import type { FormField } from "@/types/form/base";
import { E_KNOWN_FIELD_KEY } from "@/types/form/base";
import type { TFormParserContext, TParsedFormResult, TWorkItemFormResult, TIntakeFormResult } from "../../types/fields";
import { TFormType } from "../../types/fields";
import { E_MESSAGE_ACTION_TYPES } from "../../types/types";
import { richTextBlockToMrkdwn } from "../parse-issue-form";
import { removePrefixIfExists } from "../slack-options";
import { WO_INPUT_SUFFIX } from "../constants";

/**
 * @fileoverview
 * This file contains the SlackFormParser class, which is used to parse the form data from Slack.
 * It is used to parse the form data from Slack and return a type-safe result.
 * Essentially, there are core fields and custom fields. The parser takes in the issue, issue's type
 * and project, and understand what fields are expected to be present. It moves on and the parse with
 * the same assumption for the custom fields.
 */

/**
 * Type definition for parser handler functions
 */
export type TParserHandler = (viewData: {
  callback_id: string;
  state: { values: any };
  private_metadata?: string;
}) => Promise<TParsedFormResult>;

export class SlackFormParser {
  constructor(protected readonly context: TFormParserContext) {}

  protected readonly coreFieldParsers: Record<string, any> = {
    project: (data: any) => data?.selected_option?.value,
    name: (data: any) => data?.value,
    description_html: (data: any) => richTextBlockToMrkdwn(data?.rich_text_value) || "<p></p>",
    assignees: (data: any) => data?.selected_options?.map((opt: any) => opt.value),
    state: (data: any) => data?.selected_option?.value,
    priority: (data: any) => data?.selected_option?.value,
    labels: (data: any) => data?.selected_options?.map((opt: any) => opt.value),
    enable_thread_sync: (data: any) => data?.selected_options?.length > 0,
    issue_type: (data: any) => removePrefixIfExists(data?.selected_option?.value),
  };

  /**
   * Map of callback_id to parser handler functions.
   * Derived classes can extend this map to add custom handlers.
   */
  protected readonly actionHandlers: Map<string, TParserHandler> = new Map<string, TParserHandler>([
    [E_MESSAGE_ACTION_TYPES.CREATE_NEW_WORK_ITEM, this.parseWorkItem.bind(this)],
    [E_MESSAGE_ACTION_TYPES.CREATE_INTAKE_ISSUE, this.parseIntake.bind(this)],
  ]);

  async parse(viewData: {
    callback_id: string;
    state: { values: any };
    private_metadata?: string;
  }): Promise<TParsedFormResult> {
    try {
      const handler = this.actionHandlers.get(viewData.callback_id);

      if (handler) {
        return await handler(viewData);
      }

      return {
        type: TFormType.UNKNOWN,
        success: false,
        error: `Unsupported callback_id: ${viewData.callback_id}`,
        callbackId: viewData.callback_id,
      };
    } catch (error) {
      return {
        type: TFormType.UNKNOWN,
        success: false,
        error: error instanceof Error ? error.message : "Unknown parsing error",
        callbackId: viewData.callback_id,
      };
    }
  }

  protected async parseWorkItem(viewData: any): Promise<TWorkItemFormResult> {
    const projectId = this.extractProjectId(viewData.state.values);

    const issueTypeFromForm = this.extractIssueType(viewData.state.values);
    const finalIssueTypeId = issueTypeFromForm;

    const formFields = await getCreateWorkItemFormFields(
      this.context.workspaceSlug,
      projectId,
      this.context.accessToken,
      finalIssueTypeId
    );

    const { coreFields, customFields } = this.parseFields(viewData.state.values, formFields.fields, projectId);

    return {
      type: TFormType.WORK_ITEM,
      success: true,
      data: {
        ...coreFields,
        customFields,
        projectId,
        formFields: formFields.fields,
      },
    };
  }

  protected async parseIntake(viewData: any): Promise<TIntakeFormResult> {
    const projectId = this.extractProjectId(viewData.state.values);

    // Fetch the form definition
    const formFields = await getCreateIntakeFormFields(this.context.workspaceSlug, projectId);

    const { coreFields, customFields } = this.parseFields(viewData.state.values, formFields.fields, projectId);

    return {
      type: TFormType.INTAKE,
      success: true,
      data: {
        project: coreFields.project,
        name: coreFields.name,
        description_html: coreFields.description_html,
        priority: coreFields.priority,
        customFields,
        projectId,
        formFields: formFields.fields,
      },
    };
  }

  protected parseFields(values: any, formFields: FormField[], projectId: string) {
    const coreFields = {
      project: projectId,
      name: "",
      description_html: "", // or whatever default you want
      state: undefined as string | undefined,
      state_id: undefined as string | undefined,
      priority: undefined as string | undefined,
      labels: undefined as string[] | undefined,
      enable_thread_sync: undefined as boolean | undefined,
      type_id: undefined as string | undefined,
    };

    const customFields: Record<string, unknown> = {};
    const fieldMap = new Map(formFields.map((field) => [field.id, field]));

    Object.entries(values).forEach(([_, blockData]: [string, any]) => {
      Object.entries(blockData).forEach(([actionKey, actionData]: [string, any]) => {
        // Parse core fields (backward compatibility)
        if (this.isCoreField(actionKey)) {
          this.parseCoreField(actionKey, actionData, coreFields);
        } else {
          // Parse dynamic custom fields using action_id pattern: projectId.fieldId
          const fieldId = removePrefixIfExists(actionKey);
          const field = fieldMap.get(fieldId);

          if (field) {
            const value = this.parseFieldValue(actionData, field);
            if (value !== undefined) {
              customFields[fieldId] = value;
            }
          }
        }
      });
    });

    return { coreFields, customFields };
  }

  protected isCoreField(actionKey: string): boolean {
    if (actionKey.includes(`.${WO_INPUT_SUFFIX}`)) {
      const [key] = actionKey.split(".");
      const cleanActionKey = removePrefixIfExists(key);
      return cleanActionKey in this.coreFieldParsers;
    }

    const cleanActionKey = removePrefixIfExists(actionKey);
    return cleanActionKey in this.coreFieldParsers;
  }

  protected parseCoreField(actionKey: string, actionData: any, coreFields: any) {
    const cleanActionKey = removePrefixIfExists(actionKey);
    const parser = this.coreFieldParsers[cleanActionKey];
    if (!parser) return;

    const value = parser(actionData);
    if (value !== undefined) {
      if (cleanActionKey === E_KNOWN_FIELD_KEY.TITLE) {
        coreFields[E_KNOWN_FIELD_KEY.NAME] = value;
      } else if (cleanActionKey === E_KNOWN_FIELD_KEY.STATUS) {
        coreFields[E_KNOWN_FIELD_KEY.STATE] = value;
      } else if (cleanActionKey === E_KNOWN_FIELD_KEY.ISSUE_TYPE) {
        coreFields[E_KNOWN_FIELD_KEY.TYPE_ID] = value;
      } else {
        coreFields[cleanActionKey] = value;
      }
    }
  }

  protected parseFieldValue(data: any, field: FormField): unknown {
    switch (field.type) {
      case "TEXT":
        return data.type === "plain_text_input" ? data.value : undefined;

      case "DECIMAL":
        if (data.type === "plain_text_input" || data.type === "number_input") {
          const num = parseFloat(data.value);
          return isNaN(num) ? undefined : num;
        }
        return undefined;

      case "OPTION":
        if (field.isMulti && (data.type === "multi_static_select" || data.type === "multi_external_select")) {
          return data.selected_options?.map((opt: any) => opt.value) || [];
        } else if (!field.isMulti && (data.type === "static_select" || data.type === "external_select")) {
          return data.selected_option?.value;
        }
        return undefined;

      case "RELATION":
        if (field.isMulti && data.type === "multi_external_select") {
          return data.selected_options?.map((opt: any) => opt.value) || [];
        } else if (!field.isMulti && data.type === "external_select") {
          return data.selected_option?.value;
        }
        return undefined;

      case "DATETIME":
        return data.type === "datepicker" ? data.selected_date : undefined;

      case "BOOLEAN":
        return data.type === "checkboxes" ? data.selected_options?.length > 0 : false;

      default:
        return data.value;
    }
  }

  protected extractProjectId(values: any): string {
    let projectId = "";

    Object.entries(values).forEach(([_, blockData]: [string, any]) => {
      if (blockData.project?.type === "static_select") {
        projectId = blockData.project.selected_option?.value;
      }
    });

    return projectId;
  }

  protected extractIssueType(values: any): string | undefined {
    let issueTypeId: string | undefined;

    Object.entries(values).forEach(([_, blockData]: [string, any]) => {
      Object.entries(blockData).forEach(([actionKey, actionData]: [string, any]) => {
        if (actionKey.includes(E_KNOWN_FIELD_KEY.ISSUE_TYPE) && actionData?.type === "static_select") {
          issueTypeId = removePrefixIfExists(actionData.selected_option?.value);
        }
      });
    });

    return issueTypeId;
  }
}

export const createSlackFormParser = (context: TFormParserContext) => new SlackFormParser(context);
