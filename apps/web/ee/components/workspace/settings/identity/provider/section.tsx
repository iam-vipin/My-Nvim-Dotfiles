// plane imports
import { useTranslation } from "@plane/i18n";
// hooks
import { useDomains } from "@/plane-web/hooks/sso/use-domains";
import { useProviders } from "@/plane-web/hooks/sso/use-providers";
// plane web imports
import { IdentitySettingsSection } from "@/plane-web/components/workspace/settings/identity/common/identity-settings-section";
// local components
import { OIDCSection } from "./oidc/section";
import { SAMLSection } from "./saml/section";

type TProviderSection = {
  workspaceSlug: string;
};

export function ProviderSection(props: TProviderSection) {
  const { workspaceSlug } = props;
  // plane hooks
  const { t } = useTranslation();
  // SWR hooks
  const { hasAnyVerifiedDomain } = useDomains(workspaceSlug);
  const { isLoading, oidcProvider, samlProvider } = useProviders(workspaceSlug);

  return (
    <IdentitySettingsSection sectionTitle={t("sso.providers.header")}>
      <div className="flex flex-col gap-6">
        <SAMLSection
          isDisabled={!hasAnyVerifiedDomain}
          isInitializing={isLoading}
          workspaceSlug={workspaceSlug}
          samlProvider={samlProvider}
        />
        <OIDCSection
          isDisabled={!hasAnyVerifiedDomain}
          isInitializing={isLoading}
          workspaceSlug={workspaceSlug}
          oidcProvider={oidcProvider}
        />
      </div>
    </IdentitySettingsSection>
  );
}
