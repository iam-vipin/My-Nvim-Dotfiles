import { Paperclip } from "lucide-react";
import { LinkIcon } from "@plane/propel/icons";
import { ProjectAttachmentActionButton } from "../collaspible-section/attachment/quick-action-button";

type TProps = {
  toggleLinkModalOpen: (open: boolean) => void;
  workspaceSlug: string;
  projectId: string;
};
export function Actions(props: TProps) {
  const { toggleLinkModalOpen, workspaceSlug, projectId } = props;
  return (
    <div className="text-14 font-medium flex gap-4 text-secondary my-auto">
      <button className="flex gap-1" onClick={() => toggleLinkModalOpen(true)}>
        <LinkIcon className="rotate-[135deg] my-auto" width={16} height={16} />
        <div>Add link</div>
      </button>
      <ProjectAttachmentActionButton
        workspaceSlug={workspaceSlug.toString()}
        projectId={projectId.toString()}
        customButton={
          <button className="flex gap-1">
            <Paperclip className="my-auto" size={16} />
            <div>Attach</div>
          </button>
        }
      />
    </div>
  );
}
