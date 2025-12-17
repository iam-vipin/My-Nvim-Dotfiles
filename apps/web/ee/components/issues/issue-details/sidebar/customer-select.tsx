import type { FC } from "react";
import React from "react";
import { difference } from "lodash-es";
import { observer } from "mobx-react";
import { mutate } from "swr";
import { PlusIcon } from "lucide-react";
// plane imports
import { CUSTOMER_TRACKER_EVENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { CustomersIcon } from "@plane/propel/icons";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
// plane web imports
import { captureError, captureSuccess } from "@/helpers/event-tracker.helper";
import { CustomerDropDown } from "@/plane-web/components/customers";
import { useCustomers } from "@/plane-web/hooks/store";
import { IconButton } from "@plane/propel/icon-button";
type TProps = {
  workItemId: string;
  value: string[] | null;
  workspaceSlug: string;
};

export const CustomerSelect = observer(function CustomerSelect(props: TProps) {
  const { workItemId, value, workspaceSlug } = props;
  // hooks
  const {
    workItems: { addWorkItemsToCustomer, removeWorkItemFromCustomer },
  } = useCustomers();
  const { t } = useTranslation();
  const handleChange = async (_value: string | string[]) => {
    // get the newly added customer id
    const addedCustomerIds = difference(_value, value || []);
    const removedCustomerIds = difference(value || [], _value);
    if (addedCustomerIds.length) {
      addWorkItemsToCustomer(workspaceSlug, addedCustomerIds[0], [workItemId])
        .then(() => {
          captureSuccess({
            eventName: CUSTOMER_TRACKER_EVENTS.add_work_items_to_customer,
            payload: {
              id: addedCustomerIds[0],
              work_item_ids: [workItemId],
            },
          });
          return;
        })
        .catch((error) => {
          captureError({
            eventName: CUSTOMER_TRACKER_EVENTS.add_work_items_to_customer,
            payload: {
              id: addedCustomerIds[0],
              work_item_ids: [workItemId],
            },
            error: error as Error,
          });
          setToast({
            title: t("toast.error"),
            type: TOAST_TYPE.ERROR,
            message: t("customers.toasts.work_item.add.error.message"),
          });
        });
    }
    if (removedCustomerIds.length) {
      await removeWorkItemFromCustomer(workspaceSlug, removedCustomerIds[0], workItemId)
        .then(() => {
          captureSuccess({
            eventName: CUSTOMER_TRACKER_EVENTS.remove_work_items_from_customer,
            payload: {
              id: removedCustomerIds[0],
              work_item_ids: [workItemId],
            },
          });
          return;
        })
        .catch((error) => {
          captureError({
            eventName: CUSTOMER_TRACKER_EVENTS.remove_work_items_from_customer,
            payload: {
              id: removedCustomerIds[0],
              work_item_ids: [workItemId],
            },
            error: error as Error,
          });
          setToast({
            title: t("toast.error"),
            type: TOAST_TYPE.ERROR,
            message: t("customers.toasts.work_item.remove.error.message"),
          });
        });
      await mutate(`WORK_ITEM_REQUESTS${workspaceSlug}_${workItemId}`);
    }
  };

  return (
    <CustomerDropDown
      customButton={
        <button
          type="button"
          className="h-full w-full flex items-center gap-1.5 rounded-lg px-2 py-0.5 bg-layer-transparent-active hover:bg-layer-transparent-hover text-body-xs-regular text-tertiary"
        >
          <PlusIcon className="size-4" />
          <span className="flex-shrink-0 text-body-xs-regular">{t("customers.dropdown.placeholder")}</span>
        </button>
      }
      customButtonClassName="hover:bg-transparent"
      value={value || []}
      multiple
      onChange={handleChange}
      disabled={false}
    />
  );
});
