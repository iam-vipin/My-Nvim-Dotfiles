import type { IIssueType } from "../work-item-types/work-item-types";
import type { TIssueIdentifierProps, TIssueTypeIdentifier as TIssueTypeIdentifierBase } from "./issue-identifier";
import type { EWorkItemTypeEntity } from "../work-item-types";

export type TIssueTypeIdentifierExtended = TIssueTypeIdentifierBase & {
  getWorkItemTypeById?: (workItemTypeId: string) => IIssueType | undefined;
};

export type TIssueIdentifierPropsExtended = TIssueIdentifierProps & {
  getWorkItemTypeById?: (workItemTypeId: string) => IIssueType | undefined;
  isWorkItemTypeEntityEnabled?: (workspaceSlug: string, projectId: string, entityType: EWorkItemTypeEntity) => boolean;
};
