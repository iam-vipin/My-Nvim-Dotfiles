import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
// ui
import { CycleIcon } from "@plane/propel/icons";
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// plane web components
import { BetaBadge } from "@/plane-web/components/common/beta";
import { UpgradeBadge } from "@/plane-web/components/workspace/upgrade-badge";

export const WorkspaceActiveCycleHeader = observer(function WorkspaceActiveCycleHeader() {
  const { t } = useTranslation();
  return (
    <Header>
      <Header.LeftItem>
        <div className="flex gap-2">
          <Breadcrumbs>
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label={t("active_cycles")}
                  icon={<CycleIcon className="h-4 w-4 text-custom-text-300 rotate-180" />}
                />
              }
            />
          </Breadcrumbs>
          <BetaBadge />
        </div>
        <UpgradeBadge size="md" flag="WORKSPACE_ACTIVE_CYCLES" />
      </Header.LeftItem>
    </Header>
  );
});
