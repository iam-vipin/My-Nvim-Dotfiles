import { observer } from "mobx-react";
// plane imports
import { StateGroupIcon } from "@plane/propel/icons";
import type { TEditorWorkItemMention } from "@plane/types";
import { EditorWorkItemMentionLogo } from "./logo";

type Props = {
  workItemDetails: TEditorWorkItemMention;
};

export const EditorWorkItemMentionPreview = observer(function EditorWorkItemMentionPreview(props: Props) {
  const { workItemDetails } = props;

  return (
    <>
      <div className="flex items-center justify-between gap-3 text-custom-text-200">
        <div className="shrink-0 flex items-center gap-1">
          <EditorWorkItemMentionLogo
            className="shrink-0 size-4"
            projectId={workItemDetails.project_id}
            showOnlyWorkItemType
            stateGroup={workItemDetails.state__group}
            workItemTypeId={workItemDetails.type_id}
          />
          <p className="text-xs font-medium">
            {workItemDetails.project__identifier}-{workItemDetails.sequence_id}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <StateGroupIcon stateGroup={workItemDetails.state__group} className="shrink-0 size-3" />
          <p className="text-xs font-medium">{workItemDetails.state__name}</p>
        </div>
      </div>
      <div>
        <h6 className="text-sm break-words">{workItemDetails.name}</h6>
      </div>
    </>
  );
});
