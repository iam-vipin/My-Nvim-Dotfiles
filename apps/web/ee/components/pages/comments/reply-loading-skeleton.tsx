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

import { Loader } from "@plane/ui";

type PageCommentReplyLoadingSkeletonProps = {
  commentReplyCount: number;
};

export function PageCommentReplyLoadingSkeleton({ commentReplyCount }: PageCommentReplyLoadingSkeletonProps) {
  return (
    <Loader>
      {Array.from({ length: commentReplyCount }, (_, index) => (
        <div key={index} className="relative w-full mb-4">
          <div className="space-y-2">
            {/* User avatar and timestamp */}
            <div className="flex items-center gap-2">
              <div className="rounded-full overflow-hidden">
                <Loader.Item width="24px" height="24px" />
              </div>
              <Loader.Item width={index % 2 === 0 ? "25%" : "30%"} height="12px" />
            </div>
            {/* Reply content */}
            <div className="pl-8 space-y-1">
              <Loader.Item width={index % 3 === 0 ? "75%" : index % 3 === 1 ? "90%" : "60%"} height="14px" />
              <Loader.Item width={index % 2 === 0 ? "45%" : "60%"} height="14px" />
              {index % 3 === 1 && <Loader.Item width="35%" height="14px" />}
            </div>
          </div>
        </div>
      ))}
    </Loader>
  );
}
