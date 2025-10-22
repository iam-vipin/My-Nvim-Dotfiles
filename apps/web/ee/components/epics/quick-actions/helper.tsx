import { useMemo } from "react";
import type { TContextMenuItem } from "@plane/ui";
import type { MenuItemFactoryProps } from "@/components/issues/issue-layouts/quick-action-dropdowns/helper";
import { useMenuItemFactory } from "@/components/issues/issue-layouts/quick-action-dropdowns/helper";

export const useEpicMenuItems = (props: MenuItemFactoryProps): TContextMenuItem[] => {
  const factory = useMenuItemFactory(props);

  return useMemo(
    () => [
      factory.createEditMenuItem(),
      factory.createCopyMenuItem(props.workspaceSlug),
      factory.createOpenInNewTabMenuItem(),
      factory.createCopyLinkMenuItem(),
      factory.createDeleteMenuItem(),
    ],
    [factory, props.workspaceSlug]
  );
};
