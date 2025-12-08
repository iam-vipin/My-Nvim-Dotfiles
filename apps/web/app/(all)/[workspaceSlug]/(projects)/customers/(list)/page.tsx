// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web components
import { CustomersListRoot } from "@/plane-web/components/customers/list";

function CustomersListPage() {
  // store
  const { currentWorkspace } = useWorkspace();
  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Customers` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <CustomersListRoot />
    </>
  );
}

export default CustomersListPage;
