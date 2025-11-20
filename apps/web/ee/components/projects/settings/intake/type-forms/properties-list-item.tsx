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
export const TypeFormPropertiesListItem: React.FC<Props> = observer((props: Props) => {
  const { typeId, propertyId, handleRemove } = props;

  const property = useIssueProperty(typeId, propertyId);

  if (!property) return null;

  return (
    <div className="p-2 rounded-md border border-custom-border-200">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <IssuePropertyLogo icon_props={property?.logo_props?.icon} colorClassName="text-custom-text-200" size={12} />
          <span className="text-custom-text-200 text-xs">{property.display_name}</span>
        </div>
        <div className="flex gap-2 items-center">
          {property.is_required && (
            <Pill className="border-none text-xs font-semibold text-custom-text-300" size={EPillSize.XS}>
              Mandatory
            </Pill>
          )}
          {!property.is_required && (
            <Menu ellipsis>
              <Menu.MenuItem onClick={handleRemove} className="flex items-center gap-2 text-red-500">
                <CloseIcon className="size-4" />
                <span className="text-xs">Remove property</span>
              </Menu.MenuItem>
            </Menu>
          )}
        </div>
      </div>
    </div>
  );
});
