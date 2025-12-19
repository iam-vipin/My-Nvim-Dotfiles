import { useMemo } from "react";
// plane editor types
import type { IEditorPropsExtended, TCommentConfig } from "@plane/editor";
// hooks
import { EIssuesStoreType, EUserPermissions } from "@plane/types";
import type { TPartialProject, TSearchEntityRequestPayload, TSearchResponse } from "@plane/types";
import { LogoSpinner } from "@/components/common/logo-spinner";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useUserProfile } from "@/hooks/store/use-user-profile";
import { useUser } from "@/hooks/store/user";
// plane web hooks
import { useEditorEmbeds } from "@/plane-web/hooks/use-editor-embed";
// store
import type { TPageInstance } from "@/store/pages/base-page";
// local imports
import type { EPageStoreType } from "../store";

export type TExtendedEditorExtensionsConfig = Pick<
  IEditorPropsExtended,
  "embedHandler" | "commentConfig" | "isSmoothCursorEnabled" | "logoSpinner" | "selectionConversion"
>;

export type TExtendedEditorExtensionsHookParams = {
  workspaceSlug: string;
  page: TPageInstance;
  storeType: EPageStoreType;
  fetchEntity: (payload: TSearchEntityRequestPayload) => Promise<TSearchResponse>;
  getRedirectionLink: (pageId?: string) => string;
  extensionHandlers?: Map<string, unknown>;
  projectId?: string;
};

export const useExtendedEditorProps = (
  params: TExtendedEditorExtensionsHookParams
): TExtendedEditorExtensionsConfig => {
  const { workspaceSlug, page, storeType, fetchEntity, getRedirectionLink, extensionHandlers, projectId } = params;
  // store hooks
  const {
    canPerformAnyCreateAction,
    permission: { getProjectRoleByWorkspaceSlugAndProjectId },
  } = useUser();
  const {
    data: { is_smooth_cursor_enabled },
  } = useUserProfile();
  const { joinedProjectIds, getPartialProjectById } = useProject();
  const {
    issues: { createIssue },
  } = useIssues(EIssuesStoreType.PROJECT);
  // embed props
  const { embedProps } = useEditorEmbeds({
    fetchEmbedSuggestions: fetchEntity,
    getRedirectionLink,
    workspaceSlug,
    page,
    storeType,
    projectId,
  });

  const selectionConversionProps: TExtendedEditorExtensionsConfig["selectionConversion"] = useMemo(() => {
    const canCreateWorkItem = projectId ? canPerformAnyCreateAction : true;
    const projectsList = joinedProjectIds
      ?.map((projectId) => getPartialProjectById(projectId))
      .filter((p): p is TPartialProject => {
        if (!p) return false;
        const projectRole = getProjectRoleByWorkspaceSlugAndProjectId(workspaceSlug, p.id);
        return !!projectRole && projectRole >= EUserPermissions.MEMBER;
      });

    return {
      createWorkItemCallback: async (payload, projectIdFromSelection?: string) => {
        const resolvedProjectId = projectIdFromSelection ?? projectId;
        if (!resolvedProjectId) return;
        const response = await createIssue(workspaceSlug, resolvedProjectId, payload);
        if (!response) return;
        return {
          id: response.id,
        };
      },
      isConversionEnabled: canCreateWorkItem,
      projectSelectionEnabled: projectId ? undefined : { projectsList },
    };
  }, [
    canPerformAnyCreateAction,
    createIssue,
    getPartialProjectById,
    getProjectRoleByWorkspaceSlugAndProjectId,
    joinedProjectIds,
    projectId,
    workspaceSlug,
  ]);

  const extendedEditorProps: TExtendedEditorExtensionsConfig = useMemo(
    () => ({
      embedHandler: embedProps,
      commentConfig: extensionHandlers?.get("comments") as TCommentConfig | undefined,
      isSmoothCursorEnabled: is_smooth_cursor_enabled,
      logoSpinner: LogoSpinner,
      selectionConversion: selectionConversionProps,
    }),
    [embedProps, extensionHandlers, is_smooth_cursor_enabled, selectionConversionProps]
  );

  return extendedEditorProps;
};
