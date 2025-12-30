import { observer } from "mobx-react";
// components
import { PageWrapper } from "@/components/common/page-wrapper";
// plane admin imports
// types
// import type { Route } from "./+types/page";

function UserManagementPage() {
  return (
    <PageWrapper
      header={{
        title: "Instance-Level User Management",
        description: "View and manage seats for all the members active in this instance",
      }}
      size="lg"
    >
      Instance-Level User Management
    </PageWrapper>
  );
}

// export const meta: Route.MetaFunction = () => [{ title: "User Management - God Mode" }];

export default observer(UserManagementPage);
