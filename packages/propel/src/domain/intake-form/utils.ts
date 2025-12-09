import type { IIssueProperty, EIssuePropertyType } from "@plane/types";

/**
 * Filter out RELATION type properties for intake forms
 * Intake forms should not include relation-based properties (USER/ISSUE relations)
 * as they require additional context that external users won't have
 */
export const filterIntakeEligibleProperties = (
  properties: IIssueProperty<EIssuePropertyType>[]
): IIssueProperty<EIssuePropertyType>[] =>
  properties.filter((prop) => prop.relation_type === null || prop.relation_type === undefined);

/**
 * Get the property type key for rendering the correct input component
 */
export const getPropertyTypeKey = (propertyType: EIssuePropertyType | undefined): string => {
  if (!propertyType) return "UNKNOWN";
  return propertyType;
};

/**
 * Format form data for submission
 */
export const formatFormDataForSubmission = (data: Record<string, any>) => ({
  ...data,
  // Convert property fields to the expected format
  properties: Object.keys(data)
    .filter((key) => key.startsWith("property_"))
    .reduce(
      (acc, key) => {
        const propertyId = key.replace("property_", "");
        acc[propertyId] = data[key];
        return acc;
      },
      {} as Record<string, any>
    ),
});
