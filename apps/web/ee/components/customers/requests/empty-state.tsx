import type { FC } from "react";
import React from "react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { getButtonStyling } from "@plane/propel/button";
import { CustomerRequestIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { SectionEmptyState } from "@/plane-web/components/common/layout/main/common/empty-state";

type TProps = {
  addRequest: () => void;
};

export function CustomerRequestEmptyState(props: TProps) {
  const { addRequest } = props;
  // i18n
  const { t } = useTranslation();
  return (
    <SectionEmptyState
      heading={t("customers.requests.empty_state.list.title")}
      subHeading={t("customers.requests.empty_state.list.description")}
      icon={<CustomerRequestIcon className="size-5" />}
      actionElement={
        <span
          onClick={addRequest}
          className={cn(getButtonStyling("accent-primary", "sm"), "font-medium px-2 py-1 cursor-pointer")}
        >
          {t("customers.requests.empty_state.list.button")}
        </span>
      }
    />
  );
}
