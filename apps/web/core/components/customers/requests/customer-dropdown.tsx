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

import { useRef, useState } from "react";
import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { CustomersIcon } from "@plane/propel/icons";
import { ComboDropDown } from "@plane/ui";
import { cn } from "@plane/utils";
import { SwitcherIcon } from "@/components/common/switcher-label";
import { DropdownButton } from "@/components/dropdowns/buttons";
import { useDropdown } from "@/hooks/use-dropdown";
import { useCustomers } from "@/plane-web/hooks/store";
import { CustomerOptions } from "./customer-options";

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

export const CustomerDropDown: FC<TProps> = observer(function CustomerDropDown(props: TProps) {
  const {
    value,
    onChange,
    tabIndex,
    customButtonClassName,
    className,
    disabled,
    customButton,
    multiple = false,
  } = props;

  const { t } = useTranslation();

  // refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  // states
  const [isOpen, setIsOpen] = useState(false);

  // store hooks
  const { customerIds, getCustomerById } = useCustomers();

  const { handleClose, handleKeyDown, handleOnClick } = useDropdown({
    dropdownRef,
    isOpen,
    onClose: undefined,
    setIsOpen,
  });

  const dropdownOnChange = (val: string & string[]) => {
    onChange(val);
    if (!multiple) handleClose();
  };

  // Get display content for single select
  const selectedCustomer = !multiple && value ? getCustomerById(value) : undefined;

  const comboButton = customButton ? (
    <button
      ref={setReferenceElement}
      type="button"
      className={cn("clickable block h-full w-full outline-none")}
      onClick={handleOnClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      {customButton}
    </button>
  ) : (
    <button
      ref={setReferenceElement}
      type="button"
      className={cn(
        "clickable block h-full max-w-full outline-none",
        disabled ? "cursor-not-allowed text-secondary" : "cursor-pointer"
      )}
      onClick={handleOnClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      <DropdownButton
        className={customButtonClassName}
        isActive={isOpen}
        tooltipHeading={t("customers.dropdown.placeholder")}
        tooltipContent=""
        showTooltip={false}
        variant="transparent-with-text"
      >
        {selectedCustomer ? (
          <div className="flex items-center gap-2">
            <SwitcherIcon logo_url={selectedCustomer.logo_url} LabelIcon={CustomersIcon} />
            <span className="flex-grow truncate text-secondary">{selectedCustomer.name}</span>
          </div>
        ) : (
          <span className="text-body-xs-medium text-placeholder">{t("customers.dropdown.placeholder")}</span>
        )}
      </DropdownButton>
    </button>
  );

  return (
    <ComboDropDown
      as="div"
      ref={dropdownRef}
      value={value}
      onChange={dropdownOnChange}
      disabled={disabled}
      multiple={multiple}
      onKeyDown={handleKeyDown}
      button={comboButton}
      className={cn("h-full", className)}
    >
      {isOpen && (
        <CustomerOptions
          customerIds={customerIds}
          getCustomerById={getCustomerById}
          isOpen={isOpen}
          referenceElement={referenceElement}
          value={value}
        />
      )}
    </ComboDropDown>
  );
});
