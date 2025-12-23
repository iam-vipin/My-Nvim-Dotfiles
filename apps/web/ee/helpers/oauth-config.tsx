// plane imports
import { API_BASE_URL } from "@plane/constants";
import { Key } from "lucide-react";
import type { IInstanceConfig } from "@plane/types";
// ce imports
import { OAUTH_CONFIG as CE_OAUTH_CONFIG, isOAuthEnabled as ceIsOAuthEnabled } from "@/ce/helpers/oauth-config";
import type { OAuthConfigParams } from "@/ce/helpers/oauth-config";

export type { OAuthConfigParams };

export const isOAuthEnabled = (config: IInstanceConfig | undefined) =>
  ceIsOAuthEnabled(config) || (config && (config?.is_oidc_enabled || config?.is_saml_enabled)) || false;

export function OAUTH_CONFIG(params: OAuthConfigParams) {
  const { config, next_path } = params;
  const baseConfig = CE_OAUTH_CONFIG(params);

  return [
    ...baseConfig,
    {
      id: "oidc",
      text: `Continue with ${config?.oidc_provider_name ? config.oidc_provider_name : "OIDC"}`,
      icon: <Key height={18} width={18} />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/oidc/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_oidc_enabled || false,
    },
    {
      id: "saml",
      text: `Continue with ${config?.saml_provider_name ? config.saml_provider_name : "SAML"}`,
      icon: <Key height={18} width={18} />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/saml/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_saml_enabled || false,
    },
  ];
}
