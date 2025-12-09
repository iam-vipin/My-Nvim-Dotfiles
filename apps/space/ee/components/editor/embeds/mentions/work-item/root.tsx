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
    <div className="not-prose !inline px-1 py-0.5 rounded bg-custom-primary-100/10 border border-custom-border-400 no-underline">
      <Popover delay={100} openOnHover>
        <Popover.Button className="cursor-default">
          {workItemDetails && <EditorWorkItemMentionContent workItemDetails={workItemDetails} />}
        </Popover.Button>
        <Popover.Panel side="bottom" align="start">
          <div className="p-3 space-y-2 w-72 rounded-lg shadow-custom-shadow-rg bg-custom-background-100 border-[0.5px] border-custom-border-300">
            {workItemDetails ? (
              <EditorWorkItemMentionPreview workItemDetails={workItemDetails} />
            ) : (
              <p className="text-custom-text-300 text-sm">
                The mentioned work item is not found. It&apos;s either deleted or not accessible to you.
              </p>
            )}
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
});
