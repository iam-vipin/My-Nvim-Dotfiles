/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { FC } from "react";
import React, { Fragment, useState } from "react";
import { observer } from "mobx-react";
import { usePopper } from "react-popper";
import { Popover, Transition } from "@headlessui/react";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { CustomersIcon } from "@plane/propel/icons";
import { EUserWorkspaceRoles } from "@plane/types";
import { getFileURL } from "@plane/utils";
// components
// hooks
import { useUserPermissions } from "@/hooks/store/user";
import { useCustomers } from "@/plane-web/hooks/store";
import { CustomerPreview } from "./preview";
import { Button } from "@plane/propel/button";

type TCustomerListItem = {
  customerId: string;
  isPeekView?: boolean;
  workspaceSlug: string;
};

export const CustomerSidebarListitem = observer(function CustomerSidebarListitem(props: TCustomerListItem) {
  const { customerId, isPeekView, workspaceSlug } = props;
  // refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  // hooks
  const { getCustomerById } = useCustomers();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const customer = getCustomerById(customerId);
  const isAdmin = allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: isPeekView ? "right" : "left",
  });

  if (!customer) return null;
  return (
    <Popover as="div" className="truncate max-w-[200px]">
      <button
        type="button"
        className="h-full w-full flex items-center gap-1.5 rounded-lg px-2 py-0.5 bg-layer-transparent-active hover:bg-layer-transparent-hover text-body-xs-regular text-tertiary"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        ref={setReferenceElement}
      >
        {customer.logo_url ? (
          <img src={getFileURL(customer.logo_url)} alt="customer-logo" className="rounded-md w-3 h-3 object-cover" />
        ) : (
          <CustomersIcon className="size-4 opacity-50" />
        )}
        <span className="flex-shrink-0 text-body-xs-regular truncate">{customer.name}</span>
      </button>
      <Transition as={Fragment} show={showPreview}>
        <Popover.Panel
          {...attributes.popper}
          className={""}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          {isAdmin && (
            <CustomerPreview
              workspaceSlug={workspaceSlug}
              customer={customer}
              setPopperElement={setPopperElement}
              styles={styles}
            />
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
});
