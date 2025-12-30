import { observer } from "mobx-react";
import { ScrollArea } from "@plane/propel/scrollarea";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TCustomer } from "@plane/types";
// plane web imports
import { SidebarWrapper } from "@/plane-web/components/common/layout/sidebar/sidebar-wrapper";
import {
  CustomerAdditionalPropertyValuesUpdate,
  CustomerDefaultSidebarProperties,
} from "@/plane-web/components/customers";
import { useCustomers } from "@/plane-web/hooks/store";

type TProps = {
  customerId: string;
  workspaceSlug: string;
  isDisabled: boolean;
};

export const CustomerDetailSidebar = observer(function CustomerDetailSidebar(props: TProps) {
  const { customerId, workspaceSlug, isDisabled } = props;

  // hooks
  const { getCustomerById, updateCustomer, customerDetailSidebarCollapsed } = useCustomers();
  const updateProperty = (data: Partial<TCustomer>) => {
    let _payload = { ...data };
    if (data.website_url) {
      const parsedUrl = data?.website_url?.startsWith("http") ? data.website_url : `http://${data.website_url}`;
      _payload = { ...data, website_url: parsedUrl };
    }
    updateCustomer(workspaceSlug, customerId, _payload)
      .then(() => {})
      .catch((error) => {
        const errorMessage = (error as { error?: string })?.error;
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: errorMessage || "Unable to update property.Try again!",
        });
      });
  };

  // derived values
  const customer = getCustomerById(customerId);
  if (!customer) return <></>;

  return (
    <SidebarWrapper isSidebarOpen={!customerDetailSidebarCollapsed}>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col gap-2">
            <CustomerDefaultSidebarProperties
              customer={customer}
              updateProperty={updateProperty}
              isDisabled={isDisabled}
            />
            <CustomerAdditionalPropertyValuesUpdate
              customerId={customerId}
              workspaceSlug={workspaceSlug}
              isDisabled={isDisabled}
            />
          </div>
        </ScrollArea>
      </div>
    </SidebarWrapper>
  );
});
