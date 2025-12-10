import { useMemo } from "react";
import { isDesktopApp as isDesktopAppFn } from "@todesktop/client-core/platform/todesktop";
import { observer } from "mobx-react";
// helpers
import { cn } from "@plane/utils";
// desktop app components
import {
  DesktopSidebarToggle,
  DesktopAppNavigation,
  useDesktopApp,
  DesktopAppProvider,
} from "@/plane-web/components/desktop";

const DesktopHeaderRoot = observer(function DesktopHeaderRoot() {
  // store hooks
  const { isFullScreen } = useDesktopApp();
  // derived values
  const isDesktopApp = useMemo(() => isDesktopAppFn(), []);

  if (!isDesktopApp) return null;
  return (
    <div
      className={cn("flex flex-shrink-0 gap-0.5 transition-all duration-300 ease-in-out", {
        "pl-12": isFullScreen,
        "pl-20": !isFullScreen,
      })}
    >
      <DesktopSidebarToggle />
      <DesktopAppNavigation />
    </div>
  );
});

export const DesktopHeaderProvider = observer(function DesktopHeaderProvider() {
  return (
    <DesktopAppProvider>
      <DesktopHeaderRoot />
    </DesktopAppProvider>
  );
});
