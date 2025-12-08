import { Outlet } from "react-router";
// components
import { AppHeader } from "@/components/core/app-header";
// local components
import { PageTypeFiltersHeader } from "../filters-header";
import { PageTypeHeader } from "../header";

export default function ArchivedPagesListLayout() {
  return (
    <>
      <AppHeader header={<PageTypeHeader pageType="archived" />} />
      <PageTypeFiltersHeader />
      <Outlet />
    </>
  );
}
