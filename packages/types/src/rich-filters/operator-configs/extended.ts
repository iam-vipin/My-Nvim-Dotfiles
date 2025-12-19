import type { TFilterValue } from "../expression";
import type {
  TDateFilterFieldConfig,
  TTextFilterFieldConfig,
  TNumberFilterFieldConfig,
  TBooleanFilterFieldConfig,
  TNumberRangeFilterFieldConfig,
} from "../field-types";
import type { EXTENDED_COMPARISON_OPERATOR, EXTENDED_EQUALITY_OPERATOR } from "../operators";

// ----------------------------- EXACT Operator -----------------------------
export type TExtendedExactOperatorConfigs<V extends TFilterValue> =
  | TBooleanFilterFieldConfig
  | TNumberFilterFieldConfig<V>
  | TTextFilterFieldConfig<V>;

// ----------------------------- IN Operator -----------------------------
export type TExtendedInOperatorConfigs<_V extends TFilterValue> = never;

// ----------------------------- RANGE Operator -----------------------------
export type TExtendedRangeOperatorConfigs<V extends TFilterValue> = TNumberRangeFilterFieldConfig<V>;

// ----------------------------- CONTAINS Operator -----------------------------
export type TExtendedContainsOperatorConfigs<V extends TFilterValue> = TTextFilterFieldConfig<V>;

// ----------------------------- LT Operator -----------------------------
export type TLtOperatorConfigs<V extends TFilterValue> = TDateFilterFieldConfig<V> | TNumberFilterFieldConfig<V>;

// ----------------------------- LTE Operator -----------------------------
export type TLteOperatorConfigs<V extends TFilterValue> = TDateFilterFieldConfig<V> | TNumberFilterFieldConfig<V>;

// ----------------------------- GT Operator -----------------------------
export type TGtOperatorConfigs<V extends TFilterValue> = TDateFilterFieldConfig<V> | TNumberFilterFieldConfig<V>;

// ----------------------------- GTE Operator -----------------------------
export type TGteOperatorConfigs<V extends TFilterValue> = TDateFilterFieldConfig<V> | TNumberFilterFieldConfig<V>;

// ----------------------------- Extended Operator Specific Configs -----------------------------
export type TExtendedOperatorSpecificConfigs<V extends TFilterValue> = {
  [EXTENDED_EQUALITY_OPERATOR.CONTAINS]: TExtendedContainsOperatorConfigs<V>;
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN]: TLtOperatorConfigs<V>;
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN_OR_EQUAL_TO]: TLteOperatorConfigs<V>;
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN]: TGtOperatorConfigs<V>;
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN_OR_EQUAL_TO]: TGteOperatorConfigs<V>;
};
