import { useState } from "react";
import { observer } from "mobx-react";
import { Link2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
// plane imports
import { CUSTOMER_TRACKER_ELEMENTS, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { IconButton } from "@plane/propel/icon-button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EUserWorkspaceRoles } from "@plane/types";
import type { TContextMenuItem } from "@plane/ui";
import { ContextMenu, CustomMenu } from "@plane/ui";
import { cn, copyUrlToClipboard } from "@plane/utils";
// hooks
import { captureClick } from "@/helpers/event-tracker.helper";
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useUserPermissions } from "@/hooks/store/user";
// plane web constants
import { DeleteCustomerModal } from "@/plane-web/components/customers/actions";

type Props = {
  customerId: string;
  workspaceSlug: string;
  parentRef: React.RefObject<HTMLDivElement> | null;
  customClassName?: string;
};

export const CustomerQuickActions = observer(function CustomerQuickActions(props: Props) {
  const { customerId, workspaceSlug, parentRef, customClassName } = props;
  // states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // i18n
  const { t } = useTranslation();
  // store hooks
  const { toggleCreateCustomerModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const customerLink = `${workspaceSlug}/customers/${customerId}`;
  const isAdmin = allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE);

  const handleEditCustomer = () => {
    toggleCreateCustomerModal({ isOpen: true, customerId });
  };

  const handleCopyText = () =>
    copyUrlToClipboard(customerLink).then(() => {
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("customers.toasts.copy_link.title"),
        message: t("customers.toasts.copy_link.message"),
      });
    });

  const handelDeleteCustomer = () => {
    setIsDeleteModalOpen(true);
  };

  const MENU_ITEMS: TContextMenuItem[] = [
    {
      key: "edit",
      title: t("customers.quick_actions.edit"),
      icon: Pencil,
      action: handleEditCustomer,
      shouldRender: isAdmin,
    },
    {
      key: "copy-link",
      action: handleCopyText,
      title: t("customers.quick_actions.copy_link"),
      icon: Link2,
      iconClassName: "-rotate-45",
    },
    {
      key: "delete",
      action: handelDeleteCustomer,
      title: t("customers.quick_actions.delete"),
      icon: Trash2,
      className: "text-red-500",
      shouldRender: isAdmin,
    },
  ];

  return (
    <>
      <DeleteCustomerModal
        customerId={customerId}
        isModalOpen={isDeleteModalOpen}
        handleClose={() => setIsDeleteModalOpen(false)}
      />
      {parentRef && <ContextMenu parentRef={parentRef} items={MENU_ITEMS} />}
      <CustomMenu
        customButton={<IconButton variant="tertiary" size="lg" icon={MoreHorizontal} />}
        placement="bottom-end"
        closeOnSelect
        buttonClassName={customClassName}
      >
        {MENU_ITEMS.map((item) => {
          if (item.shouldRender === false) return null;
          return (
            <CustomMenu.MenuItem
              key={item.key}
              onClick={() => {
                item.action();
                captureClick({ elementName: CUSTOMER_TRACKER_ELEMENTS.QUICK_ACTIONS });
              }}
              className={cn(
                "flex items-center gap-2",
                {
                  "text-placeholder": item.disabled,
                },
                item.className
              )}
              disabled={item.disabled}
            >
              {item.icon && <item.icon className={cn("h-3 w-3", item.iconClassName)} />}
              <div>
                <h5>{item.title}</h5>
                {item.description && (
                  <p
                    className={cn("text-tertiary whitespace-pre-line", {
                      "text-placeholder": item.disabled,
                    })}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </CustomMenu.MenuItem>
          );
        })}
      </CustomMenu>
    </>
  );
});
