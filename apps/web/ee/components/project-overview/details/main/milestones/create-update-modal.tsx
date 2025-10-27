import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LayersIcon } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { ISearchIssueResponse, TMilestone } from "@plane/types";
import { EFileAssetType } from "@plane/types";
import { Button, Input, ModalCore } from "@plane/ui";
import { cn, getChangedFields, getDescriptionPlaceholderI18n, renderFormattedPayloadDate } from "@plane/utils";
import { DateDropdown } from "@/components/dropdowns/date";
import { RichTextEditor } from "@/components/editor/rich-text";
import { useEditorAsset } from "@/hooks/store/use-editor-asset";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";
import { WorkspaceService } from "@/plane-web/services";
import { MilestoneWorkItemActionButton } from "./quick-action-button";

const workspaceService = new WorkspaceService();

type Props = {
  workspaceSlug: string;
  projectId: string;
  isOpen: boolean;
  handleClose: () => void;
  milestoneId?: string;
};

const defaultValues = {
  title: "",
  description: {
    description_html: "",
  },
};

export const CreateUpdateMilestoneModal = (props: Props) => {
  const { workspaceSlug, projectId, isOpen, handleClose, milestoneId } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<string[]>([]);

  const { t } = useTranslation();
  const { getWorkspaceBySlug } = useWorkspace();
  const { uploadEditorAsset } = useEditorAsset();
  const {
    createMilestone,
    updateMilestone,
    getMilestoneById,
    addWorkItemsToMilestone,
    updateWorkItems,
    fetchMilestoneWorkItems,
  } = useMilestones();
  const workspaceId = getWorkspaceBySlug(workspaceSlug)?.id as string;

  // derived values
  const data = milestoneId ? getMilestoneById(projectId, milestoneId) : undefined;

  // hook form
  const {
    handleSubmit,
    control,
    reset,
    formState: { dirtyFields, errors },
  } = useForm<Partial<TMilestone>>({
    defaultValues,
  });

  const resetForm = () => {
    reset(defaultValues);
  };

  const onClose = () => {
    handleClose();
    resetForm();
  };

  const handleAddWorkItems = async (workItemIds: string[], id: string) => {
    const promise = milestoneId
      ? updateWorkItems(workspaceSlug, projectId, id, workItemIds)
      : addWorkItemsToMilestone(workspaceSlug, projectId, id, workItemIds);

    await promise.catch(() => {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: "Failed to add work items to milestone. Please try again.",
      });
    });
  };

  const onSubmit = async (formData: Partial<TMilestone>) => {
    let payload: Partial<TMilestone> = {};
    if (milestoneId) {
      payload = getChangedFields<Partial<TMilestone>>(
        formData as Partial<TMilestone>,
        dirtyFields as Partial<Record<Extract<keyof TMilestone, string>, boolean | undefined>>
      );
    } else payload = formData;

    setIsSubmitting(true);
    const promise = milestoneId
      ? updateMilestone(workspaceSlug, projectId, milestoneId, payload)
      : createMilestone(workspaceSlug, projectId, payload);
    await promise
      .then((response) => {
        onClose();
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: milestoneId ? "Milestone updated successfully." : "Milestone created successfully.",
        });

        if (response?.id) handleAddWorkItems(selectedWorkItemIds, response.id);
      })
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: milestoneId
            ? "Failed to update milestone. Please try again."
            : "Failed to create milestone. Please try again.",
        });
      });
    setIsSubmitting(false);
  };

  const handleWorkItemsSubmit = async (searchData: ISearchIssueResponse[]) => {
    setSelectedWorkItemIds(searchData.map((item) => item.id));
  };

  // fetch work items when modal is open
  useEffect(() => {
    (async () => {
      if (isOpen && milestoneId) {
        const workItemIds = await fetchMilestoneWorkItems(workspaceSlug, projectId, milestoneId);
        setSelectedWorkItemIds(workItemIds);
      }
    })();
  }, [isOpen, milestoneId, fetchMilestoneWorkItems, workspaceSlug, projectId]);

  // ensure data populates the form when available; fallback to defaultValues
  useEffect(() => {
    if (isOpen) {
      reset({
        ...defaultValues,
        ...(data ?? {}),
      });
    }
  }, [isOpen, data, reset]);

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose}>
      <div className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-custom-text-200">
              {data?.id ? "Update Milestone" : "Create Milestone"}
            </h3>
            {/* Title */}
            <div className="space-y-1">
              <Controller
                name="title"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="text"
                    className={cn("text-sm w-full", errors.title ? "border-red-500" : "")}
                    value={value}
                    onChange={onChange}
                    placeholder="Title"
                  />
                )}
                rules={{
                  required: "Title is required",
                }}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            {/* Description */}
            <Controller
              name="description.description_html"
              control={control}
              render={({ field: { value, onChange } }) => (
                <RichTextEditor
                  editable
                  id={data?.id ?? "milestone-modal-editor"}
                  initialValue={value ?? ""}
                  workspaceSlug={workspaceSlug}
                  workspaceId={workspaceId}
                  projectId={projectId}
                  onChange={(_description: object, description_html: string) => {
                    onChange(description_html);
                  }}
                  displayConfig={{ fontSize: "small-font" }}
                  placeholder={(isFocused, description) => t(getDescriptionPlaceholderI18n(isFocused, description))}
                  searchMentionCallback={async (payload) =>
                    await workspaceService.searchEntity(workspaceSlug?.toString() ?? "", {
                      ...payload,
                      project_id: projectId?.toString() ?? "",
                    })
                  }
                  containerClassName="pt-3 min-h-[150px] rounded-lg relative border border-custom-border-100"
                  uploadFile={async (blockId, file) => {
                    try {
                      const { asset_id } = await uploadEditorAsset({
                        blockId,
                        data: {
                          entity_identifier: data?.id ?? "",
                          entity_type: EFileAssetType.MILESTONE_DESCRIPTION,
                        },
                        file,
                        projectId,
                        workspaceSlug,
                      });
                      return asset_id;
                    } catch (_error) {
                      throw new Error("Asset upload failed. Please try again later.");
                    }
                  }}
                />
              )}
            />
            <div className="flex items-center gap-2">
              <MilestoneWorkItemActionButton
                projectId={projectId}
                workspaceSlug={workspaceSlug}
                customButton={
                  <Button variant="neutral-primary" size="sm" className="text-custom-text-200 text-xs">
                    <LayersIcon className="size-3" />
                    {selectedWorkItemIds.length > 0 ? (
                      <span className="text-xs">{selectedWorkItemIds.length}</span>
                    ) : (
                      "Link work items"
                    )}
                  </Button>
                }
                handleSubmit={handleWorkItemsSubmit}
                selectedWorkItemIds={selectedWorkItemIds}
              />
              <div className="space-y-1 flex gap-2">
                <Controller
                  name="target_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="h-7">
                      <DateDropdown
                        value={value || null}
                        onChange={(date) => onChange(date ? renderFormattedPayloadDate(date) : null)}
                        buttonVariant="border-with-text"
                        placeholder="Target date"
                        buttonClassName={`${errors.target_date ? "border-red-500" : ""}`}
                      />
                    </div>
                  )}
                  rules={{
                    required: "Target date is required",
                  }}
                />
                {errors.target_date && <p className="text-xs text-red-500">{errors.target_date.message}</p>}
              </div>
            </div>
          </div>
          <div className="flex border-t items-center border-custom-border-100 pt-3 mt-3 justify-end gap-3">
            <Button variant="neutral-primary" onClick={onClose} size="sm">
              Discard
            </Button>
            <Button variant="primary" type="submit" size="sm" loading={isSubmitting}>
              {data?.id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </ModalCore>
  );
};
