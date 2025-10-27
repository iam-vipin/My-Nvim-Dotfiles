import type { FC } from "react";
// plane imports
import { useTranslation } from "@plane/i18n";
// assets
import { EmptyStateCompact } from "@plane/propel/empty-state";

type TCustomerSettingsDisabled = {
  toggleCustomersFeature: () => void;
};
export const CustomerSettingsDisabled: FC<TCustomerSettingsDisabled> = (props) => {
  const { toggleCustomersFeature } = props;
  // hooks
  const { t } = useTranslation();

  return (
    <EmptyStateCompact
      assetKey="customer"
      title={t("settings.customers_setting.title")}
      actions={[{ label: t("settings.customers_setting.cta_primary"), onClick: () => toggleCustomersFeature() }]}
      align="start"
      rootClassName="py-20"
    />
  );
};
