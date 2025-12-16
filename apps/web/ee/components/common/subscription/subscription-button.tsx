// plane imports
import { Button } from "@plane/propel/button";
import { Tooltip } from "@plane/propel/tooltip";
import { EProductSubscriptionEnum } from "@plane/types";

type TProps = {
  subscriptionType: EProductSubscriptionEnum;
  handleClick: () => void;
  children: React.ReactNode;
  className?: string;
  tooltipContent?: string;
  showTooltip?: boolean;
};

export function SubscriptionButton(props: TProps) {
  const { handleClick, children, className, tooltipContent, showTooltip = false } = props;

  return (
    <Tooltip disabled={!showTooltip} tooltipContent={tooltipContent}>
      <Button variant="tertiary" size="lg" className={className} onClick={handleClick}>
        {children}
      </Button>
    </Tooltip>
  );
}
