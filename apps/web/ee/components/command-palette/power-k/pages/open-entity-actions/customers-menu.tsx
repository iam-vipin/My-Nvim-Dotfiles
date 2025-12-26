import { observer } from "mobx-react";
// plane imports
import type { TCustomer } from "@plane/types";
import { Spinner } from "@plane/ui";
// plane-web hooks
import { useCustomers } from "@/plane-web/hooks/store";
// local imports
import { PowerKCustomersMenu } from "../../menus/customers";

type Props = {
  handleSelect: (customer: TCustomer) => void;
};

export const PowerKOpenCustomersMenu = observer(function PowerKOpenCustomersMenu(props: Props) {
  const { handleSelect } = props;
  // store hooks
  const { loader, customerIds, getCustomerById } = useCustomers();
  // derived values
  const customersList = customerIds
    ? customerIds.map((customerId) => getCustomerById(customerId)).filter((customer) => !!customer)
    : [];

  if (loader === "init-loader") return <Spinner />;

  return <PowerKCustomersMenu customers={customersList} onSelect={handleSelect} />;
});
