// plane admin providers
import { InstanceLicenseProvider } from "@/plane-admin/providers/license.provider";

export function ExtendedProviders({ children }: { children: React.ReactNode }) {
  return <InstanceLicenseProvider>{children}</InstanceLicenseProvider>;
}
