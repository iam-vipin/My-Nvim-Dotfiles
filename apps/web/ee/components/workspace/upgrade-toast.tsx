import { PlaneLogo } from "@plane/propel/icons";

export function UpgradeToast() {
  return (
    <div className="flex gap-2 px-2">
      <div className="flex-shrink-0 pt-1.5">
        <PlaneLogo className="h-3 w-auto text-accent-primary" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="text-13 font-medium leading-5">Upgrade</div>
        <div className="text-secondary">Get this feature when you upgrade to Pro.</div>
      </div>
    </div>
  );
}
