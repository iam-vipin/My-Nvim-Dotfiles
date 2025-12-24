import { observer } from "mobx-react";
import useSWR from "swr";
// hooks
import { useInstanceManagement } from "@/plane-admin/hooks/store/use-instance-management";

export const InstanceLicenseProvider = observer(function InstanceLicenseProvider(props: React.PropsWithChildren) {
  const { children } = props;
  // store hooks
  const { fetchInstanceLicense } = useInstanceManagement();
  // fetching instance license
  useSWR("INSTANCE_LICENSE", () => fetchInstanceLicense());

  return <>{children}</>;
});
