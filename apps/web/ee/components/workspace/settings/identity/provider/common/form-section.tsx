import type { ReactNode } from "react";
// plane imports
import { useTranslation } from "@plane/i18n";
// store hooks
import { useWorkspace } from "@/hooks/store/use-workspace";

type TProviderFormSectionProps = {
  children: ReactNode;
  workspaceSlug: string;
};

export function ProviderFormSection(props: TProviderFormSectionProps) {
  const { children, workspaceSlug } = props;
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const workspace = getWorkspaceBySlug(workspaceSlug);
  const workspaceName = workspace?.name || "Workspace";

  return (
    <div className="w-full flex flex-col gap-4">
      <h6 className="text-h6-medium text-primary">{t("sso.providers.form_section.title", { workspaceName })}</h6>
      {children}
    </div>
  );
}
