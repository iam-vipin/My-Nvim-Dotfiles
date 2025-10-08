"use client";

import { ReactNode } from "react";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// local components
import { InitiativesListHeader } from "./header";

const InitiativesListLayout = ({ children }: { children: ReactNode }) => (
  <>
    <AppHeader header={<InitiativesListHeader />} />
    <ContentWrapper>{children}</ContentWrapper>
  </>
);

export default InitiativesListLayout;
