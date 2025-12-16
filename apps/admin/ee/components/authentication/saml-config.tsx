import { observer } from "mobx-react";
import Link from "next/link";
// icons
import { Settings2 } from "lucide-react";
// plane internal packages
import { getButtonStyling } from "@plane/propel/button";
import type { TInstanceEnterpriseAuthenticationMethodKeys } from "@plane/types";
import { ToggleSwitch } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useInstance } from "@/hooks/store";

type Props = {
  disabled: boolean;
  updateConfig: (key: TInstanceEnterpriseAuthenticationMethodKeys, value: string) => void;
};

export const SAMLConfiguration = observer(function SAMLConfiguration(props: Props) {
  const { disabled, updateConfig } = props;
  // store
  const { formattedConfig } = useInstance();
  // derived values
  const enableSAMLConfig = formattedConfig?.IS_SAML_ENABLED ?? "";
  const isSAMLConfigured = !!formattedConfig?.SAML_ENTITY_ID && !!formattedConfig?.SAML_CERTIFICATE;

  return (
    <>
      {isSAMLConfigured ? (
        <div className="flex items-center gap-4">
          <Link href="/authentication/saml" className={cn(getButtonStyling("link", "lg"), "font-medium")}>
            Edit
          </Link>
          <ToggleSwitch
            value={Boolean(parseInt(enableSAMLConfig))}
            onChange={() => {
              Boolean(parseInt(enableSAMLConfig)) === true
                ? updateConfig("IS_SAML_ENABLED", "0")
                : updateConfig("IS_SAML_ENABLED", "1");
            }}
            size="sm"
            disabled={disabled}
          />
        </div>
      ) : (
        <Link href="/authentication/saml" className={cn(getButtonStyling("secondary", "base"), "text-tertiary")}>
          <Settings2 className="h-4 w-4 p-0.5 text-tertiary/80" />
          Configure
        </Link>
      )}
    </>
  );
});
