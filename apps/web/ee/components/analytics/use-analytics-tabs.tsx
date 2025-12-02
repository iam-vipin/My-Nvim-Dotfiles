import { useMemo } from "react";
import { useTranslation } from "@plane/i18n";
import { useFlag } from "@/plane-web/hooks/store";
import { getAnalyticsTabs } from "./tabs";

export const useAnalyticsTabs = (workspaceSlug: string) => {
  const { t } = useTranslation();
  const isAnalyticsTabsEnabled = useFlag(workspaceSlug, "ANALYTICS_ADVANCED");

  const analyticsTabs = useMemo(() => getAnalyticsTabs(t, isAnalyticsTabsEnabled), [t, isAnalyticsTabsEnabled]);

  return analyticsTabs;
};