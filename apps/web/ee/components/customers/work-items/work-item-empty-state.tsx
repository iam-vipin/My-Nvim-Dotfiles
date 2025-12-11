import type { FC } from "react";
import React from "react";
import { useTranslation } from "@plane/i18n";
import { getButtonStyling } from "@plane/propel/button";
import { LayersIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { SectionEmptyState } from "@/plane-web/components/common/layout/main/common/empty-state";

type TProps = {
  linkWorkItem: () => void;
};
export function WorkItemEmptyState(props: TProps) {
  const { linkWorkItem } = props;
  // i18n
  const { t } = useTranslation();

  return (
    <SectionEmptyState
      heading={t("customers.linked_work_items.empty_state.list.title")}
      subHeading={t("customers.linked_work_items.empty_state.list.description")}
      icon={<LayersIcon className="size-5" />}
      actionElement={
        <span
          onClick={linkWorkItem}
          className={cn(getButtonStyling("accent-primary", "sm"), "font-medium px-2 py-1 cursor-pointer")}
        >
          {t("customers.linked_work_items.empty_state.list.button")}
        </span>
      }
    />
  );
}
