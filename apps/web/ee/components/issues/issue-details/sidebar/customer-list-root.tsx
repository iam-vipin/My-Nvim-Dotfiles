import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Loader } from "@plane/ui";
// plane web imports
import { useCustomers } from "@/plane-web/hooks/store";
import { SidebarCustomersList } from "./customers-list";

type TWorkItemSidebarCustomerList = {
  workItemId: string;
  workspaceSlug: string;
  isPeekView?: boolean;
};

export const WorkItemSidebarCustomers = observer(function WorkItemSidebarCustomers(
  props: TWorkItemSidebarCustomerList
) {
  const { workItemId, workspaceSlug, isPeekView = false } = props;

  // hooks
  const {
    workItems: { fetchWorkItemCustomers },
  } = useCustomers();

  // fetch issue property values
  const { isLoading } = useSWR(
    workspaceSlug && workItemId ? `WORK_ITEM_CUSTOMERS${workspaceSlug}_${workItemId}` : null,
    () => (workspaceSlug && workItemId ? fetchWorkItemCustomers(workspaceSlug, workItemId) : null),
    {
      revalidateOnFocus: false,
    }
  );
  return (
    <>
      {isLoading ? (
        <Loader>
          <div className="flex gap-2">
            <Loader.Item width="40%" height="30px" />
            <Loader.Item width="60%" height="30px" />
          </div>
        </Loader>
      ) : (
        <SidebarCustomersList isPeekView={isPeekView} workspaceSlug={workspaceSlug} workItemId={workItemId} />
      )}
    </>
  );
});
