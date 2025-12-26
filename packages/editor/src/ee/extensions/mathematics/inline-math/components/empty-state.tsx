import { SquareRadical } from "lucide-react";
import React from "react";
// types
import type { TMathComponentProps } from "../../types";
// local components
import { InlineMathContainer } from "./container";

type TInlineMathEmptyProps = TMathComponentProps;

export function InlineMathEmptyState({ onClick, isEditable }: TInlineMathEmptyProps) {
  return (
    <InlineMathContainer onClick={onClick} variant="empty" title="Click to add equation" isEditable={isEditable}>
      <SquareRadical className="size-4 shrink-0" />
      <span>New equation</span>
    </InlineMathContainer>
  );
}
