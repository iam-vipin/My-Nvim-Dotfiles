import { observer } from "mobx-react";
// assets
import packageJson from "package.json";
// hooks

import { useInstance } from "@/hooks/store/use-instance";

export const PlaneVersionNumber = observer(function PlaneVersionNumber() {
  const { instance, config } = useInstance();

  if (config?.payment_server_base_url) {
    return <span>Version: Latest</span>;
  }

  if (instance?.current_version) {
    return <span>Version: {instance.current_version || "Stable"}</span>;
  }

  return <span>Version: v{packageJson.version}</span>;
});
