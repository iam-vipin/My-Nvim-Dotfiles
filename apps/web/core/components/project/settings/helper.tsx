import { PROJECT_TRACKER_ELEMENTS } from "@plane/constants";
import { ChevronRightIcon } from "@plane/propel/icons";
import { EPillVariant, Pill, EPillSize } from "@plane/propel/pill";
import { ToggleSwitch } from "@plane/ui";
import type { TProperties } from "@/ce/constants/project/settings/features";

type Props = {
  featureItem: TProperties;
  value: boolean;
  handleSubmit: (featureKey: string, featureProperty: string) => void;
  disabled?: boolean;
  isCreateModal?: boolean;
};

export const ProjectFeatureToggle = (props: Props) => {
  const { featureItem, value, handleSubmit, disabled, isCreateModal } = props;

  const handleToggle = () => {
    handleSubmit(featureItem.key, featureItem.property);
  };

  // ToggleSwitch props
  const toggleSwitchProps = {
    value,
    onChange: handleToggle,
    disabled,
    size: "sm" as const,
  };

  if (isCreateModal) {
    return <ToggleSwitch {...toggleSwitchProps} />;
  }

  if (featureItem.href) {
    return (
      <div className="flex items-center gap-2">
        <Pill
          variant={value ? EPillVariant.PRIMARY : EPillVariant.DEFAULT}
          size={EPillSize.SM}
          className="border-none rounded-lg"
        >
          {value ? "Enabled" : "Disabled"}
        </Pill>
        <ChevronRightIcon className="h-4 w-4 text-custom-text-300" />
      </div>
    );
  }

  return <ToggleSwitch {...toggleSwitchProps} data-ph-element={PROJECT_TRACKER_ELEMENTS.TOGGLE_FEATURE} />;
};
