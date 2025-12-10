import type { FC } from "react";
// plane imports
import { useTranslation } from "@plane/i18n";
// assets
import { EmptyStateCompact } from "@plane/propel/empty-state";

type TCustomerSettingsDisabled = {
  toggleCustomersFeature: () => void;
};
export function CustomerSettingsDisabled(props: TCustomerSettingsDisabled) {
  const { toggleCustomersFeature } = props;
  // hooks
  const { t } = useTranslation();

  return (
    <EmptyStateCompact
      assetKey="customer"
      title={t("settings_empty_state.customers_setting.title")}
      actions={[
        { label: t("settings_empty_state.customers_setting.cta_primary"), onClick: () => toggleCustomersFeature() },
      ]}
      align="start"
      rootClassName="py-20"
    />
  );
}
