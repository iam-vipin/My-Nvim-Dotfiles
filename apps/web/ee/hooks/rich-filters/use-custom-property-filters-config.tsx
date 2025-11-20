import React, { useMemo } from "react";
// plane imports
import { ISSUE_PROPERTY_TYPE_DETAILS } from "@plane/constants";
import type {
  EIssuePropertyType,
  IIssueProperty,
  IUserLite,
  TCustomPropertyFilterKey,
  TFilterConfig,
  TFilterValue,
} from "@plane/types";
import { Avatar } from "@plane/ui";
import type { TCustomPropertyFilterParams, TFilterIconType } from "@plane/utils";
import {
  getBooleanPropertyFilterConfig,
  getDatePropertyFilterConfig,
  getDropdownPropertyFilterConfig,
  getFileURL,
  getIssuePropertyTypeKey,
  getMemberPickerPropertyFilterConfig,
  getNumberPropertyFilterConfig,
  getTextPropertyFilterConfig,
} from "@plane/utils";
// ce imports
import type { TFiltersOperatorConfigs } from "@/ce/hooks/rich-filters/use-filters-operator-configs";
import { CUSTOM_PROPERTY_ICON_MAP } from "@/plane-web/components/issue-types/properties/property-icon";

interface TUseCustomPropertyFiltersConfigProps {
  customProperties: IIssueProperty<EIssuePropertyType>[];
  getAdditionalRightContent: (property: IIssueProperty<EIssuePropertyType>) => JSX.Element | undefined;
  getPropertyTooltipContent: (property: IIssueProperty<EIssuePropertyType>) => React.ReactNode | undefined;
  isFilterEnabled: (key: TCustomPropertyFilterKey) => boolean;
  members: IUserLite[];
  operatorConfigs: TFiltersOperatorConfigs;
}

interface TCustomPropertyFiltersConfig {
  configs: Array<TFilterConfig<TCustomPropertyFilterKey, TFilterValue>>;
  configMap: Record<TCustomPropertyFilterKey, TFilterConfig<TCustomPropertyFilterKey, TFilterValue>>;
}

export const useCustomPropertyFiltersConfig = ({
  customProperties,
  getAdditionalRightContent,
  getPropertyTooltipContent,
  isFilterEnabled,
  members,
  operatorConfigs,
}: TUseCustomPropertyFiltersConfigProps): TCustomPropertyFiltersConfig =>
  useMemo(() => {
    const configs: Array<TFilterConfig<TCustomPropertyFilterKey, TFilterValue>> = [];
    const configMap: Record<TCustomPropertyFilterKey, TFilterConfig<TCustomPropertyFilterKey, TFilterValue>> = {};

    customProperties.forEach((property) => {
      if (!property.id) return;

      // Custom property key
      const customPropertyKey = `customproperty_${property.id}` as TCustomPropertyFilterKey;
      const isEnabled = isFilterEnabled(customPropertyKey) && !!property.is_active;

      // Property type details
      const propertyTypeKey = getIssuePropertyTypeKey(property.property_type, property.relation_type);
      const propertyTypeDetails = ISSUE_PROPERTY_TYPE_DETAILS[propertyTypeKey];

      // Generate config based on property type
      let config: TFilterConfig<TCustomPropertyFilterKey, TFilterValue> | null = null;

      const commonConfig: TCustomPropertyFilterParams<TFilterIconType> = {
        isEnabled,
        filterIcon: propertyTypeDetails?.iconKey ? CUSTOM_PROPERTY_ICON_MAP[propertyTypeDetails.iconKey] : undefined,
        propertyDisplayName: property.display_name || "Custom Property",
        rightContent: getAdditionalRightContent(property),
        tooltipContent: getPropertyTooltipContent(property),
        ...operatorConfigs,
      };

      switch (propertyTypeKey) {
        case "TEXT":
          config = getTextPropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
          });
          break;
        case "URL":
          config = getTextPropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
          });
          break;
        case "DECIMAL":
          config = getNumberPropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
          });
          break;
        case "BOOLEAN":
          config = getBooleanPropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
          });
          break;
        case "DATETIME":
          config = getDatePropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
          });
          break;
        case "OPTION":
          config = getDropdownPropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
            customPropertyOptions: property.propertyOptions ?? [],
          });
          break;
        case "RELATION_USER":
          config = getMemberPickerPropertyFilterConfig<TCustomPropertyFilterKey>(customPropertyKey)({
            ...commonConfig,
            members: members,
            getOptionIcon: (memberDetails) => (
              <Avatar
                name={memberDetails.display_name}
                src={getFileURL(memberDetails.avatar_url)}
                showTooltip={false}
                size="sm"
              />
            ),
          });
          break;
        default:
      }

      if (config) {
        configs.push(config);
        configMap[customPropertyKey] = config;
      }
    });

    return { configs, configMap };
  }, [
    customProperties,
    getAdditionalRightContent,
    getPropertyTooltipContent,
    isFilterEnabled,
    members,
    operatorConfigs,
  ]);
