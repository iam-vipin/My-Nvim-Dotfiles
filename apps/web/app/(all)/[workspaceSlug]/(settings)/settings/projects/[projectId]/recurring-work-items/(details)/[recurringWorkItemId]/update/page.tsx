import { observer } from "mobx-react";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
// plane web imports
import { useTranslation } from "@plane/i18n";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { IssueModalProvider } from "@/plane-web/components/issues/issue-modal/provider";
import { CreateUpdateRecurringWorkItem } from "@/plane-web/components/recurring-work-items/settings/create-update/root";
import { RecurringWorkItemsUpgrade } from "@/plane-web/components/recurring-work-items/settings/upgrade";
import type { Route } from "./+types/page";

function UpdateRecurringWorkItemPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, projectId, recurringWorkItemId } = params;
  // plane hooks
  const { t } = useTranslation();

  return (
    <WithFeatureFlagHOC
      workspaceSlug={workspaceSlug}
      flag={E_FEATURE_FLAGS.RECURRING_WORKITEMS}
      fallback={<RecurringWorkItemsUpgrade />}
    >
      <div className="flex items-center justify-between border-b border-subtle-1 pb-3 tracking-tight w-full">
        <div>
          <h3 className="text-18 font-medium">{t("recurring_work_items.settings.update_recurring_work_item")}</h3>
        </div>
      </div>
      <IssueModalProvider>
        <CreateUpdateRecurringWorkItem
          projectId={projectId}
          recurringWorkItemId={recurringWorkItemId}
          workspaceSlug={workspaceSlug}
        />
      </IssueModalProvider>
    </WithFeatureFlagHOC>
  );
}

export default observer(UpdateRecurringWorkItemPage);
