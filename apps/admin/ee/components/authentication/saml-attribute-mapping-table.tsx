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

export function SAMLAttributeMappingTable() {
  return (
    <table className="table-auto border-collapse text-secondary text-13 w-full">
      <thead>
        <tr className="text-left border-b border-subtle-1">
          <th className="py-2">IdP</th>
          <th className="py-2">Plane</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-subtle-1">
          <td className="py-2">Name ID format</td>
          <td className="py-2">emailAddress</td>
        </tr>
        <tr className="border-b border-subtle-1">
          <td className="py-2">first_name</td>
          <td className="py-2">user.firstName</td>
        </tr>
        <tr className="border-b border-subtle-1">
          <td className="py-2">last_name</td>
          <td className="py-2">user.lastName</td>
        </tr>
        <tr className="border-b border-subtle-1">
          <td className="py-2">email</td>
          <td className="py-2">user.email</td>
        </tr>
      </tbody>
    </table>
  );
}
