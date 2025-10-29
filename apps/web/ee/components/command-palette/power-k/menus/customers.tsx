"use client";

import React from "react";
import { observer } from "mobx-react";
// plane imports
import { CustomersIcon } from "@plane/propel/icons";
import type { TCustomer } from "@plane/types";
import { SwitcherIcon } from "@/components/common/switcher-label";
import { PowerKMenuBuilder } from "@/components/power-k/menus/builder";

type Props = {
  customers: TCustomer[];
  onSelect: (customer: TCustomer) => void;
};

export const PowerKCustomersMenu: React.FC<Props> = observer(({ customers, onSelect }) => (
  <PowerKMenuBuilder
    heading="Customers"
    items={customers}
    getIconNode={(customer) => <SwitcherIcon logo_url={customer.logo_url} LabelIcon={CustomersIcon} size={14} />}
    getKey={(customer) => customer.id || customer.name}
    getLabel={(customer) => customer.name}
    getValue={(customer) => customer.name}
    onSelect={onSelect}
    emptyText="No customers found"
  />
));
