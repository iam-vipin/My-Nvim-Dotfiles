import type { FC } from "react";
import React from "react";
import { ArrowRight } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import { EpicIcon, LayersIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { EWorkItemConversionType } from "@plane/types";

interface ConvertWorkItemIconProps {
  handleOnClick: () => void;
  conversionType: EWorkItemConversionType;
  disabled?: boolean;
}

export function ConvertWorkItemIcon(props: ConvertWorkItemIconProps) {
  const { handleOnClick, conversionType, disabled = false } = props;
  // derived values
  const IconComponent = conversionType === EWorkItemConversionType.WORK_ITEM ? LayersIcon : EpicIcon;
  const tooltipContent =
    conversionType === EWorkItemConversionType.WORK_ITEM ? "Convert to Work item" : "Convert to Epic";

  return (
    <Tooltip tooltipContent={tooltipContent}>
      <Button
        size="lg"
        variant="secondary"
        onClick={handleOnClick}
        disabled={disabled}
        aria-label={tooltipContent}
        prependIcon={<ArrowRight />}
        appendIcon={<IconComponent />}
      />
    </Tooltip>
  );
}
