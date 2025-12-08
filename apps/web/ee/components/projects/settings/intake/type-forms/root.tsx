import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { PlusIcon } from "lucide-react";
import { Button } from "@plane/propel/button";
import { LayersIcon } from "@plane/propel/icons";
// components
import { Loader } from "@plane/ui";
import { useIntakeTypeForms } from "@/plane-web/hooks/store/use-intake-type-forms";
import { TypeFormCreateUpdateRoot } from "./create-update-form";
import { TypeFormListItem } from "./form-list-item";
import { SelectTypesModal } from "./select-types-modal";

export const TypeFormsRoot = () => {
  // router
  const { workspaceSlug, projectId } = useParams();

  // hooks
  const { fetchTypeForms, getProjectFormIds, isCustomFormsEnabled } = useIntakeTypeForms();
  //states
  const [isSelectTypesModalOpen, setIsSelectTypesModalOpen] = useState(false);

  const [formCreateList, setFormCreateList] = useState<string[]>([]);

  /**Fetch type forms */
  const { isLoading } = useSWR(
    workspaceSlug && projectId ? `INTAKE_TYPE_FORMS_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchTypeForms(workspaceSlug.toString(), projectId.toString()) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  const isEnabled = isCustomFormsEnabled(workspaceSlug.toString(), projectId.toString());

  if (!workspaceSlug || !projectId || !isEnabled) return null;

  // derived values
  const projectFormIds = projectId ? getProjectFormIds(projectId.toString()) : [];

  // handlers
  const handleSelectType = (typeId: string) => {
    setFormCreateList((prev) => [...prev, typeId]);
  };

  const handleRemoveForm = (formId: string) => {
    setFormCreateList((prev) => prev.filter((id) => id !== formId));
  };

  return (
    <>
      <div className="pb-3 space-y-2">
        <div className="px-3 border-t border-custom-border-100">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <LayersIcon className="size-4" />{" "}
              <span className="text-xs font-medium text-custom-text-200">Create Forms using work item types</span>
            </div>
            <Button variant="link-neutral" size="sm" className="px-0" onClick={() => setIsSelectTypesModalOpen(true)}>
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>
        {/* Existing forms */}
        {isLoading ? (
          <div className="px-3">
            <Loader className="space-y-3">
              <Loader.Item height="120px" />
              <Loader.Item height="120px" />
            </Loader>
          </div>
        ) : (
          projectFormIds.length > 0 && (
            <div className="space-y-3 p-3">
              {projectFormIds.map((formId) => (
                <TypeFormListItem
                  key={formId}
                  formId={formId}
                  projectId={projectId.toString()}
                  workspaceSlug={workspaceSlug.toString()}
                />
              ))}
            </div>
          )
        )}
        {/* Create forms */}
        {formCreateList.length > 0 && (
          <div className="space-y-3 p-3">
            {formCreateList.map((typeId) => (
              <TypeFormCreateUpdateRoot
                key={typeId}
                typeId={typeId}
                handleRemove={() => handleRemoveForm(typeId)}
                onClose={() => handleRemoveForm(typeId)}
              />
            ))}
          </div>
        )}
      </div>

      <SelectTypesModal
        isOpen={isSelectTypesModalOpen}
        onClose={() => setIsSelectTypesModalOpen(false)}
        onSelect={handleSelectType}
      />
    </>
  );
};
