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

import type { FC } from "react";
import { observer } from "mobx-react";
// computed
import { ContentOverflowWrapper } from "@/components/core/content-overflow-HOC";
import { useHome } from "@/hooks/store/use-home";
import { LinksEmptyState } from "../empty-states/links";
import { EWidgetKeys, WidgetLoader } from "../loaders";
import { ProjectLinkDetail } from "./link-detail";
import type { TLinkOperations } from "./use-links";

export type TLinkOperationsModal = Exclude<TLinkOperations, "create">;

export type TProjectLinkList = {
  linkOperations: TLinkOperationsModal;
  workspaceSlug: string;
};

export const ProjectLinkList = observer(function ProjectLinkList(props: TProjectLinkList) {
  // props
  const { linkOperations, workspaceSlug } = props;
  // hooks
  const {
    quickLinks: { getLinksByWorkspaceId },
  } = useHome();

  const links = getLinksByWorkspaceId(workspaceSlug);

  if (links === undefined) return <WidgetLoader widgetKey={EWidgetKeys.QUICK_LINKS} />;

  if (links.length === 0) return <LinksEmptyState />;

  return (
    <div className="relative">
      <ContentOverflowWrapper
        maxHeight={150}
        containerClassName="box-border min-h-[30px] flex flex-col"
        fallback={<></>}
        buttonClassName="bg-surface-2/20"
      >
        <div className="flex gap-2 mb-2 flex-wrap flex-1">
          {links.map((linkId) => (
            <ProjectLinkDetail key={linkId} linkId={linkId} linkOperations={linkOperations} />
          ))}
        </div>
      </ContentOverflowWrapper>
    </div>
  );
});
