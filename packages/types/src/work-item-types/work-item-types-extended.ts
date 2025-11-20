import type { EIssuePropertyType, IIssueProperty } from "./work-item-properties";
import type { TIssuePropertyTypeKeys } from "./work-item-property-configurations";
import type { IIssueType } from "./work-item-types";

export type TIssuePropertySerializedValuePrimitive = string | number | boolean | null | undefined;
export type TIssuePropertySerializedValue =
  | TIssuePropertySerializedValuePrimitive
  | TIssuePropertySerializedValuePrimitive[];

export type TIssuePropertySerializedEntry = {
  property_id?: string;
  value?: TIssuePropertySerializedValue;
  [key: string]: TIssuePropertySerializedValue | undefined;
} | null;

export type TIssuePropertyDisplayEntry = {
  property: IIssueProperty<EIssuePropertyType>;
  propertyId: string;
  propertyTypeKey: TIssuePropertyTypeKeys;
  displayValues: string[];
};

export type TIssuePropertyDisplayContext = {
  entries: TIssuePropertySerializedEntry[];
  workItemType?: IIssueType;
};
