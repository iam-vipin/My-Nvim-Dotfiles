import { observer } from "mobx-react";
// plane imports
import { Loader } from "@plane/ui";
// plane web stores
import type { DashboardWidgetInstance } from "@/plane-web/store/dashboards/widget";

type Props = {
  widget: DashboardWidgetInstance;
};

export const DashboardWidgetLoader = observer(function DashboardWidgetLoader(props: Props) {
  const {} = props;

  return (
    <Loader className="size-full px-4 pb-4">
      <Loader.Item height="100%" width="100%" />
    </Loader>
  );
});
