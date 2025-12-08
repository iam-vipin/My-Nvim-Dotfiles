import type { FC } from "react";
import { observer } from "mobx-react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";
// plane web
import { MainWrapper } from "@/plane-web/components/common/layout/main/main-wrapper";
// local components
import { InitiativeCollapsibleSection } from "./collapsible-section-root";
import { InitiativeInfoSection } from "./info-section-root";
import { InitiativeModalsRoot } from "./modals";
import { InitiativeProgressSection } from "./progress-section-root";
import { ScopeBreakdown } from "./scope-breakdown";

type Props = {
  editorRef?: React.RefObject<EditorRefApi>;
  workspaceSlug: string;
  initiativeId: string;
  disabled?: boolean;
};

export const InitiativeMainContentRoot = observer(function InitiativeMainContentRoot(props: Props) {
  const { editorRef, workspaceSlug, initiativeId, disabled = false } = props;
  // store hooks
  const { initiativesSidebarCollapsed } = useAppTheme();

  return (
    <MainWrapper isSidebarOpen={!initiativesSidebarCollapsed}>
      <InitiativeInfoSection
        editorRef={editorRef}
        workspaceSlug={workspaceSlug}
        initiativeId={initiativeId}
        disabled={disabled}
      />
      <InitiativeProgressSection initiativeId={initiativeId} />
      <ScopeBreakdown workspaceSlug={workspaceSlug} initiativeId={initiativeId} disabled={disabled} />
      <InitiativeCollapsibleSection workspaceSlug={workspaceSlug} initiativeId={initiativeId} disabled={disabled} />
      <InitiativeModalsRoot workspaceSlug={workspaceSlug} initiativeId={initiativeId} />
    </MainWrapper>
  );
});
