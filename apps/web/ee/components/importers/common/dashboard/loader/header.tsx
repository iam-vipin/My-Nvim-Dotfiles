import { Loader } from "@plane/ui";

export function DashboardLoaderHeader() {
  return (
    <Loader>
      <div className="space-y-6">
        <Loader.Item height="26px" width="20%" />
        <Loader.Item height="60px" width="100%" />
      </div>
    </Loader>
  );
}
