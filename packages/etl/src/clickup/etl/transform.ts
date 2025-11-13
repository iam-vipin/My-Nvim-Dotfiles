import type {
  ExIssueComment,
  ExIssueLabel,
  ExIssueProperty,
  ExIssuePropertyOption,
  ExIssueType,
  ExModule,
  ExProject,
  ExState,
  PlaneUser,
} from "@plane/sdk";
import {
  getCommentHTML,
  CLICKUP_ALLOWED_CUSTOM_FIELD_TYPES,
  CLICKUP_OPTION_CUSTOM_FIELD_TYPES,
  CLICKUP_TASK_EXTERNAL_ID,
  CLICKUP_TASK_TYPE_EXTERNAL_ID,
  CLICKUP_TASK_COMMENT_EXTERNAL_ID,
  CLICKUP_LIST_EXTERNAL_ID,
  CLICKUP_TASK_CUSTOM_FIELD_EXTERNAL_ID,
  CLICKUP_TASK_CUSTOM_FIELD_OPTION_EXTERNAL_ID,
  CLICKUP_PROJECT_EXTERNAL_ID,
  CLICKUP_STATE_EXTERNAL_ID,
} from "@/clickup/helpers";

import type { TPropertyValuesPayload } from "@/core";
import { E_IMPORTER_KEYS, getRandomColor, getFormattedDateFromTimestamp } from "@/core";
import { getPropertyAttributes, getPropertyValues } from "../helpers/custom-field-etl";
import type {
  TClickUpTask,
  TClickUpComment,
  TClickUpUser,
  TClickUpListsWithTasks,
  TClickUpCustomTaskType,
  TClickUpTag,
  TClickUpCustomField,
  TClickUpCustomFieldOption,
  TClickUpFolder,
  TClickUpSpace,
  TClickUpStatus,
} from "../types";

export const transformTag = (tag: TClickUpTag): Partial<ExIssueLabel> => ({
  name: tag.name,
  color: getRandomColor(),
});

export const transformComment = (
  spaceId: string,
  folderId: string,
  taskId: string,
  comment: TClickUpComment
): Partial<ExIssueComment> => ({
  external_id: CLICKUP_TASK_COMMENT_EXTERNAL_ID(spaceId, folderId, taskId, comment.id),
  external_source: E_IMPORTER_KEYS.CLICKUP,
  created_at: getFormattedDateFromTimestamp(Number(comment.date)),
  created_by: comment.user.username,
  comment_html: getCommentHTML(comment) ?? "<p></p>",
  actor: comment.user.username,
  issue: CLICKUP_TASK_EXTERNAL_ID(taskId),
});

export const transformUser = (user: TClickUpUser): Partial<PlaneUser> => {
  const [first_name, last_name] = user.username.split(" ");
  const role = user.role_key && user.role_key.toLowerCase().includes("admin") ? 20 : 15;

  return {
    email: user.email,
    display_name: user.username,
    first_name: first_name ?? "",
    last_name: last_name ?? "",
    role,
  };
};

export const transformList = (
  spaceId: string,
  folderId: string,
  listWithTasks: TClickUpListsWithTasks
): Partial<ExModule> => ({
  external_id: CLICKUP_LIST_EXTERNAL_ID(spaceId, folderId, listWithTasks.id),
  external_source: E_IMPORTER_KEYS.CLICKUP,
  name: listWithTasks.name,
  issues: listWithTasks.tasks.map((task) => CLICKUP_TASK_EXTERNAL_ID(task.id)),
});

export const transformTaskType = (
  spaceId: string,
  folderId: string,
  customTaskType: TClickUpCustomTaskType
): Partial<ExIssueType> => ({
  name: customTaskType.name,
  description: customTaskType.description ?? "",
  is_active: true,
  external_id: CLICKUP_TASK_TYPE_EXTERNAL_ID(spaceId, folderId, customTaskType.id.toString()),
  external_source: E_IMPORTER_KEYS.CLICKUP,
});

export const transformCustomField = (
  spaceId: string,
  folderId: string,
  customField: TClickUpCustomField,
  customTaskType: TClickUpCustomTaskType
): Partial<ExIssueProperty> | undefined => {
  if (!customField.type || !CLICKUP_ALLOWED_CUSTOM_FIELD_TYPES.includes(customField.type)) {
    return undefined;
  }
  return {
    external_id: CLICKUP_TASK_CUSTOM_FIELD_EXTERNAL_ID(
      spaceId,
      folderId,
      customTaskType.id.toString(),
      customField.id.toString()
    ),
    external_source: E_IMPORTER_KEYS.CLICKUP,
    display_name: customField.name,
    type_id: CLICKUP_TASK_TYPE_EXTERNAL_ID(spaceId, folderId, customTaskType.id.toString()),
    is_required: customField.required,
    is_active: true,
    ...getPropertyAttributes(customField),
  };
};

export const transformCustomFieldForDefaultTaskType = (
  spaceId: string,
  folderId: string,
  customField: TClickUpCustomField
): Partial<ExIssueProperty> | undefined => {
  if (!customField.type || !CLICKUP_ALLOWED_CUSTOM_FIELD_TYPES.includes(customField.type)) {
    return undefined;
  }
  return {
    external_id: CLICKUP_TASK_CUSTOM_FIELD_EXTERNAL_ID(spaceId, folderId, "default", customField.id.toString()),
    external_source: E_IMPORTER_KEYS.CLICKUP,
    display_name: customField.name,
    type_id: undefined,
    is_required: customField.required,
    is_active: true,
    ...getPropertyAttributes(customField),
  };
};

export const transformCustomFieldOption = (
  spaceId: string,
  folderId: string,
  customField: TClickUpCustomField,
  customFieldOption: TClickUpCustomFieldOption,
  customTaskType: TClickUpCustomTaskType
): Partial<ExIssuePropertyOption> | undefined => {
  if (!customField.type || !CLICKUP_OPTION_CUSTOM_FIELD_TYPES.includes(customField.type)) {
    return undefined;
  }
  return {
    external_id: CLICKUP_TASK_CUSTOM_FIELD_OPTION_EXTERNAL_ID(
      spaceId,
      folderId,
      customTaskType.id.toString(),
      customField.id.toString(),
      customFieldOption.id.toString()
    ),
    external_source: E_IMPORTER_KEYS.CLICKUP,
    name: customField.type === "labels" ? customFieldOption.label : customFieldOption.name,
    is_active: true,
    property_id: CLICKUP_TASK_CUSTOM_FIELD_EXTERNAL_ID(
      spaceId,
      folderId,
      customTaskType.id.toString(),
      customField.id.toString()
    ),
  };
};

/**
 * Transforms the custom field values for a task
 * @param spaceId
 * @param folderId
 * @param task
 * @returns A map of custom field id to property values
 */
export const transformCustomFieldValues = (
  spaceId: string,
  folderId: string,
  task: TClickUpTask
): TPropertyValuesPayload => {
  const propertyValuesPayload: TPropertyValuesPayload = {};
  // here make values for default custom field as well
  task.custom_fields.forEach((customField) => {
    const customTaskTypeId = task.custom_item_id?.toString() ?? "0";
    const propertyValues = getPropertyValues(spaceId, folderId, customTaskTypeId, customField);
    if (propertyValues.length === 0) {
      return;
    }
    // propertyid -> propertyvalues
    const propertyId = CLICKUP_TASK_CUSTOM_FIELD_EXTERNAL_ID(
      spaceId,
      folderId,
      customTaskTypeId,
      customField.id.toString()
    );
    propertyValuesPayload[propertyId] = propertyValues;
  });
  return propertyValuesPayload;
};

/**
 * Transforms the project from a folder
 * @param folder
 * @returns Partial<ExProject>
 */
export const transformProject = (space: TClickUpSpace, folder: TClickUpFolder): Partial<ExProject> => {
  const projectIdentifier = folder.id.slice(-5);
  return {
    name: folder.name,
    description: `Imported from Clickup ${space.name} - ${folder.name}`,
    identifier: projectIdentifier,
    external_id: CLICKUP_PROJECT_EXTERNAL_ID(space.id, folder.id),
    external_source: E_IMPORTER_KEYS.CLICKUP,
  };
};

/**
 * Transforms the state from a status
 * @param space
 * @param folder
 * @param status
 * @returns Partial<ExState>
 */
export const transformState = (
  space: TClickUpSpace,
  folder: TClickUpFolder,
  status: TClickUpStatus
): Partial<ExState> => ({
  name: status.status,
  color: getRandomColor(),
  external_id: CLICKUP_STATE_EXTERNAL_ID(space.id, folder.id, status.id),
  external_source: E_IMPORTER_KEYS.CLICKUP,
});
