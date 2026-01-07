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

// TODO: Check if we need this
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#link-relpreload
// export const usePreloadResources = () => {
//   useEffect(() => {
//     const preloadItem = (url: string) => {
//       ReactDOM.preload(url, { as: "fetch", crossOrigin: "use-credentials" });
//     };

//     const urls = [
//       `${process.env.VITE_API_BASE_URL}/api/instances/`,
//       `${process.env.VITE_API_BASE_URL}/api/users/me/`,
//       `${process.env.VITE_API_BASE_URL}/api/users/me/profile/`,
//       `${process.env.VITE_API_BASE_URL}/api/users/me/settings/`,
//       `${process.env.VITE_API_BASE_URL}/api/users/me/workspaces/?v=${Date.now()}`,
//     ];

//     urls.forEach((url) => preloadItem(url));
//   }, []);
// };

export function PreloadResources() {
  return (
    // usePreloadResources();
    null
  );
}
