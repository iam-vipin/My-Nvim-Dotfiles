import { observer } from "mobx-react";
// components
import { useTranslation } from "@plane/i18n";
import { EmptyStateCompact } from "@plane/propel/empty-state";
// local imports
import { CreateRecurringWorkItemsButton } from "./create-button";

type TRecurringWorkItemsEmptyStateProps = { workspaceSlug: string; projectId: string };

export const RecurringWorkItemsEmptyState = observer((props: TRecurringWorkItemsEmptyStateProps) => {
  // derived values
  const { t } = useTranslation();

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-center h-full w-full">
        <EmptyStateCompact
          assetKey="work-item"
          title={t("settings.recurring_work_items.title")}
          description={t("recurring_work_items.settings.description")}
          customButton={
            <CreateRecurringWorkItemsButton
              {...props}
              buttonSize="md"
              buttonI18nLabel="recurring_work_items.empty_state.no_templates.button"
            />
          }
          align="start"
          rootClassName="py-20"
        />
      </div>
    </div>
  );
});
