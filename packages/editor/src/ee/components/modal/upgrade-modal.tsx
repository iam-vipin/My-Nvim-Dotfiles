// plane imports
import { getButtonStyling } from "@plane/propel/button";
import { cn } from "@plane/utils";
import { ProBadge } from "@/plane-editor/components/badges/pro-badge";

export function UpgradeNowModal() {
  return (
    <div className="bg-layer-1 border border-subtle rounded-lg w-72 my-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col space-y-2 p-3 pb-0">
        <ProBadge />

        {/* Title */}
        <h3 className="text-base font-semibold text-primary leading-tight">Upgrade to access this feature.</h3>
        {/* Description */}
        <p className="text-13 text-secondary leading-relaxed">
          This is a paid feature. You can upgrade your workspace to let all your members use it.
        </p>
      </div>
      {/* Action button */}
      <a
        href="https://plane.so/pricing"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(getButtonStyling("primary", "base"), "no-underline w-fit text-center text-13 mt-4 mb-3 mx-3")}
      >
        Upgrade now
      </a>
    </div>
  );
}
