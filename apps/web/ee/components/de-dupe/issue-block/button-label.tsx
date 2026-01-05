// plane imports
import { PiIcon, ChevronRightIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";

type TDeDupeIssueButtonLabelProps = {
  isOpen: boolean;
  buttonLabel: string;
};

export function DeDupeIssueButtonLabel(props: TDeDupeIssueButtonLabelProps) {
  const { isOpen, buttonLabel } = props;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0.5 h-6 p-1 rounded-sm border border-transparent bg-accent-primary/10 shadow-sm overflow-hidden w-fit",
        {
          "border-accent-strong/10 shadow-md": isOpen,
        }
      )}
    >
      <PiIcon className="size-4 shrink-0" />
      <span className="min-w-0 max-w-32 truncate text-13 text-secondary">{buttonLabel}</span>
      <ChevronRightIcon className="size-4 text-placeholder shrink-0" />
    </div>
  );
}
