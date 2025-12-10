import type { FormEvent } from "react";
import { useState } from "react";
// types
import { observer } from "mobx-react";
import { ETabIndices, EUserPermissionsLevel } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { ProjectIcon, WikiIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
// ui
import { EUserProjectRoles } from "@plane/types";
import { EModalPosition, EModalWidth, Input, ModalCore } from "@plane/ui";
import { cn, getTabIndex } from "@plane/utils";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";

type Props = {
  workspaceSlug: string;
  isOpen: boolean;
  handleModalClose: () => void;
  handleConvertToPage: (projectId: string | undefined) => Promise<
    | {
        page_url: string;
      }
    | undefined
  >;
};

export const SavePageModal = observer(function SavePageModal(props: Props) {
  const { workspaceSlug, isOpen, handleModalClose, handleConvertToPage } = props;
  // state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(undefined);
  // hooks
  const { isMobile } = usePlatformOS();
  const { workspaceProjectIds, getProjectById } = useProject();
  const { allowPermissions } = useUserPermissions();

  const options = workspaceProjectIds
    ?.filter((projectId) =>
      allowPermissions(
        [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER, EUserProjectRoles.GUEST],
        EUserPermissionsLevel.PROJECT,
        workspaceSlug,
        projectId
      )
    )
    .map((projectId: string) => {
      const projectDetails = getProjectById(projectId);

      return {
        value: projectDetails?.id,
        query: `${projectDetails?.name} ${projectDetails?.identifier}`,
        content: (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-custom-background-80">
              <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                {projectDetails?.logo_props ? (
                  <Logo logo={projectDetails?.logo_props} size={16} />
                ) : (
                  <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                    <ProjectIcon className="h-4 w-4" />
                  </span>
                )}
              </span>
            </div>
            <p className="text-sm font-medium">{projectDetails?.name}</p>
          </div>
        ),
      };
    });
  const filteredOptions =
    query === "" ? options : options?.filter((option) => option.query.toLowerCase().includes(query.toLowerCase()));

  const { getIndex } = getTabIndex(ETabIndices.PROJECT_PAGE, isMobile);

  const handleEditFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleConvertToPage(selectedEntity === "wiki" ? undefined : selectedEntity)
      .then((response) => {
        setIsSubmitting(false);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Page saved successfully.",
          actionItems: (
            <div className="flex items-center gap-1 text-xs text-custom-text-200">
              <a
                href={response?.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-custom-primary px-2 py-1 hover:bg-custom-background-90 font-medium rounded"
              >
                View page
              </a>
            </div>
          ),
        });
        handleModalClose();
      })
      .catch(() => {
        setIsSubmitting(false);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "Something went wrong please try again later.",
        });
      });
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={handleModalClose} position={EModalPosition.TOP} width={EModalWidth.SM}>
      <form onSubmit={handleEditFormSubmit}>
        <div className="space-y-2 p-5">
          <h3 className="text-base font-semibold text-custom-text-300">Save this page in</h3>
          {/* search project */}
          <div className="space-y-1 flex-grow w-full">
            <Input
              id="name"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for projects"
              className="w-full resize-none text-base font-medium text-custom-text-200"
              tabIndex={getIndex("search")}
            />
          </div>
          <div className="divide-y divide-custom-border-100">
            {/* wiki */}
            <div className="py-2">
              <button
                className={cn("flex items-center gap-2 hover:bg-custom-background-90 rounded-md p-2 w-full", {
                  "bg-custom-background-90": selectedEntity === "wiki",
                })}
                onClick={() => setSelectedEntity("wiki")}
                type="button"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-custom-background-80">
                  <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                    <WikiIcon className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-sm font-medium">Wiki</p>
              </button>
            </div>
            {/* projects */}
            <div className="py-4">
              <h4 className="text-xs font-semibold text-custom-text-400 uppercase mb-4">Projects</h4>
              <div className="flex flex-col max-h-[308px] overflow-y-scroll">
                {filteredOptions?.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={cn("hover:bg-custom-background-90 rounded-md p-2", {
                      "bg-custom-background-90": selectedEntity === option.value,
                    })}
                    onClick={() => setSelectedEntity(option.value)}
                  >
                    {option.content}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-custom-border-200">
          <Button variant="neutral-primary" size="sm" onClick={handleModalClose} tabIndex={getIndex("cancel")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            tabIndex={getIndex("submit")}
          >
            {isSubmitting ? "Saving" : "Save"}
          </Button>
        </div>
      </form>
    </ModalCore>
  );
});
