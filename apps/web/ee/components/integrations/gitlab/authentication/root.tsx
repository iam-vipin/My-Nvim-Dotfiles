import type { FC } from "react";
// plane web components
import { ConnectOrganization } from "@/plane-web/components/integrations/gitlab";
// plane web hooks

interface IUserAuthenticationProps {
  isEnterprise: boolean;
}

export function UserAuthentication({ isEnterprise }: IUserAuthenticationProps) {
  return (
    <div className="relative">
      <ConnectOrganization isEnterprise={isEnterprise} />
    </div>
  );
}
