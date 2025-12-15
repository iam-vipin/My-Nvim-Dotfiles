import { cn } from "@plane/utils";

export const getPropertyChangeDropdownClassNames = (isDisabled: boolean) => {
  const dropdownButtonClassName = cn("w-full px-4 py-1.5 hover:bg-layer-transparent-hover", {
    "bg-layer-disabled": isDisabled,
  });
  const errorClassName = "border-[0.5px] border-red-400";

  return {
    dropdownButtonClassName,
    errorClassName,
  };
};
