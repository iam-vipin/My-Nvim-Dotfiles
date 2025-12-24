import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { CustomerDefaultProperties, CustomerCustomPropertiesRoot } from "@/plane-web/components/customers/settings";

export const CustomerPropertiesRoot = observer(function CustomerPropertiesRoot() {
  return (
    <>
      <CustomerDefaultProperties />
      <CustomerCustomPropertiesRoot />
    </>
  );
});
