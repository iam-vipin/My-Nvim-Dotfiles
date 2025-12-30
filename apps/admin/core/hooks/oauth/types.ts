import type { TInstanceAuthenticationMethodKeys, TInstanceEnterpriseAuthenticationMethodKeys } from "@plane/types";

export type TGetAuthenticationModeProps = {
  disabled: boolean;
  updateConfig: (
    key: TInstanceAuthenticationMethodKeys | TInstanceEnterpriseAuthenticationMethodKeys,
    value: string
  ) => void;
  resolvedTheme: string | undefined;
};
