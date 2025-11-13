import type { TClickUpTask, TClickUpStateConfig, TClickUpPriorityConfig } from "@plane/etl/clickup";
import {
  CLICKUP_TASK_URL,
  CLICKUP_TASK_EXTERNAL_ID,
  CLICKUP_TASK_TYPE_EXTERNAL_ID,
  getTargetState,
  getTargetPriority,
  getTargetAttachments,
} from "@plane/etl/clickup";
import { E_IMPORTER_KEYS, getFormattedDateFromTimestamp } from "@plane/etl/core";
import type { ExIssue as PlaneIssue } from "@plane/sdk";
import type { ClickUpContentParserConfig } from "./get-content-parser";
import { getClickUpContentParser } from "./get-content-parser";

export const transformTask = async (
  spaceId: string,
  folderId: string,
  task: TClickUpTask,
  stateMap: TClickUpStateConfig[],
  priorityMap: TClickUpPriorityConfig[],
  clickupContentParserConfig: ClickUpContentParserConfig
): Promise<Partial<PlaneIssue>> => {
  const targetState = getTargetState(stateMap, task.status);
  const targetPriority = getTargetPriority(priorityMap, task.priority);
  const attachments = getTargetAttachments(spaceId, folderId, task.attachments);
  const markdownDescription = task.markdown_description ?? "";
  const contentParser = getClickUpContentParser(clickupContentParserConfig);
  const description = markdownDescription ? await contentParser.toPlaneHtml(markdownDescription) : "<p></p>";
  const links = [
    {
      name: "Linked Clickup Task",
      url: CLICKUP_TASK_URL(task.id),
    },
  ];

  return {
    assignees: task.assignees.map((assignee) => assignee.username),
    links,
    external_id: CLICKUP_TASK_EXTERNAL_ID(task.id),
    external_source: E_IMPORTER_KEYS.CLICKUP,
    created_by: task.creator.username,
    name: task.name?.slice(0, 255) ?? "Untitled",
    description_html: description,
    target_date: task.due_date ? getFormattedDateFromTimestamp(Number(task.due_date)) : null,
    start_date: task.start_date ? getFormattedDateFromTimestamp(Number(task.start_date)) : null,
    created_at: getFormattedDateFromTimestamp(Number(task.date_created)),
    attachments: attachments,
    state: targetState?.id ?? "",
    external_source_state_id: targetState?.external_id ?? "",
    priority: targetPriority ?? "none",
    labels: task?.tags?.length > 0 ? task.tags.map((tag) => tag.name) : [],
    parent: task.parent ? CLICKUP_TASK_EXTERNAL_ID(task.parent) : "",
    type_id:
      task.custom_item_id !== null
        ? CLICKUP_TASK_TYPE_EXTERNAL_ID(spaceId, folderId, task.custom_item_id.toString())
        : "",
  } as unknown as PlaneIssue;
};
