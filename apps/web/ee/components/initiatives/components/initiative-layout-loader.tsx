import React from "react";
import type { TBaseLayoutType } from "@plane/types";
import { GenericLayoutLoader } from "@/components/base-layouts/loaders/layout-loader";
import { DEFAULT_INITIATIVE_LAYOUT } from "@/plane-web/constants/initiative";

const InitiativeLayoutLoader = ({ layout }: { layout?: TBaseLayoutType }) => (
  <GenericLayoutLoader layout={layout ?? DEFAULT_INITIATIVE_LAYOUT} />
);

export default InitiativeLayoutLoader;
