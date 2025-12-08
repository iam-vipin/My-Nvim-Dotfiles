import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { ChevronDownIcon } from "@plane/propel/icons";
// plane imports
import { EProductSubscriptionEnum } from "@plane/types";
import { MultiSelectDropdown } from "@plane/ui";
import { cn } from "@plane/utils";

type TSelectSupportedPlansProps = {
  value: string[];
  handleChange: (value: string[]) => void;
};

const COMMON_DROPDOWN_CONTAINER_CLASSNAME =
  "bg-custom-background-100 border border-custom-border-200 rounded-md px-2 py-1";

const PLAN_OPTIONS = [
  { data: EProductSubscriptionEnum.FREE, value: "Free" },
  { data: EProductSubscriptionEnum.ONE, value: "One" },
  { data: EProductSubscriptionEnum.PRO, value: "Pro" },
  { data: EProductSubscriptionEnum.BUSINESS, value: "Business" },
  { data: EProductSubscriptionEnum.ENTERPRISE, value: "Enterprise" },
];

export const SelectSupportedPlans: React.FC<TSelectSupportedPlansProps> = observer((props) => {
  const { value, handleChange } = props;
  // plane hooks
  const { t } = useTranslation();

  return (
    <MultiSelectDropdown
      value={value}
      options={PLAN_OPTIONS}
      onChange={(value) => handleChange(value as string[])}
      keyExtractor={(option) => option.data}
      buttonContainerClassName={COMMON_DROPDOWN_CONTAINER_CLASSNAME}
      buttonContent={(isOpen, val) => (
        <span className="flex items-center justify-between gap-1 text-sm text-custom-text-300 w-60">
          {val && val.length > 0
            ? `${val.length} ${t("workspace_settings.settings.applications.supported_plans")}`
            : t("workspace_settings.settings.applications.select_plans")}
          <ChevronDownIcon height={16} width={16} className={cn(isOpen ? "rotate-180 ml-auto" : "rotate-0 ml-auto")} />
        </span>
      )}
      disableSearch
    />
  );
});
