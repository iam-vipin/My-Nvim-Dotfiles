"use client";

import React, { useState, useRef } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";

// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Loader } from "@plane/ui";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
import SettingsHeading from "@/components/settings/heading";

// hooks
import { useUserPermissions } from "@/hooks/store/user";
import { useResolvedAssetPath } from "@/hooks/use-resolved-asset-path";

// local imports
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { TInitiativeLabel } from "@/plane-web/types";
import {
  CreateUpdateInitiativeLabelInline,
  TInitiativeLabelOperationsCallbacks,
} from "./create-update-initiative-label-inline";
import { DeleteInitiativeLabelModal } from "./delete-initiative-label-modal";
import { InitiativeLabelItem } from "./initiative-label-item";

export const InitiativeLabelList: React.FC = observer(() => {
  const { workspaceSlug } = useParams();
  const scrollToRef = useRef<HTMLDivElement>(null);

  // plane hooks
  const { t } = useTranslation();

  // states
  const [showLabelForm, setLabelForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectDeleteLabel, setSelectDeleteLabel] = useState<TInitiativeLabel | null>(null);

  // store hooks
  const {
    initiative: { createInitiativeLabel, updateInitiativeLabel, updateInitiativeLabelPosition, getInitiativesLabels },
  } = useInitiatives();
  const { allowPermissions } = useUserPermissions();
  const initiativeLabels = getInitiativesLabels(workspaceSlug?.toString());

  // derived values
  const isEditable = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);
  const resolvedPath = useResolvedAssetPath({ basePath: "/empty-state/project-settings/labels" });
  const labelOperationsCallbacks: TInitiativeLabelOperationsCallbacks = {
    createLabel: (data: Partial<TInitiativeLabel>) => createInitiativeLabel(workspaceSlug?.toString(), data),
    updateLabel: (labelId: string, data: Partial<TInitiativeLabel>) =>
      updateInitiativeLabel(workspaceSlug?.toString(), labelId, data),
  };

  const newLabel = () => {
    setIsUpdating(false);
    setLabelForm(true);
  };

  const onDrop = (draggingLabelId: string, droppedLabelId: string | undefined, dropAtEndOfList: boolean) => {
    if (workspaceSlug) {
      updateInitiativeLabelPosition(workspaceSlug.toString(), draggingLabelId, droppedLabelId, dropAtEndOfList);
    }
  };

  return (
    <>
      <DeleteInitiativeLabelModal
        isOpen={!!selectDeleteLabel}
        data={selectDeleteLabel ?? null}
        onClose={() => setSelectDeleteLabel(null)}
      />
      <SettingsHeading
        title={t("initiatives.initiative_settings.labels.heading")}
        description={t("initiatives.initiative_settings.labels.description")}
        button={{
          label: t("common.add_label"),
          onClick: () => {
            newLabel();
          },
        }}
        showButton={isEditable}
        className="border-b-0"
      />

      <div className="w-full bg-custom-background-900 rounded-lg border  border-custom-border-100 p-2">
        {showLabelForm && (
          <div className="w-full rounded border border-custom-border-200">
            <CreateUpdateInitiativeLabelInline
              labelForm={showLabelForm}
              setLabelForm={setLabelForm}
              isUpdating={isUpdating}
              labelOperationsCallbacks={labelOperationsCallbacks}
              ref={scrollToRef}
              onClose={() => {
                setLabelForm(false);
                setIsUpdating(false);
              }}
            />
          </div>
        )}
        {initiativeLabels ? (
          initiativeLabels.size === 0 && !showLabelForm ? (
            <div className="flex items-center justify-center h-full w-full p-6">
              <DetailedEmptyState
                title={""}
                description={""}
                primaryButton={{
                  text: "Create your first label",
                  onClick: () => {
                    newLabel();
                  },
                }}
                assetPath={resolvedPath}
                className="w-full !px-0 !py-0"
                size="md"
              />
            </div>
          ) : (
            initiativeLabels.size > 0 &&
            Array.from(initiativeLabels.values())
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((label, index, sortedLabels) => (
                <InitiativeLabelItem
                  label={label}
                  key={label.id}
                  setIsUpdating={setIsUpdating}
                  handleLabelDelete={(label) => setSelectDeleteLabel(label)}
                  isParentDragging={false}
                  isChild={false}
                  isLastChild={index === sortedLabels.length - 1}
                  onDrop={onDrop}
                  labelOperationsCallbacks={labelOperationsCallbacks}
                />
              ))
          )
        ) : (
          !showLabelForm && (
            <Loader className="space-y-5">
              <Loader.Item height="42px" />
              <Loader.Item height="42px" />
              <Loader.Item height="42px" />
              <Loader.Item height="42px" />
            </Loader>
          )
        )}
      </div>
    </>
  );
});
