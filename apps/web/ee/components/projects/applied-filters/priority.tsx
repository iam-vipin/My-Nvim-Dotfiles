import { observer } from "mobx-react";
// constants
import { CloseIcon, PriorityIcon } from "@plane/propel/icons";
import { PROJECT_PRIORITIES } from "@/plane-web/constants/project/default-root";
import type { TProjectPriority } from "@/plane-web/types/workspace-project-filters";

type Props = {
  handleRemove: (val: TProjectPriority) => void;
  appliedFilters: TProjectPriority[];
  editable: boolean | undefined;
};

export const AppliedPriorityFilters = observer(function AppliedPriorityFilters(props: Props) {
  const { handleRemove, appliedFilters, editable } = props;

  return (
    <>
      {appliedFilters.map((priority) => {
        const priorityDetails = PROJECT_PRIORITIES.find((p) => p.key === priority);
        if (!priorityDetails) return null;
        return (
          <div key={priority} className="flex items-center gap-1 rounded p-1 text-xs bg-custom-background-80">
            <PriorityIcon priority={priorityDetails.key} className={`h-3 w-3`} />
            {priorityDetails?.label}
            {editable && (
              <button
                type="button"
                className="grid place-items-center text-custom-text-300 hover:text-custom-text-200"
                onClick={() => handleRemove(priority)}
              >
                <CloseIcon height={10} width={10} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
});
