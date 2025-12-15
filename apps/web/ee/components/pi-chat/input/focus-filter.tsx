import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { AtSign } from "lucide-react";
import { EUserPermissionsLevel } from "@plane/constants";
// plane imports
import { Logo } from "@plane/propel/emoji-icon-picker";
import { Tooltip } from "@plane/propel/tooltip";
import type { IProject, IWorkspace } from "@plane/types";
import { EUserProjectRoles } from "@plane/types";
import { CustomSelect, Loader, ToggleSwitch } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import { WorkspaceLogo } from "@/components/workspace/logo";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import type { TFocus } from "@/plane-web/types";

type TProps = {
  workspaceId: string;
  projectId: string;
  focus: TFocus;
  isLoading: boolean;
  setFocus: Dispatch<SetStateAction<TFocus>>;
};
export const FocusFilter = observer(function FocusFilter(props: TProps) {
  const { focus, setFocus, isLoading, workspaceId, projectId } = props;
  // router params
  const { workspaceSlug } = useParams();
  // store hooks
  const { getWorkspaceBySlug } = useWorkspace();
  const { workspaceProjectIds, getProjectById } = useProject();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const workspace = getWorkspaceBySlug(workspaceSlug?.toString() || "");
  const selectedFocus = focus.entityType === "workspace_id" ? workspace : getProjectById(focus.entityIdentifier);
  // helper
  const updateFocus = <K extends keyof TFocus>(key: K, value: TFocus[K]) => {
    setFocus((prev) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
  };

  // Change focus based on projectId
  useEffect(() => {
    if (projectId) {
      setFocus({
        isInWorkspaceContext: true,
        entityType: "project_id",
        entityIdentifier: projectId.toString(),
      });
    } else {
      setFocus({
        isInWorkspaceContext: true,
        entityType: "workspace_id",
        entityIdentifier: workspaceId?.toString() || "",
      });
    }
  }, [projectId, workspaceId, setFocus]);

  if (isLoading)
    return (
      <Loader>
        <Loader.Item width="100px" height="30px" className="rounded-lg" />
      </Loader>
    );

  return (
    <CustomSelect
      value={focus}
      label={
        <Tooltip
          tooltipContent="Turn this on if you want AI to use your work data from Plane."
          position="top"
          className="ml-4 max-w-[200px] font-medium text-tertiary"
          disabled={focus.isInWorkspaceContext}
        >
          <div className="flex font-medium gap-2 w-full overflow-hidden">
            {!isEmpty(focus) && !isEmpty(selectedFocus) && focus.isInWorkspaceContext ? (
              <div className=" flex items-center gap-2 text-13 my-auto capitalize truncate">
                {focus.entityType === "workspace_id" ? (
                  <WorkspaceLogo
                    logo={(selectedFocus as IWorkspace)?.logo_url}
                    name={selectedFocus?.name}
                    classNames={"w-4 h-4 text-11 text-on-color"}
                  />
                ) : (
                  <Logo logo={(selectedFocus as IProject)?.logo_props} />
                )}
                <span className="truncate text-body-xs-medium text-primary">{selectedFocus?.name}</span>
              </div>
            ) : (
              <div className="text-sm font-medium my-auto flex items-center gap-2">
                <AtSign className="size-4 text-icon-tertiary" />{" "}
                <span className="text-body-xs-medium text-primary">Add context </span>
              </div>
            )}
          </div>
        </Tooltip>
      }
      noChevron
      onChange={(val: string) => {
        updateFocus("entityType", val.split("%")[0]);
        updateFocus("entityIdentifier", val.split("%")[1]);
        if (!focus.isInWorkspaceContext) {
          updateFocus("isInWorkspaceContext", true);
        }
      }}
      maxHeight="lg"
      className="flex flex-col-reverse"
      buttonClassName={cn(
        "rounded-lg h-full px-2 bg-layer-2 border border-subtle-1 overflow-hidden max-w-[200px] hover:bg-surface-1 hover:shadow-raised-100"
      )}
      optionsClassName="max-h-[70vh] overflow-y-auto"
    >
      <div className="flex flex-col divide-y divide-subtle-1 space-y-2 max-w-[192px] max-h-full">
        <div>
          <span className="text-tertiary font-medium">Ask AI to use data from:</span>
          <CustomSelect.Option
            value={`workspace_id%${workspace?.id}`}
            className="text-13 text-secondary font-medium flex justify-start"
          >
            <div className="flex flex-start gap-2 max-w-full">
              <WorkspaceLogo
                logo={workspace?.logo_url}
                name={workspace?.name}
                classNames={"w-4 h-4 text-11 text-on-color"}
              />
              <span className="truncate">{workspace?.name}</span>
            </div>
          </CustomSelect.Option>

          {workspaceProjectIds && workspaceProjectIds.length > 0 && (
            <span className="text-tertiary font-medium">Projects</span>
          )}
          {workspaceProjectIds &&
            workspaceProjectIds.map((id) => {
              const project = getProjectById(id);
              if (
                allowPermissions(
                  [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER, EUserProjectRoles.GUEST],
                  EUserPermissionsLevel.PROJECT,
                  workspaceSlug.toString(),
                  project?.id
                )
              )
                return (
                  <CustomSelect.Option
                    key={id}
                    value={`project_id%${id}`}
                    className="text-13 text-secondary font-medium"
                  >
                    <div className="flex flex-start gap-2 max-w-full">
                      <div className="size-4 m-auto">{project && <Logo logo={project?.logo_props} />}</div>{" "}
                      <span className="truncate">{project?.name}</span>
                    </div>
                  </CustomSelect.Option>
                );
            })}
        </div>
        <div className="pt-2 flex justify-between gap-2">
          <div className="text-wrap font-medium text-tertiary">
            Turn this off if you don’t want AI to use your work from Plane.{" "}
          </div>
          <ToggleSwitch
            value={focus.isInWorkspaceContext ?? false}
            onChange={() => {
              updateFocus("isInWorkspaceContext", !focus.isInWorkspaceContext);
            }}
            size="sm"
          />
        </div>
      </div>
    </CustomSelect>
  );
});
