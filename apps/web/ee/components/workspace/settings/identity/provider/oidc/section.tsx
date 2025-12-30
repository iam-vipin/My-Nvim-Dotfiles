import { Link } from "react-router";
// plane imports
import { useTranslation } from "@plane/i18n";
import { getButtonStyling } from "@plane/propel/button";
import { Tooltip } from "@plane/propel/tooltip";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
import type { TIdentityProviderOIDC } from "@plane/types";
// assets
import OIDCLogo from "@/app/assets/logos/oidc-logo.svg?url";
// plane web imports
import { IdentitySettingsSubSection } from "@/plane-web/components/workspace/settings/identity/common/identity-settings-sub-section";

type TOIDCSection = {
  isDisabled: boolean;
  isInitializing: boolean;
  workspaceSlug: string;
  oidcProvider: TIdentityProviderOIDC | undefined;
};

export function OIDCSection(props: TOIDCSection) {
  const { isDisabled, isInitializing, oidcProvider } = props;
  // plane hooks
  const { t } = useTranslation();

  return (
    <IdentitySettingsSubSection
      subsectionTitle={t("sso.providers.oidc.header")}
      subsectionDescription={t("sso.providers.oidc.description")}
      logo={{
        src: OIDCLogo,
        alt: "OIDC Logo",
      }}
      action={
        isInitializing ? (
          <Loader>
            <Loader.Item height="26px" width="75px" />
          </Loader>
        ) : (
          <Tooltip position="left" tooltipContent={t("sso.providers.disabled_message")} disabled={!isDisabled}>
            <div>
              <Link
                to="oidc"
                className={cn(
                  getButtonStyling("ghost", "lg"),
                  isDisabled && "opacity-70 cursor-not-allowed pointer-events-none"
                )}
                aria-disabled={isDisabled}
              >
                {oidcProvider ? t("sso.providers.configure.update") : t("sso.providers.configure.create")}
              </Link>
            </div>
          </Tooltip>
        )
      }
      showBorder
    />
  );
}
