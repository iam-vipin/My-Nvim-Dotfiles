"use client";

import React from "react";
import { observer } from "mobx-react";
// components
import type { TPowerKCommandConfig, TPowerKContext, TPowerKPageType } from "@/components/power-k/core/types";
import { PowerKModalDefaultPage } from "@/components/power-k/ui/pages/default";
import { PowerKAccountPreferencesPages } from "@/components/power-k/ui/pages/preferences";

type Props = {
  activePage: TPowerKPageType | null;
  context: TPowerKContext;
  onCommandSelect: (command: TPowerKCommandConfig) => void;
  onPageDataSelect: (value: unknown) => void;
};

export const PlaneAiAppPowerKModalPagesList: React.FC<Props> = observer((props) => {
  const { activePage, context, onCommandSelect, onPageDataSelect } = props;

  // Main page content (no specific page)
  if (!activePage) {
    return <PowerKModalDefaultPage context={context} onCommandSelect={onCommandSelect} />;
  }

  return (
    <>
      <PowerKAccountPreferencesPages activePage={activePage} handleSelection={onPageDataSelect} />
    </>
  );
});
