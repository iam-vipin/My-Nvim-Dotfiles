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

import React, { useEffect, useState } from "react";
// ui
import { Loader } from "@plane/ui";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative } from "@/helpers/flutter-callback.helper";

type Props = {
  issueIdentifier: string;
  projectId?: string;
  workspaceSlug?: string;
};

export function IssueIdentifier(props: Props) {
  const { projectId, workspaceSlug, issueIdentifier } = props;
  const [projectIdentifier, setProjectIdentifier] = useState<string | undefined>(undefined);

  // Get the project identifier from the native code.
  useEffect(() => {
    if (!projectIdentifier) {
      callNative(
        CallbackHandlerStrings.getProjectIdentifier,
        JSON.stringify({
          projectId,
          workspaceSlug,
        })
      ).then((identifier: string) => setProjectIdentifier(identifier));
    }
  }, [projectId, projectIdentifier, workspaceSlug]);

  if (!projectIdentifier)
    return (
      <Loader className="flex flex-shrink-0 w-20 h-5">
        <Loader.Item height="100%" width="100%" />
      </Loader>
    );

  return <span className={"text-13 font-medium text-tertiary"}>{`${projectIdentifier}-${issueIdentifier}`}</span>;
}
