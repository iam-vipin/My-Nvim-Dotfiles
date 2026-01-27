/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { CirclePlus, Mails } from "lucide-react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { WorkspaceLogo } from "@/components/workspace/logo";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// local imports
import { SettingsSidebarItem } from "../../sidebar/item";

export const ProfileSettingsSidebarWorkspaceOptions = observer(function ProfileSettingsSidebarWorkspaceOptions() {
  // store hooks
  const { workspaces } = useWorkspace();
  // translation
  const { t } = useTranslation();

  return (
    <div className="shrink-0">
      <div className="p-2 text-caption-md-medium text-tertiary capitalize">{t("workspace")}</div>
      <div className="flex flex-col">
        {Object.values(workspaces).map((workspace) => (
          <SettingsSidebarItem
            key={workspace.id}
            as="link"
            href={`/${workspace.slug}/`}
            iconNode={<WorkspaceLogo logo={workspace.logo_url} name={workspace.name} classNames="shrink-0" />}
            label={workspace.name}
            isActive={false}
          />
        ))}
        <div className="mt-1.5">
          <SettingsSidebarItem
            as="link"
            href="/create-workspace/"
            icon={CirclePlus}
            label={t("create_workspace")}
            isActive={false}
          />
          <SettingsSidebarItem
            as="link"
            href="/invitations/"
            icon={Mails}
            label={t("workspace_invites")}
            isActive={false}
          />
        </div>
      </div>
    </div>
  );
});
