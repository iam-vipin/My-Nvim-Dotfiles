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
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { Outlet } from "react-router";
// hooks
import { useUser } from "@/hooks/store/use-user";

function RootLayout() {
  // router
  const { replace } = useRouter();
  // store hooks
  const { isUserLoggedIn } = useUser();

  useEffect(() => {
    if (isUserLoggedIn === true) replace("/general");
  }, [replace, isUserLoggedIn]);

  return (
    <div className="relative z-10 flex flex-col items-center w-screen h-screen overflow-hidden overflow-y-auto pt-6 pb-10 px-8 bg-surface-1">
      <Outlet />
    </div>
  );
}

export default observer(RootLayout);
