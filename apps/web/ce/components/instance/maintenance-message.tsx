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

export function MaintenanceMessage() {
  const linkMap = [
    {
      key: "mail_to",
      label: "Contact Support",
      value: "mailto:support@plane.so",
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <h1 className="text-18 font-semibold text-primary text-left">
          &#x1F6A7; Looks like Plane didn&apos;t start up correctly!
        </h1>
        <span className="text-14 font-medium text-secondary text-left">
          Some services might have failed to start. Please check your container logs to identify and resolve the issue.
          If you&apos;re stuck, reach out to our support team for more help.
        </span>
      </div>
      <div className="flex items-center justify-start gap-6 mt-1">
        {linkMap.map((link) => (
          <div key={link.key}>
            <a
              href={link.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:underline text-13"
            >
              {link.label}
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
