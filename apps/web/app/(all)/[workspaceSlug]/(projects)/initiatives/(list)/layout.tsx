"use client";

import type { ReactNode } from "react";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// plane-web
import { InitiativesFilterProvider } from "@/plane-web/components/initiatives/components/rich-filters/context";
// local components
import { InitiativesListHeader } from "./header";

const InitiativesListLayout = ({ children }: { children: ReactNode }) => (
  <InitiativesFilterProvider>
    <AppHeader header={<InitiativesListHeader />} />
    <ContentWrapper>{children}</ContentWrapper>
  </InitiativesFilterProvider>
);

export default InitiativesListLayout;
