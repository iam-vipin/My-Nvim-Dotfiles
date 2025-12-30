import type { TProviderType } from "@plane/types";

type TSSOProviderName = {
  short: string;
  long: string;
};

export const getSSOProviderName = (provider: TProviderType): TSSOProviderName => {
  switch (provider) {
    case "oidc":
      return {
        short: "OIDC",
        long: "OpenID Connect",
      };
    case "saml":
      return {
        short: "SAML",
        long: "Security Assertion Markup Language",
      };
  }
};
