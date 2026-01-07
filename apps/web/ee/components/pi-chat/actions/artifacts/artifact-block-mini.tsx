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

type TArtifactBlockMiniProps = {
  title: string;
  description: string;
};

function ArtifactBlockMini(props: TArtifactBlockMiniProps) {
  const { title, description } = props;
  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg bg-layer-1 max-w-[150px] overflow-hidden">
      <div className="flex gap-2 items-center">
        {/* <Briefcase className="size-3" /> */}
        <span className="text-11 text-tertiary truncate">{title}</span>
      </div>
      <div className="text-13 font-medium line-clamp-2">{description}</div>
    </div>
  );
}

export default ArtifactBlockMini;
