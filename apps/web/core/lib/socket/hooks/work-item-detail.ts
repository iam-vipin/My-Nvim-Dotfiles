import type { KeyedMutator } from "swr";
// plane imports
import type { TIssue, TIssueActivity, TIssueComment, TIssueRelation, TIssueSubIssues } from "@plane/types";
// local imports
import { useSocketEvent } from "./root";

type TUseWorkItemDetailRevalidationProps = {
  workItemId: string | undefined;
  entityType: "issue" | "epic";
  mutateFn: {
    detail: KeyedMutator<TIssue>;
    comments: KeyedMutator<TIssueComment[]>;
    relations: KeyedMutator<TIssueRelation>;
    subWorkItems: KeyedMutator<TIssueSubIssues>;
    activity: KeyedMutator<TIssueActivity[]>;
  };
};

export const useWorkItemDetailRevalidation = ({
  workItemId,
  entityType,
  mutateFn,
}: TUseWorkItemDetailRevalidationProps) =>
  useSocketEvent("work-item:updated", (data) => {
    // Guard clauses
    if (!workItemId || !data.entity_id) return;
    if (!data.event_type?.startsWith(entityType + ".")) return;
    if (data.entity_id !== workItemId) return;

    // Revalidate detail for main entity changes
    if (
      [
        `${entityType}.created`,
        `${entityType}.updated`,
        `${entityType}.deleted`,
        `${entityType}.state.updated`,
        `${entityType}.assignee.added`,
        `${entityType}.assignee.removed`,
        `${entityType}.module.added`,
        `${entityType}.module.removed`,
        `${entityType}.label.added`,
        `${entityType}.label.removed`,
        `${entityType}.cycle.added`,
        `${entityType}.cycle.removed`,
        `${entityType}.link.added`,
        `${entityType}.link.updated`,
        `${entityType}.link.removed`,
      ].includes(data.event_type)
    ) {
      void mutateFn.detail();
    }

    // Revalidate comments for comment events
    if (data.event_type?.startsWith(`${entityType}.comment.`)) {
      void mutateFn.comments();
    }

    // Revalidate relations for relation events
    if (data.event_type?.startsWith(`${entityType}.relation.`)) {
      void mutateFn.relations();
    }

    // TODO: (TEMP) Update this once sub work item events are implemented
    void mutateFn.subWorkItems();

    // Always revalidate activity
    void mutateFn.activity();
  });
