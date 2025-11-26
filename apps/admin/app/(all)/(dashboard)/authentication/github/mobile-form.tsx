"use client";

import type { FC } from "react";
import { isEmpty } from "lodash-es";
import { Smartphone } from "lucide-react";
// plane internal packages
import { API_BASE_URL } from "@plane/constants";
// components
import { CodeBlock } from "@/components/common/code-block";
import type { TCopyField } from "@/components/common/copy-field";
import { CopyField } from "@/components/common/copy-field";

export const GithubMobileForm: FC = () => {
  const originURL = !isEmpty(API_BASE_URL) ? API_BASE_URL : typeof window !== "undefined" ? window.location.origin : "";

  const GITHUB_MOBILE_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "mobile_callback_uri",
      label: "Callback URI",
      url: `${originURL}/auth/mobile/github/callback/`,
      description: (
        <p>
          We will auto-generate this. Paste this into your <CodeBlock darkerShade>Authorized Redirect URI</CodeBlock>{" "}
          field. For this OAuth client{" "}
          <a
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
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
      <div className="px-6 py-3 bg-custom-background-80/60 font-medium text-xs uppercase flex items-center gap-x-3 text-custom-text-200">
        <Smartphone className="w-3 h-3" />
        Mobile
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-4 bg-custom-background-80">
        {GITHUB_MOBILE_SERVICE_DETAILS.map((field) => (
          <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
        ))}
      </div>
    </div>
  );
};
