// plane imports
import { PiIcon, CloseIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import type { TDeDupeIssue } from "@plane/types";
// local-imports
import { DuplicateIssueReadOnlyBlockRoot } from "./block-root";

type TDuplicateModalRootProps = {
  workspaceSlug: string;
  issues: TDeDupeIssue[];
  handleDuplicateIssueModal: (value: boolean) => void;
};

export function DuplicateModalRoot(props: TDuplicateModalRootProps) {
  const { workspaceSlug, issues, handleDuplicateIssueModal } = props;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between w-full">
          <span className="text-13 text-tertiary font-semibold">Duplicate work items</span>
          <Tooltip tooltipContent="Close">
            <CloseIcon
              className="cursor-pointer size-3.5 text-tertiary hover:text-secondary"
              onClick={() => handleDuplicateIssueModal(false)}
            />
          </Tooltip>
        </div>
        <div className="flex gap-1.5 w-80 shrink-0">
          <PiIcon className="size-4 shrink-0" />
          <p className="text-left text-11 text-secondary grow">
            {`Below are the listed work items that seem${issues?.length > 1 ? "" : "s"} to be similar or are duplicate of work item that you are trying to create.`}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-hidden overflow-y-auto grow pb-1 w-80">
        <>
          {issues.map((issue: TDeDupeIssue) => (
            <DuplicateIssueReadOnlyBlockRoot key={issue.id} workspaceSlug={workspaceSlug} issue={issue} />
          ))}
        </>
      </div>
    </>
  );
}
