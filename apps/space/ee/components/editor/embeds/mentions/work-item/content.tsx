import { observer } from "mobx-react";
// plane imports
import type { TEditorWorkItemMention } from "@plane/types";
// local imports
import { EditorWorkItemMentionLogo } from "./logo";

type Props = {
  workItemDetails: TEditorWorkItemMention;
};

export const EditorWorkItemMentionContent: React.FC<Props> = observer((props) => {
  const { workItemDetails } = props;
  // derived values
  const trimmedName =
    workItemDetails.name.length > 64 ? workItemDetails.name.slice(0, 64) + "..." : workItemDetails.name;

  return (
    <span className="not-prose inline-flex items-center gap-1 w-fit text-sm font-medium">
      <EditorWorkItemMentionLogo
        className="shrink-0 size-3"
        stateColor={workItemDetails.state__color}
        stateGroup={workItemDetails.state__group}
      />
      <span className="text-custom-text-300">
        {workItemDetails.project__identifier}-{workItemDetails.sequence_id}
      </span>
      <span className="text-custom-text-200">{trimmedName}</span>
    </span>
  );
});
