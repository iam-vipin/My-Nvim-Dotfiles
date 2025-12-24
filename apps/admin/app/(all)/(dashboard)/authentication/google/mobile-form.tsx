import { isEmpty } from "lodash-es";
import { Smartphone } from "lucide-react";
// plane internal packages
import { API_BASE_URL } from "@plane/constants";
// components
import { CodeBlock } from "@/components/common/code-block";
import type { TCopyField } from "@/components/common/copy-field";
import { CopyField } from "@/components/common/copy-field";

export function GoogleMobileForm() {
  const originURL = !isEmpty(API_BASE_URL) ? API_BASE_URL : typeof window !== "undefined" ? window.location.origin : "";

  const GOOGLE_MOBILE_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "mobile_callback_uri",
      label: "Callback URI",
      url: `${originURL}/auth/mobile/google/callback/`,
      description: (
        <p>
          We will auto-generate this. Paste this into your <CodeBlock darkerShade>Authorized Redirect URI</CodeBlock>{" "}
          field. For this OAuth client{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials/oauthclient"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            here.
          </a>
        </p>
      ),
    },
  ];

  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <div className="px-6 py-3 bg-layer-3 font-medium text-11 uppercase flex items-center gap-x-3 text-secondary">
        <Smartphone className="w-3 h-3" />
        Mobile
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-4 bg-layer-1">
        {GOOGLE_MOBILE_SERVICE_DETAILS.map((field) => (
          <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
        ))}
      </div>
    </div>
  );
}
