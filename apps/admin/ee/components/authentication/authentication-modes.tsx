import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import { KeyRound, Mails } from "lucide-react";
import type {
  TInstanceAuthenticationMethodKeys as TBaseAuthenticationMethods,
  TInstanceAuthenticationModes,
  TInstanceEnterpriseAuthenticationMethodKeys,
} from "@plane/types";
import { resolveGeneralTheme } from "@plane/utils";
// assets
import giteaLogo from "@/app/assets/logos/gitea-logo.svg?url";
import githubLightModeImage from "@/app/assets/logos/github-black.png?url";
import githubDarkModeImage from "@/app/assets/logos/github-white.png?url";
import GitlabLogo from "@/app/assets/logos/gitlab-logo.svg?url";
import GoogleLogo from "@/app/assets/logos/google-logo.svg?url";
import OIDCLogo from "@/app/assets/logos/oidc-logo.svg?url";
import SAMLLogo from "@/app/assets/logos/saml-logo.svg?url";
// plane ce components
import { getAuthenticationModes as getCEAuthenticationModes } from "@/ce/components/authentication/authentication-modes";
// components
import { AuthenticationMethodCard } from "@/components/authentication/authentication-method-card";
import { EmailCodesConfiguration } from "@/components/authentication/email-config-switch";
import { GiteaConfiguration } from "@/components/authentication/gitea-config";
import { GithubConfiguration } from "@/components/authentication/github-config";
import { GitlabConfiguration } from "@/components/authentication/gitlab-config";
import { GoogleConfiguration } from "@/components/authentication/google-config";
import { PasswordLoginConfiguration } from "@/components/authentication/password-config-switch";
// plane admin imports
import { OIDCConfiguration, SAMLConfiguration } from "@/plane-admin/components/authentication";
import { useInstanceFlag } from "@/plane-admin/hooks/store/use-instance-flag";

type TInstanceAuthenticationMethodKeys = TBaseAuthenticationMethods | TInstanceEnterpriseAuthenticationMethodKeys;

export type TAuthenticationModeProps = {
  disabled: boolean;
  updateConfig: (key: TInstanceAuthenticationMethodKeys, value: string) => void;
};

export type TGetAuthenticationModeProps = {
  disabled: boolean;
  updateConfig: (key: TInstanceAuthenticationMethodKeys, value: string) => void;
  resolvedTheme: string | undefined;
};

// Enterprise authentication methods
export const getAuthenticationModes: (props: TGetAuthenticationModeProps) => TInstanceAuthenticationModes[] = ({
  disabled,
  updateConfig,
  resolvedTheme,
}) => [
  {
    key: "unique-codes",
    name: "Unique codes",
    description:
      "Log in or sign up for Plane using codes sent via email. You need to have set up SMTP to use this method.",
    icon: <Mails className="h-6 w-6 p-0.5 text-custom-text-300/80" />,
    config: <EmailCodesConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "passwords-login",
    name: "Passwords",
    description: "Allow members to create accounts with passwords and use it with their email addresses to sign in.",
    icon: <KeyRound className="h-6 w-6 p-0.5 text-custom-text-300/80" />,
    config: <PasswordLoginConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "google",
    name: "Google",
    description: "Allow members to log in or sign up for Plane with their Google accounts.",
    icon: <img src={GoogleLogo} height={20} width={20} alt="Google Logo" />,
    config: <GoogleConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "github",
    name: "GitHub",
    description: "Allow members to log in or sign up for Plane with their GitHub accounts.",
    icon: (
      <img
        src={resolveGeneralTheme(resolvedTheme) === "dark" ? githubDarkModeImage : githubLightModeImage}
        height={20}
        width={20}
        alt="GitHub Logo"
      />
    ),
    config: <GithubConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "gitlab",
    name: "GitLab",
    description: "Allow members to log in or sign up to plane with their GitLab accounts.",
    icon: <img src={GitlabLogo} height={20} width={20} alt="GitLab Logo" />,
    config: <GitlabConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "gitea",
    name: "Gitea",
    description: "Allow members to log in or sign up to plane with their Gitea accounts.",
    icon: <img className="h-5 w-5" src={giteaLogo} height={20} width={20} alt="Gitea Logo" />,
    config: <GiteaConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "oidc",
    name: "OIDC",
    description: "Authenticate your users via the OpenID Connect protocol.",
    icon: <img src={OIDCLogo} height={22} width={22} alt="OIDC Logo" />,
    config: <OIDCConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  {
    key: "saml",
    name: "SAML",
    description: "Authenticate your users via the Security Assertion Markup Language protocol.",
    icon: <img src={SAMLLogo} height={22} width={22} alt="SAML Logo" className="pl-0.5" />,
    config: <SAMLConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
];

export const AuthenticationModes = observer(function AuthenticationModes(props: TAuthenticationModeProps) {
  const { disabled, updateConfig } = props;
  // next-themes
  const { resolvedTheme } = useTheme();
  // plane admin hooks
  const isOIDCSAMLEnabled = useInstanceFlag("OIDC_SAML_AUTH");

  const authenticationModes = isOIDCSAMLEnabled
    ? getAuthenticationModes({ disabled, updateConfig, resolvedTheme })
    : getCEAuthenticationModes({ disabled, updateConfig, resolvedTheme });

  return (
    <>
      {authenticationModes.map((method) => (
        <AuthenticationMethodCard
          key={method.key}
          name={method.name}
          description={method.description}
          icon={method.icon}
          config={method.config}
          disabled={disabled}
          unavailable={method.unavailable}
        />
      ))}
    </>
  );
});
