import { observer } from "mobx-react";
// plane imports
import { StateGroupIcon } from "@plane/propel/icons";
import type { TEditorWorkItemMention } from "@plane/types";

type Props = {
  workItemDetails: TEditorWorkItemMention;
};

export const EditorWorkItemMentionPreview: React.FC<Props> = observer((props) => {
  const { workItemDetails } = props;

  return (
    <>
      <div className="flex items-center justify-between gap-3 text-custom-text-200">
        <p className="shrink-0 text-xs font-medium">
          {workItemDetails.project__identifier}-{workItemDetails.sequence_id}
        </p>
        <div className="shrink-0 flex items-center gap-1">
          <StateGroupIcon stateGroup={workItemDetails.state__group} className="shrink-0 size-3" />
          <p className="text-xs font-medium">{workItemDetails.state__name}</p>
        </div>
      </div>
      <div>
        <h6 className="text-sm">{workItemDetails.name}</h6>
      </div>
    </>
  );
});
