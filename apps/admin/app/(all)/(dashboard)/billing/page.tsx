import { observer } from "mobx-react";
// components
import { PageWrapper } from "@/components/common/page-wrapper";
// plane admin imports
import { EnterpriseLicenseManagement } from "@/plane-admin/components/enterprise-license/root";
// types
import type { Route } from "./+types/page";

function BillingPage() {
  return (
    <PageWrapper
      header={{
        title: "Billings and plans",
        description: "Manage your instance license, view billing details, and upgrade your plan.",
      }}
    >
      <EnterpriseLicenseManagement />
    </PageWrapper>
  );
}

export const meta: Route.MetaFunction = () => [{ title: "Billing and Plans - God Mode" }];

export default observer(BillingPage);
