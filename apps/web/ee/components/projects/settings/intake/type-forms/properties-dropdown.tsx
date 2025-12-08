import { observer } from "mobx-react";
import { Button } from "@plane/propel/button";
import { Combobox } from "@plane/propel/combobox";
import { filterIntakeEligibleProperties } from "@plane/propel/domain/intake-form";
import { AddIcon } from "@plane/propel/icons";
import { EPillSize, Pill } from "@plane/propel/pill";
import { cn } from "@plane/propel/utils";
import type { IIssueType } from "@plane/types";
import { Checkbox } from "@plane/ui";
import { IssuePropertyLogo } from "@/plane-web/components/issue-types/properties/common/issue-property-logo";

type Props = {
  onSelect: (value: string[]) => void;
  workItemType: IIssueType;
  selectedFields?: string[];
};
export const TypePropertiesDropdown: React.FC<Props> = observer((props: Props) => {
  const { workItemType, selectedFields = [], onSelect } = props;

  // Filter out RELATION type properties for intake forms
  const properties = filterIntakeEligibleProperties(workItemType.activeProperties);

  const handleSelect = (value: string[] | string) => {
    if (Array.isArray(value)) {
      onSelect(value);
    } else {
      onSelect([value]);
    }
  };

  const isPropertyDisabled = (propertyId: string): boolean => {
    const property = properties.find((property) => property.id === propertyId);
    if (!property?.id) return true;

    if (!selectedFields.includes(propertyId) && property.is_required) return false;

    if (property.is_required) return true;

    return false;
  };

  return (
    <Combobox multiSelect value={selectedFields} onValueChange={handleSelect}>
      <Combobox.Button>
        <Button variant="neutral-primary" className="bg-custom-background-80 rounded-lg px-1.5 py-1" size="sm">
          <AddIcon className="size-3" />
          <span className="truncate text-xs text-custom-text-300 font-semibold">Select properties</span>
        </Button>
      </Combobox.Button>
      <Combobox.Options showSearch searchPlaceholder="Search for properties" className="w-72 text-sm">
        {properties.map((property) => {
          if (!property.id) return null;
          return (
            <Combobox.Option
              key={property.id}
              value={property.id}
              className={cn("flex items-center justify-between gap-1 py-2", {
                "opacity-80": isPropertyDisabled(property.id),
                "cursor-not-allowed": isPropertyDisabled(property.id),
              })}
              disabled={isPropertyDisabled(property.id)}
            >
              <div className="flex items-center gap-1">
                <Checkbox checked={selectedFields.includes(property.id)} disabled={isPropertyDisabled(property.id)} />
                <IssuePropertyLogo
                  size={12}
                  icon_props={property?.logo_props?.icon}
                  colorClassName={property.is_active ? "text-custom-text-200" : "text-custom-text-300"}
                />
                <span className="text-custom-text-200 text-sm">{property.name}</span>
              </div>
              {property.is_required && (
                <Pill size={EPillSize.XS} className="text-custom-text-300 border-none text-xs">
                  Mandatory
                </Pill>
              )}
            </Combobox.Option>
          );
        })}
      </Combobox.Options>
    </Combobox>
  );
});
