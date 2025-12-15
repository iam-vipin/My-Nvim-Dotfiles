import { observer } from "mobx-react";
// plane web imports
import type { TProject } from "@/plane-web/types/projects";
// local imports
import { PriorityDropdown } from "../../../dropdowns/priority-dropdown";

type Props = {
  project: TProject;
  onClose?: () => void;
  onChange: (project: TProject, data: Partial<TProject>) => void;
  disabled: boolean;
};

export const SpreadsheetPriorityColumn = observer(function SpreadsheetPriorityColumn(props: Props) {
  const { project, onChange, disabled, onClose } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1">
      <PriorityDropdown
        value={project.priority}
        onChange={(data) => onChange(project, { priority: data })}
        disabled={disabled}
        buttonVariant="transparent-with-text"
        buttonClassName="px-4 text-left rounded-none group-[.selected-project-row]:bg-accent-primary/5 group-[.selected-project-row]:hover:bg-accent-primary/10"
        buttonContainerClassName="w-full"
        onClose={onClose}
      />
    </div>
  );
});
