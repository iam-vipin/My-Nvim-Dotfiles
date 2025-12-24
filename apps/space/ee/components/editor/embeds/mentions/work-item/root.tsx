import { observer } from "mobx-react";
// plane imports
import { Popover } from "@plane/propel/popover";
// local imports
import type { TEditorMentionComponentProps } from "../root";
import { EditorWorkItemMentionContent } from "./content";
import { EditorWorkItemMentionPreview } from "./preview";

export const EditorWorkItemMention = observer(function EditorWorkItemMention(props: TEditorMentionComponentProps) {
  const { entity_identifier: workItemId, getMentionDetails } = props;
  // derived values
  const workItemDetails = getMentionDetails?.("issue_mention", workItemId);

  return (
    <div className="not-prose !inline px-1 py-0.5 rounded-sm bg-accent-primary/10 border border-strong-1 no-underline">
      <Popover delay={100} openOnHover>
        <Popover.Button className="cursor-default">
          {workItemDetails && <EditorWorkItemMentionContent workItemDetails={workItemDetails} />}
        </Popover.Button>
        <Popover.Panel side="bottom" align="start">
          <div className="p-3 space-y-2 w-72 rounded-lg shadow-raised-200 bg-surface-1 border-[0.5px] border-subtle-1">
            {workItemDetails ? (
              <EditorWorkItemMentionPreview workItemDetails={workItemDetails} />
            ) : (
              <p className="text-tertiary text-13">
                The mentioned work item is not found. It&apos;s either deleted or not accessible to you.
              </p>
            )}
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
});
