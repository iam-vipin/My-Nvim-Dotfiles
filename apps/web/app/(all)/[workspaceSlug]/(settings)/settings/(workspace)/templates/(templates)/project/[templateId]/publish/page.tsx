import { observer } from "mobx-react";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
// plane web imports
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { TemplatesUpgrade } from "@/plane-web/components/templates/settings";
import { PublishTemplate } from "@/plane-web/components/templates/settings/publish";
import { useProjectTemplates } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function PublishProjectTemplatePage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, templateId } = params;
  // store hooks
  const { isInitializingTemplates, getTemplateById } = useProjectTemplates();
  // derived values
  const templateInstance = getTemplateById(templateId);

  return (
    <WithFeatureFlagHOC
      workspaceSlug={workspaceSlug}
      flag={E_FEATURE_FLAGS.PROJECT_TEMPLATES_PUBLISH}
      fallback={<TemplatesUpgrade flag={E_FEATURE_FLAGS.PROJECT_TEMPLATES_PUBLISH} />}
    >
      <PublishTemplate
        workspaceSlug={workspaceSlug}
        templateInstance={templateInstance}
        isInitializing={isInitializingTemplates}
      />
    </WithFeatureFlagHOC>
  );
}

export default observer(PublishProjectTemplatePage);
