import React from "react";
import { observer } from "mobx-react";
// plane imports
import type {
  TFilterValue,
  TFilterProperty,
  SingleOrArray,
  TFilterConditionNodeForDisplay,
  TBooleanFilterFieldConfig,
  TTextFilterFieldConfig,
  TNumberFilterFieldConfig,
  TNumberRangeFilterFieldConfig,
} from "@plane/types";
import { FILTER_FIELD_TYPE } from "@plane/types";
// ce imports
import { AdditionalFilterValueInput as AdditionalFilterValueInputCE } from "@/ce/components/rich-filters/filter-value-input/root";
// local imports
import type { TFilterValueInputProps } from "@/components/rich-filters/shared";
import { BooleanFilterValueInput } from "./boolean/root";
import { NumberRangeFilterValueInput } from "./number/range";
import { NumberFilterValueInput } from "./number/single";
import { TextFilterValueInput } from "./text/root";

export const AdditionalFilterValueInput = observer(
  <P extends TFilterProperty, V extends TFilterValue>(props: TFilterValueInputProps<P, V>) => {
    const { condition, filterFieldConfig, isDisabled = false, onChange } = props;

    // Boolean filter input
    if (filterFieldConfig?.type === FILTER_FIELD_TYPE.BOOLEAN) {
      return (
        <BooleanFilterValueInput<P>
          config={filterFieldConfig as TBooleanFilterFieldConfig}
          condition={condition as TFilterConditionNodeForDisplay<P, boolean>}
          isDisabled={isDisabled}
          onChange={(value) => onChange(value as SingleOrArray<V>)}
        />
      );
    }

    // Text filter input
    if (filterFieldConfig?.type === FILTER_FIELD_TYPE.TEXT) {
      return (
        <TextFilterValueInput<P>
          config={filterFieldConfig as TTextFilterFieldConfig<string>}
          condition={condition as TFilterConditionNodeForDisplay<P, string>}
          isDisabled={isDisabled}
          onChange={(value) => onChange(value as SingleOrArray<V>)}
        />
      );
    }

    // Number filter input
    if (filterFieldConfig?.type === FILTER_FIELD_TYPE.NUMBER) {
      return (
        <NumberFilterValueInput<P>
          config={filterFieldConfig as TNumberFilterFieldConfig<number>}
          condition={condition as TFilterConditionNodeForDisplay<P, number>}
          isDisabled={isDisabled}
          onChange={(value) => onChange(value as SingleOrArray<V>)}
        />
      );
    }

    // Number range filter input
    if (filterFieldConfig?.type === FILTER_FIELD_TYPE.NUMBER_RANGE) {
      return (
        <NumberRangeFilterValueInput<P>
          config={filterFieldConfig as TNumberRangeFilterFieldConfig<number>}
          condition={condition as TFilterConditionNodeForDisplay<P, number>}
          isDisabled={isDisabled}
          onChange={(value) => onChange(value as SingleOrArray<V>)}
        />
      );
    }

    return <AdditionalFilterValueInputCE {...props} />;
  }
);
