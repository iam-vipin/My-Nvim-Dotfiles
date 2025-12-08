import type { FC } from "react";
import { observer } from "mobx-react";
// plane web components
import { RepositoryMappingRoot } from "@/plane-web/components/integrations/gitlab";

interface IIntegrationRootProps {
  isEnterprise: boolean;
}

export const IntegrationRoot = observer(function IntegrationRoot({ isEnterprise }: IIntegrationRootProps) {
  return (
    <div className="relative">
      <RepositoryMappingRoot isEnterprise={isEnterprise} />
    </div>
  );
});
