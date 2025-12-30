import { observer } from "mobx-react";
import { CloseIcon } from "@plane/propel/icons";
import { Menu } from "@plane/propel/menu";
import { EPillSize, Pill } from "@plane/propel/pill";
import { IssuePropertyLogo } from "@/plane-web/components/issue-types/properties/common/issue-property-logo";
import { useIssueProperty } from "@/plane-web/hooks/store";

type Props = {
  typeId: string;
  propertyId: string;
  handleRemove: () => void;
};
export const TypeFormPropertiesListItem = observer(function TypeFormPropertiesListItem(props: Props) {
  const { typeId, propertyId, handleRemove } = props;

  const property = useIssueProperty(typeId, propertyId);

  if (!property) return null;

  return (
    <div className="p-2 rounded-md border border-subtle-1">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <IssuePropertyLogo icon_props={property?.logo_props?.icon} colorClassName="text-secondary" size={12} />
          <span className="text-secondary text-11">{property.display_name}</span>
        </div>
        <div className="flex gap-2 items-center">
          {property.is_required && (
            <Pill className="border-none text-11 font-semibold text-tertiary" size={EPillSize.XS}>
              Mandatory
            </Pill>
          )}
          {!property.is_required && (
            <Menu ellipsis>
              <Menu.MenuItem onClick={handleRemove} className="flex items-center gap-2 text-danger-primary">
                <CloseIcon className="size-4" />
                <span className="text-11">Remove property</span>
              </Menu.MenuItem>
            </Menu>
          )}
        </div>
      </div>
    </div>
  );
});
