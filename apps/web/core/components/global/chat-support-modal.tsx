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

import { useEffect } from "react";
import { Intercom, shutdown, show } from "@intercom/messenger-js-sdk";
import { observer } from "mobx-react";
// custom events
import { CHAT_SUPPORT_EVENTS } from "@/custom-events/chat-support";
// store hooks
import { useInstance } from "@/hooks/store/use-instance";
import { useUser } from "@/hooks/store/user";

const ChatSupportModal = observer(function ChatSupportModal() {
  // store hooks
  const { data: user } = useUser();
  const { config } = useInstance();
  // derived values
  const intercomAppId = config?.intercom_app_id;
  const isEnabled = Boolean(user && config?.is_intercom_enabled && intercomAppId);

  useEffect(() => {
    if (!isEnabled || !user || !intercomAppId) return;

    Intercom({
      app_id: intercomAppId,
      user_id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      hide_default_launcher: true,
    });

    const handleOpenChatSupport = () => {
      show();
    };

    window.addEventListener(CHAT_SUPPORT_EVENTS.open, handleOpenChatSupport);
    return () => {
      window.removeEventListener(CHAT_SUPPORT_EVENTS.open, handleOpenChatSupport);
      shutdown();
    };
  }, [user, intercomAppId, isEnabled]);

  return null;
});

export default ChatSupportModal;
