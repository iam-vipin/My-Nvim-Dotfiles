/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

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

export const AdditionalFilterValueInput = observer(function AdditionalFilterValueInput<
  P extends TFilterProperty,
  V extends TFilterValue,
>(props: TFilterValueInputProps<P, V>) {
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

  // With value filter input
  if (filterFieldConfig?.type === FILTER_FIELD_TYPE.WITH_VALUE) {
    // No input needed for "with value" filters—render nothing.
    return <></>;
  }

  return <AdditionalFilterValueInputCE {...props} />;
});
