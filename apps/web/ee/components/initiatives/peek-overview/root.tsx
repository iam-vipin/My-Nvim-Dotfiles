"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
// Plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TInitiativeStates } from "@plane/types";

// components
import { ProjectMultiSelectModal } from "@/components/project/multi-select-modal";

// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";

// local imports
import { WorkspaceEpicsListModal } from "../details/main/collapsible-section/epics/workspace-epic-modal";
import { InitiativeView } from "./view";

export const InitiativePeekOverview: FC = observer(() => {
  // store hook
  const { allowPermissions } = useUserPermissions();
  const { workspaceProjectIds } = useProject();
  const { t } = useTranslation();

  const {
    initiative: {
      peekInitiative,
      fetchInitiativeDetails,
      getInitiativeById,
      updateInitiative,
      fetchInitiativeAnalytics,
      epics: { addEpicsToInitiative, getInitiativeEpicsById },
    },
  } = useInitiatives();
  // state
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);

  // Fetch initiative details
  useEffect(() => {
    const fetchInitiative = async () => {
      if (peekInitiative) {
        try {
          setError(false);
          setIsLoading(true);
          await fetchInitiativeDetails(peekInitiative.workspaceSlug, peekInitiative.initiativeId);
        } catch (error) {
          setError(true);
          console.error("Error fetching initiative", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInitiative();
  }, [peekInitiative, fetchInitiativeDetails]);

  if (!peekInitiative?.workspaceSlug || !peekInitiative?.initiativeId) return null;

  const initiative = getInitiativeById(peekInitiative.initiativeId);

  // Check if initiative is editable, based on user role
  const isEditable = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE,
    peekInitiative.workspaceSlug
  );

  const toggleEpicModal = (value?: boolean) => setIsEpicModalOpen(value ?? !isEpicModalOpen);
  const toggleProjectsModal = (value?: boolean) => setIsProjectsOpen(value ?? !isProjectsOpen);

  const handleInitiativeStateUpdate = async (stateId: TInitiativeStates) => {
    if (!initiative) return;
    await updateInitiative(peekInitiative.workspaceSlug, peekInitiative.initiativeId, { state: stateId });
  };

  const handleInitiativeLabelUpdate = async (labelIds: string[]) => {
    if (!initiative) return;
    await updateInitiative(peekInitiative.workspaceSlug, peekInitiative.initiativeId, { label_ids: labelIds });
  };

  const handleProjectsUpdate = async (initiativeProjectIds: string[]) => {
    if (!peekInitiative?.initiativeId) return;

    await updateInitiative(peekInitiative.workspaceSlug, peekInitiative.initiativeId, {
      project_ids: initiativeProjectIds,
    })
      .then(async () => {
        fetchInitiativeAnalytics(peekInitiative.workspaceSlug, peekInitiative.initiativeId);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("initiatives.toast.project_update_success"),
        });
      })
      .catch((error) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.success"),
          message: error?.error ?? t("initiatives.toast.project_update_error"),
        });
      });
  };

  const handleAddEpicToInitiative = async (epicIds: string[]) => {
    if (!peekInitiative?.initiativeId) return;
    try {
      addEpicsToInitiative(peekInitiative.workspaceSlug, peekInitiative.initiativeId, epicIds).then(async () => {
        fetchInitiativeAnalytics(peekInitiative.workspaceSlug, peekInitiative.initiativeId);
      });
    } catch {
      setToast({
        title: t("toast.error"),
        type: TOAST_TYPE.ERROR,
        message: t("initiatives.toast.epic_update_error"),
      });
    }
  };

  return (
    <>
      <InitiativeView
        workspaceSlug={peekInitiative.workspaceSlug}
        initiativeId={peekInitiative.initiativeId}
        isLoading={isLoading}
        isError={error}
        disabled={!isEditable}
        toggleProjectModal={toggleProjectsModal}
        toggleEpicModal={toggleEpicModal}
        handleInitiativeStateUpdate={handleInitiativeStateUpdate}
        handleInitiativeLabelUpdate={handleInitiativeLabelUpdate}
        isProjectsModalOpen={isProjectsOpen}
        isEpicModalOpen={isEpicModalOpen}
      />
      <ProjectMultiSelectModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        onSubmit={handleProjectsUpdate}
        selectedProjectIds={initiative?.project_ids ?? []}
        projectIds={workspaceProjectIds || []}
      />
      <WorkspaceEpicsListModal
        workspaceSlug={peekInitiative.workspaceSlug}
        isOpen={isEpicModalOpen}
        searchParams={{}}
        selectedEpicIds={getInitiativeEpicsById(peekInitiative.initiativeId) ?? []}
        handleClose={() => setIsEpicModalOpen(false)}
        handleOnSubmit={async (data) => {
          handleAddEpicToInitiative(data.map((epic) => epic.id));
        }}
      />
    </>
  );
});
