import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { CustomersIcon } from "@plane/propel/icons";
import { EUserWorkspaceRoles } from "@plane/types";
import { useUserPermissions } from "@/hooks/store/user";
import { useCustomers } from "@/plane-web/hooks/store";
import { SidebarPropertyListItem } from "@/components/common/layout/sidebar/property-list-item";
import { CustomerSidebarListitem } from "./customer-list-item";
import { CustomerSelect } from "./customer-select";

type TProps = {
  isPeekView: boolean;
  workspaceSlug: string;
  workItemId: string;
};

export const SidebarCustomersList = observer(function SidebarCustomersList(props: TProps) {
  const { isPeekView, workspaceSlug, workItemId } = props;
  // hooks
  const { t } = useTranslation();
  const {
    workItems: { getWorkItemCustomerIds },
  } = useCustomers();
  const { allowPermissions } = useUserPermissions();

  // derived values
  const customerIds = getWorkItemCustomerIds(workItemId);
  const isAdmin = allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE);
  return (
    <SidebarPropertyListItem icon={CustomersIcon} label={t("customers.label", { count: 2 })}>
      {customerIds?.length
        ? customerIds?.map((id) => (
            <CustomerSidebarListitem workspaceSlug={workspaceSlug} isPeekView={isPeekView} key={id} customerId={id} />
          ))
        : !isAdmin && <span className="text-13 text-placeholder px-2">{t("customers.dropdown.no_selection")}</span>}
      {isAdmin && (
        <CustomerSelect
          customButtonClassName="w-full h-7.5 text-left"
          workspaceSlug={workspaceSlug}
          value={customerIds || null}
          workItemId={workItemId}
        />
      )}
    </SidebarPropertyListItem>
  );
});
