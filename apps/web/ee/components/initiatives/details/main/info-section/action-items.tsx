"use client";

import type { FC } from "react";
import { observer } from "mobx-react";
import { Link, Paperclip } from "lucide-react";
import { useTranslation } from "@plane/i18n";
// hooks
import { EpicIcon, ProjectIcon } from "@plane/propel/icons";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { InitiativeActionButton } from "./action-button";
import { InitiativeAttachmentActionButton } from "./attachment-button";
import { InitiativeLinksActionButton } from "./link-button";
import { InitiativeReactions } from "./reactions";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
  disabled: boolean;
};

export const InitiativeInfoActionItems: FC<Props> = observer((props) => {
  const { workspaceSlug, initiativeId, disabled } = props;
  const { t } = useTranslation();
  // store hooks
  const {
    initiative: { toggleProjectsModal, toggleEpicModal },
  } = useInitiatives();

  return (
    <div className="flex gap-4 flex-col">
      <InitiativeReactions workspaceSlug={workspaceSlug} initiativeId={initiativeId} disabled={disabled} />
      <div className="flex items-center gap-2">
        <InitiativeLinksActionButton
          customButton={
            <div className="flex items-center gap-1 p-2 text-custom-text-200 hover:text-custom-text-100 border border-custom-border-200 rounded">
              <Link className="size-3 flex-shrink-0 text-custom-text-300" strokeWidth={2} />
              <span className="text-sm font-medium">{t("add_link")}</span>
            </div>
          }
          disabled={disabled}
        />
        <InitiativeAttachmentActionButton
          workspaceSlug={workspaceSlug.toString()}
          initiativeId={initiativeId}
          customButton={
            <div className="flex items-center gap-1 p-2 text-custom-text-200 hover:text-custom-text-100 border border-custom-border-200 rounded">
              <Paperclip className="size-3 flex-shrink-0 text-custom-text-300" strokeWidth={2} />
              <span className="text-sm font-medium">{t("common.attach")}</span>
            </div>
          }
          disabled={disabled}
        />
        <InitiativeActionButton
          customButton={
            <div className="flex items-center gap-1 p-2 text-custom-text-200 hover:text-custom-text-100 border border-custom-border-200 rounded">
              <ProjectIcon className="size-3 flex-shrink-0 text-custom-text-300" />
              <span className="text-sm font-medium">{t("add_project")}</span>
            </div>
          }
          disabled={disabled}
          onClick={() => toggleProjectsModal(true)}
        />
        <InitiativeActionButton
          customButton={
            <div className="flex items-center gap-1 p-2 text-custom-text-200 hover:text-custom-text-100 border border-custom-border-200 rounded">
              <EpicIcon className="size-3 flex-shrink-0 text-custom-text-300" />
              <span className="text-sm font-medium">{t("epic.add.label")}</span>
            </div>
          }
          disabled={disabled}
          onClick={() => toggleEpicModal(true)}
        />
      </div>
    </div>
  );
});
