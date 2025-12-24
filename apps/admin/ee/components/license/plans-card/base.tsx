import { observer } from "mobx-react";
import type { EProductSubscriptionEnum } from "@plane/types";
// plane imports
import { getSubscriptionName } from "@plane/utils";

type TBasePlanCard = {
  planVariant: EProductSubscriptionEnum;
  planDescription: React.ReactNode;
  button: React.ReactNode;
};

export const BasePlanCard = observer(function BasePlanCard(props: TBasePlanCard) {
  const { planVariant, planDescription, button } = props;
  // derived values
  const planName = getSubscriptionName(planVariant);

  return (
    <div className="flex gap-2 font-medium items-center justify-between bg-accent-subtle rounded-lg p-4">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-18 leading-6 font-bold text-accent-primary">{planName}</h4>
        <div className="text-13 text-secondary font-medium">{planDescription}</div>
      </div>
      <div className="flex flex-col gap-1 items-center justify-center">{button}</div>
    </div>
  );
});
