import { useState } from "react";
import { Copy, ExternalLink, InfoIcon, LayersIcon, ListTodo, RefreshCcw } from "lucide-react";
import { SPACE_BASE_URL, SPACE_BASE_PATH } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { setPromiseToast, setToast, TOAST_TYPE } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import { Loader, ToggleSwitch } from "@plane/ui";
import { copyTextToClipboard } from "@plane/utils";
import { useProjectInbox } from "@/hooks/store/use-project-inbox";
import { RenewModal } from "./renew-modal";
import { TypeFormsRoot } from "./type-forms/root";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
  isEnabled: boolean;
  allowEdit?: boolean;
  isFormEnabled?: boolean;
  anchor?: string;
  isToolTip?: boolean;
};

export const IntakeFormsRoot: React.FC<Props> = (props: Props) => {
  // props
  const {
    workspaceSlug,
    projectId,
    isAdmin,
    isEnabled,
    allowEdit = true,
    isFormEnabled,
    anchor,
    isToolTip = false,
  } = props;
  // states
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  // hooks
  const { toggleIntakeForms, regenerateIntakeForms } = useProjectInbox();

  const handleSubmit = async () => {
    if (!workspaceSlug || !projectId || isFormEnabled === undefined) return;

    const updateProjectPromise = toggleIntakeForms(workspaceSlug, projectId, {
      is_form_enabled: !isFormEnabled,
    });
    setPromiseToast(updateProjectPromise, {
      loading: "Updating project feature...",
      success: {
        title: "Success!",
        message: () => "Project feature updated successfully.",
      },
      error: {
        title: "Error!",
        message: () => "Something went wrong while updating project feature. Please try again.",
      },
    });
  };

  const publishLink = `${(SPACE_BASE_URL.trim() === "" ? window.location.origin : SPACE_BASE_URL) + SPACE_BASE_PATH}/intake/${anchor}`;

  const copyToClipboard = () => {
    copyTextToClipboard(publishLink).then(() =>
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Copied to clipboard",
        message: "The URL has been successfully copied to your clipboard",
      })
    );
  };

  return (
    <>
      {workspaceSlug && projectId && (
        <RenewModal
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          source="form"
          handleSubmit={regenerateIntakeForms}
        />
      )}
      <div className="gap-x-8 gap-y-3 bg-custom-background-100 py-3">
        <div className="flex justify-between gap-2">
          <div className="w-full">
            <div className="flex justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="text-sm font-medium leading-5 align-top ">Forms</div>
                <p className="text-sm text-custom-text-300 text-wrap mt-1">
                  Let folks outside your workspace create potential new work items for you via a dedicated and secure
                  form.{" "}
                </p>
              </div>
              <div className="flex items-center">
                {isEnabled && isFormEnabled !== undefined && (
                  <Tooltip
                    tooltipContent={`Ask your Project Admin to turn this ${isFormEnabled ? "off" : "on"}.`}
                    position="top"
                    className=""
                    disabled={isAdmin}
                  >
                    <div>
                      <ToggleSwitch
                        value={Boolean(isFormEnabled)}
                        onChange={() => handleSubmit()}
                        disabled={!isEnabled || !isAdmin}
                        size="sm"
                      />
                    </div>
                  </Tooltip>
                )}
                {(isFormEnabled === undefined || !isEnabled) && (
                  <Loader>
                    <Loader.Item height="16px" width="24px" className="rounded-lg" />
                  </Loader>
                )}
              </div>
            </div>

            {isEnabled && isFormEnabled && (
              <div className="rounded-md bg-custom-background-90 space-y-2 mt-2">
                <div className="space-y-2">
                  <div className="p-3 space-y-2">
                    <div className="flex gap-2 rounded">
                      <ListTodo className="h-4 w-4 flex-shrink-0 text-custom-text-300" />
                      <span className="text-xs font-medium">Default form URL</span>
                    </div>
                    <div className="flex gap-2 h-[30px] truncate">
                      {anchor ? (
                        <div className="flex items-center text-sm rounded-md border-[0.5px] border-custom-border-300 flex-1 py-1 px-2 gap-2 h-full truncate">
                          <span className="truncate flex-1 mr-4">{publishLink}</span>
                          <Copy
                            className="text-custom-text-400 w-[16px] cursor-pointer"
                            onClick={() => copyToClipboard()}
                          />
                          <a href={publishLink} target="_blank">
                            <ExternalLink className="text-custom-text-400 w-[16px] cursor-pointer" />
                          </a>
                        </div>
                      ) : (
                        <Loader>
                          <Loader.Item height="30px" width="250px" className="rounded" />
                        </Loader>
                      )}
                      {allowEdit && anchor && (
                        <Button
                          tabIndex={-1}
                          size="sm"
                          variant="neutral-primary"
                          className="w-fit cursor-pointer px-2 py-1 text-center text-sm font-medium outline-none my-auto h-full"
                          onClick={() => setIsRenewModalOpen(true)}
                        >
                          <RefreshCcw className="w-[16px]" /> Renew
                        </Button>
                      )}
                    </div>
                  </div>
                  {isToolTip ? (
                    <div className="flex gap-2 items-center justify-between px-3 pb-3">
                      <div className="flex items-center gap-2">
                        <LayersIcon className="size-3" />{" "}
                        <span className="text-xs font-medium text-custom-text-200">
                          Create Forms using work item types
                        </span>
                      </div>
                      {isAdmin ? (
                        <Button
                          variant="link-neutral"
                          size="sm"
                          className="px-0 flex items-center gap-1"
                          onClick={() => {}}
                        >
                          <span>Manage forms</span>
                          <ExternalLink className="size-3" />
                        </Button>
                      ) : (
                        <Tooltip tooltipContent="Ask your Workspace Admin to manage this.">
                          <InfoIcon className="size-3" />
                        </Tooltip>
                      )}
                    </div>
                  ) : (
                    <TypeFormsRoot />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
