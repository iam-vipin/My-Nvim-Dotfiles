import { useTheme } from "next-themes";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
// assets
import initiativesGanttDark from "@/app/assets/empty-state/initiatives/scope/initiatives-gantt-dark.webp?url";
import initiativesGanttLight from "@/app/assets/empty-state/initiatives/scope/initiatives-gantt-light.webp?url";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
import { TimeLineTypeContext, ETimeLineTypeType } from "@/components/gantt-chart/contexts";
import { AddScopeButton } from "../../common/add-scope-button";
import { ScopeGanttChartRoot } from "./chart/chart-root";

type Props = {
  epicIds: string[];
  projectIds: string[];
  workspaceSlug: string;
  initiativeId: string;
  disabled: boolean;
  handleAddEpic: () => void;
  handleAddProject: () => void;
};
export const InitiativeScopeGanttView: React.FC<Props> = (props) => {
  const { epicIds, projectIds, workspaceSlug, handleAddEpic, handleAddProject, initiativeId, disabled } = props;

  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  const isEmpty = epicIds.length === 0 && projectIds.length === 0;

  const resolvedAssetPath = resolvedTheme === "light" ? initiativesGanttLight : initiativesGanttDark;

  if (isEmpty)
    return (
      <DetailedEmptyState
        assetPath={resolvedAssetPath}
        title={t("initiatives.scope.empty_state.title")}
        description={t("initiatives.scope.empty_state.description")}
        customPrimaryButton={
          <AddScopeButton
            workspaceSlug={workspaceSlug}
            initiativeId={initiativeId}
            disabled={disabled}
            customButton={<Button>{t("initiatives.scope.empty_state.primary_button.text")}</Button>}
          />
        }
      />
    );

  return (
    <TimeLineTypeContext.Provider value={ETimeLineTypeType.GROUPED}>
      <ScopeGanttChartRoot
        epicIds={epicIds}
        projectIds={projectIds}
        workspaceSlug={workspaceSlug}
        handleAddEpic={handleAddEpic}
        handleAddProject={handleAddProject}
        initiativeId={initiativeId}
        disabled={disabled}
      />
    </TimeLineTypeContext.Provider>
  );
};
