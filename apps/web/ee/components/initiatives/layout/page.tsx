"use client";

import { observer } from "mobx-react";
// local components
import { InitiativesRoot } from "../components/initiatives-root";
import InitiativesFiltersRow from "../components/rich-filters/row";
import { InitiativePeekOverview } from "../peek-overview";

export const InitiativesPageRoot = observer(() => (
  <div className="h-full w-full flex flex-col">
    <InitiativesFiltersRow />
    <InitiativesRoot />
    <InitiativePeekOverview />
  </div>
));
