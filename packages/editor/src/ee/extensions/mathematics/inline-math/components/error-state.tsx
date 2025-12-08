import { SquareRadical } from "lucide-react";
import React from "react";
// types
import type { TMathComponentProps } from "../../types";
// local components
import { InlineMathContainer } from "./container";

type TInlineMathErrorProps = TMathComponentProps & {
  errorMessage: string;
};

export function InlineMathErrorState({ errorMessage, onClick, isEditable }: TInlineMathErrorProps) {
  return (
    <InlineMathContainer onClick={onClick} variant="error" title={errorMessage} isEditable={isEditable}>
      <SquareRadical className="size-4 shrink-0" />
      <span>Invalid equation</span>
    </InlineMathContainer>
  );
}
