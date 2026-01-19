import type { FC } from "react";
import { observer } from "mobx-react";
import { EMPTY_PLANE_STATE } from "@plane/etl/core";
import { useTranslation } from "@plane/i18n";
import type { IState, TIssueStateMap, TIssueStateMapKeys } from "@plane/types";
import { E_ISSUE_STATE_MAP_KEYS } from "@plane/types";
// plane web components
// plane web hooks
import { useGitlabIntegration } from "@/plane-web/hooks/store";
import { SelectProjectState } from "../../../../common";
// plane web types

type TMapProjectIssueState = {
  projectId: string | undefined;
  value: TIssueStateMap;
  handleChange: <T extends keyof TIssueStateMap>(key: T, value: TIssueStateMap[T]) => void;
  isEnterprise: boolean;
};

const GIT_ISSUE_DATA: { key: TIssueStateMapKeys; title: string }[] = [
  {
    key: E_ISSUE_STATE_MAP_KEYS.ISSUE_OPEN,
    title: "On issue open, set the state to",
  },
  {
    key: E_ISSUE_STATE_MAP_KEYS.ISSUE_CLOSED,
    title: "On issue closed, set the state to",
  },
];

export const MapProjectIssueState = observer(function MapProjectIssueState(props: TMapProjectIssueState) {
  // props
  const { projectId, value, handleChange, isEnterprise } = props;

  const { t } = useTranslation();

  // hooks
  const { stateIdsByProjectId, getStateById } = useGitlabIntegration(isEnterprise);

  // derived values
  const planeProjectStates = ((projectId && stateIdsByProjectId(projectId)) || [])
    .map((id) => (projectId && getStateById(projectId, id)) || undefined)
    .filter((state) => state != undefined && state != null);

  return (
    <div className="w-full max-h-full overflow-y-auto space-y-2">
      {planeProjectStates &&
        GIT_ISSUE_DATA.map((gitState) => (
          <SelectProjectState
            title={t(`gitlab_integration.${gitState.key}`) || gitState.title}
            key={gitState.key}
            value={value?.[gitState.key]?.id || undefined}
            handleValue={(value: IState | undefined) => handleChange(gitState.key, value)}
            planeStates={[EMPTY_PLANE_STATE, ...planeProjectStates]}
          />
        ))}
    </div>
  );
});
