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

interface SettingsSectionProps {
  title: string;
  description: string;
  control: React.ReactNode;
}

export function PreferencesSection({ title, description, control }: SettingsSectionProps) {
  return (
    <div className="grid grid-cols-12 gap-4 py-6 sm:gap-16">
      <div className="col-span-12 sm:col-span-6">
        <h4 className="text-lg font-semibold text-primary">{title}</h4>
        <p className="text-13 text-secondary">{description}</p>
      </div>
      <div className="col-span-12 sm:col-span-6">{control}</div>
    </div>
  );
}
