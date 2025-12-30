import type { FC } from "react";
import { useTranslation } from "@plane/i18n";

export function EmptyState() {
  const { t } = useTranslation();
  return <div>{t("common.no_data_available")}</div>;
}
