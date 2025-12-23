import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Monitor, Smartphone, Cable } from "lucide-react";
// plane internal packages
import { Button, getButtonStyling } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IFormattedInstanceConfiguration, TInstanceSAMLAuthenticationConfigurationKeys } from "@plane/types";
import { TextArea } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import { CodeBlock } from "@/components/common/code-block";
import { ConfirmDiscardModal } from "@/components/common/confirm-discard-modal";
import type { TControllerInputFormField } from "@/components/common/controller-input";
import { ControllerInput } from "@/components/common/controller-input";
import type { TControllerSwitchFormField } from "@/components/common/controller-switch";
import { ControllerSwitch } from "@/components/common/controller-switch";
import type { TCopyField } from "@/components/common/copy-field";
import { CopyField } from "@/components/common/copy-field";
// hooks
import { useInstance } from "@/hooks/store";
import { SAMLAttributeMappingTable } from "@/plane-admin/components/authentication";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type SAMLConfigFormValues = Record<TInstanceSAMLAuthenticationConfigurationKeys, string>;

export function InstanceSAMLConfigForm(props: Props) {
  const { config } = props;
  // states
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  // store hooks
  const { updateInstanceConfigurations } = useInstance();
  // form data
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SAMLConfigFormValues>({
    defaultValues: {
      SAML_ENTITY_ID: config["SAML_ENTITY_ID"],
      SAML_SSO_URL: config["SAML_SSO_URL"],
      SAML_LOGOUT_URL: config["SAML_LOGOUT_URL"],
      SAML_CERTIFICATE: config["SAML_CERTIFICATE"],
      SAML_PROVIDER_NAME: config["SAML_PROVIDER_NAME"],
      ENABLE_SAML_IDP_SYNC: config["ENABLE_SAML_IDP_SYNC"],
    },
  });

  const originURL = typeof window !== "undefined" ? window.location.origin : "";

  const SAML_FORM_FIELDS: TControllerInputFormField[] = [
    {
      key: "SAML_ENTITY_ID",
      type: "text",
      label: "Entity ID",
      description: "A unique ID for this Plane app that you register on your IdP",
      placeholder: "70a44354520df8bd9bcd",
      error: Boolean(errors.SAML_ENTITY_ID),
      required: true,
    },
    {
      key: "SAML_SSO_URL",
      type: "text",
      label: "SSO URL",
      description: (
        <>
          The URL that brings up your IdP{"'"}s authentication screen when your users click the{" "}
          <CodeBlock>{"Continue with"}</CodeBlock> button
        </>
      ),
      placeholder: "https://example.com/sso",
      error: Boolean(errors.SAML_SSO_URL),
      required: true,
    },
    {
      key: "SAML_LOGOUT_URL",
      type: "text",
      label: "Logout URL",
      description: "Optional field that tells your IdP your users have logged out of this Plane app",
      placeholder: "https://example.com/logout",
      error: Boolean(errors.SAML_LOGOUT_URL),
      required: false,
    },
    {
      key: "SAML_PROVIDER_NAME",
      type: "text",
      label: "IdP's name",
      description: (
        <>
          Optional field for the name that your users see on the <CodeBlock>Continue with</CodeBlock> button
        </>
      ),
      placeholder: "Okta",
      error: Boolean(errors.SAML_PROVIDER_NAME),
      required: false,
    },
  ];

  const SAML_FORM_SWITCH_FIELD: TControllerSwitchFormField<SAMLConfigFormValues> = {
    name: "ENABLE_SAML_IDP_SYNC",
    label: "IdP",
  };

  const SAML_WEB_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "Metadata_Information",
      label: "Entity ID | Audience | Metadata information",
      url: `${originURL}/auth/saml/metadata/`,
      description:
        "We will generate this bit of the metadata that identifies this Plane app as an authorized service on your IdP.",
    },
    {
      key: "Callback_URI",
      label: "Callback URI",
      url: `${originURL}/auth/saml/callback/`,
      description: (
        <>
          We will generate this <CodeBlock darkerShade>http-post request</CodeBlock> URL that you should paste into your{" "}
          <CodeBlock darkerShade>ACS URL</CodeBlock> or <CodeBlock darkerShade>Sign-in call back URL</CodeBlock> field
          on your IdP.
        </>
      ),
    },
    {
      key: "Logout_URI",
      label: "Logout URI",
      url: `${originURL}/auth/saml/logout/`,
      description: (
        <>
          We will generate this <CodeBlock darkerShade>http-redirect request</CodeBlock> URL that you should paste into
          your <CodeBlock darkerShade>SLS URL</CodeBlock> or <CodeBlock darkerShade>Logout URL</CodeBlock>
          field on your IdP.
        </>
      ),
    },
  ];

  const SAML_MOBILE_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "mobile_metadata_information",
      label: "Entity ID | Audience | Metadata information",
      url: `${originURL}/auth/mobile/saml/metadata/`,
      description:
        "We will generate this bit of the metadata that identifies this Plane app as an authorized service on your IdP.",
    },
    {
      key: "mobile_callback_uri",
      label: "Callback URI",
      url: `${originURL}/auth/mobile/saml/callback/`,
      description: (
        <>
          We will generate this <CodeBlock darkerShade>http-post request</CodeBlock> URL that you should paste into your{" "}
          <CodeBlock darkerShade>ACS URL</CodeBlock> or <CodeBlock darkerShade>Sign-in call back URL</CodeBlock> field
          on your IdP.
        </>
      ),
    },
    {
      key: "mobile_logout_uri",
      label: "Logout URI",
      url: `${originURL}/auth/mobile/saml/logout/`,
      description: (
        <>
          We will generate this <CodeBlock darkerShade>http-redirect request</CodeBlock> URL that you should paste into
          your <CodeBlock darkerShade>SLS URL</CodeBlock> or <CodeBlock darkerShade>Logout URL</CodeBlock>
          field on your IdP.
        </>
      ),
    },
  ];

  const onSubmit = async (formData: SAMLConfigFormValues) => {
    const payload: Partial<SAMLConfigFormValues> = { ...formData };

    try {
      const response = await updateInstanceConfigurations(payload);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Done!",
        message: "Your SAML-based authentication is configured. You should test it now.",
      });
      reset({
        SAML_ENTITY_ID: response.find((item) => item.key === "SAML_ENTITY_ID")?.value,
        SAML_SSO_URL: response.find((item) => item.key === "SAML_SSO_URL")?.value,
        SAML_LOGOUT_URL: response.find((item) => item.key === "SAML_LOGOUT_URL")?.value,
        SAML_CERTIFICATE: response.find((item) => item.key === "SAML_CERTIFICATE")?.value,
        SAML_PROVIDER_NAME: response.find((item) => item.key === "SAML_PROVIDER_NAME")?.value,
        ENABLE_SAML_IDP_SYNC: response.find((item) => item.key === "ENABLE_SAML_IDP_SYNC")?.value,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isDirty) {
      e.preventDefault();
      setIsDiscardChangesModalOpen(true);
    }
  };

  return (
    <>
      <ConfirmDiscardModal
        isOpen={isDiscardChangesModalOpen}
        onDiscardHref="/authentication"
        handleClose={() => setIsDiscardChangesModalOpen(false)}
      />
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-y-4 col-span-2 md:col-span-1 pt-1">
            <div className="pt-2.5 text-18 font-medium">IdP-provided details for Plane</div>
            {SAML_FORM_FIELDS.map((field) => (
              <ControllerInput
                key={field.key}
                control={control}
                type={field.type}
                name={field.key}
                label={field.label}
                description={field.description}
                placeholder={field.placeholder}
                error={field.error}
                required={field.required}
              />
            ))}

            <div className="flex flex-col gap-1">
              <h4 className="text-13">SAML certificate</h4>
              <Controller
                control={control}
                name="SAML_CERTIFICATE"
                rules={{ required: "Certificate is required." }}
                render={({ field: { value, onChange } }) => (
                  <TextArea
                    id="SAML_CERTIFICATE"
                    name="SAML_CERTIFICATE"
                    value={value}
                    onChange={onChange}
                    hasError={Boolean(errors.SAML_CERTIFICATE)}
                    placeholder="---BEGIN CERTIFICATE---\n2yWn1gc7DhOFB9\nr0gbE+\n---END CERTIFICATE---"
                    className="min-h-[102px] w-full rounded-md font-medium text-13"
                  />
                )}
              />
              <p className="pt-0.5 text-11 text-tertiary">
                IdP-generated certificate for signing this Plane app as an authorized service provider for your IdP
              </p>
            </div>
            <ControllerSwitch control={control} field={SAML_FORM_SWITCH_FIELD} />
            <div className="flex flex-col gap-1 pt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  onClick={(e) => void handleSubmit(onSubmit)(e)}
                  loading={isSubmitting}
                  disabled={!isDirty}
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
                <Link
                  href="/authentication"
                  className={cn(getButtonStyling("secondary", "base"), "font-medium")}
                  onClick={handleGoBack}
                >
                  Go back
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-y-6">
            <div className="pt-2 text-18 font-medium">Plane-provided details for your IdP</div>

            <div className="flex flex-col gap-y-4">
              {/* web service details */}
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-layer-1/60 font-medium text-11 uppercase flex items-center gap-x-3 text-secondary">
                  <Monitor className="w-3 h-3" />
                  Web
                </div>
                <div className="px-6 py-4 flex flex-col gap-y-4 bg-layer-1">
                  {SAML_WEB_SERVICE_DETAILS.map((field) => (
                    <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
                  ))}
                </div>
              </div>

              {/* mobile service details */}
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-layer-1/60 font-medium text-11 uppercase flex items-center gap-x-3 text-secondary">
                  <Smartphone className="w-3 h-3" />
                  Mobile
                </div>
                <div className="px-6 py-4 flex flex-col gap-y-4 bg-layer-1">
                  {SAML_MOBILE_SERVICE_DETAILS.map((field) => (
                    <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
                  ))}
                </div>
              </div>

              {/* mapping details */}
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-layer-1/60 font-medium text-11 uppercase flex items-center gap-x-3 text-secondary">
                  <Cable className="w-3 h-3" />
                  Mapping
                </div>
                <div className="px-6 py-4 bg-layer-1">
                  <SAMLAttributeMappingTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
