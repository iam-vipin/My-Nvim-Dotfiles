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

import { observer } from "mobx-react";
import CreateTypeFormModal from "@/plane-web/components/intake/create/create-type-form-modal";
import { useIntake } from "@/plane-web/hooks/store/use-intake";
import type { Route } from "./+types/page";

const TypeFormPage = observer(function TypeFormPage(props: Route.ComponentProps) {
  const { params } = props;
  const { anchor } = params;

  const { settings } = useIntake();
  const activeSettings = settings?.anchor === anchor ? settings : undefined;

  if (!activeSettings) return null;

  return <CreateTypeFormModal formSettings={activeSettings} anchor={anchor} />;
});

export default TypeFormPage;
