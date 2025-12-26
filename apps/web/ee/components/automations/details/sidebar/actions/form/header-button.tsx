// plane imports
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";

type TProps = {
  children: React.ReactNode;
  isDisabled?: boolean;
  onClick: () => void;
  tooltipMessage?: string;
  variant: "default" | "destructive";
};

export function AutomationDetailsSidebarActionFormHeaderButton(props: TProps) {
  const { children, isDisabled, onClick, tooltipMessage, variant } = props;

  return (
    <Tooltip tooltipContent={tooltipMessage} position="left" disabled={!tooltipMessage}>
      <span>
        <button
          type="button"
          className={cn(
            "flex-shrink-0 size-4 rounded-sm grid place-items-center outline-none border-none text-tertiary transition-colors",
            {
              "hover:text-primary hover:bg-layer-1": variant === "default",
              "hover:text-danger-primary hover:bg-danger-primary": variant === "destructive",
              "hover:text-tertiary hover:bg-transparent cursor-not-allowed": isDisabled,
            }
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          disabled={isDisabled}
        >
          {children}
        </button>
      </span>
    </Tooltip>
  );
}
