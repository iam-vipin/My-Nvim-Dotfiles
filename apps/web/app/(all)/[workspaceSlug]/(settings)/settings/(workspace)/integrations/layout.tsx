"use client";

import { Outlet } from "react-router";
// components
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";

const IntegrationsLayout = () => (
  <SettingsContentWrapper size="md">
    <Outlet />
  </SettingsContentWrapper>
);

export default IntegrationsLayout;
