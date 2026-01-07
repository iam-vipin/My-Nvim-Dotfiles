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
import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { CustomersIcon } from "@plane/propel/icons";
import { CustomSearchSelect } from "@plane/ui";
import { SwitcherIcon } from "@/components/common/switcher-label";
import { useCustomers } from "@/plane-web/hooks/store";
import { Button } from "@plane/propel/button";

type TProps = {
  value: any;
  onChange: (value: string[] | string) => void;
  tabIndex?: number;
  className?: string;
  customButtonClassName?: string;
  chevronClassName?: string;
  maxHeight?: "sm" | "rg" | "md" | "lg" | undefined;
  disabled: boolean;
  customButton?: React.ReactNode;
  multiple?: boolean;
};

export const CustomerDropDown = observer(function CustomerDropDown(props: TProps) {
  const {
    value,
    onChange,
    maxHeight,
    tabIndex,
    customButtonClassName,
    chevronClassName,
    className,
    disabled,
    customButton,
    multiple = false,
  } = props;

  const { t } = useTranslation();

  // store hooks
  const { customerIds, getCustomerById } = useCustomers();

  // formatted options
  const customersOptions = customerIds.map((id) => {
    const customer = getCustomerById(id);
    return {
      value: customer?.id,
      query: `${customer?.name}`,
      content: (
        <Button variant="ghost" prependIcon={<SwitcherIcon logo_url={customer?.logo_url} LabelIcon={CustomersIcon} />}>
          {customer?.name}
        </Button>
      ),
    };
  });

  // label content for single select variant
  const labelContent = multiple ? undefined : customersOptions.find((option) => option.value === value);
  return (
    <CustomSearchSelect
      options={customersOptions}
      value={value}
      label={
        <div className="truncate">
          <span className=" text-secondary">
            {labelContent ? (
              labelContent.content
            ) : (
              <span className=" text-body-xs-medium text-placeholder">{t("customers.dropdown.placeholder")}</span>
            )}
          </span>
        </div>
      }
      multiple={multiple}
      customButton={customButton}
      maxHeight={maxHeight}
      tabIndex={tabIndex}
      onChange={onChange}
      className={className}
      customButtonClassName={customButtonClassName}
      chevronClassName={chevronClassName}
      disabled={disabled}
    />
  );
});
