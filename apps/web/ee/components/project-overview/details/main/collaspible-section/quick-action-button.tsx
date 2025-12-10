import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";

type Props = {
  customButton?: React.ReactNode;
  disabled?: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

export const ProjectActionButton = observer(function ProjectActionButton(props: Props) {
  const { customButton, setIsModalOpen, disabled = false } = props;

  // handlers
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <button type="button" onClick={handleOnClick} disabled={disabled}>
      {customButton ? customButton : <Plus className="h-4 w-4" />}
    </button>
  );
});
