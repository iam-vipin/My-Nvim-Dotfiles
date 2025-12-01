import { Plus } from "lucide-react";
import { cn, getButtonStyling } from "@plane/ui";

type Props = {
  toggleModal: () => void;
  variant?: "default" | "compact";
};
export const AddMilestoneButton = (props: Props) => {
  const { toggleModal, variant = "default" } = props;

  const handleClick = (e: React.MouseEvent<HTMLDivElement | SVGSVGElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleModal();
  };

  return (
    <>
      {variant === "default" ? (
        <div
          onClick={handleClick}
          className={cn(getButtonStyling("accent-primary", "sm"), "font-medium px-2 py-1 cursor-pointer")}
        >
          Create
        </div>
      ) : (
        <Plus className="h-4 w-4" onClick={handleClick} />
      )}
    </>
  );
};
