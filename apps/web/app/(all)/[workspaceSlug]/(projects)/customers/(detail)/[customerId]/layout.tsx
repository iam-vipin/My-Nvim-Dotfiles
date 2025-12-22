// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { CustomerDetailHeader } from "@/plane-web/components/customers";

export default function CustomerDetailLayout() {
  return (
    <>
      <AppHeader header={<CustomerDetailHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
