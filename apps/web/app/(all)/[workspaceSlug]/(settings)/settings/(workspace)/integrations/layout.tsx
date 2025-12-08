import { Outlet } from "react-router";
// components
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";

function IntegrationsLayout() {
  return (
    <SettingsContentWrapper size="md">
      <Outlet />
    </SettingsContentWrapper>
  );
}

export default IntegrationsLayout;
