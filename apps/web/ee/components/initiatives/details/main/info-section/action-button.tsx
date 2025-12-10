import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";

type Props = {
  customButton?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

export const InitiativeActionButton = observer(function InitiativeActionButton(props: Props) {
  const { customButton, onClick, disabled = false } = props;

  // handlers
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button type="button" onClick={handleOnClick} disabled={disabled}>
      {customButton ? customButton : <Plus className="h-4 w-4" />}
    </button>
  );
});
