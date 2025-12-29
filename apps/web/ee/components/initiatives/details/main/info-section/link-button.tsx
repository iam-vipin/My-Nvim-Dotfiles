import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { PlusIcon } from "@plane/propel/icons";
// Plane-web
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";

type Props = {
  customButton?: React.ReactNode;
  disabled?: boolean;
  variant?: "layer-1" | "default";
};

export const InitiativeLinksActionButton = observer(function InitiativeLinksActionButton(props: Props) {
  const { customButton, disabled = false, variant } = props;
  // store hooks
  const {
    initiative: {
      initiativeLinks: { setIsLinkModalOpen },
    },
  } = useInitiatives();

  // handlers
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLinkModalOpen(true);
  };

  const getVariantClassName = () => {
    if (variant === "layer-1") {
      return "bg-layer-1 hover:bg-layer-1-hover rounded-md p-1";
    }
    return "rounded-md p-1";
  };

  return (
    <button type="button" onClick={handleOnClick} disabled={disabled} className={getVariantClassName()}>
      {customButton ? customButton : <PlusIcon className="h-4 w-4" />}
    </button>
  );
});
