import type { FC } from "react";
import React from "react";
// components
import { LinkList } from "../link-items";
// helper
import { useLinkOperations } from "../link-items/links-helper";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
  disabled: boolean;
};

export function InitiativeLinksCollapsibleContent(props: Props) {
  const { workspaceSlug, initiativeId, disabled } = props;
  // helper
  const handleLinkOperations = useLinkOperations(workspaceSlug, initiativeId);
  return <LinkList initiativeId={initiativeId} linkOperations={handleLinkOperations} disabled={disabled} />;
}
