import { EPillVariant, EPillSize, ERadius, Pill } from "@plane/propel/pill";
import { generateIconColors } from "@plane/utils";

export const BetaBadge = () => {
  const color = generateIconColors("CC7700");
  const textColor = color ? color.foreground : "transparent";
  const backgroundColor = color ? color.background : "transparent";
  return (
    <Pill
      variant={EPillVariant.WARNING}
      size={EPillSize.SM}
      radius={ERadius.SQUARE}
      className="border-none "
      style={{ color: textColor, backgroundColor: backgroundColor }}
    >
      Beta
    </Pill>
  );
};
