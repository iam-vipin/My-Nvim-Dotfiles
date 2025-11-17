"use client";

import { observer } from "mobx-react";

// component
import Link from "next/link";
import useSWR from "swr";
import { ChevronLeftIcon } from "lucide-react";
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TUserApplication } from "@plane/types";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
// hooks
import { APPLICATION_CATEGORIES_LIST } from "@/constants/fetch-keys";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { CreateUpdateApplication } from "@/plane-web/components/marketplace";
import { useApplications } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function ApplicationCreatePage({ params }: Route.ComponentProps) {
  // store hooks
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();
  const { createApplication, fetchApplicationCategories } = useApplications();
  const { workspaceSlug } = params;
  // derived values
  const canPerformWorkspaceAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Build your own app` : undefined;

  useSWR(APPLICATION_CATEGORIES_LIST(), async () => fetchApplicationCategories());

  const handleFormSubmit = async (data: Partial<TUserApplication>) => {
    try {
      if (!data) return;
      const response = await createApplication(data);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: "Application created successfully",
      });
      return response;
    } catch (error) {
      console.error(error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: "Failed to create application",
      });
    }
  };

  if (workspaceUserInfo && !canPerformWorkspaceAdminActions) {
    return <NotAuthorizedView section="settings" className="h-auto" />;
  }

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="w-full h-full">
        <Link
          href={`/${workspaceSlug}/settings/integrations`}
          className="flex items-center gap-2 text-sm font-semibold text-custom-text-300 mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to integrations
        </Link>
        <CreateUpdateApplication handleFormSubmit={handleFormSubmit} />
      </div>
    </>
  );
}

export default observer(ApplicationCreatePage);
