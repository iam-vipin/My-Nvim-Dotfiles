"use client";

import { observer } from "mobx-react";
import CreateTypeFormModal from "@/plane-web/components/intake/create/create-type-form-modal";
import { useIntake } from "@/plane-web/hooks/store/use-intake";
import type { Route } from "./+types/page";

const TypeFormPage = observer((props: Route.ComponentProps) => {
  const { params } = props;
  const { anchor } = params;

  const { settings } = useIntake();
  const activeSettings = settings?.anchor === anchor ? settings : undefined;

  if (!activeSettings) return null;

  return <CreateTypeFormModal formSettings={activeSettings} anchor={anchor} />;
});

export default TypeFormPage;
