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

type Props = {
  title: string;
  description?: string;
};

export function ProfileSettingContentHeader(props: Props) {
  const { title, description } = props;
  return (
    <div className="flex flex-col gap-1 pb-4 border-b border-subtle w-full">
      <div className="text-18 font-medium text-primary">{title}</div>
      {description && <div className="text-13 font-regular text-tertiary">{description}</div>}
    </div>
  );
}
