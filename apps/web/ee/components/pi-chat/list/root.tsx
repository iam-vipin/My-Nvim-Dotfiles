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

import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import PiChatList from "./list";

export const AllChats = observer(function AllChats() {
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { geUserThreads, isLoadingThreads } = usePiChat();
  const userThreads = geUserThreads();

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between w-full">
        <div className="font-semibold text-tertiary text-18">Chats</div>
        <Link
          href={`/${workspaceSlug}/pi-chat`}
          className="flex items-center font-medium gap-2 text-secondary hover:text-primary text-13 border border-subtle-1 rounded-md px-2 py-1"
        >
          New chat
        </Link>
      </div>
      <PiChatList userThreads={userThreads} isLoading={isLoadingThreads} />
    </div>
  );
});
