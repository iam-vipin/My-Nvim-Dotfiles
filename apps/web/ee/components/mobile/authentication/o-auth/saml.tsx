"use client";

import type { FC } from "react";
import { useTheme } from "next-themes";
import { Key } from "lucide-react";
// helpers
import { API_BASE_URL } from "@plane/constants";

export type TSAMLButton = {
  title: string;
  invitationId?: string;
};

export const SAMLButton: FC<TSAMLButton> = (props) => {
  // props
  const { title, invitationId } = props;
  // hooks
  const { resolvedTheme } = useTheme();

  const handleSignIn = () => {
    let url = `${API_BASE_URL}/auth/mobile/saml/`;
    if (invitationId) url += `?invitation_id=${invitationId}`;
    window.location.assign(url);
  };

  return (
    <button
      className={`flex h-[42px] w-full items-center justify-center gap-2 rounded border px-2 text-sm font-medium text-custom-text-100 duration-300 bg-custom-background-100 hover:bg-onboarding-background-300 ${
        resolvedTheme === "dark" ? "border-[#43484F]" : "border-[#D9E4FF]"
      }`}
      onClick={handleSignIn}
    >
      <Key height={18} width={18} />
      {title}
    </button>
  );
};
