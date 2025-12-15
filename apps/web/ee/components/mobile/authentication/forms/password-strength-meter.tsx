import type { FC } from "react";
import { useMemo } from "react";
import { E_PASSWORD_STRENGTH } from "@plane/constants";
import { cn, getPasswordStrength } from "@plane/utils";

type TMobilePasswordStrengthMeter = {
  password: string;
  isFocused?: boolean;
};

export function MobilePasswordStrengthMeter(props: TMobilePasswordStrengthMeter) {
  const { password, isFocused = false } = props;

  // derived values
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthBars = useMemo(() => {
    switch (strength) {
      case E_PASSWORD_STRENGTH.EMPTY: {
        return {
          bars: [`bg-layer-1`, `bg-layer-1`, `bg-layer-1`],
          text: `Please enter your password`,
          textColor: `text-primary`,
        };
      }
      case E_PASSWORD_STRENGTH.LENGTH_NOT_VALID: {
        return {
          bars: [`bg-red-500`, `bg-layer-1`, `bg-layer-1`],
          text: `Password length should me more than 8 characters`,
          textColor: `text-red-500`,
        };
      }
      case E_PASSWORD_STRENGTH.STRENGTH_NOT_VALID: {
        return {
          bars: [`bg-red-500`, `bg-layer-1`, `bg-layer-1`],
          text: `Password is weak`,
          textColor: `text-red-500`,
        };
      }
      case E_PASSWORD_STRENGTH.STRENGTH_VALID: {
        return {
          bars: [`bg-green-500`, `bg-green-500`, `bg-green-500`],
          text: `Password is strong`,
          textColor: `text-green-500`,
        };
      }
      default: {
        return {
          bars: [`bg-layer-1`, `bg-layer-1`, `bg-layer-1`],
          text: `Please enter your password`,
          textColor: `text-primary`,
        };
      }
    }
  }, [strength]);

  const isPasswordMeterVisible = isFocused ? true : strength === E_PASSWORD_STRENGTH.STRENGTH_VALID ? false : true;

  if (!isPasswordMeterVisible) return <></>;
  return (
    <div className="w-full space-y-2 pt-2">
      <div className="space-y-1.5">
        <div className="relative flex items-center gap-2">
          {strengthBars?.bars.map((color, index) => (
            <div key={`${color}-${index}`} className={cn("w-full h-1 rounded-full", color)} />
          ))}
        </div>
        <div className={cn(`text-11 font-medium text-primary`, strengthBars?.textColor)}>{strengthBars?.text}</div>
      </div>
    </div>
  );
}
