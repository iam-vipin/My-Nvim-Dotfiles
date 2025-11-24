"use client";

import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
// plane imports
import { E_FEATURE_FLAGS, ETemplateLevel } from "@plane/constants";
// plane web imports
import { useTranslation } from "@plane/i18n";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { IssueModalProvider } from "@/plane-web/components/issues/issue-modal/provider";
import { TemplatesUpgrade } from "@/plane-web/components/templates/settings";
import { CreateUpdateWorkItemTemplate } from "@/plane-web/components/templates/settings/work-item";
import type { Route } from "./+types/page";

function CreateProjectLevelWorkItemTemplatePage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, projectId } = params;
  const searchParams = useSearchParams();
  // plane hooks
  const { t } = useTranslation();
  // derived values
  const templateId = searchParams.get("templateId");

  return (
    <WithFeatureFlagHOC
      workspaceSlug={workspaceSlug}
      flag={E_FEATURE_FLAGS.WORKITEM_TEMPLATES}
      fallback={<TemplatesUpgrade flag={E_FEATURE_FLAGS.WORKITEM_TEMPLATES} />}
    >
      <div className="flex items-center justify-between border-b border-custom-border-200 pb-3 tracking-tight w-full">
        <div>
          <h3 className="text-xl font-medium">{t("templates.settings.new_work_item_template")}</h3>
        </div>
      </div>
      <IssueModalProvider>
        <CreateUpdateWorkItemTemplate
          workspaceSlug={workspaceSlug}
          templateId={templateId ?? undefined}
          projectId={projectId}
          currentLevel={ETemplateLevel.PROJECT}
        />
      </IssueModalProvider>
    </WithFeatureFlagHOC>
  );
}

export default observer(CreateProjectLevelWorkItemTemplatePage);
